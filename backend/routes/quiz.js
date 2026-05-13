const express  = require('express');
const Quiz     = require('../models/Quiz');
const Document = require('../models/Document');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');
const { generateQuiz } = require('../utils/groqHelper');

const router = express.Router();

// Generate a new quiz
router.post('/generate/:docId', protect, async (req, res) => {
  const { questionCount = 5 } = req.body;
  const doc = await Document.findOne({ _id: req.params.docId, user: req.user._id });
  if (!doc?.extractedText) return res.status(400).json({ message: 'Document not indexed yet' });

  const questions = await generateQuiz(doc.extractedText, Math.min(questionCount, 15));
  if (!questions.length) return res.status(500).json({ message: 'Failed to generate quiz' });

  const quiz = await Quiz.create({
    user: req.user._id, document: doc._id,
    questions, totalQ: questions.length,
  });

  await Activity.create({ user: req.user._id, type: 'quiz', label: `Generated a ${questions.length}-question quiz`, docName: doc.originalName });
  res.json(quiz);
});

// Get quizzes for a document
router.get('/document/:docId', protect, async (req, res) => {
  const quizzes = await Quiz.find({ user: req.user._id, document: req.params.docId })
    .select('-questions.explanation').sort({ createdAt: -1 });
  res.json(quizzes);
});

// Get single quiz (full)
router.get('/:id', protect, async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) return res.status(404).json({ message: 'Not found' });
  res.json(quiz);
});

// Submit quiz answers
router.post('/:id/submit', protect, async (req, res) => {
  const { answers } = req.body;
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) return res.status(404).json({ message: 'Not found' });
  if (quiz.completed) return res.status(400).json({ message: 'Quiz already completed' });

  const score = answers.reduce((acc, ans, i) =>
    acc + (quiz.questions[i] && ans === quiz.questions[i].correctAnswer ? 1 : 0), 0);

  quiz.answers   = answers;
  quiz.score     = score;
  quiz.completed = true;
  quiz.completedAt = new Date();
  await quiz.save();

  const doc = await Document.findById(quiz.document);
  await Activity.create({ user: req.user._id, type: 'quiz', label: `Completed quiz — ${score}/${quiz.totalQ} correct`, docName: doc?.originalName || '' });
  res.json({ score, totalQ: quiz.totalQ, questions: quiz.questions, answers });
});

module.exports = router;
