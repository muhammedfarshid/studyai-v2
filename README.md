# 📚 StudyAI v2 — Context-Aware Learning Assistant

A full-stack MERN application with Tailwind CSS and Groq AI that lets students upload study materials and get AI-powered answers, summaries, flashcards, and quizzes.

---

## 🧠 Features

| Feature | Description |
|---|---|
| 📄 Document Upload | Upload PDF and DOCX files |
| 👁️ PDF Viewer | View documents side-by-side with AI tools |
| 💬 AI Chat | Ask questions, get context-aware answers |
| 📋 AI Summary | One-click document summarization |
| 💡 Explain Concept | Explain any concept found in the document |
| 🃏 Flashcards | Auto-generate flippable flashcards with favorites |
| 📝 Quiz | AI-generated multiple-choice quizzes with results |
| 📊 Dashboard | Stats: docs, flashcards, quizzes, avg score |
| 🔐 Auth | JWT-based register and login |

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| AI | **Groq AI** (llama3-8b-8192 — Free) |
| Auth | JWT + bcryptjs |
| PDF | pdf-parse |
| DOCX | mammoth |

---

## 🔑 Get Free Groq API Key

1. Go to **https://console.groq.com**
2. Sign up with Google or email (free)
3. Click **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_...`)

Groq's free tier: **14,400 requests/day** — more than enough for a project demo.

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

---

### Step 1 — Clone / Extract project

```bash
cd studyai-v2
```

---

### Step 2 — Backend setup

```bash
cd backend
npm install
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/studyai
JWT_SECRET=any_long_random_string_here
GROQ_API_KEY=gsk_your_groq_key_here
```

Start backend:
```bash
npm run dev
```

✅ You should see:
```
✅ MongoDB connected
🚀 Server → http://localhost:5000
```

---

### Step 3 — Frontend setup

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Open browser: **http://localhost:5173**

---

## 🚀 How to Use

1. **Register** → create your account
2. **My Documents** → upload a PDF or DOCX
3. Wait for status: **Indexed** ✓
4. Click **Open** on the document
5. Use the tabs:
   - **AI Chat** → ask questions
   - **Summary** → get instant summary
   - **Flashcards** → generate + study
   - **Quiz** → take a test, see results

---

## 📁 Project Structure

```
studyai-v2/
├── backend/
│   ├── models/          User, Document, Chat, Flashcard, Quiz, Activity
│   ├── routes/          auth, documents, chat, flashcards, quiz, stats
│   ├── middleware/      JWT auth
│   ├── utils/           extractText.js, groqHelper.js
│   ├── uploads/         uploaded files stored here
│   ├── server.js
│   └── .env             ← fill in your keys!
│
└── frontend/
    ├── src/
    │   ├── context/     AuthContext
    │   ├── components/  Layout, UI components
    │   └── pages/       Login, Register, Dashboard, Documents,
    │                    DocDetail, Flashcards, QuizPage, QuizResult
    └── tailwind.config.js
```

---

## 🎓 For Viva / Report

**Title:** Context-Aware Learning Assistant using Generative AI

**Problem:** Students waste time searching through lengthy documents for answers.

**Solution:** Upload documents once → AI generates answers, summaries, flashcards, and quizzes from your own content.

**Architecture:**
```
User → Upload PDF/DOCX
     → Text Extraction (pdf-parse / mammoth)
     → Stored in MongoDB
     → User asks question
     → Relevant text chunks selected
     → Groq AI (LLaMA3) generates answer
     → Response sent back to UI
```

**Key Innovation:** Answers are grounded to the student's own uploaded syllabus — not the internet.
