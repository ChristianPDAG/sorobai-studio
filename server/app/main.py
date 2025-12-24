from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import ChatRequest, ChatResponse
from app.rag.query import query_rag
import logging
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
def chat(request: ChatRequest):
    logging.info(f"Received chat request: {request}")
    try:
        result = query_rag(
            user_query=request.query,
            mode=request.mode,
            k=request.k,
            temperature=request.temperature,
            stream=request.stream,
            code_only=request.code_only,
            language=request.language
        )
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
