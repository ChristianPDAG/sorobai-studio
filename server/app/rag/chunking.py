from llama_index.core.node_parser import MarkdownNodeParser, SentenceSplitter
from llama_index.core import Document

def chunk_documents(documents):
    """
    Chunking inteligente con pipeline de 2 fases:
    1. Respeta estructura Markdown (headers, secciones)
    2. Divide secciones grandes preservando código
    """
    # 1️⃣ Parsear estructura Markdown
    md_parser = MarkdownNodeParser(
        include_metadata=True
    )
    md_nodes = md_parser.get_nodes_from_documents(documents)

    # 2️⃣ Split dentro de cada sección
    splitter = SentenceSplitter(
        chunk_size=1000,     # balance contexto/precisión
        chunk_overlap=200    # overlap generoso para código
    )

    final_nodes = []
    for node in md_nodes:
        # Preservar bloques de código completos si son razonables
        code_blocks = node.text.count('```')
        
        if code_blocks > 0 and code_blocks % 2 == 0 and len(node.text) < 1500:
            # Código completo y no muy largo
            final_nodes.append(node)
        else:
            # Dividir, pero marcar código truncado
            sub_nodes = splitter.get_nodes_from_documents([Document(text=node.text)])
            for sub_node in sub_nodes:
                if '```' in sub_node.text and sub_node.text.count('```') % 2 != 0:
                    sub_node.text += "\n```\n\n*(código continúa)*"
                final_nodes.append(sub_node)

    return final_nodes

def chunk_documents_semantic(documents):
    """
    Alternativa: chunking semántico por secciones completas.
    Útil para documentos bien estructurados.
    """
    from llama_index.core.node_parser import SemanticSplitterNodeParser
    from app.embeddings import embed_text
    
    # Usa embeddings para detectar cambios semánticos
    parser = SemanticSplitterNodeParser(
        buffer_size=1,
        breakpoint_percentile_threshold=95,
        embed_model=None  # Podríamos integrar nuestro modelo aquí
    )
    
    return parser.get_nodes_from_documents(documents)
