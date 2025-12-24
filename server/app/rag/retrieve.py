from app.embeddings import embed_text
from app.db import supabase
from typing import List, Dict, Any
import re

def retrieve_context(query: str, k: int = 5, filter_metadata: Dict[str, Any] = None) -> List[str]:
    """
    Recupera chunks relevantes para la query.
    
    Args:
        query: Pregunta del usuario
        k: Número de chunks a recuperar
        filter_metadata: Filtros opcionales (ej: {"section": "examples"})
    
    Returns:
        Lista de strings con el contenido de los chunks
    """
    embedding = embed_text(query)

    result = supabase.rpc(
        "match_soroban_chunks",
        {
            "query_embedding": embedding,
            "match_count": k * 2  # Recuperamos más para luego rerank
        }
    ).execute()

    chunks = result.data
    
    # Reranking simple: priorizar chunks con código si la query lo sugiere
    code_keywords = ["example", "code", "implement", "how to", "function", "contract"]
    needs_code = any(kw in query.lower() for kw in code_keywords)
    
    if needs_code:
        # Priorizar chunks con código
        chunks_with_code = [c for c in chunks if c.get("metadata", {}).get("has_code", False)]
        chunks_without_code = [c for c in chunks if not c.get("metadata", {}).get("has_code", False)]
        chunks = chunks_with_code + chunks_without_code
    
    # Aplicar filtros de metadata si se proporcionan
    if filter_metadata:
        chunks = [
            c for c in chunks 
            if all(c.get("metadata", {}).get(k) == v for k, v in filter_metadata.items())
        ]
    
    # Retornar top k
    return [chunk["content"] for chunk in chunks[:k]]


def retrieve_context_with_metadata(
    query: str, 
    k: int = 5,
    include_examples: bool = True,
    language: str = None
) -> List[Dict[str, Any]]:
    """
    Versión extendida que retorna chunks con metadata completa.
    Útil para debugging o para mostrar fuentes al usuario.
    
    Args:
        query: Pregunta del usuario
        k: Número de chunks a recuperar
        include_examples: Si incluir ejemplos
        language: Filtrar por idioma ("es" o "en"), None para todos
    """
    embedding = embed_text(query)
    
    # Detectar necesidad de contrato completo ANTES de la query
    token_contract_keywords = [
        "token contract", "contrato de token", "token completo", "full token", 
        "implementar token", "crear token", "generar token", "generate token",
        "contrato token", "ejemplo token", "token example", "token soroban",
        "smart contract token", "erc20", "fungible token"
    ]
    needs_token_contract = any(kw in query.lower() for kw in token_contract_keywords)

    # Si se busca un contrato completo, recuperamos MÁS chunks para asegurar
    # que incluimos suficientes del archivo canónico
    match_count = k * 5 if needs_token_contract else k * 3
    
    result = supabase.rpc(
        "match_soroban_chunks",
        {
            "query_embedding": embedding,
            "match_count": match_count
        }
    ).execute()

    chunks = result.data
    
    # Filtrar por idioma si se especifica
    if language:
        chunks = [
            c for c in chunks 
            if c.get("metadata", {}).get("language_doc") == language
        ]
    
    # Estrategia mejorada: Detectar intención de implementación completa
    query_lower = query.lower()
    
    # 1. Detectar si se busca un TOKEN en general
    is_token_query = "token" in query_lower
    
    # 2. Detectar verbos de CREACIÓN/IMPLEMENTACIÓN
    def has_creation_verb(text: str) -> bool:
        """Detecta verbos de creación en cualquier conjugación"""
        text_lower = text.lower()
        
        # Raíces de verbos en español (cubren todas las conjugaciones)
        spanish_roots = [
            "cre",       # crear, crea, creando, creé, creado, creación
            "gener",     # generar, genera, generando, generé, generado
            "implement", # implementar, implementa, implementando
            "escrib",    # escribir, escribe, escribiendo, escribí
            "desarroll", # desarrollar, desarrolla, desarrollando
            "hac",       # hacer, hace, haciendo, haz
            "constru",   # construir, construye, construyendo
            "elabor",    # elaborar, elabora, elaborando
            "program",   # programar, programa, programando
        ]
        
        # Verbos completos en inglés (con word boundaries para mayor precisión)
        english_verbs = [
            "build", "create", "implement", "write", "develop", 
            "make", "code", "program", "generate"
        ]
        
        # Buscar raíces españolas (simple substring match)
        for root in spanish_roots:
            if root in text_lower:
                return True
        
        # Buscar verbos ingleses con conjugaciones (word boundaries)
        for verb in english_verbs:
            if re.search(rf'\b{verb}(ing|s|ed)?\b', text_lower):
                return True
        
        return False
    
    wants_implementation = has_creation_verb(query_lower)
    
    # 3. Detectar si se busca CONCEPTOS (no código)
    concept_indicators = ["qué es", "what is", "explicar", "explain", "diferencia", "difference",
                          "cuándo usar", "when to use", "comparar", "compare"]
    wants_concepts = any(indicator in query_lower for indicator in concept_indicators)
    
    # 4. Detectar si se buscan ERRORES/ANTIPATRONES/PROBLEMAS
    error_indicators = [
        "error", "problema", "issue", "bug", "fix", "corregir", "arreglar", 
        "incorrecto", "incorrect", "wrong", "mal", "bad", "evitar", "avoid",
        "antipatrón", "antipattern", "no funciona", "not working", "falla", "fails",
        "debug", "debuggear", "revisar", "review", "auditar", "audit", "seguridad", "security"
    ]
    wants_error_help = any(indicator in query_lower for indicator in error_indicators)
    
    # DECISIÓN: Priorizar contrato completo si es token + creación Y NO conceptos
    needs_token_contract = is_token_query and wants_implementation and not wants_concepts
    
    # Alias para compatibilidad con código existente
    needs_code = wants_implementation
    needs_concepts = wants_concepts
    
    # Scoring
    for chunk in chunks:
        metadata = chunk.get("metadata", {})
        score = chunk.get("similarity", 0)
        
        # MÁXIMA PRIORIDAD: Contratos canónicos completos (examples_token_contract)
        if metadata.get("doc_type") == "complete_contract":
            # Si el usuario busca específicamente un token contract
            if needs_token_contract or ("token" in query.lower() and needs_code):
                score += 0.7  # Boost MUY fuerte (aumentado de 0.5)
            elif needs_code and metadata.get("topic") == "token":
                score += 0.4  # Boost moderado para tokens con código
        
        # Prioridad media: Guías de patrones (examples_token)
        # SOLO si NO se está buscando un contrato completo
        if metadata.get("doc_type") == "patterns_guide":
            if needs_concepts:
                score += 0.3
            elif not needs_token_contract and "token" in query.lower():
                score += 0.05  # Boost mínimo reducido
            else:
                # Penalizar FUERTEMENTE guías cuando se pide contrato completo
                if needs_token_contract:
                    score -= 0.5  # Penalización incrementada de -0.2 a -0.5
        
        # ALTA PRIORIDAD: Guías de seguridad y antipatrones
        if metadata.get("doc_type") == "security_guide":
            # Si busca errores o problemas de seguridad
            if wants_error_help:
                score += 0.6  # Boost muy fuerte para problemas/errores
            # Si busca implementación de token (incluir antipatrones para prevenir errores)
            elif needs_token_contract or (is_token_query and needs_code):
                score += 0.3  # Boost moderado como referencia de qué evitar
            # Si menciona temas de seguridad específicos
            security_topics = metadata.get("security_topics", [])
            for topic in security_topics:
                if topic in query_lower:
                    score += 0.2  # Boost adicional por tema específico
        
        # Boost para chunks con código si se necesita
        if needs_code and metadata.get("has_code"):
            score += 0.1
        
        # Boost para ejemplos completos
        if needs_code and metadata.get("content_type") == "code_heavy":
            score += 0.15
        
        # Boost para documentación si se buscan conceptos
        if needs_concepts and metadata.get("content_type") == "documentation":
            score += 0.1
        
        chunk["adjusted_score"] = score
    
    # Reordenar por score ajustado
    chunks.sort(key=lambda x: x.get("adjusted_score", 0), reverse=True)
    
    # ESTRATEGIA ESPECIAL para contratos completos de token
    if needs_token_contract and "token" in query.lower():
        # 1. Forzar recuperación DIRECTA de chunks del contrato canónico
        canonical_file = "examples_token_contract.md"
        
        # Query directa a DB para el archivo canónico (SIEMPRE)
        all_canonical = supabase.table("soroban_chunks") \
            .select("content, metadata") \
            .filter("metadata->>file", "eq", canonical_file) \
            .limit(10) \
            .execute()
        
        # Asignar scores altos a canonical chunks
        for chunk in all_canonical.data:
            chunk["adjusted_score"] = 0.75
            chunk["similarity"] = 0
        
        # Filtrar otros chunks (no del contrato canónico)
        other_chunks = [c for c in chunks if canonical_file not in c.get("metadata", {}).get("file", "")]
        
        # Combinar: 90% canónico (más chunks del archivo canónico), 10% otros para contexto
        canonical_count = min(len(all_canonical.data), max(int(k * 0.9), k - 1))
        other_count = max(0, k - canonical_count)  # Permitir 0 otros si no hay espacio
        
        result = all_canonical.data[:canonical_count] + other_chunks[:other_count]
        return result[:k]
    
    # Fallback: priorizar chunks del primer archivo si es contrato completo
    if chunks and chunks[0].get("metadata", {}).get("doc_type") == "complete_contract":
        top_file = chunks[0].get("metadata", {}).get("file")
        canonical_chunks = [c for c in chunks if c.get("metadata", {}).get("file") == top_file]
        other_chunks = [c for c in chunks if c.get("metadata", {}).get("file") != top_file]
        
        canonical_count = min(len(canonical_chunks), max(3, int(k * 0.7)))
        other_count = max(1, k - canonical_count)
        
        result = canonical_chunks[:canonical_count] + other_chunks[:other_count]
        return result[:k]
    
    return chunks[:k]


def retrieve_examples(topic: str = None, k: int = 3) -> List[str]:
    """
    Recupera específicamente ejemplos de código.
    """
    filter_meta = {"section": "examples"}
    if topic:
        filter_meta["topic"] = topic
    
    # Búsqueda más amplia para ejemplos
    query = f"código de ejemplo {topic}" if topic else "ejemplo de código completo"
    
    return retrieve_context(query, k=k, filter_metadata=filter_meta)
