# StudyAI v2 — Project Overview

## 1. What you built

This is a full-stack learning assistant app that lets users upload study documents, then uses AI to:
- answer questions about the document
- generate summaries
- explain concepts
- build flashcards
- create quiz questions

It is built with:
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- AI: Groq SDK
- Auth: JWT + bcrypt

## 2. Where data is stored

### 2.1 Uploaded files
- Uploaded documents are saved on disk in `backend/uploads`
- The backend serves them from `/api/documents/:id/file`

### 2.2 MongoDB collections
Your app stores user and document state in MongoDB. The main models are:

- `User` — user accounts and login info
- `Document` — metadata and extracted text for each uploaded file
- `Chat` — chat sessions and message history for document Q&A
- `Flashcard` — generated flashcards tied to a document
- `Quiz` — generated quizzes and quiz answers
- `Activity` — user history for uploads, chat, summaries, etc.

### 2.3 Environment variables
The app uses `backend/.env` for secrets and configuration:
- `PORT` — backend server port, e.g. `5004`
- `MONGO_URI` — MongoDB connection string, e.g. `mongodb://localhost:27017/studyai`
- `JWT_SECRET` — secret key used to sign and verify JWTs
- `GROQ_API_KEY` — API key for Groq AI

## 3. How the project works

### 3.1 Backend startup
In `backend/server.js`:
- connect to MongoDB using `process.env.MONGO_URI`
- create `backend/uploads` if missing
- mount routes for auth, documents, chat, flashcards, quiz, stats
- enable CORS for frontend at `http://localhost:5173`

### 3.2 Authentication flow
- Users register and login through `backend/routes/auth.js`
- Passwords are hashed with `bcrypt`
- Successful login returns a JWT signed with `JWT_SECRET`
- Protected routes use `backend/middleware/auth.js`
  - reads `Authorization: Bearer <token>`
  - verifies token with `JWT_SECRET`
  - attaches `req.user` to the request

### 3.3 Document upload and storage
In `backend/routes/documents.js`:
- upload endpoint uses `multer` for `pdf` and `docx`
- saves file info in `Document` collection
- asynchronously extracts text from uploaded file
  - PDFs and DOCX are parsed in `backend/utils/extractText.js`
- extracted text is stored in `Document.extractedText`
- document status becomes `indexed` after extraction

### 3.4 AI features and Groq integration
In `backend/utils/groqHelper.js`:
- `groqChat(...)` sends chat messages to Groq AI
- default model is `llama-3.1-8b-instant`
- AI features include:
  - `askQuestion` for chat answers
  - `generateSummary`
  - `explainConcept`
  - `generateFlashcards`
  - `generateQuiz`

### 3.5 Chat Q&A flow
In `backend/routes/chat.js`:
- users create chat sessions for each document
- questions are sent to `/api/chat/:chatId/ask`
- the backend loads the document text
- it sends the document context plus recent chat history to Groq
- AI answer is saved to the `Chat` record and returned to frontend

### 3.6 Summary and explain concept
In `backend/routes/documents.js`:
- `/api/documents/:id/summary` generates or returns cached summary
- `/api/documents/:id/explain` returns an explanation of a requested concept

### 3.7 Flashcards and quiz generation
- `/api/flashcards/generate/:docId` generates flashcards from document text
- `/api/quiz/generate/:docId` generates multiple-choice quiz questions
- flashcards and quizzes are stored in MongoDB
- flashcards have `term`, `definition`, and `isFavorite`
- quizzes store questions, options, correct answer, and completion status

## 4. Frontend flow

### 4.1 Main pages
- `frontend/src/pages/Documents.jsx` — document list and upload page
- `frontend/src/pages/DocDetail.jsx` — selected document viewer and AI tools
- `frontend/src/pages/Flashcards.jsx` — flashcard study + grid view
- `frontend/src/pages/QuizPage.jsx` — generate and take quizzes
- `frontend/src/pages/Login.jsx` / `Register.jsx` — auth UI

### 4.2 Document detail user experience
From `DocDetail.jsx`:
- left side shows document preview for PDF files
- right side has tool tabs:
  - AI Chat
  - Summary
  - Flashcards link
  - Quiz link

### 4.3 Flashcards page behavior
From `Flashcards.jsx`:
- requests flashcards from `/api/flashcards/document/:docId`
- can switch between grid view and study mode
- cards flip by toggling internal state
- users can favorite or delete flashcards
- new flashcards are generated with a slider input count

### 4.4 Quiz page behavior
From `QuizPage.jsx`:
- loads quizzes for the document from `/api/quiz/document/:docId`
- generates a new quiz with question count
- starts a quiz and tracks selected answers
- submits answers to `/api/quiz/:id/submit`
- completed quizzes show score and can be reviewed

## 5. Where to look if you want to change behavior

### Backend files
- `backend/server.js` — startup, routes, database
- `backend/routes/auth.js` — login/register
- `backend/routes/documents.js` — upload, summary, explain, file serving
- `backend/routes/chat.js` — chat sessions and question answering
- `backend/routes/flashcards.js` — flashcard generation, favorites, delete
- `backend/routes/quiz.js` — quiz generation and submission
- `backend/utils/groqHelper.js` — AI prompt logic
- `backend/utils/extractText.js` — PDF / DOCX text extraction

### Frontend files
- `frontend/src/pages/Documents.jsx` — document list and uploader
- `frontend/src/pages/DocDetail.jsx` — AI tool interface
- `frontend/src/pages/Flashcards.jsx` — flashcard UI
- `frontend/src/pages/QuizPage.jsx` — quiz UI
- `frontend/src/context/AuthContext.jsx` — stores user token and auth state

## 6. Data storage summary

- Uploaded files: `backend/uploads/`
- Document metadata + extracted text: MongoDB `documents`
- Chat history: MongoDB `chats`
- Flashcards: MongoDB `flashcards`
- Quizzes/results: MongoDB `quizzes`
- User accounts: MongoDB `users`
- Activity logs: MongoDB `activities`

## 7. How the app runs

### Start backend
```bash
cd backend
npm install
npm run dev
```

### Start frontend
```bash
cd frontend
npm install
npm run dev
```

Then open the React app in the browser at `http://localhost:5173`.

---

This document is based on your current code and describes the full project flow, storage, and feature mapping.
