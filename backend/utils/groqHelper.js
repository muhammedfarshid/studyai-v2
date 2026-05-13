const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Generic completion call
async function groqChat(messages, { model = 'llama-3.1-8b-instant', temperature = 0.3, max_tokens = 2048 } = {}) {
  const res = await groq.chat.completions.create({ model, messages, temperature, max_tokens });
  return res.choices[0]?.message?.content || '';
}

// Context-aware QA
async function askQuestion(docText, question, history = []) {
  const context = docText.slice(0, 14000);
  const systemMsg = {
    role: 'system',
    content: `You are StudyAI, a helpful learning assistant for students.
Answer questions ONLY from the document context below.
If not found, say: "This topic is not covered in the document."
Be clear, detailed, and student-friendly. Use bullet points where helpful.

DOCUMENT CONTEXT:
${context}`,
  };
  const msgs = [systemMsg, ...history.slice(-6), { role: 'user', content: question }];
  return groqChat(msgs, { temperature: 0.2, max_tokens: 1500 });
}

// Generate summary
async function generateSummary(docText) {
  const context = docText.slice(0, 14000);
  return groqChat([{
    role: 'user',
    content: `Summarize the following study document concisely. 
Include: main topics, key concepts, and important points.
Format with clear headings and bullet points.

DOCUMENT:
${context}`,
  }], { temperature: 0.3, max_tokens: 1000 });
}

// Explain a concept
async function explainConcept(docText, concept) {
  const context = docText.slice(0, 14000);
  return groqChat([{
    role: 'user',
    content: `Based on this document, explain the concept: "${concept}"
Give a clear, detailed explanation suitable for a student.
Include examples if mentioned in the document.

DOCUMENT:
${context}`,
  }], { temperature: 0.3, max_tokens: 1200 });
}

// Generate flashcards — returns JSON array
async function generateFlashcards(docText, count = 10) {
  const context = docText.slice(0, 14000);
  const raw = await groqChat([{
    role: 'user',
    content: `Extract ${count} important key terms and definitions from this document.
Return ONLY a valid JSON array (no markdown, no extra text) like:
[{"term":"...","definition":"..."},...]

DOCUMENT:
${context}`,
  }], { temperature: 0.2, max_tokens: 2000 });

  try {
    // Remove markdown code blocks and whitespace
    const clean = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
    const arr = JSON.parse(clean);
    if (Array.isArray(arr)) return arr.slice(0, count);
  } catch (e) {
    // Fallback: extract JSON array from response
    const match = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      try {
        const arr = JSON.parse(match[0]);
        if (Array.isArray(arr)) return arr.slice(0, count);
      } catch (e2) {
        console.error('Flashcard JSON parse error:', e2.message, 'Raw:', raw.substring(0, 200));
      }
    } else {
      console.error('No JSON array found in flashcard response:', raw.substring(0, 200));
    }
  }
  return [];
}

// Generate quiz — returns JSON array
async function generateQuiz(docText, questionCount = 5) {
  const context = docText.slice(0, 14000);
  const raw = await groqChat([{
    role: 'user',
    content: `Generate ${questionCount} multiple-choice quiz questions from this document.
Each question must have exactly 4 options (A,B,C,D).
Return ONLY a valid JSON array (no markdown, no extra text) like:
[{"question":"...","options":["A)...","B)...","C)...","D)..."],"correctAnswer":0,"explanation":"..."},...]
correctAnswer is the 0-based index of the correct option.

DOCUMENT:
${context}`,
  }], { temperature: 0.3, max_tokens: 3000 });

  try {
    // Remove markdown code blocks and whitespace
    const clean = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
    const arr = JSON.parse(clean);
    if (Array.isArray(arr)) return arr.slice(0, questionCount);
  } catch (e) {
    // Fallback: extract JSON array from response
    const match = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      try {
        const arr = JSON.parse(match[0]);
        if (Array.isArray(arr)) return arr.slice(0, questionCount);
      } catch (e2) {
        console.error('Quiz JSON parse error:', e2.message, 'Raw:', raw.substring(0, 200));
      }
    } else {
      console.error('No JSON array found in quiz response:', raw.substring(0, 200));
    }
  }
  return [];
}

module.exports = { askQuestion, generateSummary, explainConcept, generateFlashcards, generateQuiz };
