import { useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  BarChart3,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Database,
  FileQuestion,
  Gauge,
  Layers3,
  Loader2,
  RefreshCw,
  Scissors,
  ShieldAlert,
  Sparkles,
  Target,
} from 'lucide-react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const examples = [
  {
    label: 'Tokens',
    text: 'AI models read text as tokens, not full human sentences. A context window is the limited working memory that decides how much information the model can use at one time.',
  },
  {
    label: 'Risky prompt',
    text: 'What is the latest and best AI tool today? Give the exact answer and make sure it is guaranteed for all users.',
  },
  {
    label: 'Long context',
    text: 'RAG systems split documents into chunks, convert chunks into searchable representations, retrieve the most relevant chunks, and pass those chunks into the model. This helps the answer stay grounded in the provided source material instead of depending only on model memory.',
  },
]

const sampleDocument =
  'Tokens are small pieces of text used by AI models. A context window is the amount of text the model can consider at once. Temperature controls how predictable or creative a generated answer becomes. Hallucination means the AI produces a confident answer that is not grounded in reliable information. RAG means retrieval augmented generation, where relevant document chunks are retrieved before the AI writes an answer.'

const conceptCards = [
  ['Tokens', 'Text pieces processed by a model'],
  ['Context', 'The model working memory limit'],
  ['Temperature', 'Creativity versus predictability'],
  ['RAG', 'Retrieve useful text before answering'],
]

function App() {
  const promptRef = useRef(null)
  const analysisRef = useRef(null)
  const temperatureRef = useRef(null)
  const ragRef = useRef(null)
  const [text, setText] = useState(examples[0].text)
  const [contextLimit, setContextLimit] = useState(24)
  const [chunkSize, setChunkSize] = useState(18)
  const [temperature, setTemperature] = useState(0.4)
  const [documentText, setDocumentText] = useState(sampleDocument)
  const [question, setQuestion] = useState('What is RAG and why does it help?')
  const [analysis, setAnalysis] = useState(null)
  const [temperatureResult, setTemperatureResult] = useState(null)
  const [ragResult, setRagResult] = useState(null)
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')

  const usedPercent = useMemo(() => {
    if (!analysis?.context_window?.limit) return 0
    return Math.min(100, Math.round((analysis.context_window.used / analysis.context_window.limit) * 100))
  }, [analysis])

  const tokenFlow = useMemo(() => {
    if (!analysis) return []
    return analysis.tokens.map((token, index) => ({
      id: `${token}-${index}`,
      token,
      inContext: index < analysis.context_window.limit,
      order: index,
    }))
  }, [analysis])

  const riskClass = analysis?.hallucination?.risk_level?.toLowerCase() ?? 'low'

  function scrollToSection(sectionRef) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sectionRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  }

  async function callApi(path, payload) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('The Python backend returned an error.')
    }

    return response.json()
  }

  async function analyzeText() {
    setLoading('analysis')
    setError('')
    try {
      const result = await callApi('/api/analyze', {
        text,
        context_limit: Number(contextLimit),
        chunk_size: Number(chunkSize),
      })
      setAnalysis(result)
      window.setTimeout(() => scrollToSection(analysisRef), 80)
    } catch {
      setError('Start the Python backend, then try again.')
    } finally {
      setLoading('')
    }
  }

  async function generateTemperatureDemo() {
    setLoading('temperature')
    setError('')
    try {
      const result = await callApi('/api/temperature', {
        prompt: text,
        temperature: Number(temperature),
      })
      setTemperatureResult(result)
      window.setTimeout(() => scrollToSection(temperatureRef), 80)
    } catch {
      setError('Start the Python backend, then try again.')
    } finally {
      setLoading('')
    }
  }

  async function askDocument() {
    setLoading('rag')
    setError('')
    try {
      const result = await callApi('/api/rag', {
        document: documentText,
        question,
      })
      setRagResult(result)
      window.setTimeout(() => scrollToSection(ragRef), 80)
    } catch {
      setError('Start the Python backend, then try again.')
    } finally {
      setLoading('')
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">React + Python FastAPI</span>
          <h1>AI Learning Playground</h1>
          <p>
            A hands-on dashboard for tokens, context windows, temperature, hallucination risk,
            and RAG-style retrieval.
          </p>
          <div className="hero-actions">
            <button type="button" onClick={() => scrollToSection(promptRef)}>
              <ArrowDown size={18} />
              Start with input
            </button>
            <button className="secondary-button" type="button" onClick={() => scrollToSection(ragRef)}>
              <FileQuestion size={18} />
              Jump to RAG
            </button>
          </div>
        </div>

        <div className="hero-board" aria-label="AI concept cards">
          {conceptCards.map(([title, body], index) => (
            <div className="concept-card" key={title}>
              <span>0{index + 1}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="status-banner" role="alert">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <nav className="flow-nav" aria-label="Project workflow">
        <button type="button" onClick={() => scrollToSection(promptRef)}>
          <CircleDot size={15} />
          1 Input
        </button>
        <button type="button" onClick={() => scrollToSection(analysisRef)}>
          <CircleDot size={15} />
          2 Output
        </button>
        <button type="button" onClick={() => scrollToSection(temperatureRef)}>
          <CircleDot size={15} />
          3 Temperature
        </button>
        <button type="button" onClick={() => scrollToSection(ragRef)}>
          <CircleDot size={15} />
          4 RAG
        </button>
      </nav>

      <section className="workspace-grid">
        <div className="panel input-panel span-2 guided-panel input-focus" ref={promptRef}>
          <div className="section-ribbon">Input area</div>
          <div className="panel-heading">
            <Scissors size={22} />
            <div>
              <h2>Prompt Lab</h2>
              <p>Set the text, memory limit, and chunk size here. This is the data sent to Python.</p>
            </div>
          </div>

          <div className="example-row">
            {examples.map((example) => (
              <button
                className="chip-button"
                key={example.label}
                type="button"
                onClick={() => setText(example.text)}
              >
                {example.label}
              </button>
            ))}
          </div>

          <label htmlFor="text-input">Text</label>
          <textarea
            id="text-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={7}
          />

          <div className="settings-grid">
            <div>
              <label htmlFor="context-limit">Context window</label>
              <input
                id="context-limit"
                type="number"
                min="8"
                max="300"
                value={contextLimit}
                onChange={(event) => setContextLimit(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="chunk-size">Chunk size</label>
              <input
                id="chunk-size"
                type="number"
                min="4"
                max="120"
                value={chunkSize}
                onChange={(event) => setChunkSize(event.target.value)}
              />
            </div>
          </div>

          <div className="action-strip">
            <span>After setting inputs, run Python analysis.</span>
            <button type="button" onClick={analyzeText} disabled={loading === 'analysis'}>
              {loading === 'analysis' ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
              Analyze text
            </button>
          </div>
        </div>

        <div className="flow-arrow span-2" aria-hidden="true">
          <ArrowDown size={22} />
          Python returns structured output
        </div>

        <div className="panel output-panel span-2 guided-panel output-focus" ref={analysisRef}>
          <div className="section-ribbon output">Output area</div>
          <div className="panel-heading compact-heading">
            <BarChart3 size={22} />
            <div>
              <h2>Analysis Results</h2>
              <p>Token count, memory usage, chunking, and risk signals.</p>
            </div>
          </div>

          {analysis ? (
            <>
              <div className="concept-flow motion-result" aria-label="Prompt to token to context visualization">
                <div className="flow-card prompt-card">
                  <span className="flow-label">Prompt input</span>
                  <p>{text}</p>
                </div>

                <div className="flow-pipe" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="flow-card token-stage">
                  <span className="flow-label">Token stream</span>
                  <div className="flowing-token-row">
                    {tokenFlow.map((item) => (
                      <span
                        className={item.inContext ? 'flow-token' : 'flow-token overflow-token'}
                        key={item.id}
                        style={{ animationDelay: `${Math.min(item.order * 45, 900)}ms` }}
                      >
                        {item.token}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flow-card context-stage">
                  <div className="context-stage-header">
                    <span className="flow-label">Context window text</span>
                    <strong>{analysis.context_window.limit} token limit</strong>
                  </div>
                  <div className="context-window-visual">
                    {tokenFlow.map((item) => (
                      <span
                        className={item.inContext ? 'context-token' : 'context-token context-overflow'}
                        key={`context-${item.id}`}
                        style={{ animationDelay: `${Math.min(item.order * 38, 850)}ms` }}
                      >
                        {item.token}
                      </span>
                    ))}
                  </div>
                  <div className="context-legend">
                    <span><i className="legend-dot fit" /> Inside memory</span>
                    <span><i className="legend-dot overflow" /> Overflow</span>
                  </div>
                </div>
              </div>

              <div className="machine-row motion-result">
                <div className="machine-card chunk-machine">
                  <div className="machine-title">
                    <Database size={18} />
                    <span>Chunk assembler</span>
                  </div>
                  <div className="chunk-conveyor">
                    {analysis.chunks.map((chunk, index) => (
                      <div
                        className="moving-chunk"
                        key={chunk.id}
                        style={{ animationDelay: `${Math.min(index * 130, 650)}ms` }}
                      >
                        <strong>Chunk {chunk.id}</strong>
                        <span>{chunk.token_count} tokens</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`machine-card risk-machine ${riskClass}`}>
                  <div className="machine-title">
                    <ShieldAlert size={18} />
                    <span>Hallucination risk scanner</span>
                  </div>
                  <div className="risk-beacon">
                    <span />
                    <strong>{analysis.hallucination.risk_level}</strong>
                  </div>
                  <p>{analysis.hallucination.reasons[0]}</p>
                </div>
              </div>

              <div className="metric-row four">
                <div>
                  <span>Total tokens</span>
                  <strong>{analysis.token_count}</strong>
                </div>
                <div>
                  <span>Unique words</span>
                  <strong>{analysis.token_summary.unique_word_count}</strong>
                </div>
                <div>
                  <span>Chunks</span>
                  <strong>{analysis.chunks.length}</strong>
                </div>
                <div className={`risk-card ${riskClass}`}>
                  <span>Risk</span>
                  <strong>{analysis.hallucination.risk_level}</strong>
                </div>
              </div>

              <div className="context-meter">
                <div className="meter-label">
                  <span>{analysis.context_window.used} tokens used</span>
                  <span>{analysis.context_window.overflow} overflow</span>
                </div>
                <div className="meter-track">
                  <span style={{ width: `${usedPercent}%` }} />
                </div>
              </div>

              <div className="result-columns">
                <div>
                  <h3>Tokens</h3>
                  <div className="token-cloud">
                    {analysis.tokens.map((token, index) => (
                      <span key={`${token}-${index}`}>{token}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3>Chunks</h3>
                  <div className="chunk-list">
                    {analysis.chunks.map((chunk) => (
                      <div key={chunk.id}>
                        <span>Chunk {chunk.id} - {chunk.token_count} tokens</span>
                        <p>{chunk.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="insight-grid">
                <div>
                  <h3>Risk reasons</h3>
                  {analysis.hallucination.reasons.map((reason) => (
                    <p key={reason}>{reason}</p>
                  ))}
                </div>
                <div>
                  <h3>Recommendations</h3>
                  {analysis.hallucination.recommendations.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <ClipboardList size={34} />
              Run the analyzer to see Python-generated token, context, and risk details.
            </div>
          )}
        </div>

        <div className="panel guided-panel" ref={temperatureRef}>
          <div className="section-ribbon">Set value</div>
          <div className="panel-heading">
            <Gauge size={22} />
            <div>
              <h2>Temperature Demo</h2>
              <p>Move the slider to compare predictable and creative output.</p>
            </div>
          </div>

          <div className={`temperature-orb level-${Math.round(Number(temperature) * 10)}`}>
            <div className="orb-core">
              <Sparkles size={28} />
              <strong>{temperature}</strong>
            </div>
            <div className="orb-caption">
              {Number(temperature) <= 0.3
                ? 'Predictable'
                : Number(temperature) <= 0.7
                  ? 'Balanced'
                  : 'Creative'}
            </div>
          </div>

          <label htmlFor="temperature">Temperature: {temperature}</label>
          <input
            id="temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(event) => setTemperature(event.target.value)}
          />
          <div className="temperature-scale">
            <span>Focused</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
          <div className="action-strip compact">
            <span>Slider input becomes style output.</span>
            <button type="button" onClick={generateTemperatureDemo} disabled={loading === 'temperature'}>
              {loading === 'temperature' ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
              Generate demo answer
            </button>
          </div>

          {temperatureResult && (
            <div className="answer-box motion-result">
              <span>{temperatureResult.style}</span>
              <p>{temperatureResult.answer}</p>
            </div>
          )}
        </div>

        <div className="panel guided-panel" ref={ragRef}>
          <div className="section-ribbon">Input + output</div>
          <div className="panel-heading">
            <Layers3 size={22} />
            <div>
              <h2>Mini RAG Demo</h2>
              <p>Retrieve matching document chunks before creating an answer.</p>
            </div>
          </div>

          <label htmlFor="document">Knowledge text</label>
          <textarea
            id="document"
            value={documentText}
            onChange={(event) => setDocumentText(event.target.value)}
            rows={6}
          />

          <label htmlFor="question">Question</label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />

          <div className="action-strip compact">
            <span>Question plus knowledge text goes to retrieval.</span>
            <button type="button" onClick={askDocument} disabled={loading === 'rag'}>
              {loading === 'rag' ? <Loader2 className="spin" size={18} /> : <FileQuestion size={18} />}
              Ask document
            </button>
          </div>

          {ragResult && (
            <div className="rag-results motion-result">
              <div className="retrieval-map">
                <div className="question-node">
                  <Target size={18} />
                  <span>{ragResult.question}</span>
                </div>
                <div className="retrieval-beam" />
                <div className="retrieved-node-list">
                  {ragResult.retrieved_chunks.length > 0 ? (
                    ragResult.retrieved_chunks.map((chunk, index) => (
                      <div
                        className="retrieved-node"
                        key={`node-${chunk.id}`}
                        style={{ animationDelay: `${index * 160}ms` }}
                      >
                        <strong>Chunk {chunk.id}</strong>
                        <span>{chunk.matched_terms.join(', ')}</span>
                      </div>
                    ))
                  ) : (
                    <div className="retrieved-node no-match">
                      <strong>No match</strong>
                      <span>Try a question closer to the document.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="answer-box">
                <span>Confidence: {ragResult.confidence}</span>
                <p>{ragResult.answer}</p>
              </div>
              {ragResult.retrieved_chunks.map((chunk) => (
                <div className="evidence-card" key={chunk.id}>
                  <CheckCircle2 size={16} />
                  <div>
                    <strong>Chunk {chunk.id}</strong>
                    <span>Matched: {chunk.matched_terms.join(', ') || 'none'}</span>
                    <p>{chunk.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
