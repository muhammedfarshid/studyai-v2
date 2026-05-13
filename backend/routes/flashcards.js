const express   = require('express');
const Flashcard = require('../models/Flashcard');
const Document  = require('../models/Document');
const Activity  = require('../models/Activity');
const { protect } = require('../middleware/auth');
const { generateFlashcards } = require('../utils/groqHelper');

const router = express.Router();

// Generate flashcards for a document
router.post('/generate/:docId', protect, async (req, res) => {
  const { count = 10 } = req.body;
  const doc = await Document.findOne({ _id: req.params.docId, user: req.user._id });
  if (!doc?.extractedText) return res.status(400).json({ message: 'Document not indexed yet' });

  const cards = await generateFlashcards(doc.extractedText, Math.min(count, 20));
  if (!cards.length) return res.status(500).json({ message: 'Failed to generate flashcards' });

  const docs = cards.map(c => ({ user: req.user._id, document: doc._id, term: c.term, definition: c.definition }));
  const saved = await Flashcard.insertMany(docs);

  await Activity.create({ user: req.user._id, type: 'flashcard', label: `Generated ${saved.length} flashcards`, docName: doc.originalName, meta: { count: saved.length } });
  res.json(saved);
});

// Get flashcards for a document
router.get('/document/:docId', protect, async (req, res) => {
  const cards = await Flashcard.find({ user: req.user._id, document: req.params.docId }).sort({ createdAt: -1 });
  res.json(cards);
});

// Toggle favorite
router.patch('/:id/favorite', protect, async (req, res) => {
  const card = await Flashcard.findOne({ _id: req.params.id, user: req.user._id });
  if (!card) return res.status(404).json({ message: 'Not found' });
  card.isFavorite = !card.isFavorite;
  await card.save();
  res.json(card);
});

// Delete all flashcards for a document
router.delete('/document/:docId', protect, async (req, res) => {
  await Flashcard.deleteMany({ user: req.user._id, document: req.params.docId });
  res.json({ message: 'Deleted' });
});

// Delete single flashcard
router.delete('/:id', protect, async (req, res) => {
  await Flashcard.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
});

module.exports = router;
