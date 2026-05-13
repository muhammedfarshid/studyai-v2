const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName:  { type: String, required: true },
  filename:      { type: String, required: true },
  fileType:      { type: String, enum: ['pdf', 'docx'], required: true },
  fileSize:      { type: Number, default: 0 },
  pageCount:     { type: Number, default: 0 },
  extractedText: { type: String, default: '' },
  summary:       { type: String, default: '' },
  status:        { type: String, enum: ['processing', 'indexed', 'error'], default: 'processing' },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
