// Lightweight TF-IDF vector search 
function tokenize(text) { return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean) }

function tfidf(docs) {
  const df = {}
  docs.forEach(d => { const seen = new Set(); tokenize(d).forEach(w => { if (!seen.has(w)) { df[w] = (df[w] || 0) + 1; seen.add(w) } }) })
  return docs.map(d => {
    const tokens = tokenize(d); const tf = {}
    tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1 })
    const vec = {}
    Object.keys(tf).forEach(t => { vec[t] = (tf[t] / tokens.length) * Math.log(docs.length / (df[t] || 1)) })
    return vec
  })
}

function cosine(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  let dot = 0, magA = 0, magB = 0
  keys.forEach(k => { dot += (a[k]||0)*(b[k]||0); magA += (a[k]||0)**2; magB += (b[k]||0)**2 })
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0
}

export function searchNotes(query, notes) {
  if (!notes.length) return []
  const docs = notes.map(n => n.content)
  docs.push(query)
  const vecs = tfidf(docs)
  const qVec = vecs.pop()
  const scored = notes.map((n, i) => ({ ...n, score: cosine(vecs[i], qVec) }))
  return scored.filter(s => s.score > 0.01).sort((a, b) => b.score - a.score)
}
