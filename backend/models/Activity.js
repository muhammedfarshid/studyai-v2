const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['upload', 'chat', 'flashcard', 'quiz', 'summary'], required: true },
  label:   { type: String, required: true },
  docName: { type: String, default: '' },
  meta:    { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
