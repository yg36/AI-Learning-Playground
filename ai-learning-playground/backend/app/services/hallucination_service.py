UNCERTAIN_PHRASES = [
    "latest",
    "today",
    "current",
    "always",
    "never",
    "guaranteed",
    "exact",
    "best",
    "all",
]


def build_recommendations(risk_score: int, found_phrases: list[str], overflow: bool) -> list[str]:
    recommendations = []

    if overflow:
        recommendations.append("Reduce the prompt, summarize it, or retrieve only the most relevant chunks.")

    if found_phrases:
        recommendations.append("Ask the model to cite sources or say when it does not know.")

    if risk_score == 0:
        recommendations.append("This prompt is already grounded. Add source text if you need factual precision.")

    recommendations.append("For important facts, verify the answer against a trusted source.")
    return recommendations


def assess_hallucination_risk(text: str, token_count: int, context_limit: int) -> dict:
    lower_text = text.lower()
    reasons = []
    overflow = token_count > context_limit

    if overflow:
        reasons.append("Input is larger than the context window, so useful details may be dropped.")

    found_phrases = [phrase for phrase in UNCERTAIN_PHRASES if phrase in lower_text]
    if found_phrases:
        reasons.append(
            "The text contains claims that often need verification: "
            + ", ".join(found_phrases[:4])
            + "."
        )

    if "?" in text and token_count < 12:
        reasons.append("The question is short, so the model may not have enough grounding context.")

    if not reasons:
        reasons.append("Risk looks low because the text is specific and fits the context window.")

    risk_score = 0
    if token_count > context_limit:
        risk_score += 2
    if found_phrases:
        risk_score += 1
    if len(text.strip()) < 50:
        risk_score += 1

    if risk_score >= 3:
        risk_level = "High"
    elif risk_score >= 1:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "reasons": reasons,
        "recommendations": build_recommendations(risk_score, found_phrases, overflow),
    }
