from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import AnalyzeRequest, RagRequest, TemperatureRequest
from app.services.hallucination_service import assess_hallucination_risk
from app.services.rag_service import answer_with_retrieval
from app.services.temperature_service import generate_temperature_demo
from app.services.token_service import chunk_tokens, context_summary, token_summary, tokenize

app = FastAPI(title="AI Learning Playground API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.post("/api/analyze")
def analyze_text(payload: AnalyzeRequest) -> dict:
    tokens = tokenize(payload.text)
    return {
        "tokens": tokens,
        "token_count": len(tokens),
        "token_summary": token_summary(tokens),
        "chunks": chunk_tokens(tokens, payload.chunk_size),
        "context_window": context_summary(tokens, payload.context_limit),
        "hallucination": assess_hallucination_risk(
            payload.text,
            len(tokens),
            payload.context_limit,
        ),
    }


@app.post("/api/temperature")
def temperature_demo(payload: TemperatureRequest) -> dict:
    return generate_temperature_demo(payload.prompt, payload.temperature)


@app.post("/api/rag")
def rag_demo(payload: RagRequest) -> dict:
    return answer_with_retrieval(payload.document, payload.question)
