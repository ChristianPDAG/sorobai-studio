from llama_index.core import SimpleDirectoryReader
from app.rag.chunking import chunk_documents
from app.embeddings import embed_text
from app.db import supabase
import re

def infer_metadata(filename: str, content: str, language: str = "es") -> dict:
    """Infiere metadata rica del archivo y su contenido."""
    base_metadata = {}
    
    # Clasificación por nombre de archivo
    if filename.startswith("overview"):
        base_metadata = {"section": "overview", "topic": "intro", "level": "beginner"}
    elif filename.startswith("sdk_env"):
        base_metadata = {"section": "sdk", "topic": "environment", "level": "basic"}
    elif filename.startswith("sdk_storage"):
        base_metadata = {"section": "sdk", "topic": "storage", "level": "intermediate"}
    elif filename.startswith("sdk_auth"):
        base_metadata = {"section": "sdk", "topic": "auth", "level": "intermediate"}
    elif filename.startswith("sdk_types"):
        base_metadata = {"section": "sdk", "topic": "types", "level": "basic"}
    elif filename.startswith("sdk_errors"):
        base_metadata = {"section": "sdk", "topic": "errors", "level": "intermediate"}
    elif filename.startswith("examples_token_contract"):
        base_metadata = {"section": "examples", "topic": "token", "level": "advanced", "code_type": "full_implementation", "doc_type": "complete_contract"}
    elif filename.startswith("examples_token_antipattern"):
        base_metadata = {"section": "examples", "topic": "token", "level": "advanced", "code_type": "antipatterns", "doc_type": "security_guide"}
    elif filename.startswith("examples_token"):
        base_metadata = {"section": "examples", "topic": "token", "level": "intermediate", "code_type": "conceptual", "doc_type": "patterns_guide"}
    elif filename.startswith("examples_counter"):
        base_metadata = {"section": "examples", "topic": "counter", "level": "beginner", "code_type": "full_example"}
    elif filename.startswith("cli"):
        base_metadata = {"section": "cli", "topic": "commands", "level": "basic"}
    else:
        base_metadata = {"section": "general", "topic": "unknown", "level": "basic"}
    
    # Análisis del contenido
    has_code = "```rust" in content or "```" in content
    code_blocks = content.count("```") // 2
    
    # Detectar funciones mencionadas
    functions = set(re.findall(r'`([a-z_]+)\(`', content))
    
    # Detectar patrones específicos para examples_token_contract (implementación completa)
    if filename.startswith("examples_token_contract"):
        # Detectar secciones del documento
        sections = re.findall(r'^##\s+\d+\.\s+(.+)$', content, re.MULTILINE)
        
        # Detectar tipos de almacenamiento mencionados
        storage_types = []
        if "Instance Storage" in content or "instance()" in content:
            storage_types.append("instance")
        if "Temporary Storage" in content or "temporary()" in content:
            storage_types.append("temporary")
        if "Persistent Storage" in content or "persistent()" in content:
            storage_types.append("persistent")
        
        # Detectar interfaces implementadas
        interfaces = []
        if "TokenInterface" in content:
            interfaces.append("TokenInterface")
        if "SEP-41" in content:
            interfaces.append("SEP-41")
        
        # Agregar metadata específica para token contracts
        base_metadata.update({
            "sections": sections if sections else [],
            "storage_types": storage_types,
            "implements": interfaces,
            "contract_type": "token",
            "has_constructor": "__constructor" in content,
            "has_admin": "administrator" in content.lower(),
            "has_allowances": "allowance" in content.lower(),
        })
    
    # Detectar patrones específicos para examples_token_antipattern (guía de seguridad)
    if filename.startswith("examples_token_antipattern"):
        # Detectar antipatrones mencionados
        antipatterns = re.findall(r'##\s+\d+\.\s+El Antipatrón\s+"([^"]+)"', content, re.MULTILINE)
        
        # Detectar temas de seguridad
        security_topics = []
        if "ttl" in content.lower() or "extend_ttl" in content.lower():
            security_topics.append("ttl")
        if "require_auth" in content.lower():
            security_topics.append("auth")
        if "panic" in content.lower():
            security_topics.append("error_handling")
        if "client" in content.lower() and "recursive" in content.lower():
            security_topics.append("recursion")
        if "initialize" in content.lower() and "front-running" in content.lower():
            security_topics.append("initialization")
        if "gas" in content.lower():
            security_topics.append("gas_optimization")
        
        # Agregar metadata específica para antipatrones
        base_metadata.update({
            "antipatterns": antipatterns if antipatterns else [],
            "security_topics": security_topics,
            "contract_type": "token",
            "is_negative_example": True,  # Indica que contiene ejemplos de qué NO hacer
            "has_solutions": True,  # Indica que incluye soluciones correctas
        })
    
    # Detectar si es principalmente código o documentación
    if has_code and code_blocks >= 2:
        base_metadata["content_type"] = "code_heavy"
    elif has_code:
        base_metadata["content_type"] = "mixed"
    else:
        base_metadata["content_type"] = "documentation"
    
    base_metadata.update({
        "file": filename,
        "source": "official_docs",
        "has_code": has_code,
        "code_blocks_count": code_blocks,
        "functions": list(functions)[:10] if functions else [],  # Top 10
        "language": "rust" if "rust" in content.lower() else "general",
        "language_doc": language  # Idioma de la documentación
    })
    
    return base_metadata

def ingest(language: str = "es"):
    """Ingesta documentos con chunking optimizado y metadata rica.
    
    Args:
        language: Idioma de la documentación ("es" o "en")
    """
    DOCS_PATH = f"data/docs/{language}"
    
    print(f"📚 Cargando documentos desde {DOCS_PATH} (idioma: {language.upper()})...")
    
    try:
        docs = SimpleDirectoryReader(DOCS_PATH).load_data()
        print(f"✅ {len(docs)} documentos cargados")
    except Exception as e:
        print(f"❌ Error cargando documentos: {e}")
        return
    
    print("✂️  Chunking documentos...")
    try:
        nodes = chunk_documents(docs)
        print(f"✅ {len(nodes)} chunks generados")
    except Exception as e:
        print(f"❌ Error en chunking: {e}")
        return
    
    print("🔢 Generando embeddings e ingiriendo...")
    ingested = 0
    errors = 0
    
    for i, node in enumerate(nodes):
        try:
            # Generar embedding
            embedding = embed_text(node.text)
            
            # Obtener metadata del archivo original
            file_name = node.metadata.get("file_name", "unknown")
            
            # Enriquecer metadata
            metadata = infer_metadata(file_name, node.text, language)
            
            # Agregar metadata del chunk
            if hasattr(node, 'relationships'):
                metadata["id_chunk"] = node.id_
            
            # Insertar en Supabase
            supabase.table("soroban_chunks").insert({
                "content": node.text,
                "embedding": embedding,
                "metadata": metadata
            }).execute()
            
            ingested += 1
            
            # Progress indicator
            if (i + 1) % 10 == 0:
                print(f"  📝 Progreso: {i + 1}/{len(nodes)} chunks")
                
        except Exception as e:
            errors += 1
            print(f"  ⚠️  Error en chunk {i}: {e}")
            continue
    
    print(f"\n✅ Ingesta completada:")
    print(f"   - Chunks ingresados: {ingested}")
    print(f"   - Errores: {errors}")
    print(f"   - Tasa de éxito: {(ingested/len(nodes)*100):.1f}%")

if __name__ == "__main__":
    import sys
    
    # Permitir especificar idioma por argumento
    language = sys.argv[1] if len(sys.argv) > 1 else "es"
    
    if language not in ["es", "en"]:
        print("❌ Idioma no válido. Usa 'es' o 'en'")
        print("   Ejemplo: python ingest.py es")
        sys.exit(1)
    
    print(f"🌍 Ingiriendo documentación en {language.upper()}")
    ingest(language)
