const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  document:   { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  term:       { type: String, required: true },
  definition: { type: String, required: true },
  isFavorite: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', flashcardSchema);
