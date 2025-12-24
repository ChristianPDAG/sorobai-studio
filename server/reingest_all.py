#!/usr/bin/env python3
"""
Script para reingerir toda la documentación en ambos idiomas.
Útil después de cambios en chunking o metadata.
"""

import sys
from app.rag.ingest import ingest
from app.db import supabase

def clear_all_chunks():
    """Elimina todos los chunks existentes."""
    print("🗑️  Limpiando chunks existentes...")
    try:
        result = supabase.table("soroban_chunks").delete().neq("id_chunk", "00000000-0000-0000-0000-000000000000").execute()
        print("   ✅ Chunks eliminados")
        return True
    except Exception as e:
        print(f"   ❌ Error limpiando: {e}")
        return False

def main():
    print("""
╔════════════════════════════════════════════════════════════════╗
║          REINGESTIÓN COMPLETA - DOCS MULTILENGUAJE             ║
╚════════════════════════════════════════════════════════════════╝
""")
    
    # Preguntar si limpiar
    response = input("\n⚠️  ¿Deseas eliminar todos los chunks existentes? (s/n): ")
    if response.lower() in ['s', 'si', 'yes', 'y']:
        if not clear_all_chunks():
            print("\n❌ Error en limpieza. Abortando.")
            sys.exit(1)
    
    print("\n" + "="*70)
    
    # Ingerir español
    print("\n📚 INGIRIENDO DOCUMENTACIÓN EN ESPAÑOL")
    print("="*70)
    try:
        ingest("es")
    except Exception as e:
        print(f"❌ Error en ingesta español: {e}")
    
    print("\n" + "="*70)
    
    # Ingerir inglés
    print("\n📚 INGIRIENDO DOCUMENTACIÓN EN INGLÉS")
    print("="*70)
    try:
        ingest("en")
    except Exception as e:
        print(f"❌ Error en ingesta inglés: {e}")
    
    print("\n" + "="*70)
    print("✅ REINGESTIÓN COMPLETA FINALIZADA")
    print("="*70)
    
    # Mostrar estadísticas
    try:
        result = supabase.table("soroban_chunks").select("metadata", count="exact").execute()
        total = result.count
        
        # Contar por idioma
        es_count = sum(1 for item in result.data if item.get("metadata", {}).get("language_doc") == "es")
        en_count = sum(1 for item in result.data if item.get("metadata", {}).get("language_doc") == "en")
        
        print(f"\n📊 Estadísticas:")
        print(f"   Total de chunks: {total}")
        print(f"   Chunks en español: {es_count}")
        print(f"   Chunks en inglés: {en_count}")
        
    except Exception as e:
        print(f"\n⚠️  No se pudieron obtener estadísticas: {e}")

if __name__ == "__main__":
    main()
