# 🚀 MindMate Quick Start Guide

## What Was Built

A **complete emotion-aware chatbot backend system** with:
- ✅ Emotion detection from text & voice
- ✅ Crisis detection & severity classification  
- ✅ Two response pipelines (normal & crisis)
- ✅ Emergency resources & guided support
- ✅ Production-ready code structure

---

## System Architecture (Simple View)

```
User Message
    ↓
Analyze Emotion (Happiness, Sadness, Anxiety, etc.)
    ↓
Check for Crisis Keywords (Suicide, Depression, Trauma, etc.)
    ↓
DECISION POINT:
DECISION POINT:
├─ Crisis Found? → Crisis Pipeline (Get emergency help info + Gemini AI Response)
└─ No Crisis? → Normal Pipeline (Supportive Gemini AI response & suggestions)
    ↓
Send Response to User
```

---

## 3 Main Services Created

### 1️⃣ **Emotion Detection Service**
- Detects 6 emotions: Happy, Sad, Angry, Anxious, Calm, Excited
- Uses TED (Text Emotion Detection) for text input
- Uses SED (Speech Emotion Detection) for voice input
- Returns emotion + confidence score (0-100%)

### 2️⃣ **Crisis Detection Service**
- Checks message for 36+ crisis keywords
- Classifies severity: CRITICAL → SEVERE → MODERATE
- Provides emergency hotlines and resources
- Generates supportive crisis messages
- Gives guided next steps

### 3️⃣ **Response Service (with Gemini AI)**
- Creates emotion-aware responses dynamically via Google Gemini
- Provides coping suggestions
- Generates follow-up questions
- Keeps conversations natural & helpful

---

## Files Created

```
📁 services/
   ├── emotionService.js          (Emotion detection)
   ├── crisisDetectionService.js  (Crisis handling)
   └── responseService.js         (Smart responses)

📁 routes/
   └── dataRoutes.js              (3 API endpoints)

📄 README.md                        (Full documentation)
📄 API_EXAMPLES.js                  (7+ test examples)
📄 test.js                          (Automated tests)
📄 IMPLEMENTATION_SUMMARY.md        (This summary)
📄 QUICK_START.md                   (You are here!)
```

---

## How to Use

### 1. **Start the Server**
```bash
cd c:\Users\shiva\Desktop\projects\mindmate
node server.js
```
Expected: `Server running on http://localhost:5000`

### 2. **Send a Message** (Happy)
```bash
curl -X POST http://localhost:5000/api/data/process-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "text": "I just got promoted! I am so happy!",
    "userId": "user123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "usingAI": true,
    "isCrisis": false,
    "response": "That's wonderful to hear! Keep nurturing this positive energy.",
    "detectedEmotion": "happy",
    "emotionConfidence": 0.92,
    "suggestions": [
      "Keep a gratitude journal",
      "Share your joy with others",
      "Plan something fun"
    ]
  }
}
```

### 3. **Send a Crisis Message** (Suicidal)
```bash
curl -X POST http://localhost:5000/api/data/process-with-ai \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "text": "I want to die. I cannot take this pain.",
    "userId": "user999"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "usingAI": true,
    "isCrisis": true,
    "severity": "CRITICAL",
    "supportMessage": "I'm really concerned about what you're sharing...",
    "resources": [
      {
        "name": "Tele-MANAS (Official Govt Helpline)",
        "number": "14416",
        "url": "https://telemanas.mohfw.gov.in",
        "availability": "24/7"
      },
      {
        "name": "Kiran Mental Health Helpline",
        "number": "1800-599-0019"
      }
    ],
    "guidedNextSteps": [
      "Contact a crisis helpline immediately",
      "Reach out to a trusted person",
      "Go to nearest emergency room if in danger"
    ]
  }
}
```

---

## API Endpoints

### **POST /api/data/process-with-ai** ⭐ Main Endpoint
```
Input:  { type: "text"|"voice", text: "...", userId: "..." }
Output: { success: true, data: {...response...} }
*(Can also append ?stream=true for Server-Sent Events)*
```

### **GET /api/data/health** 🏥 Health Check
```
Input:  (no parameters)
Output: { status: "operational", services: {...} }
```

### **GET /api/data/resources** 🆘 Get Crisis Resources
```
Input:  ?severity=CRITICAL|SEVERE|MODERATE
Output: { severity: "...", resources: [...] }
```

---

## Crisis Severity Levels

### 🔴 **CRITICAL** (Immediate Danger)
**Keywords:** suicide, want to die, kill myself, overdose, self-harm
**Response:** Emergency hotline numbers, immediate action steps

### 🟠 **SEVERE** (High Risk)
**Keywords:** depressed, hopeless, can't go on, trauma, panic attack
**Response:** Professional help resources, support groups

### 🟡 **MODERATE** (Concerning)
**Keywords:** anxious, stressed, sad, overwhelmed, angry
**Response:** Coping strategies, professional consultation

---

## 7 Emotions & How System Responds

| Emotion | Response Type | Support Provided |
|---------|---------------|------------------|
| 😊 Happy | Reinforcement | Gratitude journal, share joy |
| 😢 Sad | Empathy | Talk it out, spend time with people |
| 😠 Angry | Validation | STOP technique, physical activity |
| 😰 Anxious | Grounding | Deep breathing, 5-4-3-2-1 technique |
| 😌 Calm | Strength | Maintain practices, channel energy |
| 🤩 Excited | Enthusiasm | Channel energy, share excitement |

---

## What's Ready Now

✅ **Emotion Detection**
- Works with text or voice
- Returns emotion + confidence score
- Mock responses available for development

✅ **Crisis Detection**
- Scans for 36+ keywords
- Classifies severity automatically
- Provides emergency numbers

✅ **Smart Responses**
- Emotion-specific support
- Coping suggestions
- Follow-up questions

✅ **Complete Documentation**
- API examples
- Test scripts
- Setup guide

---

## What's Next (Optional)

To make it production-ready:

1. **Connect Real ML Models**
   - Replace mock TED with actual text emotion detection API
   - Replace mock SED with actual voice emotion detection API
   - Update `.env` with real API endpoints

2. **Add Database**
   - Store user conversations
   - Track crisis events
   - Build user profiles

3. **Set Up Monitoring**
   - Alert on CRITICAL crises
   - Log all interactions
   - Dashboard for analytics

4. **Add Security**
   - Authentication for users
   - Rate limiting
   - HIPAA compliance

5. **Enhance Features**
   - Conversation history
   - Personalized responses
   - Multi-language support
   - Admin dashboard

---

## Testing Commands

### Run all tests
```bash
node test.js
```

### Test health
```bash
curl http://localhost:5000/api/data/health
```

### Get CRITICAL resources
```bash
curl "http://localhost:5000/api/data/resources?severity=CRITICAL"
```

---

## File Locations

| File | Purpose |
|------|---------|
| `services/emotionService.js` | Emotion detection logic |
| `services/crisisDetectionService.js` | Crisis keywords & resources |
| `services/responseService.js` | Response generation |
| `routes/dataRoutes.js` | API endpoints |
| `server.js` | Express server setup |
| `.env` | Configuration (API keys, port) |
| `README.md` | Full documentation |
| `API_EXAMPLES.js` | Test examples |
| `test.js` | Automated tests |

---

## Key Features at a Glance

```
INPUT: "I feel so depressed and hopeless..."
  ↓
EMOTION: sad (confidence: 88%)
  ↓
CRISIS CHECK: Found "depressed", "hopeless" → SEVERE crisis
  ↓
OUTPUT:
  ├─ Message: "I hear you're struggling with deep pain..."
  ├─ Severity: SEVERE
  ├─ Resources: [SAMHSA Helpline, Mental Health America]
  └─ Next Steps: [See therapist, reach out to trusted person, ...]
```

---

## Emergency Contacts (Built-In)

🚨 **CRITICAL (Suicidal):**
- 🇮🇳 Tele-MANAS (Official Govt Helpline): **14416**
- 🇮🇳 Kiran Mental Health Helpline: **1800-599-0019**

🏥 **SEVERE (Depression/Crisis):**
- Sangath Support: **011-41198666**
- TISS iCall Helpline: **9152987821**

---

## Architecture Diagram

```
┌──────────────────────────────────────────┐
│         User Input (Text/Voice)          │
└────────────────────┬─────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Emotion Detection     │
        │  (TED or SED Model)    │
        │  Returns: emotion,     │
        │  confidence            │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Crisis Detection      │
        │  Keyword Scanning      │
        │  Severity Check        │
        └────────────┬───────────┘
                     │
        ┌────────────┴───────────┐
        │                        │
        ▼                        ▼
    ┌────────────┐       ┌──────────────┐
    │   NORMAL   │       │   CRISIS     │
    │  PIPELINE  │       │  PIPELINE    │
    │            │       │              │
    │ • Response │       │ • Severity   │
    │ • Suggest. │       │ • Resources  │
    │ • Q&A      │       │ • Next Steps │
    └────────────┘       └──────────────┘
        │                        │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │   Response to User     │
        │   (JSON API)           │
        └────────────────────────┘
```

---

## Summary

You now have a **fully functional emotion-aware chatbot system** that:

✅ Detects emotions with confidence scores
✅ Identifies crisis situations by severity
✅ Provides appropriate support & resources
✅ Routes messages to correct pipeline
✅ Returns helpful, contextual responses
✅ Includes emergency hotline information
✅ Has detailed documentation
✅ Ready for ML model integration

**Start the server, send a message, get a supportive response!**

```bash
node server.js
# Then test with the examples above
```

---

**Questions? Check:**
- `README.md` - Full documentation
- `API_EXAMPLES.js` - Code examples
- `IMPLEMENTATION_SUMMARY.md` - What was built
