from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse
from app.rag.query import query_rag
import logging
import asyncio

app = FastAPI(title="SorobAI Backend")
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    logging.info(f"Received chat request: {request}")
    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(
                query_rag,
            user_query=request.query,
            mode=request.mode,
            k=request.k,
            temperature=request.temperature,
            stream=request.stream,
            code_only=request.code_only,
            language=request.language
        ),
        timeout=180.0  # 3 minutos
    )

        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_endpoint(request: Request):
    data = await request.json()
    
    # Timeout de 3 minutos para el endpoint
    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(
                query_rag,
                user_query=data["query"],
                mode=data.get("mode", "explain")
            ),
            timeout=180.0  # 3 minutos
        )
        return result
        
    except asyncio.TimeoutError:
        return {
            "error": "Request timeout (180s)",
            "suggestion": "Intenta con una pregunta más simple o usa modo streaming"
        }
