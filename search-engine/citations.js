function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function yearOf(item) {
  return item?.published?.['date-parts']?.[0]?.[0]
    || item?.publishedPrint?.['date-parts']?.[0]?.[0]
    || item?.issued?.['date-parts']?.[0]?.[0]
    || 'n.d.';
}

function authorsOf(item) {
  return (item.author || []).map((author) => ({
    given: clean(author.given),
    family: clean(author.family || author.name)
  })).filter((author) => author.family);
}

function apaAuthors(authors) {
  return authors.map((author) => {
    const initials = author.given.split(/\s+/).filter(Boolean).map((part) => `${part[0]}.`).join(' ');
    return `${author.family}, ${initials}`.trim();
  }).join(', ');
}

function mlaAuthors(authors) {
  if (!authors.length) return '';
  const first = `${authors[0].family}, ${authors[0].given}`.trim();
  if (authors.length === 1) return first;
  return `${first}, et al.`;
}

function formatCitation(item, style = 'APA') {
  const title = clean(item.title?.[0] || item.title || 'Untitled work');
  const journal = clean(item['container-title']?.[0] || item.journal || '');
  const authors = authorsOf(item);
  const year = yearOf(item);
  const doi = item.DOI ? `https://doi.org/${item.DOI}` : clean(item.URL || '');
  const volume = clean(item.volume);
  const issue = clean(item.issue);
  const pages = clean(item.page);
  if (style.toUpperCase() === 'MLA') {
    const journalPart = journal ? ` ${journal},` : '';
    const volumePart = volume ? ` vol. ${volume},` : '';
    const issuePart = issue ? ` no. ${issue},` : '';
    const pagesPart = pages ? ` pp. ${pages},` : '';
    return `${mlaAuthors(authors)}. "${title}."${journalPart}${volumePart}${issuePart}${year},${pagesPart} ${doi}`.replace(/\s+/g, ' ').replace(/,\s+$/, '').trim();
  }
  const journalPart = journal ? ` ${journal}` : '';
  const volumePart = volume ? `, ${volume}` : '';
  const issuePart = issue ? `(${issue})` : '';
  const pagesPart = pages ? `, ${pages}` : '';
  return `${apaAuthors(authors) || 'Unknown author'} (${year}). ${title}.${journalPart}${volumePart}${issuePart}${pagesPart}. ${doi}`.replace(/\s+/g, ' ').trim();
}

async function recommendCitations(query, { limit = 6, style = 'APA' } = {}) {
  const normalized = clean(query);
  if (!normalized) return { provider: 'crossref', query: normalized, results: [] };
  const url = new URL('https://api.crossref.org/works');
  url.searchParams.set('query.bibliographic', normalized);
  url.searchParams.set('rows', String(Math.min(20, Math.max(1, limit))));
  url.searchParams.set('select', 'DOI,title,author,published,container-title,volume,issue,page,URL,type');
  const headers = { Accept: 'application/json', 'User-Agent': `Mabini-EDataBanking/1.0${process.env.CROSSREF_MAILTO ? ` (mailto:${process.env.CROSSREF_MAILTO})` : ''}` };
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Crossref returned ${response.status}`);
  const payload = await response.json();
  return {
    provider: 'Crossref',
    query: normalized,
    results: (payload.message?.items || []).map((item) => ({
      title: clean(item.title?.[0] || 'Untitled work'),
      authors: authorsOf(item),
      year: yearOf(item),
      journal: clean(item['container-title']?.[0] || ''),
      doi: clean(item.DOI),
      url: clean(item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : '')),
      apa: formatCitation(item, 'APA'),
      mla: formatCitation(item, 'MLA')
    }))
  };
}

function analyzeCitationConsistency(text) {
  const source = String(text || '');
  const inTextAuthorYear = [...source.matchAll(/\(([A-Z][A-Za-z'’-]{2,})(?:\s+et\s+al\.)?,?\s+(19|20)\d{2}[a-z]?\)/g)];
  const numberedCitations = [...source.matchAll(/\[(\d{1,3}(?:\s*[,;–-]\s*\d{1,3})*)\]/g)];
  const referenceSection = source.match(/\b(?:references|bibliography|works cited)\b([\s\S]*)/i)?.[1] || '';
  const referenceEntries = referenceSection.split(/\n{2,}|(?=\d+\.\s)/).map(clean).filter((entry) => entry.length > 30);
  const issues = [];
  if (!inTextAuthorYear.length && !numberedCitations.length) issues.push('No recognizable in-text citations were detected.');
  if ((inTextAuthorYear.length || numberedCitations.length) && !referenceSection) issues.push('In-text citations were detected but no References/Bibliography section was found.');
  if (referenceSection && !referenceEntries.length) issues.push('A References section exists but no complete reference entries were detected.');
  return {
    provider: 'citation-pattern-analysis',
    inTextCitations: inTextAuthorYear.length + numberedCitations.length,
    referenceEntries: referenceEntries.length,
    consistent: issues.length === 0,
    issues
  };
}

module.exports = { analyzeCitationConsistency, formatCitation, recommendCitations };
