const STOP_WORDS = new Set(['about', 'after', 'again', 'also', 'because', 'from', 'have', 'into', 'more', 'that', 'their', 'there', 'these', 'this', 'those', 'through', 'with', 'which', 'what', 'when', 'where', 'while', 'will', 'would', 'your']);

function tokenize(value) {
  return String(value || '').toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 3 && !STOP_WORDS.has(token));
}

function makeNgrams(tokens, size = 8) {
  const ngrams = new Map();
  for (let index = 0; index <= tokens.length - size; index += 1) {
    const phrase = tokens.slice(index, index + size).join(' ');
    if (!ngrams.has(phrase)) ngrams.set(phrase, index);
  }
  return ngrams;
}

function compareTexts(sourceText, candidateText) {
  const sourceTokens = tokenize(sourceText);
  const candidateTokens = tokenize(candidateText);
  if (sourceTokens.length < 6 || candidateTokens.length < 6) return { score: 0, matchedPhrases: [], matchedWords: 0 };

  const sourceWords = new Set(sourceTokens);
  const candidateWords = new Set(candidateTokens);
  const sharedWords = [...sourceWords].filter((word) => candidateWords.has(word));
  const jaccard = sharedWords.length / new Set([...sourceWords, ...candidateWords]).size;
  const ngramSize = Math.min(8, Math.max(4, Math.floor(Math.min(sourceTokens.length, candidateTokens.length) / 2)));
  const sourceNgrams = makeNgrams(sourceTokens, ngramSize);
  const candidateNgrams = makeNgrams(candidateTokens, ngramSize);
  const matches = [...sourceNgrams.keys()].filter((phrase) => candidateNgrams.has(phrase));
  const phraseCoverage = sourceNgrams.size ? matches.length / sourceNgrams.size : 0;
  const score = Math.min(100, Math.round((phraseCoverage * 75 + jaccard * 25) * 100) / 100);
  return {
    score,
    matchedWords: sharedWords.length,
    matchedPhrases: matches.slice(0, 10).map((phrase) => phrase.split(' ').join(' '))
  };
}

function reportPlagiarism(sourceText, candidates) {
  const matches = candidates.map((candidate) => {
    const comparison = compareTexts(sourceText, candidate.text);
    return {
      manuscriptId: candidate.id,
      title: candidate.title,
      category: candidate.category,
      status: candidate.status,
      score: comparison.score,
      matchedWords: comparison.matchedWords,
      matchedPhrases: comparison.matchedPhrases
    };
  }).filter((match) => match.score > 0).sort((left, right) => right.score - left.score);
  const highest = matches[0]?.score || 0;
  return {
    provider: 'internal-corpus-ngram-analysis',
    checkedDocuments: candidates.length,
    similarity: highest,
    originality: Math.max(0, Math.round((100 - highest) * 100) / 100),
    risk: highest >= 40 ? 'high' : highest >= 20 ? 'medium' : 'low',
    matches: matches.slice(0, 10)
  };
}

async function checkExternalPlagiarism(sourceText) {
  const endpoint = String(process.env.PLAGIARISM_API_URL || '').trim();
  if (!endpoint) return null;
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (process.env.PLAGIARISM_API_KEY) headers.Authorization = `Bearer ${process.env.PLAGIARISM_API_KEY}`;
  const response = await fetch(endpoint, {
    method: 'POST', headers, body: JSON.stringify({ text: String(sourceText || '') }), signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`External plagiarism provider returned ${response.status}.`);
  const payload = await response.json();
  const similarity = Number(payload.similarity ?? payload.similarityScore ?? payload.score ?? 0);
  return {
    provider: 'external-plagiarism-provider',
    similarity: Math.min(100, Math.max(0, similarity)),
    originality: Math.min(100, Math.max(0, Number(payload.originality ?? (100 - similarity)))),
    report: payload.report || payload.matches || null
  };
}

module.exports = { checkExternalPlagiarism, reportPlagiarism };
