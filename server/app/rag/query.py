from app.rag.retrieve import retrieve_context_with_metadata
from app.rag.prompts import build_code_generation_prompt, build_explanation_prompt
from app.rag.validators import validate_soroban_code, format_validation_message, should_validate_code
from openai import OpenAI
from app.config import OPENROUTER_API_KEY
from typing import List, Dict, Any
import httpx
import re

client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    timeout=httpx.Timeout(
        connect=10.0,      # 10s para conectar
        read=180.0,        # 3 minutos para leer
        write=30.0,        # 30s para escribir
        pool=10.0          # 10s pool timeout
    ),
    max_retries=2 
)

# Modelo para generación de código
# Opciones por velocidad:
# - deepseek/deepseek-chat (RÁPIDO, 10-15s, calidad buena)
# - deepseek/deepseek-r1-0528:free (LENTO, 60s+, calidad excelente)
# - anthropic/claude-3.5-sonnet (MUY RÁPIDO, 5-10s, calidad excelente, PAGO)
CODE_MODEL = "deepseek/deepseek-chat"  # Cambiado de R1 a Chat para velocidad

def detect_language(query: str) -> str:
    """
    Detecta el idioma de la query del usuario.
    
    Returns:
        "en" para inglés, "es" para español
    """
    query_lower = query.lower()
    
    # Detectar caracteres específicos del español (tildes y ñ)
    spanish_chars = ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡']
    has_spanish_chars = any(char in query_lower for char in spanish_chars)
    
    # Si tiene caracteres españoles, es muy probable que sea español
    if has_spanish_chars:
        return "es"
    
    # Palabras clave en inglés (expandido)
    english_keywords = [
        "create", "build", "make", "how", "what", "explain", "show", "write",
        "implement", "generate", "help", "can", "please", "need", "want",
        "using", "with", "should", "must", "have", "that", "this", "the",
        "contract", "function", "add", "remove", "update", "get",
        "set", "delete", "list", "display", "where", "when", "why", "which"
    ]
    
    # Palabras clave en español (muy expandido)
    spanish_keywords = [
        "crear", "crea", "construir", "hacer", "cómo", "como", "qué", "que", "explicar", 
        "mostrar", "escribir", "implementar", "generar", "ayuda", "puedo", 
        "por favor", "necesito", "quiero", "usando", "con", "debe", "debería",
        "tiene", "tenga", "tengo", "este", "esta", "el", "la", "un", "una",
        "contrato", "token", "función", "añadir", "agregar", "eliminar", 
        "actualizar", "obtener", "establecer", "listar", "mostrar", "donde",
        "cuando", "porqué", "porque", "cual", "cuál", "escribe", "devuelve",
        "usa", "use", "soporte", "protege", "valida", "incluye", "requisitos",
        "solo", "sólo", "compatible", "oficial", "documentación", "exclusivamente",
        "mantiene", "emite", "evita", "tipos", "correctos", "completo", "actual",
        "antiguas", "importantes", "listo", "para", "del", "los", "las"
    ]
    
    # Contar ocurrencias de palabras clave
    english_score = sum(1 for word in english_keywords if word in query_lower)
    spanish_score = sum(1 for word in spanish_keywords if word in query_lower)
    
    # Si tiene más palabras en inglés, es inglés
    if english_score > spanish_score:
        return "en"
    
    # Default a español
    return "es"

def query_rag(
    user_query: str,
    mode: str = "code",  # "code" o "explain"
    k: int = 5,
    model: str = CODE_MODEL,
    temperature: float = 0.1,
    stream: bool = False,
    code_only: bool = False,
    language: str = None
) -> Dict[str, Any]:
    """
    Pipeline completo de RAG para generación de código o explicaciones.
    
    Args:
        user_query: Pregunta o solicitud del usuario
        mode: "code" para generación de código, "explain" para explicaciones
        k: Número de chunks a recuperar
        model: Modelo de LLM a usar
        temperature: Temperatura del modelo (0.1 para código, 0.7 para explicaciones)
        stream: Si True, retorna un generador para streaming
        code_only: Si True, genera solo código sin explicaciones
        language: Forzar idioma ("es" o "en"), None para auto-detección
    
    Returns:
        Dict con la respuesta, fuentes y metadata
    """
    
    # Auto-detectar idioma si no se especifica
    if language is None:
        language = detect_language(user_query)
    
    print(f"🌍 Idioma detectado: {language.upper()}")
    
    # 1. Retrieval: obtener contexto relevante
    print(f"🔍 Buscando contexto relevante para: {user_query[:50]}...")
    
    # Reducir chunks para tokens (más rápido)
    is_token_query = 'token' in user_query.lower()
    effective_k = max(3, k - 2) if is_token_query else k  # Menos chunks para tokens
    
    chunks = retrieve_context_with_metadata(user_query, k=effective_k, language=language)
    
    if not chunks:
        return {
            "answer": "Lo siento, no encontré información relevante para responder tu pregunta.",
            "sources": [],
            "context_used": 0
        }
    
    # 2. Preparar contexto
    context_parts = []
    sources = []
    
    for i, chunk in enumerate(chunks):
        content = chunk["content"]
        metadata = chunk.get("metadata", {})
        
        # Agregar header con metadata para el LLM
        section = metadata.get("section", "unknown")
        topic = metadata.get("topic", "unknown")
        has_code = "✓" if metadata.get("has_code") else "✗"
        
        context_parts.append(
            f"### Fuente {i+1} [{section}/{topic}] [Código: {has_code}]\n{content}\n"
        )
        
        # Guardar fuentes para referencia
        sources.append({
            "file": metadata.get("file", "unknown"),
            "section": section,
            "topic": topic,
            "has_code": metadata.get("has_code", False)
        })
    
    context = "\n---\n\n".join(context_parts)
    
    # 3. Construir prompt según el modo
    if mode == "code":
        system_prompt, user_prompt = build_code_generation_prompt(
            user_query, context, code_only=code_only, language=language
        )
        temp = 0.1  # Más determinístico para código
    else:
        system_prompt, user_prompt = build_explanation_prompt(
            user_query, context, language=language
        )
        temp = temperature
    
    # 4. Generar respuesta
    print(f"🤖 Generando respuesta con {model}...")
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    if stream:
        # Retornar generador para streaming
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temp,
            stream=True
        )
        return {
            "stream": response,
            "sources": sources,
            "context_used": len(chunks)
        }
    
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temp
    )
    
    answer = response.choices[0].message.content
    
    # Validar código si es necesario
    validation_message = None
    retry_count = 0
    max_retries = 1  # Permitir 1 reintento si se detectan antipatrones críticos
    
    if mode == "code" and should_validate_code(user_query):
        print("🔍 Validando código generado...")
        
        # Extraer código de bloques markdown si existe
        code_to_validate = answer
        rust_code_blocks = re.findall(r'```rust\n(.*?)```', answer, re.DOTALL)
        if rust_code_blocks:
            # Si hay bloques de código rust, validar el primero (usualmente el principal)
            code_to_validate = rust_code_blocks[0]
        elif '```' in answer:
            # Si hay bloques genéricos sin especificar lenguaje
            generic_blocks = re.findall(r'```\n(.*?)```', answer, re.DOTALL)
            if generic_blocks:
                code_to_validate = generic_blocks[0]
        
        validation_result = validate_soroban_code(code_to_validate)
        
        # Si hay errores críticos (antipatrones) y no hemos reintentado, regenerar
        if not validation_result.is_valid and retry_count < max_retries:
            print(f"⚠️  Antipatrones detectados. Intentando regenerar código...")
            
            # Construir prompt de corrección con los errores detectados
            correction_prompt = f"""El código generado contiene los siguientes errores/antipatrones:

{format_validation_message(validation_result)}

Por favor, regenera el código corrigiendo estos problemas específicos.

Query original del usuario:
{user_query}

Contexto de documentación:
{context}

CRÍTICO: Corrige TODOS los antipatrones mencionados arriba."""
            
            # Reintentar generación
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
                {"role": "assistant", "content": answer},
                {"role": "user", "content": correction_prompt}
            ]
            
            print("🔄 Regenerando código...")
            retry_response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temp
            )
            
            answer = retry_response.choices[0].message.content
            retry_count += 1
            
            # Validar nuevamente
            validation_result = validate_soroban_code(answer)
            print("🔍 Validando código regenerado...")
        
        if not validation_result.is_valid or validation_result.warnings:
            validation_message = format_validation_message(validation_result)
            print(validation_message)
            
            # Agregar mensaje de validación al answer (errores O advertencias)
            if not validation_result.is_valid:
                # Errores críticos: añadir como advertencia de seguridad
                answer += f"\n\n---\n\n⚠️ **ADVERTENCIA DE SEGURIDAD**\n\n{validation_message}"
            elif validation_result.warnings:
                # Solo advertencias: añadir como nota informativa
                answer += f"\n\n---\n\n💡 **ADVERTENCIAS Y RECOMENDACIONES**\n\n{validation_message}"
    
    return {
        "answer": answer,
        "sources": sources,
        "context_used": len(chunks),
        "model": model,
        "validation": validation_message,
        "tokens": {
            "prompt": response.usage.prompt_tokens,
            "completion": response.usage.completion_tokens,
            "total": response.usage.total_tokens
        }
    }


def generate_code(user_query: str, k: int = 5) -> str:
    """
    Shortcut para generación de código.
    Retorna directamente el código generado como string.
    """
    result = query_rag(user_query, mode="code", k=k)
    return result["answer"]


def explain_concept(user_query: str, k: int = 3) -> str:
    """
    Shortcut para explicaciones de conceptos.
    """
    result = query_rag(user_query, mode="explain", k=k, temperature=0.5)
    return result["answer"]


def interactive_chat(history: List[Dict[str, str]], new_message: str, k: int = 4) -> Dict[str, Any]:
    """
    Chat conversacional con memoria de contexto.
    
    Args:
        history: Lista de mensajes previos [{"role": "user/assistant", "content": "..."}]
        new_message: Nuevo mensaje del usuario
        k: Chunks a recuperar
    
    Returns:
        Dict con respuesta y metadata
    """
    # Recuperar contexto para el nuevo mensaje
    chunks = retrieve_context_with_metadata(new_message, k=k)
    
    context_parts = []
    for chunk in chunks:
        context_parts.append(chunk["content"])
    
    context = "\n\n---\n\n".join(context_parts)
    
    # Construir prompt conversacional
    system_prompt = f"""Eres un asistente experto en Soroban (smart contracts de Stellar) y Rust.

Contexto relevante de la documentación:
{context}

Instrucciones:
- Usa el contexto proporcionado para responder
- Si el usuario pregunta sobre código, proporciona ejemplos
- Mantén coherencia con la conversación previa
- Si no tienes información suficiente, dilo claramente"""

    # Construir historial completo
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": new_message})
    
    response = client.chat.completions.create(
        model=CODE_MODEL,
        messages=messages,
        temperature=0.3
    )
    
    answer = response.choices[0].message.content
    
    return {
        "answer": answer,
        "sources": [{"file": c.get("metadata", {}).get("file")} for c in chunks],
        "context_used": len(chunks)
    }


def validate_code_only(code: str, contract_type: str = None) -> Dict[str, Any]:
    """
    Valida código sin regenerarlo.
    
    Args:
        code: Código Rust a validar
        contract_type: Tipo de contrato ("token", "nft", "custom")
    
    Returns:
        Dict con resultado de validación y sugerencias
    """
    validation_result = validate_soroban_code(code, contract_type)
    
    return {
        "is_valid": validation_result.is_valid,
        "has_warnings": len(validation_result.warnings) > 0,
        "errors": validation_result.errors,
        "warnings": validation_result.warnings,
        "message": format_validation_message(validation_result),
        "summary": {
            "total_errors": len(validation_result.errors),
            "total_warnings": len(validation_result.warnings),
            "antipatterns_detected": [
                err for err in validation_result.errors 
                if "ANTIPATRÓN" in err
            ]
        }
    }
