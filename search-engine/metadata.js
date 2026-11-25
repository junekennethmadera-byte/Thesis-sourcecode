function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = String(text || '').match(pattern);
    if (match?.[1]) return clean(match[1]).replace(/[|]+$/g, '').trim();
  }
  return '';
}

function extractMetadataFromText(text, existing = {}) {
  const source = String(text || '').replace(/\r/g, '\n');
  const lines = source.split(/\n+/).map(clean).filter(Boolean);
  const abstract = firstMatch(source, [
    /(?:abstract|summary)\s*[:\-]\s*([\s\S]{80,1800}?)(?=\b(?:keywords?|key words?|introduction)\b)/i,
    /\babstract\b\s+([\s\S]{80,1800}?)(?=\bkeywords?\b)/i
  ]);
  const keywords = firstMatch(source, [
    /(?:keywords?|key words?)\s*[:\-]\s*([^\n]{3,300})/i
  ]);
  const authors = firstMatch(source, [
    /(?:authors?|researchers?|prepared by|by)\s*[:\-]\s*([^\n]{3,240})/i
  ]);
  const title = firstMatch(source, [
    /(?:title|thesis title)\s*[:\-]\s*([^\n]{5,300})/i
  ]) || (!existing.title ? lines.find((line) => line.length >= 12 && line.length <= 300 && !/^(abstract|keywords?|chapter|introduction)$/i.test(line)) || '' : '');
  return {
    title: existing.title || title,
    authors: existing.authors || authors,
    abstract: existing.abstract || abstract,
    keywords: existing.keywords || keywords,
    provider: title || authors || abstract || keywords ? 'pdf-text-heuristics' : 'none'
  };
}

module.exports = { extractMetadataFromText };
