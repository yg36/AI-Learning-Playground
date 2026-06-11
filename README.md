# AI Learning Playground

A full-stack learning project that turns five AI concepts into interactive demos.

## What this project teaches

- Tokens: small pieces of text that models process.
- Context window: the limited working memory available to a model.
- Temperature: a control for predictable versus creative output.
- Hallucination risk: why confident answers still need grounding.
- RAG: retrieval augmented generation, where relevant text is retrieved before answering.
- Chunking: breaking long text into smaller pieces that can be retrieved or passed to a model.
- Confidence signals: simple scoring that explains whether retrieved text matched the question well.

## Tech stack

- React with Vite for the frontend.
- Python with FastAPI for the backend.
- Pydantic for request validation.
- Plain CSS for styling.
- Pytest for backend service tests.

## Interview explanation

The frontend is responsible for user interaction and visual output. The backend owns the AI concept logic. React sends JSON requests to FastAPI, Python processes the text, and FastAPI returns JSON results. This separation is similar to a real AI product because the interface and intelligence layer can evolve independently.

The app has three main workflows:

- Prompt Lab: sends text, context window size, and chunk size to Python for token analysis.
- Temperature Demo: simulates how generation style changes at low, medium, and high temperature.
- Mini RAG Demo: retrieves matching document sentences, shows matched terms, estimates confidence, and answers from the retrieved evidence.

The Python tests cover token splitting, chunking, context overflow, hallucination risk scoring, temperature labels, sentence splitting, retrieval matching, and low-confidence no-match cases.

## Run the backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend runs at `http://localhost:8000`.

## Run the frontend

Open another terminal:

```bash
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Useful API routes

- `GET /api/health`
- `POST /api/analyze`
- `POST /api/temperature`
- `POST /api/rag`

FastAPI also gives automatic API docs at `http://localhost:8000/docs`.
