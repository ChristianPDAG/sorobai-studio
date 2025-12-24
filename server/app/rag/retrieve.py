from app.embeddings import embed_text
from app.db import supabase
from typing import List, Dict, Any

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

    result = supabase.rpc(
        "match_soroban_chunks",
        {
            "query_embedding": embedding,
            "match_count": k * 2
        }
    ).execute()

    chunks = result.data
    
    # Filtrar por idioma si se especifica
    if language:
        chunks = [
            c for c in chunks 
            if c.get("metadata", {}).get("language_doc") == language
        ]
    
    # Estrategia de retrieval inteligente
    code_keywords = ["example", "code", "implement", "how to", "function", "contract", "write", "crear", "implementar", "ejemplo"]
    concept_keywords = ["what is", "explain", "difference", "when to use", "why", "qué es", "explicar", "diferencia", "cuándo usar"]
    
    # Detectar si se busca un contrato completo de token
    token_contract_keywords = ["token contract", "contrato de token", "token completo", "full token", "implementar token", "crear token"]
    needs_token_contract = any(kw in query.lower() for kw in token_contract_keywords)
    
    needs_code = any(kw in query.lower() for kw in code_keywords)
    needs_concepts = any(kw in query.lower() for kw in concept_keywords)
    
    # Scoring
    for chunk in chunks:
        metadata = chunk.get("metadata", {})
        score = chunk.get("similarity", 0)
        
        # MÁXIMA PRIORIDAD: Contratos canónicos completos (examples_token_contract)
        if metadata.get("doc_type") == "complete_contract":
            # Si el usuario busca específicamente un token contract
            if needs_token_contract or ("token" in query.lower() and needs_code):
                score += 0.5  # Boost muy fuerte
            elif needs_code and metadata.get("topic") == "token":
                score += 0.3  # Boost moderado para tokens con código
        
        # Prioridad media: Guías de patrones (examples_token)
        if metadata.get("doc_type") == "patterns_guide":
            if needs_concepts or (not needs_token_contract and "token" in query.lower()):
                score += 0.2
        
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
