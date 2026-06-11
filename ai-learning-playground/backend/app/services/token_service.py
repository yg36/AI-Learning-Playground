import re

TOKEN_PATTERN = re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)?|\d+(?:\.\d+)?|[^\w\s]", re.UNICODE)


def tokenize(text: str) -> list[str]:
    return TOKEN_PATTERN.findall(text)


def chunk_tokens(tokens: list[str], chunk_size: int = 24) -> list[dict]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than zero")

    chunks = []
    for start in range(0, len(tokens), chunk_size):
        chunk = tokens[start : start + chunk_size]
        chunks.append(
            {
                "id": len(chunks) + 1,
                "token_count": len(chunk),
                "text": " ".join(chunk),
            }
        )
    return chunks


def token_summary(tokens: list[str]) -> dict:
    word_tokens = [token for token in tokens if any(char.isalnum() for char in token)]
    punctuation_tokens = [token for token in tokens if token not in word_tokens]
    unique_words = {token.lower() for token in word_tokens}
    average_length = (
        round(sum(len(token) for token in word_tokens) / len(word_tokens), 2)
        if word_tokens
        else 0
    )

    return {
        "word_count": len(word_tokens),
        "punctuation_count": len(punctuation_tokens),
        "unique_word_count": len(unique_words),
        "average_word_length": average_length,
        "estimated_reading_seconds": max(1, round(len(word_tokens) / 3.3)) if word_tokens else 0,
    }


def context_summary(tokens: list[str], context_limit: int) -> dict:
    used = min(len(tokens), context_limit)
    overflow = max(0, len(tokens) - context_limit)
    return {
        "limit": context_limit,
        "used": used,
        "remaining": max(0, context_limit - used),
        "overflow": overflow,
        "fits": overflow == 0,
    }
