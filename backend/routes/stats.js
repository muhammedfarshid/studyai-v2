const express   = require('express');
const Document  = require('../models/Document');
const Flashcard = require('../models/Flashcard');
const Quiz      = require('../models/Quiz');
const Chat      = require('../models/Chat');
const Activity  = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const uid = req.user._id;
  const [docs, flashcards, quizzes, chats, activities] = await Promise.all([
    Document.countDocuments({ user: uid }),
    Flashcard.countDocuments({ user: uid }),
    Quiz.countDocuments({ user: uid, completed: true }),
    Chat.countDocuments({ user: uid }),
    Activity.find({ user: uid }).sort({ createdAt: -1 }).limit(10),
  ]);

  const completedQuizzes = await Quiz.find({ user: uid, completed: true }).select('score totalQ');
  const avgScore = completedQuizzes.length
    ? Math.round(completedQuizzes.reduce((a, q) => a + (q.score / q.totalQ) * 100, 0) / completedQuizzes.length)
    : 0;

  res.json({ docs, flashcards, quizzesTaken: quizzes, chats, avgScore, activities });
});

module.exports = router;
