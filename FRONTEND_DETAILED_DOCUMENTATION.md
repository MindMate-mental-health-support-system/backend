# MindMate Frontend - Detailed Technical Documentation

**Version:** 2.0  
**Last Updated:** March 6, 2026  
**Author:** Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Overview](#architecture-overview)
5. [Configuration & Setup](#configuration--setup)
6. [Pages & Components](#pages--components)
7. [Styling & Theme System](#styling--theme-system)
8. [Core Features](#core-features)
9. [API Integration](#api-integration)
10. [State Management](#state-management)
11. [Routing & Navigation](#routing--navigation)
12. [Error Handling](#error-handling)
13. [Performance Optimization](#performance-optimization)
14. [Development Guide](#development-guide)
15. [Deployment](#deployment)
16. [Troubleshooting](#troubleshooting)

---

## Executive Summary

**MindMate Frontend V2** is a modern React-based mental health companion application built with cutting-edge technologies. The frontend provides a secure, intuitive interface for users to:

- **Chat Interface:** Real-time conversation with the MindMate AI assistant
- **Voice Integration:** Speech-to-text input for hands-free interaction
- **Mood Tracking:** Visual dashboard displaying emotional patterns
- **Multi-Language Support:** Support for Malayalam, English, and other languages
- **Theme Switching:** Dark and light mode support
- **Session Ma0nagement:** Conversation history and persistence
- **Authentication:** Secure user accounts and guest sessions

### Key Features
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Real-time Chat with AI Assistant
- ✅ Speech Recognition (Web Speech API)
- ✅ Mood Analytics Dashboard
- ✅ Dark/Light Theme Toggle
- ✅ Multi-language Support
- ✅ Guest and Authenticated User Modes
- ✅ Conversation History Management
- ✅ Protected Routes & Authentication
- ✅ Error Boundary Implementation
- ✅ Animation & Microinteractions (Framer Motion)

---

## Technology Stack

### Core Framework & Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| **React** | ^19.2.0 | UI Framework |
| **React DOM** | ^19.2.0 | React rendering |
| **React Router DOM** | ^7.13.1 | Routing & Navigation |
| **Vite** | ^7.3.1 | Build Tool & Dev Server |

### UI & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| **Framer Motion** | ^12.34.4 | Animation Library |
| **Lucide React** | ^0.576.0 | Icon Library |
| **CSS Variables** | Native | Theme Management |

### Data & HTTP

| Package | Version | Purpose |
|---------|---------|---------|
| **Axios** | ^1.13.6 | HTTP Client |

### Data Visualization

| Package | Version | Purpose |
|---------|---------|---------|
| **Recharts** | ^3.7.0 | Chart Library |

### Development Tools

| Package | Version | Purpose |
|---------|---------|---------|
| **ESLint** | ^9.39.1 | Code Linting |
| **Vite PWA Plugin** | ^1.2.0 | Progressive Web App |

---

## Project Structure

```
FRONTEND_V2/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, media
│   ├── components/        # Reusable React components
│   │   └── ErrorBoundary.jsx
│   ├── pages/             # Page components (routes)
│   │   ├── ChatPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── SignupPage.jsx
│   ├── services/          # API services (empty - API calls inline)
│   ├── App.jsx            # Root component
│   ├── App.css            # Legacy styles
│   ├── config.js          # Configuration
│   ├── index.css          # Global styles & theme
│   └── main.jsx           # Entry point
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint rules
└── README.md              # Project README
```

### Directory Descriptions

#### `/public`
Static files served as-is, including favicons, images, and manifest files.

#### `/src/assets`
Contains images, fonts, and other media files used throughout the application.

#### `/src/components`
Reusable React components:
- **ErrorBoundary.jsx** - Error boundary wrapper component for error handling

#### `/src/pages`
Page-level components representing different routes:
- **ChatPage.jsx** - Main chat interface with AI assistant
- **DashboardPage.jsx** - Mood analytics and statistics
- **LandingPage.jsx** - Home/welcome page
- **LoginPage.jsx** - User login form
- **SignupPage.jsx** - User registration form

#### `/src/services`
Empty directory reserved for API service layer (currently API calls are inline).

#### Root Files
- **App.jsx** - Root component with routing configuration
- **main.jsx** - React entry point
- **config.js** - API configuration and constants
- **index.css** - Global styles and theme variables
- **App.css** - Legacy styles (legacy)

---

## Architecture Overview

### Component Hierarchy

```
App
├── BrowserRouter
│   ├── LandingPage (/)
│   ├── LoginPage (/login)
│   ├── SignupPage (/signup)
│   ├── ProtectedRoute
│   │   ├── ChatPage (/chat)
│   │   └── DashboardPage (/dashboard)
└── ErrorBoundary (Wrapper)
```

### Data Flow

```
User Input
    ↓
Component State (useState)
    ↓
Event Handler
    ↓
API Call (axios) → Backend API
    ↓
Response Processing
    ↓
State Update → Re-render
    ↓
UI Update
```

### Authentication Flow

```
User Registration/Login
    ↓
Backend validates credentials
    ↓
Backend returns JWT token + user data
    ↓
Frontend stores: token, alias, user data in localStorage
    ↓
ProtectedRoute checks for token/alias
    ↓
Allow access to protected pages (ChatPage, DashboardPage)
```

---

## Configuration & Setup

### config.js

```javascript
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

**Purpose:** Centralized API endpoint configuration
- Uses Vite's environment variables
- Falls back to localhost:5000 for development

### Environment Variables

Create `.env` or `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=MindMate
VITE_VERSION=2.0.0
```

### Build Configuration (vite.config.js)

```javascript
{
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false
  }
}
```

### Scripts Available

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

---

## Pages & Components

### 1. Landing Page (`LandingPage.jsx`)

**Route:** `/`  
**Authentication:** Not required  
**Purpose:** Welcome page and entry point

#### Key Features:
- Brand introduction with animated logo
- Call-to-action buttons
- Responsive design
- Smooth animations (Framer Motion)

#### Component State:
```javascript
const [isHovered, setIsHovered] = useState(false);
```

#### Key Functions:
- `handleGetStarted()` - Navigate to signup
- Animation transitions with Framer Motion

#### UI Elements:
- MindMate logo with Sparkles icon
- Brand tagline
- "Create Free Account" button (gradient)
- "Login" button
- Premium glass-morphism panel

---

### 2. Login Page (`LoginPage.jsx`)

**Route:** `/login`  
**Authentication:** Not required  
**Purpose:** User authentication

#### Key Features:
- Email/username input
- Password input
- Remember me option
- Sign up link
- Error handling

#### Component State:
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const [rememberMe, setRememberMe] = useState(false);
```

#### API Integration:
- POST `/api/auth/login` - Authenticate user
- Stores token, user data, alias in localStorage

---

### 3. Signup Page (`SignupPage.jsx`)

**Route:** `/signup`  
**Authentication:** Not required  
**Purpose:** User registration

#### Key Features:
- Email input
- Username input
- Password input
- Password confirmation
- Terms acceptance
- Error handling

#### Component State:
```javascript
const [email, setEmail] = useState('');
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [acceptTerms, setAcceptTerms] = useState(false);
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```

#### API Integration:
- POST `/api/auth/signup` - Register user
- Automatically logs in after signup

---

### 4. Chat Page (`ChatPage.jsx`) - Main Interface

**Route:** `/chat`  
**Authentication:** Required  
**Purpose:** Primary interaction interface with AI assistant

#### Key Features:
- Real-time chat interface
- Voice input (Web Speech API)
- Conversation history
- Session management
- Mood selection
- Language selection
- Theme toggle
- Sidebar with conversation sessions
- AI toggle
- Typing indicators
- Message animations

#### Component State:

```javascript
// User Data
const [alias, setAlias] = useState(localStorage.getItem('mindmate_alias'));
const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('mindmate_user') || '{}'));

// Sidebar & Sessions
const [sidebarOpen, setSidebarOpen] = useState(!isGuest);
const [sessions, setSessions] = useState([]);
const [selectedSessionId, setSelectedSessionId] = useState(null);
const [hasMoreHistory, setHasMoreHistory] = useState(true);
const [isLoadingHistory, setIsLoadingHistory] = useState(false);

// UI Preferences
const [currentLanguage, setCurrentLanguage] = useState(() => {
  return localStorage.getItem('mindmate_language') || 'ml-IN';
});
const [currentMood, setCurrentMood] = useState('default');
const [isSelectingMood, setIsSelectingMood] = useState(false);
const [theme, setTheme] = useState(() => {
  const stored = localStorage.getItem('mindmate_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
});

// Chat State
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');
const [isListening, setIsListening] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [isNewConversation, setIsNewConversation] = useState(true);
const [useAI, setUseAI] = useState(false);
```

#### Key Functions:

**Initialization:**
```javascript
useEffect(() => {
  // Check authentication
  if (!alias && !token) {
    navigate('/login');
    return;
  }
  
  // Apply theme
  document.documentElement.setAttribute('data-theme', theme);
  
  // Set initial greeting
  setMessages([{
    id: Date.now(),
    sender: 'bot',
    text: getGreeting(),
    emotion: 'joy'
  }]);
  
  // Fetch sessions (if authenticated)
  if (!isGuest && userData?.id) {
    fetchSessions();
    checkAIStatus();
  }
}, [navigate, token, alias]);
```

**getGreeting()** - Returns random greeting message:
```javascript
const getGreeting = () => {
  const greetings = [
    `Welcome to your secure sanctuary, ${userData.username || alias}. I am MindMate. Speak freely—I'm listening.`,
    `Hi ${userData.username || alias}, how is your day going? I'm here for you.`,
    `Hello ${userData.username || alias}. Take a deep breath. What's on your mind today?`,
    `Welcome back, ${userData.username || alias}. This is your safe space.`
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
};
```

**fetchSessions()** - Loads user's conversation sessions:
```javascript
const fetchSessions = async () => {
  try {
    const res = await axios.get(`${apiBase}/api/sessions`, {
      params: { userId: userData.id },
      headers: { Authorization: `Bearer ${token}` }
    });
    const list = res.data.sessions || [];
    setSessions(list);
  } catch (e) {
    console.error("Failed to load sessions", e);
  }
};
```

**fetchSessionHistory()** - Loads messages from a session:
```javascript
const fetchSessionHistory = async (sessionId, offset = 0) => {
  setIsLoadingHistory(true);
  try {
    const res = await axios.get(`${apiBase}/api/sessions/${sessionId}/history`, {
      params: { offset, limit: 50 },
      headers: { Authorization: `Bearer ${token}` }
    });
    // Process and display messages
  } catch (e) {
    console.error("Failed to load session history", e);
  }
};
```

**sendMessage()** - Sends user message and gets response:
```javascript
const sendMessage = async () => {
  if (!input.trim()) return;
  
  // Add user message to chat
  const userMsg = { id: Date.now(), sender: 'user', text: input };
  setMessages(prev => [...prev, userMsg]);
  setInput('');
  setIsLoading(true);
  
  try {
    const res = await axios.post(`${apiBase}/api/chat`, {
      userId: userData.id,
      message: input,
      sessionId: selectedSessionId,
      language: currentLanguage,
      mood: currentMood,
      useAI: useAI
    });
    
    // Add bot response
    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      sender: 'bot',
      text: res.data.response,
      emotion: res.data.emotion
    }]);
  } catch (e) {
    console.error("Message send failed", e);
  } finally {
    setIsLoading(false);
  }
};
```

**Voice Input:**
```javascript
const startListening = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Speech Recognition not supported in your browser');
    return;
  }
  
  recognitionRef.current = new SpeechRecognition();
  recognitionRef.current.language = currentLanguage;
  recognitionRef.current.onstart = () => setIsListening(true);
  recognitionRef.current.onend = () => setIsListening(false);
  recognitionRef.current.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');
    setInput(transcript);
  };
  recognitionRef.current.start();
};
```

#### Message Structure:
```javascript
{
  id: number,           // Unique identifier
  sender: 'user'|'bot', // Message source
  text: string,         // Message content
  emotion?: string,     // Bot emotion (joy, sadness, etc.)
  timestamp?: number    // Message timestamp
}
```

#### API Endpoints Used:
- GET `/api/sessions` - Fetch user's sessions
- GET `/api/sessions/{id}/history` - Fetch session messages
- POST `/api/chat` - Send message and get response
- GET `/api/data/ai-status` - Check if AI is available

---

### 5. Dashboard Page (`DashboardPage.jsx`)

**Route:** `/dashboard`  
**Authentication:** Required  
**Purpose:** Mood analytics and emotional tracking

#### Key Features:
- Bar chart visualization of mood trends
- Last 14 sessions displayed
- Color-coded mood indicators
- Interactive tooltips
- Responsive chart design

#### Component State:
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
```

#### Mood Configuration:

```javascript
const moodConfig = {
  surprise: { value: 6, color: '#fbbf24', label: 'Surprise' },
  joy: { value: 5, color: '#10b981', label: 'Joy' },
  love: { value: 4, color: '#f472b6', label: 'Love' },
  default: { value: 3.5, color: '#94a3b8', label: 'Neutral' },
  sadness: { value: 2, color: '#38bdf8', label: 'Sadness' },
  fear: { value: 1.5, color: '#f59e0b', label: 'Fear' },
  anger: { value: 1, color: '#f43f5e', label: 'Anger' }
};
```

#### Key Functions:

**fetchMoodData()** - Loads and processes mood history:
```javascript
const fetchMoodData = async () => {
  try {
    const token = localStorage.getItem('mindmate_token');
    const res = await axios.get(`http://localhost:5000/api/sessions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    const sessions = res.data.sessions.slice(0, 14).reverse();
    const chartData = sessions.map(session => {
      const date = new Date(session.created_at);
      const moodKey = session.mood || 'default';
      const config = moodConfig[moodKey] || moodConfig['default'];
      
      return {
        name: `${date.getMonth() + 1}/${date.getDate()}`,
        fullDate: date.toLocaleDateString(),
        title: session.title || 'Chat',
        mood: config.value,
        moodLabel: config.label,
        color: config.color
      };
    });
    
    setData(chartData);
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err);
  } finally {
    setLoading(false);
  }
};
```

**Chart Components:**
- Bar Chart (Recharts)
- Custom Tooltip
- X-Axis (Dates)
- Y-Axis (Mood Values)
- Color-coded bars per mood

---

### 6. Error Boundary Component (`ErrorBoundary.jsx`)

**Purpose:** Catch and handle component errors gracefully

#### Features:
- Error logging
- User-friendly error UI
- Fallback display
- Error recovery options

#### Component State:
```javascript
state = {
  hasError: false,
  error: null,
  errorInfo: null
};
```

#### Key Methods:
```javascript
static getDerivedStateFromError(error) {
  return { hasError: true, error };
}

componentDidCatch(error, errorInfo) {
  console.error("Uncaught error:", error, errorInfo);
  this.setState({ errorInfo });
}
```

---

## Styling & Theme System

### Theme Architecture

The application uses **CSS Variables** for dynamic theming without runtime overhead.

#### How It Works:

1. **Theme Toggle:** User clicks theme button
2. **State Update:** `setTheme('light')` or `setTheme('dark')`
3. **DOM Attribute:** `document.documentElement.setAttribute('data-theme', theme)`
4. **CSS Rules:** `:root[data-theme='dark']` or `:root[data-theme='light']` apply
5. **Variable Swap:** All CSS variables update instantly
6. **Re-render:** Components reflect new colors automatically

### CSS Variables

#### Dark Mode (Default)
```css
:root[data-theme='dark'] {
  --bg-app: #050509;              /* Main background */
  --bg-panel: #18181b;            /* Panel/card background */
  --bg-panel-hover: #27272a;      /* Hover state */
  
  --text-main: #f8fafc;           /* Primary text */
  --text-muted: #94a3b8;          /* Secondary text */
  --text-inverse: #020617;        /* Inverse text */
  
  --border-light: rgba(255, 255, 255, 0.1);
  --border-faint: rgba(255, 255, 255, 0.05);
  
  --glass-bg: rgba(24, 24, 27, 0.6);
  --glass-border: rgba(255, 255, 255, 0.05);
  --glass-shadow: rgba(0, 0, 0, 0.3);
  
  --input-bg: rgba(255, 255, 255, 0.03);
  --input-border: rgba(255, 255, 255, 0.1);
  --input-focus: rgba(255, 255, 255, 0.06);
  
  --msg-bot-bg: rgba(255, 255, 255, 0.03);
  --msg-bot-border: rgba(255, 255, 255, 0.08);
  --msg-bot-text: #ffffff;
}
```

#### Light Mode
```css
:root[data-theme='light'] {
  --bg-app: #f4f5fb;
  --bg-panel: #ffffff;
  --bg-panel-hover: #f1f5f9;
  
  --text-main: #0f172a;
  --text-muted: #64748b;
  --text-inverse: #ffffff;
  
  /* ... other variables ... */
}
```

#### Brand Colors (Static)
```css
:root {
  --primary: #6366f1;              /* Indigo */
  --primary-light: #818cf8;
  --card-gradient: linear-gradient(135deg, #6366f1, #8b5cf6);
  --danger: #f43f5e;               /* Red */
  --success: #10b981;              /* Green */
  --warning: #f59e0b;              /* Amber */
}
```

### Styling Patterns

#### 1. Inline Styles with Variables
```jsx
style={{
  background: 'var(--bg-panel)',
  color: 'var(--text-main)',
  border: '1px solid var(--border-light)',
  borderRadius: '12px'
}}
```

#### 2. CSS Classes
```jsx
<div className="glass-panel">Content</div>
```

#### 3. Gradient Classes
```jsx
<div className="text-gradient">Gradient Text</div>
<button className="bg-gradient-primary">Gradient Button</button>
```

### Glass Morphism Design

The app uses glass morphism (frosted glass effect) throughout:

```css
.glass-panel {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 8px 32px var(--glass-shadow);
}
```

### Font & Typography

**Font Family:** Outfit (Google Fonts)
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
```

**Font Weights:**
- 300: Light
- 400: Regular
- 500: Medium
- 600: Semi-bold
- 700: Bold

---

## Core Features

### 1. Chat Interface

#### Real-Time Messaging:
- User messages displayed on right (user-aligned)
- Bot messages on left (bot-aligned)
- Typing indicators during loading
- Message timestamps
- Emotion indicators for bot responses

#### Message Animations:
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {message.text}
</motion.div>
```

### 2. Voice Input (Web Speech API)

#### Browser Support:
- Chrome/Edge: Full support
- Firefox: Limited support
- Safari: Limited support

#### Implementation:
```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.language = currentLanguage;
recognition.onresult = (event) => {
  const transcript = Array.from(event.results)
    .map(r => r[0].transcript)
    .join('');
  setInput(transcript);
};
recognition.start();
```

#### Supported Languages:
- Malayalam (ml-IN)
- English (en-IN, en-US)
- Hindi (hi-IN)
- Others based on browser support

### 3. Conversation Sessions

#### Session Management:
- Create new session on chat start
- Load session history
- Switch between sessions
- Persistent storage in backend

#### Session Data Structure:
```javascript
{
  id: string,
  userId: string,
  title: string,
  mood: string,
  created_at: timestamp,
  updated_at: timestamp,
  message_data: [
    {
      id: string,
      sender: 'user'|'bot',
      text: string,
      emotion?: string,
      timestamp: timestamp
    }
  ]
}
```

### 4. Multi-Language Support

#### Supported Languages:
- Malayalam (ml-IN) - Default
- English (en-IN)
- English (en-US)
- Hindi (hi-IN)

#### Implementation:
- Web Speech API language setting
- Backend processes messages in selected language
- AI responses adapt to language context
- User preference persisted in localStorage

```javascript
localStorage.setItem('mindmate_language', currentLanguage);
```

### 5. Mood Selection

#### Mood Types:
- Joy
- Sadness
- Anger
- Fear
- Love
- Surprise
- Default (Neutral)

#### UI Implementation:
- Dropdown/modal selector
- Emoji indicators
- Color-coded display
- Sent with each message

### 6. Authentication System

#### User Types:

**Registered Users:**
- Username/Email login
- Password-based authentication
- JWT token storage
- Full feature access

**Guest Users:**
- Anonymous chat
- No login required
- Limited session history
- Identified by `Guest_` prefix

#### Storage:
```javascript
localStorage.setItem('mindmate_token', token);        // JWT
localStorage.setItem('mindmate_alias', alias);        // Username/Guest_ID
localStorage.setItem('mindmate_user', JSON.stringify(userData));
localStorage.setItem('mindmate_userId', userId);
```

### 7. Protected Routes

```javascript
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('mindmate_token');
  const alias = localStorage.getItem('mindmate_alias');
  
  // Allow if:
  // 1. Has valid token (registered user), OR
  // 2. Has Guest alias (guest user)
  if (!token && !alias?.startsWith('Guest_')) {
    return <Navigate type="replace" to="/login" />;
  }
  
  return children;
};
```

---

## API Integration

### Base URL Configuration
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

### Axios Instance

Default axios configuration with headers:
```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
axios.defaults.headers.common['Content-Type'] = 'application/json';
```

### API Endpoints Used

#### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/logout` | User logout |

#### Chat
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chat` | Send message, get response |
| POST | `/api/transcription` | Convert speech to text |

#### Sessions & History
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/sessions` | List user sessions |
| GET | `/api/sessions/{id}/history` | Get session messages |
| POST | `/api/sessions` | Create new session |
| DELETE | `/api/sessions/{id}` | Delete session |

#### Data & Status
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/data/ai-status` | Check if AI is available |
| GET | `/api/user/profile` | Get user profile |

### Request Examples

#### Send Message
```javascript
await axios.post(`${API_BASE_URL}/api/chat`, {
  userId: userData.id,
  message: input,
  sessionId: selectedSessionId,
  language: currentLanguage,
  mood: currentMood,
  useAI: useAI
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

#### Fetch Sessions
```javascript
await axios.get(`${API_BASE_URL}/api/sessions`, {
  params: { userId: userData.id },
  headers: { Authorization: `Bearer ${token}` }
});
```

#### Fetch History
```javascript
await axios.get(`${API_BASE_URL}/api/sessions/${sessionId}/history`, {
  params: { offset: 0, limit: 50 },
  headers: { Authorization: `Bearer ${token}` }
});
```

### Error Handling

```javascript
try {
  const response = await axios.get(endpoint);
  // Process response
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    navigate('/login');
    localStorage.clear();
  } else if (error.response?.status === 403) {
    // Forbidden
    console.error('Access denied');
  } else {
    // Other errors
    console.error('Request failed:', error.message);
  }
}
```

---

## State Management

### Local Storage

The application uses browser `localStorage` for state persistence:

```javascript
// Authentication
localStorage.setItem('mindmate_token', jwtToken);
localStorage.setItem('mindmate_alias', username);
localStorage.setItem('mindmate_user', JSON.stringify(userData));
localStorage.setItem('mindmate_userId', userId);

// User Preferences
localStorage.setItem('mindmate_language', 'ml-IN');
localStorage.setItem('mindmate_theme', 'dark');

// Session
localStorage.setItem('mindmate_selectedSession', sessionId);
```

### Component State (useState)

#### ChatPage State:
- Messages array
- Input text
- Loading states
- Session data
- UI preferences (theme, language, mood)
- Voice recording state

#### DashboardPage State:
- Chart data
- Loading state

#### LoginPage/SignupPage State:
- Form inputs
- Error messages
- Loading state

### State Lifting

Parent → Child data flow:
```
App.jsx
  ↓
ChatPage.jsx
  ├── Session sidebar
  ├── Message display
  └── Input area
```

Child → Parent communication via callbacks:
```javascript
<ChildComponent onChange={(value) => setParentState(value)} />
```

---

## Routing & Navigation

### Route Configuration

```javascript
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

### Navigation Methods

#### useNavigate Hook:
```javascript
const navigate = useNavigate();
navigate('/chat');           // Navigate to chat
navigate(-1);                 // Go back
navigate('/login', { replace: true }); // Replace history
```

#### Link Component:
```jsx
<Link to="/dashboard">Dashboard</Link>
```

### Route Protection

```javascript
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('mindmate_token');
  const alias = localStorage.getItem('mindmate_alias');
  
  if (!token && !alias?.startsWith('Guest_')) {
    return <Navigate type="replace" to="/login" />;
  }
  return children;
};
```

---

## Error Handling

### Error Boundary

Catches rendering errors in component tree:

```javascript
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Try-Catch Blocks

API calls wrapped in try-catch:

```javascript
try {
  const response = await axios.get(endpoint);
  setData(response.data);
} catch (error) {
  console.error('Error:', error);
  setError(error.message);
} finally {
  setLoading(false);
}
```

### User Feedback

- Alert dialogs for critical errors
- Toast notifications (if implemented)
- Error messages in UI
- Fallback UI states

---

## Performance Optimization

### Code Splitting

Route-based splitting using React.lazy (future):

```javascript
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
```

### Lazy Loading

Defer non-critical resources:
- Chat history pagination (load 50 items at a time)
- Session list lazy loading
- Image lazy loading

### Memoization

Prevent unnecessary re-renders:

```javascript
const MemoizedComponent = React.memo(Component);

const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

### Optimized Animations

Framer Motion provides GPU-accelerated animations:
```javascript
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.3 }}
```

### Bundle Size

Dependencies analysis:
```bash
npm run build  # Shows bundle analysis
```

### Caching

- Browser cache for static assets
- localStorage for user preferences
- Session data in memory

---

## Development Guide

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern browser with ES2020+ support

### Installation

```bash
cd FRONTEND_V2
npm install
```

### Running Development Server

```bash
npm run dev
```

Starts at `http://localhost:5173` (or next available port)

### Building for Production

```bash
npm run build
```

Creates optimized build in `/dist`

### Linting

```bash
npm run lint
```

Checks code quality with ESLint

### Preview Production Build

```bash
npm run preview
```

Serves production build locally

### Development Tips

#### 1. Environment Setup
- Copy `.env.example` to `.env.local`
- Set `VITE_API_BASE_URL` to your backend
- Restart dev server after changes

#### 2. React DevTools
- Install React DevTools browser extension
- Inspect component hierarchy
- Monitor state changes

#### 3. Network Debugging
- Open DevTools → Network tab
- Monitor API requests
- Check request/response payloads

#### 4. Console Logging
```javascript
console.log('Debug:', value);
console.warn('Warning:', value);
console.error('Error:', value);
```

#### 5. Hot Module Replacement (HMR)
- Edit and save files
- Changes reflect instantly (no full reload)
- State preserved in most cases

---

## Deployment

### Building

```bash
npm run build
```

Generates `/dist` folder with optimized assets.

### Deployment Options

#### 1. Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

#### 2. Netlify

```bash
npm run build
# Drag /dist folder to Netlify
```

#### 3. Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 4. GitHub Pages

```bash
npm run build
# Push /dist to gh-pages branch
```

### Environment Variables for Production

```bash
VITE_API_BASE_URL=https://api.mindmate.com
VITE_APP_NAME=MindMate
```

### Performance Checklist

- ✅ Minified and compressed assets
- ✅ Images optimized
- ✅ Code split and lazy loaded
- ✅ Service worker enabled (PWA)
- ✅ Browser caching configured
- ✅ HTTPS enabled
- ✅ CORS properly configured

---

## Troubleshooting

### Common Issues

#### 1. "API Connection Failed"

**Problem:** Frontend can't reach backend

**Solutions:**
- Check backend is running (`http://localhost:5000`)
- Verify `VITE_API_BASE_URL` in config
- Check browser console for error details
- Verify CORS headers on backend

```bash
# Check backend
curl http://localhost:5000/api/health
```

#### 2. "Voice Input Not Working"

**Problem:** Speech recognition fails

**Solutions:**
- Browser must support Web Speech API
- HTTPS required in production (not localhost)
- Check microphone permissions
- Try different browser (Chrome has best support)

```javascript
console.log('Speech API support:', 
  'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
);
```

#### 3. "Messages Not Saving"

**Problem:** Conversation history not persisting

**Solutions:**
- Check user is logged in
- Verify session ID is being sent
- Check backend database connection
- Review server logs for errors

#### 4. "Theme Not Changing"

**Problem:** Dark/light mode toggle not working

**Solutions:**
- Check `data-theme` attribute on `<html>`
- Verify CSS variables are defined
- Clear browser cache
- Check if localStorage is disabled

```javascript
console.log('Theme:', document.documentElement.getAttribute('data-theme'));
console.log('Storage works:', !!localStorage.getItem('test'));
```

#### 5. "Build Failures"

**Problem:** `npm run build` fails

**Solutions:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node -v` (must be 18+)
- Fix ESLint errors: `npm run lint -- --fix`
- Check disk space

#### 6. "State Lost on Refresh"

**Problem:** User state clears after page reload

**Solutions:**
- Ensure data is saved to localStorage
- Check localStorage quota
- Verify browser allows localStorage

```javascript
// Check localStorage
console.log('Available space:', navigator.storage.estimate());
```

### Debug Mode

Enable verbose logging:

```javascript
// In main.jsx
if (import.meta.env.DEV) {
  window.DEBUG = true;
}

// In components
if (window.DEBUG) {
  console.log('Debug info:', data);
}
```

### Browser Console Tips

```javascript
// Check authentication
JSON.parse(localStorage.getItem('mindmate_user'))

// Check current theme
document.documentElement.getAttribute('data-theme')

// Check API connection
fetch('http://localhost:5000/api/health').then(r => r.json())

// Check localStorage usage
Object.keys(localStorage).forEach(k => 
  console.log(k, localStorage.getItem(k)?.length)
)
```

---

## Additional Resources

### Documentation
- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Vite Guide](https://vitejs.dev)
- [Framer Motion](https://www.framer.com/motion)
- [Axios](https://axios-http.com)
- [Recharts](https://recharts.org)

### Tools
- [React DevTools](https://react-devtools-tutorial.vercel.app)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [VS Code Extensions](https://marketplace.visualstudio.com)

### Best Practices
- Keep components small and focused
- Use meaningful variable names
- Comment complex logic
- Write error handling for all API calls
- Test responsive design on multiple devices
- Optimize images before deployment

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | March 6, 2026 | Complete rewrite with modern stack |
| 1.0 | January 2026 | Initial release |

---

## Support & Contact

For issues or questions:
- Check GitHub Issues
- Review documentation
- Contact development team
- Submit bug reports with reproduction steps

---

**End of Document**

**Document Generated:** March 6, 2026  
**Last Updated:** March 6, 2026  
**Status:** Complete & Ready for Production
