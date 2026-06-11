LOW_TEMPERATURE_ENDINGS = [
    "The safest answer is to explain the concept directly and avoid extra assumptions.",
    "A focused response should define the term, give one example, and stop there.",
    "The model should prefer the most likely wording and keep the answer predictable.",
]

MEDIUM_TEMPERATURE_ENDINGS = [
    "A balanced answer can include a short analogy and one practical use case.",
    "The response can be clear, friendly, and still stay close to the question.",
    "This setting gives enough variety without drifting away from the topic.",
]

HIGH_TEMPERATURE_ENDINGS = [
    "The answer may become more imaginative, using unusual comparisons or broader examples.",
    "This can help brainstorming, but it also increases the chance of less grounded output.",
    "Creative variation becomes stronger, so review the answer before trusting it.",
]


def generate_temperature_demo(prompt: str, temperature: float) -> dict:
    clean_prompt = " ".join(prompt.split())[:180]

    if temperature <= 0.3:
        style = "Low temperature: focused and predictable"
        choices = LOW_TEMPERATURE_ENDINGS
    elif temperature <= 0.7:
        style = "Medium temperature: balanced"
        choices = MEDIUM_TEMPERATURE_ENDINGS
    else:
        style = "High temperature: creative and varied"
        choices = HIGH_TEMPERATURE_ENDINGS

    index = int(round(temperature * (len(choices) - 1)))
    ending = choices[index]

    return {
        "style": style,
        "answer": f"For the prompt '{clean_prompt}', temperature {temperature:.1f} means: {ending}",
    }
