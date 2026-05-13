const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const Document = require('../models/Document');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');
const { extractText } = require('../utils/extractText');
const { generateSummary, explainConcept } = require('../utils/groqHelper');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    ok.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only PDF/DOCX allowed'));
  },
});

// Upload
router.post('/', protect, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const ext  = path.extname(req.file.originalname).toLowerCase().replace('.', '');
  const type = ext === 'pdf' ? 'pdf' : 'docx';

  const doc = await Document.create({
    user: req.user._id, originalName: req.file.originalname,
    filename: req.file.filename, fileType: type,
    fileSize: req.file.size, status: 'processing',
  });

  // Extract async
  extractText(req.file.path, type).then(async ({ text, pageCount }) => {
    doc.extractedText = text;
    doc.pageCount     = pageCount;
    doc.status        = text ? 'indexed' : 'error';
    await doc.save();
  });

  await Activity.create({ user: req.user._id, type: 'upload', label: 'Uploaded a document', docName: req.file.originalname });
  res.status(201).json({ _id: doc._id, originalName: doc.originalName, fileType: doc.fileType, fileSize: doc.fileSize, status: doc.status, createdAt: doc.createdAt });
});

// List
router.get('/', protect, async (req, res) => {
  const docs = await Document.find({ user: req.user._id }).select('-extractedText').sort({ createdAt: -1 });
  res.json(docs);
});

// Get one (no text)
router.get('/:id', protect, async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id }).select('-extractedText');
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

// Delete
router.delete('/:id', protect, async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  const fp = path.join(__dirname, '../uploads', doc.filename);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  await doc.deleteOne();
  res.json({ message: 'Deleted' });
});

// Generate / return summary
router.post('/:id/summary', protect, async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  if (doc.summary) return res.json({ summary: doc.summary });
  if (!doc.extractedText) return res.status(400).json({ message: 'Document not indexed yet' });

  const summary = await generateSummary(doc.extractedText);
  doc.summary = summary;
  await doc.save();
  await Activity.create({ user: req.user._id, type: 'summary', label: 'Generated document summary', docName: doc.originalName });
  res.json({ summary });
});

// Explain a concept
router.post('/:id/explain', protect, async (req, res) => {
  const { concept } = req.body;
  if (!concept) return res.status(400).json({ message: 'concept is required' });
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc || !doc.extractedText) return res.status(400).json({ message: 'Document not indexed' });
  const explanation = await explainConcept(doc.extractedText, concept);
  res.json({ explanation });
});

// Serve PDF file
router.get('/:id/file', protect, async (req, res) => {
  const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  const fp = path.join(__dirname, '../uploads', doc.filename);
  if (!fs.existsSync(fp)) return res.status(404).json({ message: 'File not found on disk' });
  res.sendFile(fp);
});

module.exports = router;
