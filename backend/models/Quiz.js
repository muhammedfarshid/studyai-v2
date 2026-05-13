const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question:      { type: String, required: true },
  options:       [{ type: String }],
  correctAnswer: { type: Number, required: true }, // index of correct option
  explanation:   { type: String, default: '' },
});

const quizSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  document:    { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  questions:   [questionSchema],
  // Result fields (filled after quiz is taken)
  score:       { type: Number, default: null },
  totalQ:      { type: Number, default: 0 },
  answers:     [{ type: Number }], // user's chosen option indices
  completed:   { type: Boolean, default: false },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
