# 📚 MindMate - Complete Project Documentation (A-Z)

**Version:** 1.0.0  
**Last Updated:** March 2026  
**Purpose:** Comprehensive guide for developers to understand every aspect of the MindMate project

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Backend System](#backend-system)
7. [Frontend System](#frontend-system)
8. [Authentication & Security](#authentication--security)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Core Features Explained](#core-features-explained)
11. [Real-Time Features & RTC](#real-time-features--rtc)
12. [Deployment Guide](#deployment-guide)
13. [How to Use & Examples](#how-to-use--examples)
14. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is MindMate?

**MindMate** is a full-stack, AI-powered mental health support application designed to provide empathetic conversational support to users through text or voice. It's a **crisis-aware chatbot system** with built-in emergency detection and response capabilities.

### Core Mission

- **Emotional Intelligence:** Detect and respond to user emotions in real-time
- **Crisis Detection:** Identify dangerous situations (suicidal ideation, self-harm) and provide emergency resources
- **Empathetic Support:** Provide genuine, supportive conversations using AI (Google Gemini)
- **Accessibility:** Support multiple input methods (text, voice) and multiple languages
- **Privacy & Security:** Secure authentication, encrypted data, ROW-Level Security (RLS)

### Key Statistics

- **Languages Supported:** English, Hindi (हिंदी), Malayalam (മലയാളം)
- **Emotion Types:** 6 emotions (Joy, Sadness, Anger, Fear, Love, Surprise)
- **Crisis Severity Levels:** 3 tiers (CRITICAL, SEVERE, MODERATE)
- **Crisis Keywords:** 36+ keywords + 3 tiers of severity classification
- **AI Provider:** Google Gemini (with fallback to mock responses)
- **Authentication:** Supabase (JWT-based)
- **Database:** PostgreSQL (via Supabase)

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER (Browser/App)                        │
│                                                                 │
│  ┌─────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Login     │      │  Text Input  │      │  Voice Input │  │
│  │ (Supabase)  │      │ (Chat Box)   │      │  (Mic/STT)   │  │
│  └──────┬──────┘      └──────┬───────┘      └──────┬───────┘  │
│         │                    │                     │           │
└─────────┼────────────────────┼─────────────────────┼───────────┘
          │                    │                     │
          │ JWT Token          │ Fetch Request       │ Form Data
          │                    │                     │
┌─────────▼────────────────────▼─────────────────────▼───────────┐
│              FRONTEND (React 19 + Vite)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  LoginPage   │  │  ChatPage    │  │  DashboardPage     │   │
│  │  SignupPage  │  │  (Main UI)   │  │  (Analytics View)  │   │
│  │ LandingPage  │  │              │  │                    │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
│                                                                 │
│  State: Messages, Sessions, Theme, Language, User Data         │
│  Services: Axios for HTTP, Fetch for Streaming (SSE)          │
└─────────────────────────────────────────────────────────────────┘
          │
          │ HTTP/HTTPS Requests
          │
┌─────────▼────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                         │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MIDDLEWARE LAYER                           │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • Auth Middleware (JWT Validation via Supabase)        │   │
│  │  • CORS (Cross-Origin Resource Sharing)                 │   │
│  │  • Helmet (Security Headers)                            │   │
│  │  • Rate Limiting (Express Rate Limit)                   │   │
│  │  • Request Logger (timestamp, method, status, duration) │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │                    API ROUTES                            │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  /api/data          → Process text/voice + emotion       │  │
│  │  /api/users         → Auth (signup/login)                │  │
│  │  /api/sessions      → Chat session management            │  │
│  │  /api/history       → Chat message history               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │                    SERVICES LAYER                        │  │
│  ├────────────────────────────────────────────────────────────┤  │
│  │  • EmotionService          (TED + SED)                   │  │
│  │  • CrisisDetectionService  (Keyword Matching + Severity) │  │
│  │  • ResponseService         (Contextual Responses)        │  │
│  │  • AIContentService        (Gemini Integration + SSE)    │  │
│  │  • TranscriptionService    (STT via Whisper/OpenAI)      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ Supabase │      │ Gemini   │      │  HF      │
    │(Auth +DB)│      │  AI API  │      │ Spaces   │
    │          │      │          │      │(Emotion) │
    └──────────┘      └──────────┘      └──────────┘
```

### Data Flow - A User Message Journey

```
User Types: "I feel so depressed and hopeless"
│
├─ FRONTEND (ChatPage.jsx)
│  ├─ Creates message object
│  ├─ Sends POST to /api/data/process
│  └─ Opens EventSource for SSE stream
│
├─ BACKEND (dataRoutes.js)
│  │
│  ├─ Step 1: Detect Emotion
│  │  └─ EmotionService.detectTextEmotion()
│  │     ├─ Call HF Spaces emotion detector
│  │     ├─ Parse response: { emotion: "sadness", confidence: 0.92 }
│  │     └─ Return emotion data
│  │
│  ├─ Step 2: Detect Crisis
│  │  └─ CrisisDetectionService.detectCrisis()
│  │     ├─ Search for crisis keywords ("depressed", "hopeless")
│  │     ├─ Match found → severity: "SEVERE"
│  │     ├─ isCrisis: true
│  │     └─ Return crisis analysis
│  │
│  ├─ Step 3: Choose Response Pipeline
│  │  ├─ IF Crisis → CRISIS PIPELINE
│  │  │  ├─ Get severity-based resources (hotlines)
│  │  │  ├─ Generate crisis prompt for AI
│  │  │  ├─ Call AI (with onChunk callback for SSE)
│  │  │  ├─ Send: severity, resources, guided steps
│  │  │  └─ Example: "Please contact Tele-MANAS at 14416..."
│  │  │
│  │  └─ IF Normal → NORMAL PIPELINE
│  │     ├─ Generate contextual response based on emotion
│  │     ├─ Generate 3-4 suggestions for the emotion
│  │     ├─ Generate follow-up questions
│  │     └─ Send: response, suggestions, questions
│  │
│  └─ Step 4: Stream Response (SSE)
│     ├─ Set headers: text/event-stream, keep-alive
│     ├─ As AI generates text, call onChunk()
│     └─ Write: `data: {"type": "chunk", "text": "word"}\n\n`
│
├─ FRONTEND (ChatPage.jsx - onmessage listener)
│  ├─ Receive SSE chunks
│  ├─ Accumulate text
│  └─ Update React state → UI renders words INSTANTLY
│
└─ Result: User sees response appearing word-by-word in real-time!
```

---

## Technology Stack

### Frontend Stack

| Technology | Purpose | Version |
|---|---|---|
| **React** | UI Component Framework | 19.2.0 |
| **React Router** | Client-side routing | 7.13.1 |
| **Vite** | Build tool & dev server | 7.3.1 |
| **Axios** | HTTP client (JSON requests) | 1.13.6 |
| **Framer Motion** | Animations & transitions | 12.34.4 |
| **Lucide React** | Icon library | 0.576.0 |
| **Recharts** | Data visualization | 3.7.0 |
| **Vite PWA Plugin** | Progressive Web App support | 1.2.0 |

### Backend Stack

| Technology | Purpose | Version |
|---|---|---|
| **Node.js** | JavaScript runtime | - |
| **Express** | Web framework | 5.1.0 |
| **Supabase** | Auth + PostgreSQL Database | 2.98.0 |
| **@google/genai** | Google Gemini AI API | 1.43.0 |
| **Multer** | File upload handling (voice) | 2.0.2 |
| **CORS** | Cross-origin resource sharing | 2.8.5 |
| **Helmet** | Security headers | 8.1.0 |
| **Express Rate Limit** | DDoS/brute-force protection | 8.2.1 |
| **Axios** | HTTP client (external APIs) | 1.12.2 |
| **Dotenv** | Environment variables | 16.4.5 |

### External Services

| Service | Purpose | Key Config |
|---|---|---|
| **Google Gemini AI** | AI response generation | `GEMINI_API_KEY`, `AI_MODEL` |
| **Hugging Face Spaces** | Emotion detection (text) | `TED_API_URL` |
| **Speech Emotion Detection API** | Emotion detection (voice) | `SED_API_URL`, `SED_API_KEY` |
| **OpenAI Whisper** | Speech-to-text (STT) | `STT_API_URL`, `STT_API_KEY` |
| **Supabase Auth** | User authentication | `SUPABASE_URL`, `SUPABASE_KEY` |

---

## Project Structure

### Directory Tree

```
mindmate/
├── BACKEND/
│   ├── server.js                      # Main Express server entry point
│   ├── package.json                   # Node dependencies
│   ├── .env                           # Environment variables (DO NOT COMMIT)
│   │
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT validation middleware
│   │
│   ├── routes/
│   │   ├── dataRoutes.js              # POST /api/data/* (process text/voice)
│   │   ├── userRoutes.js              # POST /api/users/* (auth: signup/login)
│   │   ├── sessionRoutes.js           # GET/POST /api/sessions/* (chat sessions)
│   │   └── historyRoutes.js           # GET /api/history/* (chat message history)
│   │
│   ├── services/
│   │   ├── emotionService.js          # Emotion detection (TED + SED)
│   │   ├── crisisDetectionService.js  # Crisis keyword matching + resources
│   │   ├── responseService.js         # Contextual response generation
│   │   ├── aiContentService.js        # Gemini AI integration + SSE streaming
│   │   └── transcriptionService.js    # Speech-to-text (STT) integration
│   │
│   ├── uploads/                       # Temporary voice file storage
│   │
│   └── Documentation/
│       ├── 00_START_HERE.md
│       ├── SYSTEM_OVERVIEW.md
│       ├── AI_SETUP_GUIDE.md
│       ├── IMPLEMENTATION_SUMMARY.md
│       ├── API_EXAMPLES.js
│       ├── QUICK_START.md
│       └── README.md
│
├── FRONTEND_V2/
│   ├── package.json                   # React + Vite dependencies
│   ├── vite.config.js                 # Vite build configuration
│   ├── eslint.config.js               # ESLint rules
│   ├── index.html                     # HTML entry point
│   │
│   ├── src/
│   │   ├── main.jsx                   # React app entry (ReactDOM.render)
│   │   ├── App.jsx                    # Router + protected routes
│   │   ├── config.js                  # API base URL config
│   │   ├── index.css                  # Global styles
│   │   ├── App.css                    # App component styles
│   │   │
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx        # Public landing page
│   │   │   ├── LoginPage.jsx          # User login
│   │   │   ├── SignupPage.jsx         # User registration
│   │   │   ├── ChatPage.jsx           # Main chat interface (CORE)
│   │   │   └── DashboardPage.jsx      # Analytics & session history
│   │   │
│   │   ├── components/
│   │   │   └── ErrorBoundary.jsx      # React error fallback component
│   │   │
│   │   └── assets/                    # Images, fonts, static files
│   │
│   ├── public/                        # Static assets (PWA manifest, etc)
│   └── dist/                          # Production build output
│
├── FRONTEND_V2/
│   └── ... (alternate frontend version - same as above)
│
├── Root Documentation/
│   ├── CODE_UNDERSTANDING.md          # Deep dives into complex logic
│   ├── SUPABASE_SETUP.md              # Database schema & RLS config
│   ├── DEPLOYMENT.md                  # Deployment guide (Heroku, Vercel)
│   ├── CHALLENGES_AND_SOLUTIONS.md    # Design decisions & trade-offs
│   ├── PROJECT_PRESENTATION_GUIDE.md  # Demo guide for presentations
│   └── COMPLETE_PROJECT_DOCUMENTATION.md (THIS FILE)
```

---

## Database Schema

### Supabase PostgreSQL Tables

#### 1. **profiles** (User Information)

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  gender text,              -- 'male' | 'female' | 'other' | NULL
  age int,                  -- Integer age
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_profiles_username ON profiles(username);
```

**Purpose:** Store user profile information linked to Supabase Auth

**Fields:**
- `id` - UUID from Supabase auth.users
- `username` - Unique username for login alternative
- `email` - User's email address
- `gender` - Optional gender information
- `age` - Optional age information

---

#### 2. **chat_sessions** (Conversation Sessions)

```sql
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,                     -- Session title (auto-generated)
  last_message_preview text,      -- Last message preview
  last_message_at timestamptz,    -- Timestamp of last message
  mood text,                      -- Current mood/tag (optional)
  archived boolean DEFAULT false, -- Soft delete flag
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_active ON chat_sessions(user_id, archived);
CREATE INDEX idx_chat_sessions_timestamp ON chat_sessions(last_message_at DESC);
```

**Purpose:** Organize conversations into separate sessions/threads

**Fields:**
- `id` - Unique session identifier
- `user_id` - Foreign key to profiles
- `title` - Conversation title (auto-generated from first message)
- `last_message_preview` - Snippet of last message for UI preview
- `last_message_at` - When the last message was sent
- `mood` - User's mood tag for that session
- `archived` - Whether session is archived

**Why Separate Sessions?**
- Users can have multiple conversations
- Better organization & privacy
- Pagination efficiency (only load needed messages)

---

#### 3. **chat_history** (Messages)

```sql
CREATE TABLE public.chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message_data jsonb NOT NULL,  -- Array of {sender, text, emotion, timestamp}
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_session_id ON chat_history(session_id);
```

**Purpose:** Store chat messages as JSON arrays per row

**message_data Structure (Array):**
```json
[
  {
    "id": "msg-123",
    "sender": "user",        // 'user' | 'bot'
    "text": "Hello, I'm depressed",
    "emotion": "sadness",    // Detected emotion
    "emotionConfidence": 0.92,
    "timestamp": "2024-03-06T10:30:00Z"
  },
  {
    "id": "msg-124",
    "sender": "bot",
    "text": "I understand you're feeling sad...",
    "emotion": "empathy",
    "timestamp": "2024-03-06T10:30:05Z"
  }
]
```

**Why JSONB Array?**
- Flexible structure (add new fields without migration)
- Fast JSON querying
- Easy pagination (array slicing in SQL)
- All messages in conversation grouped together

---

### Row Level Security (RLS) Policies

All tables have RLS enabled with policies:

```sql
-- Users can only see their own profile
CREATE POLICY "Users can manage their own profile"
  ON profiles
  FOR ALL
  USING (auth.uid() = id);

-- Users can only see their own sessions
CREATE POLICY "Users can read/modify their own sessions"
  ON chat_sessions
  FOR ALL
  USING (auth.uid() = user_id);

-- Users can only see their own chat history
CREATE POLICY "Users can read their own chat history"
  ON chat_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat history"
  ON chat_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Security Guarantee:** Even if someone steals another user's JWT, they cannot access data from other users due to RLS.

---

## Backend System

### Server Entry Point (server.js)

**File:** `BACKEND/server.js`

```javascript
// Key Components:

1. DEPENDENCIES
   - express       → Web framework
   - cors          → Allow frontend requests
   - helmet        → Security headers (XSS, clickjacking, CSP)
   - rate-limit    → Prevent brute-force attacks
   - dotenv        → Load .env variables

2. MIDDLEWARE STACK (in order)
   - Helmet security headers
   - Rate limiter (200 requests per 15 minutes)
   - CORS with allowed origins
   - JSON body parser (10MB limit)
   - Request logger (timestamps, status, duration)

3. ROUTE REGISTRATION
   - /api/data     → Text/voice processing + AI
   - /api/users    → Authentication (signup/login)
   - /api/sessions → Chat session management
   - /api/history  → Message history pagination

4. SERVER LIFECYCLE
   - Listen on PORT (default 5000)
   - Keep event loop alive (handle Node.js timer dereferencing)
   - Graceful error handling
```

---

### Authentication Middleware (authMiddleware.js)

**File:** `BACKEND/middleware/authMiddleware.js`

**Purpose:** Validate JWT tokens and prevent unauthorized access

**How It Works:**

1. Check Authorization header: `Authorization: Bearer <JWT_TOKEN>`
2. Call Supabase `auth.getUser(token)` to validate signature
3. If valid → Attach `req.userId` to request
4. If invalid → Return 401 Unauthorized
5. If missing + trying to assert userId → Block (prevent impersonation)

**Key Security Features:**

- **JWT Signature Validation:** Token is cryptographically verified by Supabase
- **Server-side Validation:** No trusting client-provided user IDs
- **Fallback Protection:** If Supabase unavailable, deny all requests

---

### API Routes

#### dataRoutes.js - Core Processing

**File:** `BACKEND/routes/dataRoutes.js`

**Endpoints:**

```
POST /api/data/process
  Purpose: Process user message (text or voice)
  
  Request:
  {
    type: 'text' | 'voice',
    text: string (required for text),
    userId: string (optional, client-tracked)
  }
  Files: voice (audio file, required for voice)
  
  Response:
  {
    success: boolean,
    data: {
      isCrisis: boolean,
      severity: 'CRITICAL' | 'SEVERE' | 'MODERATE' (if crisis),
      response: string,
      emotion: string,
      emotionConfidence: number,
      suggestions: string[],
      followUpQuestions: string[],
      resources: object[] (if crisis),
      guidedNextSteps: string[] (if crisis)
    }
  }

POST /api/data/process?stream=true
  Same as above but with Server-Sent Events (SSE) streaming
  
  Response Stream:
  data: {"type": "chunk", "text": "word1"}\n\n
  data: {"type": "chunk", "text": "word2"}\n\n
  ...
  
GET /api/data/ai-status
  Purpose: Check if AI service is available
  Response: { aiAvailable: true/false }
```

**Processing Pipeline:**

```
1. VALIDATE INPUT
   └─ Type must be 'text' or 'voice'
   └─ Text must be provided for type='text'
   └─ File must be provided for type='voice'

2. TRANSCRIPTION (if voice)
   └─ Use TranscriptionService
   └─ Call Whisper/OpenAI API (if configured)
   └─ Convert audio file to text

3. EMOTION DETECTION
   └─ Use EmotionService
   └─ If text → EmotionService.detectTextEmotion()
   └─ If voice → EmotionService.detectVoiceEmotion()
   └─ Returns: {emotion, confidence, model}

4. CRISIS DETECTION
   └─ Use CrisisDetectionService
   └─ Search for crisis keywords
   └─ Determine severity level
   └─ Returns: {isCrisis, severity, keywords_found}

5. RESPONSE PIPELINE (dual-path)
   ├─ IF CRISIS
   │  ├─ Generate crisis-specific prompt
   │  ├─ Call AI with crisis context
   │  ├─ Load emergency resources
   │  ├─ Generate guided steps
   │  └─ Return comprehensive crisis response
   │
   └─ IF NORMAL
      ├─ Generate emotion-based response
      ├─ Generate suggestions (3-4 per emotion)
      ├─ Generate follow-up questions
      └─ Call AI (optional, if configured)

6. STREAM OR RETURN
   └─ If ?stream=true → SSE stream chunks
   └─ Else → Return complete JSON response
```

---

#### sessionRoutes.js - Chat Sessions

**File:** `BACKEND/routes/sessionRoutes.js`

**Endpoints:**

```
GET /api/sessions
  Purpose: Fetch all active sessions for authenticated user
  Response: { sessions: [{id, title, created_at, last_message_at, ...}] }

POST /api/sessions
  Purpose: Create new chat session
  Body: { title?: string }
  Response: { session: {id, title, created_at, ...} }

GET /api/sessions/:sessionId/history
  Purpose: Fetch chat history for a session
  Query: offset=0, limit=50 (for pagination)
  Response: { history: [{id, message_data: [...], ...}] }

PUT /api/sessions/:sessionId
  Purpose: Update session (title, mood, etc)
  Body: { title?: string, mood?: string, archived?: boolean }
  Response: { session: {...} }

DELETE /api/sessions/:sessionId
  Purpose: Archive or delete session
  Response: { success: true }
```

---

#### userRoutes.js - Authentication

**File:** `BACKEND/routes/userRoutes.js`

**Endpoints:**

```
POST /api/users/signup
  Purpose: Register new user
  Body: {
    email: string,
    password: string,
    username: string,
    gender?: string,
    age?: number
  }
  Response: { message: "User created", user: {id, username, email} }

POST /api/users/login
  Purpose: Authenticate user
  Body: {
    identifier: string (email or username),
    password: string
  }
  Response: {
    message: "Login successful",
    user: {id, email, username},
    session: {...}  // JWT token
  }
```

**Authentication Flow:**

```
User enters credentials
        ↓
POST /api/users/login
        ↓
Check if identifier is email or username
        ↓
If username → Query profiles table for email
        ↓
Call Supabase auth.signInWithPassword(email, password)
        ↓
Supabase validates password hash
        ↓
If valid → Return JWT session token
        ↓
Frontend stores token in localStorage as 'mindmate_token'
        ↓
All future requests include: Authorization: Bearer <token>
```

---

### Service Layer

#### emotionService.js - Emotion Detection

**File:** `BACKEND/services/emotionService.js`

**Two Detection Methods:**

1. **Text Emotion Detection (TED)**
   - API: Hugging Face Spaces (custom trained model)
   - Endpoint: `https://sidharths9105-mindmate-emotion-detector.hf.space/run/predict`
   - Input: Text string
   - Output: {emotion, confidence, model: 'HF_CUSTOM'}

2. **Voice Emotion Detection (SED)**
   - API: Custom SED endpoint (optional)
   - Input: Audio file (WAV/MP3)
   - Output: {emotion, confidence, model: 'SED'}

**Emotion Types (6):**
- `joy` - Happy, positive feeling
- `sadness` - Down, unhappy, depressed
- `anger` - Angry, frustrated, irritated
- `fear` - Scared, anxious, worried
- `love` - Affection, care, warmth
- `surprise` - Shocked, amazed, unexpected

**Fallback Mechanism:**
```javascript
Try → Call HF Spaces emotion API
Catch → Use mock emotion based on text content
        (Fallback keywords: "happy"→joy, "sad"→sadness, etc)
```

**Example Response:**
```json
{
  "emotion": "sadness",
  "confidence": 0.92,
  "model": "HF_CUSTOM",
  "raw": {
    "label": "Sadness",
    "score": 0.92
  }
}
```

---

#### crisisDetectionService.js - Crisis Keywords & Resources

**File:** `BACKEND/services/crisisDetectionService.js`

**Crisis Keyword Hierarchy:**

```
CRITICAL (Most Severe)
├─ Suicidal ideation: "suicide", "kill myself", "end my life"
├─ Self-harm methods: "slit my wrists", "overdose", "hang myself"
├─ Hopelessness: "no point living", "better off dead"
├─ Violent thoughts: "going to hurt someone", "want to kill"
└─ Multilingual: हिंदी, മലയാളം translations

SEVERE (High Risk)
├─ Depression: "depressed", "depression", "hopeless"
├─ Emotional distress: "unbearable", "can't go on", "breaking apart"
├─ Isolation: "alone", "abandoned", "lonely"
├─ Panic: "panic attack", "panic", "severe anxiety"
└─ Trauma: "trauma", "traumatic", "PTSD"

MODERATE (Elevated Risk)
├─ Anxiety: "anxious", "anxiety", "stressed"
├─ Sadness: "sad", "sadness", "upset"
├─ Struggle: "struggling", "difficult", "hard time"
├─ Anger: "angry", "rage", "frustrated"
└─ Overwhelmed: "overwhelmed", "too much to handle"
```

**How It Works:**

```javascript
text = "I feel so depressed and hopeless"
      ↓
Search for keywords in all tiers
      ↓
Found: "depressed" (SEVERE), "hopeless" (CRITICAL)
      ↓
Select highest severity: CRITICAL
      ↓
Return: {
  isCrisis: true,
  severity: 'CRITICAL',
  keywords_found: ['depressed', 'hopeless']
}
```

**Crisis Resources (By Severity):**

```
CRITICAL Resources:
├─ Tele-MANAS: 14416 (24/7, toll-free, India Govt)
├─ Kiran Helpline: 1800-599-0019 (24/7, toll-free)
└─ NIMHANS: 080-46110007 (24/7, India)

SEVERE Resources:
├─ Sangath: 011-41198666 (10 AM - 6 PM)
└─ TISS iCall: 9152987821 (Mon-Sat, 8 AM - 10 PM)
```

---

#### responseService.js - Contextual Responses

**File:** `BACKEND/services/responseService.js`

**Structure:**

```javascript
Static responses organized by emotion:

responseService.generateNormalResponse(emotion, confidence, message)
  ↓
Based on emotion, select a response template
  ↓
Generate suggestions (3-4 per emotion)
  ↓
Generate follow-up questions
  ↓
Return complete package: {
  isCrisis: false,
  response: "I'm sorry you're feeling down...",
  suggestions: ["Allow yourself to feel...", "Spend time with..."],
  followUpQuestions: ["How long?", "Any specific trigger?"]
}
```

**Emotion-Specific Flows:**

| Emotion | Response Tone | Suggestions | Questions |
|---------|---|---|---|
| **Joy** | Celebratory | Journal, share, plan | What made this special? |
| **Sadness** | Compassionate | Feel, connect, move | How long? Trigger? |
| **Anger** | Grounding | Breathe, exercise, identify | What triggered? Ongoing? |
| **Fear** | Reassuring | Breathe, ground, limit caffeine | What afraid of? When start? |
| **Love** | Appreciative | Express gratitude, reflect | What makes strong? Tell more? |
| **Surprise** | Curious | Process, journal, discuss | Initial reaction? Changes? |

---

#### aiContentService.js - AI Integration with Gemini

**File:** `BACKEND/services/aiContentService.js`

**Purpose:** Generate dynamic, context-aware responses using Google Gemini

**How It Integrates:**

```
1. PROMPT FORMATTING
   ├─ Normal path: "User is sad, suggest self-care..."
   └─ Crisis path: "User is suicidal, show empathy + resources..."

2. SAFETY FEATURES
   ├─ Prompt injection protection: Escape HTML in user message
   ├─ Timeout: 30-second limit on AI response
   └─ Fallback: If AI fails, use ResponseService backup

3. STREAMING (SSE)
   ├─ Setup: res.setHeader('Content-Type', 'text/event-stream')
   ├─ onChunk callback: For each word generated
   └─ Write: res.write(`data: ${JSON.stringify({text})}\n\n`)

4. AI MODELS
   ├─ Default: gemini-2.5-flash
   ├─ Alternative: gemini-pro, mistral, openai-gpt4
   └─ Configured via AI_MODEL env var
```

**Example Prompts:**

**Normal Pipeline:**
```
User Context:
Current Emotion: sadness
Tension Level: High
Input Method: text

User Message: "I feel so depressed and hopeless"

Please respond as MindMate, a warm and deeply empathetic companion.
Guidelines:
1. Mirror their feeling with kindness
2. Validate their experience naturally
3. Suggest one small, gentle thing they could do
4. Ask a soft, open-ended follow-up
5. Keep it short (2-3 natural sentences)
```

**Crisis Pipeline:**
```
🚨 CRITICAL CRISIS DETECTED 🚨
The user is expressing suicidal ideation.

Your response must:
1. Show IMMEDIATE empathy and concern
2. Acknowledge their pain as real and valid
3. Provide emergency hotlines:
   - Tele-MANAS: 14416 (24/7, free, India)
   - Kiran: 1800-599-0019
4. Encourage them to reach out NOW
5. Do NOT minimize their feelings
6. Do NOT suggest self-help only

Tone: Urgent, caring, professional
```

**AI Response Example:**
```
I hear that you're in tremendous pain right now, and I want you to know 
that your life has value. Please reach out to someone immediately:

Tele-MANAS: 14416 (24/7, Free)
Kiran Helpline: 1800-599-0019

If you're in immediate danger, please go to the nearest emergency room.
You don't have to face this alone. 💙
```

---

#### transcriptionService.js - Speech-to-Text

**File:** `BACKEND/services/transcriptionService.js`

**Purpose:** Convert audio files to text (STT - Speech To Text)

**API Options:**

```
1. OpenAI Whisper (Recommended)
   - URL: https://api.openai.com/v1/audio/transcriptions
   - Accuracy: Excellent
   - Languages: 99+ languages
   - Cost: $0.006 per minute

2. Local Whisper Server (Self-hosted)
   - Cost: Free (own compute)
   - Latency: Variable

3. Google Cloud Speech-to-Text
   - URL: Custom endpoint
   - Accuracy: Excellent
```

**Configuration:**

```env
STT_API_URL=https://api.openai.com/v1/audio/transcriptions
STT_API_KEY=sk-...
STT_MODEL=whisper-1
STT_LANGUAGE=en (optional, for auto-detection)
```

**Flow:**

```
User records voice message
        ↓
Browser sends audio file via FormData
        ↓
Multer saves to uploads/ folder
        ↓
TranscriptionService.transcribe(audioFile)
        ↓
Read audio file from disk
        ↓
POST to Whisper API with file
        ↓
Whisper returns: { text: "I feel depressed..." }
        ↓
Delete temp file
        ↓
Pass text to emotion detection + crisis detection
```

---

## Frontend System

### App Component Structure (App.jsx)

**File:** `FRONTEND_V2/src/App.jsx`

**Routing:**

```jsx
<Router>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/chat" element={
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    } />
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    } />
  </Routes>
</Router>
```

**Protected Route Logic:**

```javascript
- Check localStorage for 'mindmate_token' (JWT)
- OR check for 'mindmate_alias' starting with 'Guest_'
- If neither present → Redirect to /login
- Otherwise → Allow access
```

---

### Chat Page (ChatPage.jsx) - CORE COMPONENT

**File:** `FRONTEND_V2/src/pages/ChatPage.jsx`

**This is the main user interface for chatting.**

**Key State Variables:**

```javascript
// Messages & Sessions
const [messages, setMessages] = useState([]);           // All messages in view
const [sessions, setSessions] = useState([]);           // User's chat sessions
const [selectedSessionId, setSelectedSessionId] = useState(null);
const [hasMoreHistory, setHasMoreHistory] = useState(true);

// Voice Recording
const [isListening, setIsListening] = useState(false);  // Mic recording state
const [isLoading, setIsLoading] = useState(false);      // API call in progress

// UI Settings
const [theme, setTheme] = useState('dark');             // 'dark' | 'light'
const [currentLanguage, setCurrentLanguage] = useState('ml-IN');
const [currentMood, setCurrentMood] = useState('default');
const [useAI, setUseAI] = useState(false);              // AI availability
const [sidebarOpen, setSidebarOpen] = useState(true);   // Sidebar visibility
```

**Main Features:**

1. **Text Input** - Type message + press Enter/Send button
2. **Voice Input** - Click Mic → Speak → Auto-transcribe (Web Speech API)
3. **Real-time Streaming** - Words appear as they're generated (SSE)
4. **Session Management** - View/switch between chat sessions
5. **Infinite Scroll** - Load older messages when scrolling up
6. **Theme Switching** - Light/Dark modes
7. **Language Support** - Switch between English, Hindi, Malayalam
8. **Mood Selector** - Tag sessions with mood
9. **Dashboard Link** - View analytics

---

### Key Functions in ChatPage

#### 1. handleSendMessage()

```javascript
Triggered by: User presses Enter or clicks Send

Flow:
1. Get input text from state
2. Create user message object
3. Add to messages array (setState)
4. Clear input
5. Call processMessage(text, 'text')
6. Scroll to bottom
```

#### 2. handleVoiceInput()

```javascript
Triggered by: User clicks Mic button

Flow:
1. Use Web Speech API (browser native)
2. Set isListening = true (show mic icon)
3. Capture audio stream
4. onresult → Transcribe locally (browser-side)
5. Add transcript to input field
6. Optionally send immediately or let user edit
7. Call processMessage(transcript, 'voice')
```

**Note:** The browser's Web Speech API does the initial transcription. The backend can do its own if configured.

#### 3. processMessage(text, type)

```javascript
Triggered by: handleSendMessage, handleVoiceInput

Flow:
1. Create FormData or JSON object
2. POST /api/data/process to backend
3. Open EventSource for SSE streaming
4. In SSE onmessage:
   ├─ Parse chunk: data: {"type": "chunk", "text": "word"}
   ├─ Accumulate text
   ├─ Update botMessage state
   └─ React re-renders → word appears instantly
5. On SSE close:
   ├─ Message complete
   ├─ Save to database
   ├─ Update session list
6. On error:
   ├─ Show error message
   ├─ Retry option
```

#### 4. fetchSessionHistory(sessionId, offset)

```javascript
Purpose: Load chat history for a session (pagination)

Flow:
1. GET /api/sessions/{sessionId}/history?offset=0&limit=50
2. Parse response: { history: [{id, message_data: [...]}, ...] }
3. Flatten message_data arrays
4. If offset=0 → Replace messages
5. If offset>0 → Prepend older messages
6. Update hasMoreHistory based on loaded count < limit
```

#### 5. Infinite Scroll Handler

```javascript
Triggered by: User scrolls chat to top

Flow:
1. Listen to <main> onScroll event
2. Check: scrollTop === 0 && hasMoreHistory && !isLoading
3. If yes → fetchSessionHistory(selectedSessionId, messages.length)
4. Load next 50 messages (offset by current count)
5. Prepend to messages array
6. User sees older messages
```

---

### Other Frontend Pages

#### LoginPage.jsx

**Features:**
- Email/username + password input
- Calls POST /api/users/login
- Stores JWT token in localStorage
- Redirects to /chat on success
- Error messages for invalid credentials

#### SignupPage.jsx

**Features:**
- Email, password, username, gender, age inputs
- Calls POST /api/users/signup
- Auto-redirects to login after signup
- Password confirmation validation
- Username uniqueness check

#### DashboardPage.jsx

**Features:**
- View all chat sessions
- Statistics (message count, sentiment over time)
- Session archive/delete options
- View detailed analytics with Recharts
- Mood trends over time

#### LandingPage.jsx

**Features:**
- Public homepage
- Feature showcase
- Call-to-action buttons (Login, Signup)
- About MindMate information

---

## Authentication & Security

### JWT-Based Authentication

**How It Works:**

1. **User Registers:**
   ```
   User → POST /api/users/signup
   ↓
   Supabase creates auth.users row + hashed password
   ↓
   Backend creates profiles row
   ↓
   Return success message
   ```

2. **User Logs In:**
   ```
   User → POST /api/users/login (email/password)
   ↓
   Backend → Supabase auth.signInWithPassword()
   ↓
   Supabase validates password hash
   ↓
   Supabase returns JWT session token
   ↓
   Backend returns to frontend
   ↓
   Frontend stores in localStorage: 'mindmate_token'
   ```

3. **Authenticated Requests:**
   ```
   Frontend → GET /api/sessions
   Header: Authorization: Bearer <JWT_TOKEN>
   ↓
   authMiddleware validates token via Supabase
   ↓
   If valid → req.userId assigned, request proceeds
   ↓
   If invalid/expired → Return 401 Unauthorized
   ```

### Security Features

| Feature | Implementation | Benefit |
|---------|---|---|
| **JWT Signing** | Supabase Auth | Tokens cannot be forged |
| **Row Level Security** | PostgreSQL RLS policies | Users see only their own data |
| **Password Hashing** | Supabase bcrypt | Passwords not stored plaintext |
| **HTTPS** | Deployment requirement | Data encrypted in transit |
| **CORS** | Express CORS middleware | Only allowed origins can access API |
| **Rate Limiting** | express-rate-limit | Prevent brute-force attacks |
| **Helmet Headers** | Helmet.js | Protection against XSS, clickjacking |
| **Prompt Injection Protection** | HTML escaping | AI prompts cannot be manipulated |
| **File Size Limits** | Multer (25MB) + Express (10MB) | Prevent DoS via large uploads |

---

## API Endpoints Reference

### Summary Table

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| **POST** | /api/users/signup | ❌ | Register new user |
| **POST** | /api/users/login | ❌ | Authenticate user |
| **POST** | /api/data/process | ✅ | Process text/voice message |
| **GET** | /api/data/ai-status | ✅ | Check AI availability |
| **GET** | /api/sessions | ✅ | List user's sessions |
| **POST** | /api/sessions | ✅ | Create new session |
| **GET** | /api/sessions/:id/history | ✅ | Get session messages |
| **PUT** | /api/sessions/:id | ✅ | Update session |
| **DELETE** | /api/sessions/:id | ✅ | Delete/archive session |

---

## Core Features Explained

### 1. Emotion Detection (TED/SED)

**Text Emotion Detection (TED):**

```
Input: User message "I feel so happy today!"
│
├─ Call HF Spaces: emotion-detector API
├─ ML model analyzes text
├─ Output: {label: "Joy", score: 0.95}
│
└─ Response: {emotion: "joy", confidence: 0.95}
```

**Voice Emotion Detection (SED):**

```
Input: User speaks with angry tone
│
├─ Audio file sent to backend
├─ Call SED API (optional, else mock)
├─ Analyzes tone/pitch/intensity
│
└─ Response: {emotion: "anger", confidence: 0.88}
```

**Why Both?**
- Text detects semantic meaning ("I love you")
- Voice detects tone/sentiment (can contradict text)
- Example: Sarcasm = negative words + positive tone

---

### 2. Crisis Detection System

**Three-Tier Keyword System:**

```
Level 1: CRITICAL (Suicidal/Violent)
├─ Keywords: "suicide", "kill myself", "hang myself"
├─ Action: IMMEDIATE emergency response + hotlines
└─ Example: "I'm going to kill myself tonight"

Level 2: SEVERE (High distress)
├─ Keywords: "depressed", "hopeless", "trauma"
├─ Action: Crisis response + resources + AI support
└─ Example: "I feel completely hopeless"

Level 3: MODERATE (Elevated concern)
├─ Keywords: "anxious", "stressed", "struggling"
├─ Action: Enhanced support + suggestions
└─ Example: "I'm really anxious about my job"
```

**Processing:**

```
User message: "I feel depressed and like life is pointless"
│
├─ Search for CRITICAL keywords → None found
├─ Search for SEVERE keywords → "depressed" ✓
├─ Determine severity → SEVERE
│
└─ Return: {
    isCrisis: true,
    severity: "SEVERE",
    keywords: ["depressed"],
    resources: [... crisis hotlines ...]
  }
```

---

### 3. Dual-Response Pipeline

**Normal Pipeline (for non-crisis):**

```
Input: Emotion: joy, Message: "I got promoted!"
│
├─ ResponseService.generateNormalResponse()
├─ Select emotion-based template
├─ Generate 3-4 suggestions (for joy: journal, share, plan)
├─ Generate 2-3 follow-up questions
│
└─ Package:
   {
     isCrisis: false,
     response: "That's wonderful! Celebrate this win!",
     emotion: "joy",
     suggestions: [...],
     questions: [...]
   }
```

**Crisis Pipeline (for crisis detected):**

```
Input: Crisis detected, Severity: CRITICAL
│
├─ CrisisDetectionService.getCrisisResponsePackage()
├─ Load emergency hotlines for severity level
├─ Generate crisis-aware AI prompt
├─ Call AI with urgent context
│
└─ Package:
   {
     isCrisis: true,
     severity: "CRITICAL",
     response: "I'm so glad you reached out...",
     resources: [{name: "Tele-MANAS", number: "14416"}, ...],
     guidedNextSteps: ["Call now", "Go to ER", "Tell someone"]
   }
```

---

### 4. Server-Sent Events (SSE) Streaming

**The Problem:**
Without streaming, waiting 5 seconds for AI response feels cold in a mental health app.

**The Solution:**
Keep HTTP connection open, send words as they're generated.

**Frontend Code:**

```javascript
const response = await fetch('/api/data/process?stream=true', {
  method: 'POST',
  body: formData
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value, {stream: true});
  // chunk = 'data: {"type": "chunk", "text": "word"}\n\n'
  
  const lines = chunk.split('\n').filter(l => l.startsWith('data:'));
  for (const line of lines) {
    const data = JSON.parse(line.replace('data: ', ''));
    setBotMessage(prev => prev + data.text);  // React re-renders instantly
  }
}
```

**Backend Code:**

```javascript
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');

const onChunk = (chunk) => {
  res.write(`data: ${JSON.stringify({type: 'chunk', text: chunk})}\n\n`);
};

// Pass onChunk to AI service
const aiResponse = await aiContentService.generateContent({
  emotion,
  userMessage,
  isCrisis,
  onChunk  // Called for each word generated
});
```

**User Experience:**
```
User sends: "I'm depressed"
├─ Word 1: "I"     (instant)
├─ Word 2: "hear" (instant)
├─ Word 3: "your" (instant)
└─ ...response gradually appears on screen

Feels much warmer than waiting 5 seconds for whole response!
```

---

### 5. Infinite Scrolling / Pagination

**Problem:** 1000 messages would freeze the browser if loaded at once.

**Solution:** Load 50 at a time, fetch more as user scrolls.

**Backend (Database Query):**

```sql
-- Get messages for session, paginated
SELECT * FROM chat_history
WHERE session_id = $1
ORDER BY created_at DESC
LIMIT 50
OFFSET $2;

-- OFFSET = number of messages already loaded
-- First load: OFFSET = 0   (messages 0-50)
-- Second load: OFFSET = 50  (messages 50-100)
-- etc.
```

**Frontend (Scroll Listener):**

```javascript
<main onScroll={(e) => {
  if (e.target.scrollTop === 0) {  // At the very top
    if (hasMoreHistory && !isLoadingHistory) {
      fetchSessionHistory(sessionId, messages.length);  // Offset by current count
    }
  }
}}>

// User scrolls up → loaded more messages prepended
// User never hits "loading" screen → smooth experience
```

---

## Real-Time Features & RTC

### What is RTC?

**RTC = Real-Time Communication**

MindMate currently does NOT have video/audio calling (peer-to-peer RTC with WebRTC protocol). Instead, it has:

- **Real-time Text Streaming** (via SSE)
- **Real-time Voice Input** (via Web Speech API)
- **Real-time Message Updates** (via API polling/manual fetch)

### Web Speech API (Browser-Native Voice)

**Supported:**
```javascript
// 1. Speech Recognition (Voice to Text)
const recognition = new webkitSpeechRecognition();
recognition.start();
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;  // "Hello"
  setInput(transcript);
};

// 2. Speech Synthesis (Text to Voice)
const utterance = new SpeechSynthesisUtterance("Hello there!");
speechSynthesis.speak(utterance);
```

**Supported in ChatPage:**
- ✅ Mic button records voice
- ✅ Browser transcribes locally (free, no API call)
- ✅ Text appears in input field
- ❌ Audio playback not currently implemented

### Could Add: True WebRTC for Live Calling

**If We Needed Video/Audio Calling:**

```
1. Add WebRTC peer connection
2. Use STUN/TURN servers (3rd party)
3. Exchange SDP offers/answers
4. Could integrate with AI voice assistant
5. Example: JITSI, Twilio, PeerJS

Current Status: NOT IMPLEMENTED (out of scope for this version)
```

---

## Deployment Guide

### Backend Deployment

**Option 1: Heroku (PaaS - Easiest)**

```bash
# 1. Create Heroku app
heroku create mindmate-backend

# 2. Set environment variables
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_KEY=...
heroku config:set GEMINI_API_KEY=...

# 3. Deploy
git push heroku main
```

**Option 2: Railway / Render (Alternative PaaS)**

Similar to Heroku, set env vars and deploy.

**Option 3: Self-Hosted (VPS)**

```bash
# 1. SSH into server
ssh user@server.com

# 2. Install Node
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# 3. Clone repo
git clone https://github.com/yourrepo/mindmate.git
cd mindmate/BACKEND

# 4. Install & setup
npm install
cp .env.example .env
# Edit .env with production values

# 5. Start with PM2
npm install -g pm2
pm2 start server.js --name mindmate-backend
pm2 save
```

**Environment Variables (Production):**

```env
# Server
PORT=5000
FRONTEND_URL=https://app.yourdomain.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI
AI_PROVIDER=gemini
GEMINI_API_KEY=...
AI_MODEL=gemini-2.5-flash

# Optional APIs
TED_API_URL=https://...
SED_API_URL=https://...
STT_API_URL=https://api.openai.com/v1/audio/transcriptions
STT_API_KEY=sk-...
```

---

### Frontend Deployment

**Option 1: Vercel (Recommended for Vite)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd FRONTEND_V2
vercel

# Set environment variable
vercel env add VITE_API_BASE_URL https://api.yourdomain.com
```

**Option 2: Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd FRONTEND_V2
npm run build
netlify deploy --prod --dir dist
```

**Option 3: Self-Hosted**

```bash
# Build
npm run build

# Serve with nginx
sudo cp -r dist /var/www/mindmate
sudo systemctl restart nginx
```

---

## How to Use & Examples

### 1. Running Locally (Development)

**Backend:**

```bash
cd BACKEND
npm install
# Create .env with Supabase + Gemini keys
npm start
# Server runs on http://localhost:5000
```

**Frontend:**

```bash
cd FRONTEND_V2
npm install
npm run dev
# Dev server on http://localhost:5173
```

**In Browser:**

```
http://localhost:5173
├─ Landing page with signup/login
├─ Sign up: shiva@example.com, password123
├─ Login: shiva@example.com, password123
└─ Chat: Type "I'm stressed about exams"
```

### 2. API Usage Examples

**Send Text Message:**

```bash
curl -X POST http://localhost:5000/api/data/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "text",
    "text": "I feel really anxious about my job interview tomorrow",
    "userId": "user123"
  }'

Response:
{
  "success": true,
  "data": {
    "isCrisis": false,
    "emotion": "fear",
    "emotionConfidence": 0.87,
    "response": "That's understandable. Job interviews can feel nerve-wracking...",
    "suggestions": [
      "Practice deep breathing before the interview",
      "Remember your accomplishments",
      "Get good sleep tonight"
    ]
  }
}
```

**Send Voice Message:**

```bash
curl -X POST http://localhost:5000/api/data/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "type=voice" \
  -F "voice=@audio.wav"

Response: (Same as above, but with emotion detected from voice)
```

**Get Chat Sessions:**

```bash
curl http://localhost:5000/api/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

Response:
{
  "sessions": [
    {
      "id": "uuid-123",
      "title": "Anxiety about job",
      "created_at": "2024-03-06T10:00:00Z",
      "last_message_at": "2024-03-06T10:30:00Z",
      "mood": "anxious"
    }
  ]
}
```

**Fetch Chat History:**

```bash
curl 'http://localhost:5000/api/sessions/uuid-123/history?offset=0&limit=50' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

Response:
{
  "history": [
    {
      "id": "row-123",
      "message_data": [
        {
          "sender": "user",
          "text": "I'm anxious",
          "emotion": "fear"
        },
        {
          "sender": "bot",
          "text": "I hear your concern..."
        }
      ]
    }
  ]
}
```

---

## Troubleshooting

### Common Issues & Solutions

#### Issue 1: "Cannot POST /api/data/process"

**Causes:**
- Backend not running
- Wrong API URL in frontend config
- Route not registered in server.js

**Fix:**
```bash
# Check backend is running
curl http://localhost:5000

# Verify route exists in server.js
grep "app.use('/api/data'" BACKEND/server.js

# Check API_BASE_URL in frontend
cat FRONTEND_V2/src/config.js
```

---

#### Issue 2: "Invalid or expired token"

**Causes:**
- JWT token invalid/expired
- Wrong token format (missing "Bearer")
- Supabase service role key not configured

**Fix:**
```javascript
// Frontend: Re-login to get fresh token
localStorage.removeItem('mindmate_token');
navigate('/login');

// Backend: Check authMiddleware.js
// Verify SUPABASE_SERVICE_ROLE_KEY in .env
```

---

#### Issue 3: "Emotion API failed"

**Causes:**
- HF Spaces endpoint down
- Network timeout
- HuggingFace rate limit exceeded

**Fix:**
```bash
# Test HF Spaces endpoint directly
curl -X POST https://sidharths9105-mindmate-emotion-detector.hf.space/run/predict \
  -H "Content-Type: application/json" \
  -d '{"data": ["I am happy"]}'

# If down, service falls back to mock response
# Check server logs for [EmotionService] errors
```

---

#### Issue 4: "AI response not streaming"

**Causes:**
- Browser doesn't support EventSource
- SSE headers not set correctly
- Gemini API key invalid

**Fix:**
```javascript
// Frontend: Check browser console for EventSource errors
const eventSource = new EventSource(url);
eventSource.onerror = (err) => console.error('SSE Error:', err);

// Backend: Verify streaming setup in dataRoutes.js
if (isStreaming) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
}
```

---

#### Issue 5: "Cannot read voice input"

**Causes:**
- Microphone permission denied
- Web Speech API not supported (Safari needs webkit prefix)
- Audio input disabled

**Fix:**
```javascript
// Check browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Request microphone permission
navigator.mediaDevices.getUserUserMedia({audio: true})
  .then(stream => console.log("Mic access granted"))
  .catch(err => console.error("Mic access denied:", err));
```

---

## Advanced Topics

### Extending Emotion Types

To add new emotions (e.g., "disgust", "shame"):

1. **Update HF Spaces model** (train new ML model)
2. **Update responseService.js:**
   ```javascript
   static EMOTION_RESPONSES = {
     // Add new emotion
     disgust: ["That sounds really off-putting...", ...],
     shame: ["You're not alone in feeling this way...", ...]
   }
   ```
3. **Update emotion detection mappings**
4. **Update prompt templates in aiContentService.js**

---

### Integrating New Crisis Keywords

Add keywords to crisisDetectionService.js:

```javascript
static CRISIS_KEYWORDS = {
  CRITICAL: [
    // Existing keywords...
    'new_keyword_1',
    'new_keyword_2'
  ]
}
```

---

### Custom AI Models

To use different AI providers:

**in aiContentService.js:**

```javascript
static async callAI(prompt, onChunk) {
  if (process.env.AI_PROVIDER === 'openai') {
    // Use OpenAI ChatGPT
  } else if (process.env.AI_PROVIDER === 'ollama') {
    // Use local Ollama
  } else {
    // Default to Gemini
  }
}
```

---

## Summary

MindMate is a comprehensive mental health support system with:

- **Frontend:** React 19 + Vite (responsive, real-time UI)
- **Backend:** Node.js + Express (secure, scalable API)
- **Database:** PostgreSQL via Supabase (secure with RLS)
- **AI:** Google Gemini (empathetic responses)
- **Real-Time:** SSE streaming (instant feedback)
- **Crisis Detection:** 36+ keywords, 3-tier severity
- **Emotion Detection:** ML-powered TED + SED
- **Authentication:** JWT-based (Supabase Auth)
- **Security:** CORS, Helmet, Rate Limiting, RLS policies

**If someone reads this document, they can understand and explain:**
✅ How every file works
✅ How data flows end-to-end
✅ How to deploy the system
✅ How to extend/customize it
✅ How to troubleshoot issues
✅ How authentication & RTC works

---

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Maintained By:** MindMate Development Team

---

## 15. Recent System Enhancements (Version 1.1)

### High-Availability AI "Waterfall" Fallback
To ensure 100% uptime and resilience against rate limits or service deprecations, the backend features a unified AI provider fallback sequence:
1. **Gemini Primary** (gemini-2.5-flash)
2. **Gemini Secondary** (gemini-2.5-flash)
3. **Groq** (llama-3.1-8b-instant)
4. **OpenRouter** (meta-llama/llama-3-8b-instruct:free)
5. **OpenAI** (gpt-3.5-turbo)
All providers are normalized to return Server-Sent Events (SSE) in a consistent {"type": "chunk", "text": "word"} format.

### Audio Transcripts & Speech Emotion Recognition
- The UI now features a dynamic toggle allowing users to view or hide the Speech-to-Text transcript beneath audio recordings.
- Raw .webm audio is captured via the MediaRecorder API and successfully streamed to the backend.
- Audio blobs are uploaded via @gradio/client directly to a custom Hugging Face Space for accurate Speech Emotion Recognition (SER), linking audio tone directly to the emotion analytics dashboard.

### Integrated Test Suite Mastery
The backend's 	est_integrated.js suite currently executes with a **100% pass rate (21/21 tests)**.
- Validates Supabase JWT generation and authentication middleware.
- Validates paginated session histories.
- Tests multi-provider streaming generation and crisis detection keywords.
