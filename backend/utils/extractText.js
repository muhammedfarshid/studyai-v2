const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');
const fs       = require('fs');

async function extractText(filePath, fileType) {
  try {
    if (fileType === 'pdf') {
      const buf  = fs.readFileSync(filePath);
      const data = await pdfParse(buf);
      return { text: data.text || '', pageCount: data.numpages || 0 };
    }
    if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      const text   = result.value || '';
      return { text, pageCount: Math.max(1, Math.round(text.split(/\s+/).length / 500)) };
    }
    return { text: '', pageCount: 0 };
  } catch (e) {
    console.error('extractText error:', e.message);
    return { text: '', pageCount: 0 };
  }
}

// Split text into overlapping chunks
function chunkText(text, size = 3000, overlap = 300) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }
  return chunks;
}

// Score chunks by query relevance (keyword matching)
function getRelevantContext(text, query, maxChars = 12000) {
  if (text.length <= maxChars) return text;
  const chunks   = chunkText(text);
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const scored   = chunks.map((c, i) => {
    const lower = c.toLowerCase();
    const score = keywords.reduce((acc, w) => acc + (lower.match(new RegExp(w, 'g')) || []).length, 0);
    return { c, score, i };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).sort((a, b) => a.i - b.i).map(x => x.c).join('\n\n---\n\n');
}

module.exports = { extractText, chunkText, getRelevantContext };
