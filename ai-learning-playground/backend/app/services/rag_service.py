from collections import Counter

from app.services.token_service import tokenize

STOP_WORDS = {
    "the",
    "and",
    "for",
    "what",
    "why",
    "how",
    "does",
    "are",
    "with",
    "that",
    "this",
    "from",
}


def split_sentences(document: str) -> list[str]:
    normalized = " ".join(document.split())
    if not normalized:
        return []

    sentences = []
    current = []
    for char in normalized:
        current.append(char)
        if char in ".!?":
            sentence = "".join(current).strip()
            if sentence:
                sentences.append(sentence)
            current = []

    remainder = "".join(current).strip()
    if remainder:
        sentences.append(remainder)

    return sentences


def retrieve_chunks(document: str, question: str, top_k: int = 2) -> list[dict]:
    question_terms = Counter(
        token.lower()
        for token in tokenize(question)
        if len(token) > 2 and token.lower() not in STOP_WORDS
    )
    chunks = []

    for index, sentence in enumerate(split_sentences(document), start=1):
        sentence_terms = Counter(
            token.lower()
            for token in tokenize(sentence)
            if len(token) > 2 and token.lower() not in STOP_WORDS
        )
        score = sum(min(count, sentence_terms.get(term, 0)) for term, count in question_terms.items())
        matched_terms = sorted(term for term in question_terms if term in sentence_terms)
        chunks.append({"id": index, "score": score, "matched_terms": matched_terms, "text": sentence})

    ranked = sorted(chunks, key=lambda chunk: (chunk["score"], len(chunk["text"])), reverse=True)
    return [chunk for chunk in ranked[:top_k] if chunk["score"] > 0]


def answer_with_retrieval(document: str, question: str) -> dict:
    chunks = retrieve_chunks(document, question)
    evidence = " ".join(chunk["text"] for chunk in chunks)
    confidence = "Low"

    if len(chunks) >= 2 and sum(chunk["score"] for chunk in chunks) >= 3:
        confidence = "High"
    elif chunks:
        confidence = "Medium"

    if not evidence:
        answer = "I could not find enough matching information in the document to answer that."
    else:
        answer = (
            "Based on the retrieved document text, the answer is: "
            f"{evidence} This is a RAG-style answer because it uses retrieved context before responding."
        )

    return {
        "question": question,
        "retrieved_chunks": chunks,
        "confidence": confidence,
        "answer": answer,
    }
