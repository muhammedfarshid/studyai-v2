const express  = require('express');
const Chat     = require('../models/Chat');
const Document = require('../models/Document');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');
const { askQuestion } = require('../utils/groqHelper');

const router = express.Router();

// List chats for a document
router.get('/document/:docId', protect, async (req, res) => {
  const chats = await Chat.find({ user: req.user._id, document: req.params.docId })
    .select('title createdAt updatedAt').sort({ updatedAt: -1 });
  res.json(chats);
});

// Get single chat
router.get('/:id', protect, async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
  if (!chat) return res.status(404).json({ message: 'Not found' });
  res.json(chat);
});

// Create chat for document
router.post('/document/:docId', protect, async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.docId, user: req.user._id });
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  const chat = await Chat.create({ user: req.user._id, document: doc._id, title: 'New Chat', messages: [] });
  res.status(201).json(chat);
});

// Ask question
router.post('/:id/ask', protect, async (req, res) => {
  const { question } = req.body;
  if (!question?.trim()) return res.status(400).json({ message: 'Question required' });

  const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
  if (!chat) return res.status(404).json({ message: 'Chat not found' });

  const doc = await Document.findById(chat.document);
  if (!doc?.extractedText) return res.status(400).json({ message: 'Document not indexed yet' });

  const history = chat.messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
  const answer  = await askQuestion(doc.extractedText, question, history);

  chat.messages.push({ role: 'user',      content: question });
  chat.messages.push({ role: 'assistant', content: answer });
  if (chat.title === 'New Chat') chat.title = question.slice(0, 60);
  await chat.save();

  await Activity.create({ user: req.user._id, type: 'chat', label: 'Asked a question', docName: doc.originalName, meta: { question: question.slice(0, 80) } });
  res.json({ answer, chatId: chat._id });
});

// Delete chat
router.delete('/:id', protect, async (req, res) => {
  await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
});

module.exports = router;
