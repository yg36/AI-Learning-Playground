from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=1)
    context_limit: int = Field(default=64, ge=8, le=1000)
    chunk_size: int = Field(default=24, ge=4, le=200)


class TemperatureRequest(BaseModel):
    prompt: str = Field(min_length=1)
    temperature: float = Field(default=0.4, ge=0, le=1)


class RagRequest(BaseModel):
    document: str = Field(min_length=1)
    question: str = Field(min_length=1)
