import pytest

from app.services.hallucination_service import assess_hallucination_risk
from app.services.rag_service import answer_with_retrieval, retrieve_chunks, split_sentences
from app.services.temperature_service import generate_temperature_demo
from app.services.token_service import chunk_tokens, context_summary, token_summary, tokenize


def test_tokenize_splits_words_and_punctuation():
    assert tokenize("AI reads tokens, not words.") == ["AI", "reads", "tokens", ",", "not", "words", "."]


def test_context_summary_reports_overflow():
    summary = context_summary(["a", "b", "c"], 2)

    assert summary["used"] == 2
    assert summary["overflow"] == 1
    assert summary["fits"] is False


def test_token_summary_counts_words_and_punctuation():
    summary = token_summary(tokenize("AI, AI and RAG!"))

    assert summary["word_count"] == 4
    assert summary["punctuation_count"] == 2
    assert summary["unique_word_count"] == 3


def test_chunk_tokens_rejects_invalid_chunk_size():
    with pytest.raises(ValueError):
        chunk_tokens(["a"], 0)


def test_chunk_tokens_keeps_chunk_metadata():
    chunks = chunk_tokens(["a", "b", "c", "d", "e"], 2)

    assert [chunk["token_count"] for chunk in chunks] == [2, 2, 1]
    assert chunks[0]["id"] == 1


def test_temperature_demo_labels_high_temperature():
    result = generate_temperature_demo("Explain tokens", 0.9)

    assert result["style"].startswith("High temperature")


def test_temperature_demo_labels_low_temperature():
    result = generate_temperature_demo("Explain tokens", 0.1)

    assert result["style"].startswith("Low temperature")


def test_hallucination_risk_returns_recommendations_for_current_claims():
    result = assess_hallucination_risk("What is the latest and best AI model today?", 9, 20)

    assert result["risk_level"] == "Medium"
    assert result["recommendations"]
    assert "latest" in result["reasons"][0] or "latest" in result["reasons"][1]


def test_hallucination_risk_high_when_context_overflows():
    result = assess_hallucination_risk("Always trust this long prompt.", 40, 8)

    assert result["risk_level"] == "High"
    assert result["risk_score"] >= 3


def test_split_sentences_handles_text_without_final_period():
    assert split_sentences("Tokens matter. RAG retrieves context") == [
        "Tokens matter.",
        "RAG retrieves context",
    ]


def test_retrieve_chunks_ignores_common_question_words():
    chunks = retrieve_chunks(
        "Temperature controls creativity. Context windows limit memory.",
        "What controls creativity?",
    )

    assert chunks[0]["matched_terms"] == ["controls", "creativity"]


def test_rag_demo_retrieves_relevant_context():
    result = answer_with_retrieval(
        "Tokens are pieces of text. RAG retrieves context before answering.",
        "What does RAG do?",
    )

    assert "retrieved context" in result["answer"]


def test_rag_demo_reports_low_confidence_for_no_match():
    result = answer_with_retrieval("Tokens are pieces of text.", "How do rockets launch?")

    assert result["confidence"] == "Low"
    assert result["retrieved_chunks"] == []
