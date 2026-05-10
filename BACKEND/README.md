# MindMate Emotion-Aware Chatbot System

## Overview
A comprehensive mental health support chatbot backend that:
- **Detects emotions** from text (TED) or voice (SED) using ML models
- **Identifies crisis situations** using keyword detection
- **Routes messages** to appropriate pipelines (normal vs. crisis)
- **Provides contextual responses** with supportive suggestions and resources

## System Architecture

### Components

#### 1. **Emotion Detection Service** (`services/emotionService.js`)
Integrates with ML models to detect user emotions with confidence scores.

**Features:**
- Text Emotion Detection (TED) - for text input
- Speech Emotion Detection (SED) - for voice input
- Mock responses for development/testing
- Handles API errors gracefully

**Emotions Detected:**
- Happy, Sad, Angry, Anxious, Calm, Excited

#### 2. **Crisis Detection Service** (`services/crisisDetectionService.js`)
Identifies crisis indicators using keyword matching with severity levels.

**Crisis Levels:**
- **CRITICAL** - Suicidal ideation, self-harm threats
- **SEVERE** - Depression, hopelessness, trauma
- **MODERATE** - Anxiety, stress, sadness

**Features:**
- Keyword-based crisis detection
- Severity classification
- Supportive messaging
- Crisis hotline resources
- Guided next steps

#### 3. **Response Service (AI Integration)** (`services/responseService.js` & `services/aiContentService.js`)
Generates contextual responses based on detected emotion.

**Features:**
- Native Google Gemini streaming support via Server-Sent Events.
- Auto-generation of 3-word session titles.
- Prompt injection protection.
- Fallback arrays when AI is unavailable.

#### 4. **Data Routes** (`routes/dataRoutes.js` & `routes/sessionRoutes.js`)
Main API endpoints orchestrating the entire pipeline and historical chat persistence.

**Pipeline Flow:**
```
User Input (text/voice)
    ↓
Emotion Detection (TED/SED)
    ↓
Crisis Detection (keyword matching)
    ↓
Route to Pipeline:
    ├─ Normal Pipeline → Gemini AI Prompt → Streaming SSE Response
    └─ Crisis Pipeline → Gemini AI Prompt + Emergency Resources
    ↓
Response to User
```

## API Endpoints

### 1. **POST /api/data/process**
Main endpoint for processing user input.

**Request (Streaming):**
```json
// POST /api/data/process-with-ai?stream=true
{
  "type": "text|voice",
  "text": "User message (required for text type)",
  "userId": "optional-user-id",
  "sessionId": "current-session-id"
}
```

**Response - Normal (Streamed via SSE):**
```text
data: {"text": "That's "}
data: {"text": "wonderful "}
data: {"text": "news! "}
...
event: done
data: {"success": true, "data": {"isCrisis": false, "usingAI": true, "detectedEmotion": "happy"}}
```

**Response - Crisis:**
```json
{
  "success": true,
  "data": {
    "isCrisis": true,
    "severity": "CRITICAL|SEVERE|MODERATE",
    "supportMessage": "...",
    "resources": [
      {
        "name": "...",
        "number": "...",
        "url": "...",
        "availability": "..."
      }
    ],
    "detectedKeywords": ["..."],
    "detectedEmotion": "sad",
    "guidedNextSteps": ["..."]
  }
}
```

### 2. **GET /api/data/health**
Health check for all services.

**Response:**
```json
{
  "status": "operational",
  "timestamp": "2026-02-23T10:30:00.000Z",
  "services": {
    "emotion_detection": "connected|mock",
    "voice_detection": "connected|mock",
    "crisis_detection": "active"
  }
}
```

### 3. **GET /api/data/resources?severity=CRITICAL**
Get crisis resources for a specific severity level.

**Response:**
```json
{
  "severity": "CRITICAL",
  "resources": [...],
  "timestamp": "2026-02-23T10:30:00.000Z"
}
```

### 4. **Session Management Endpoints** (`/api/sessions`)
- **GET `/`**: Fetch user sessions.
- **POST `/`**: Create a new session.
- **GET `/:sessionId/history?limit=100&offset=0`**: Fetch paginated historical messages.
- **POST `/:sessionId/messages`**: Save user/bot messages (auto-generates a session title on first message via Gemini).

## Setup & Installation

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation
```bash
cd mindmate
npm install
```

### Configuration
Update `.env` file with your ML model endpoints:

```env
PORT=5000
TED_API_URL=https://your-ted-endpoint.com/process
SED_API_URL=https://your-sed-endpoint.com/process
TED_API_KEY=your-ted-api-key
SED_API_KEY=your-sed-api-key
NODE_ENV=development
```

**Note:** If endpoints are not configured, the system uses mock responses for testing.

### Running the Server
```bash
npm start
# Server runs on http://localhost:5000
```

## Testing

### With cURL

**Test 1: Happy text message**
```bash
curl -X POST http://localhost:5000/api/data/process \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "text": "I just got promoted! I am so happy!",
    "userId": "user123"
  }'
```

**Test 2: Crisis message (critical)**
```bash
curl -X POST http://localhost:5000/api/data/process \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "text": "I want to die. I cannot take this pain.",
    "userId": "user999"
  }'
```

**Test 3: Voice message**
```bash
curl -X POST http://localhost:5000/api/data/process \
  -F "type=voice" \
  -F "voice=@/path/to/audio.wav" \
  -F "userId=user456"
```

**Test 4: Health check**
```bash
curl http://localhost:5000/api/data/health
```

**Test 5: Get resources**
```bash
curl "http://localhost:5000/api/data/resources?severity=CRITICAL"
```

See `API_EXAMPLES.js` for more detailed examples.

## Crisis Keywords

### CRITICAL Keywords
- suicide, suicidal, kill myself, end my life
- harm myself, self harm, self-harm
- overdose, jump off
- no point living, life is meaningless
- want to die, dying, end it all

### SEVERE Keywords
- depressed, depression, hopeless, hopelessness
- worthless, worthless life
- can't go on, can't take it anymore
- suffering, unbearable
- alone, isolation, lonely
- panic, panic attack, severe anxiety
- trauma, traumatic, ptsd

### MODERATE Keywords
- anxious, anxiety, stressed, stress
- sad, sadness, upset
- struggling, struggle, difficult
- overwhelmed, overwhelm
- angry, rage, irritated

## Crisis Resources

### CRITICAL Resources
- **Tele-MANAS (Govt of India Official Helpline)**: 14416 | 1800-891-4416 | 24/7 | Multiple Languages
- **Kiran Mental Health Helpline (Govt of India)**: 1800-599-0019 | 24/7 | Toll-Free
- **NIMHANS Psychosocial Support Helpline**: 080-46110007 | 24/7

### SEVERE Resources
- **Sangath - Mental Health Support**: 011-41198666 | 10 AM - 6 PM
- **TISS iCall Helpline**: 9152987821 | Mon-Sat, 8 AM - 10 PM

## Features & Pipelines

### Normal Pipeline
- **Process:** Emotion detection → Generate supportive response
- **Output:** 
  - Contextual empathetic response
  - Coping suggestions for the emotion
  - Follow-up questions to deepen conversation
  - Timestamp of interaction

### Crisis Pipeline
- **Process:** Crisis detection → Classify severity → Generate crisis support
- **Output:**
  - Severity level classification
  - Supportive crisis message
  - Emergency resources for severity level
  - Guided next steps
  - Detected crisis keywords
  - Detected emotion for context

## Emotion Responses Examples

### Happy Emotion
- "That's wonderful to hear! Keep nurturing this positive energy."
- "I'm glad you're feeling good! What's contributing to your happiness?"
- "Your happiness is contagious! Keep celebrating these good moments."

**Suggestions:**
- Keep a gratitude journal
- Share joy with others
- Plan something fun to look forward to

### Sad Emotion
- "I'm sorry you're feeling down. Sadness is a valid emotion. Want to talk?"
- "It's okay to feel sad sometimes. Is there something specific troubling you?"
- "I'm here to listen. What's making you feel this way?"

**Suggestions:**
- Allow yourself to feel
- Spend time with supportive people
- Try gentle physical activity
- Express through writing or art

### Anxious Emotion
- "Anxiety can feel overwhelming. Let's work through this together."
- "What you're feeling is understandable. Have you tried grounding techniques?"
- "Take a deep breath. Anxiety is treatable, and you're not alone."

**Suggestions:**
- Practice deep breathing (4-7-8 technique)
- Ground yourself with 5-4-3-2-1 sensory technique
- Limit caffeine and get adequate sleep
- Exercise regularly

### Angry Emotion
- "It sounds like you're frustrated. Taking a moment to breathe might help."
- "Anger can be a signal that something important matters to you."
- "Your feelings are valid. Let's work through what's making you angry."

**Suggestions:**
- Take a timeout (5-10 minutes)
- Physical activity to release tension
- Practice STOP technique
- Identify what triggered anger

## Error Handling

### Invalid Request
```json
{
  "success": false,
  "error": "Invalid request: type must be \"text\" or \"voice\""
}
```

### Missing Content
```json
{
  "success": false,
  "error": "Invalid request: text is required for type \"text\""
}
```

### Server Error
```json
{
  "success": false,
  "error": "Failed to process your message. Please try again."
}
```

## Logging

The system logs important events:
- Emotion detection results
- Crisis detection analysis
- Crisis severity classification
- User interactions (when crisis detected)

**Example Crisis Log:**
```
📋 CRISIS EVENT LOG: {
  "userId": "user999",
  "timestamp": "2026-02-23T10:30:00.000Z",
  "severity": "CRITICAL",
  "keywords": ["suicide", "want to die"],
  "emotion": "sad",
  "type": "text"
}
```

## Production Recommendations

### To-Do Items
- [ ] Connect to real TED/SED ML model APIs (currently mocked or bypassed)
- [ ] Implement database logging for audit trail
- [ ] Set up monitoring/alerting for CRITICAL cases
- [ ] Add rate limiting to prevent abuse
- [ ] Implement authentication/authorization (Done via Supabase)
- [ ] Add HIPAA compliance for data handling
- [ ] Ensure AI Prompts remain strictly within mental health guidelines

## File Structure
```
mindmate/
├── services/
│   ├── emotionService.js        # ML model integration
│   ├── crisisDetectionService.js # Crisis detection & resources
│   └── responseService.js        # Response generation
├── routes/
│   └── dataRoutes.js            # API endpoints
├── uploads/                      # Voice file storage
├── server.js                     # Express server setup
├── package.json                  # Dependencies
├── .env                          # Environment variables
├── API_EXAMPLES.js               # Testing examples
└── README.md                     # This file
```

## License
ISC

## Support
For issues or feature requests, visit: https://github.com/MindMate-mental-health-support-system/backend
#   b a c k e n d  