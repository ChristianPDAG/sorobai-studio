from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChatRequest(BaseModel):
    query: str
    mode: str = "code"
    k: int = 5
    temperature: float = 0.1
    stream: bool = False
    code_only: bool = False  # Nuevo: solo código sin explicaciones
    language: Optional[str] = None  # Nuevo: forzar idioma ("es" o "en"), None para auto-detectar

class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    context_used: int