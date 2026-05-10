# 🤖 AI Integration Summary

## What's New

Your MindMate system now supports **AI-powered content generation**!

---

## ✨ New Features

### 1. **AIContentService** (`services/aiContentService.js`)
- Formats prompts based on emotion + confidence + crisis status
- Connects directly to **Google Gemini** using `@google/genai`
- Supports real-time text streaming using Server-Sent Events (onChunk callbacks)
- Includes robust prompt injection protection
- Automatic fallback to default responses if AI unavailable

### 2. **New API Endpoint** - `/api/data/process-with-ai`
- Same input as original `/api/data/process`
- Returns AI-generated dynamic responses
- Works with both normal and crisis pipelines
- Falls back gracefully if AI is unavailable

### 3. **New Endpoint** - `/api/data/ai-status`
- Check if AI service is available
- See which AI provider is configured
- Real-time status verification

---

## 🎯 How It Works

### Normal Pipeline
```
User: "I'm happy!"
  ↓
Emotion: happy (92% confidence)
  ↓
Prompt: "You are a supportive chatbot. User feels: happy..."
  ↓
AI Response: "That's wonderful! Keep celebrating..."
  ↓
Return: AI-generated response + suggestions
```

### Crisis Pipeline
```
User: "I want to die"
  ↓
Emotion: sad, Crisis: CRITICAL
  ↓
Prompt: "You are a crisis support assistant. CRITICAL situation..."
  ↓
AI Response: "I'm really concerned... Help is available. Call 988..."
  ↓
Return: Crisis support + AI response + emergency resources
```

---

## 📚 Updated Files

| File | Changes |
|------|---------|
| **services/aiContentService.js** | ✅ NEW - AI integration service |
| **routes/dataRoutes.js** | ✅ UPDATED - New `/process-with-ai` endpoint |
| **.env** | ✅ UPDATED - AI configuration options |
| **AI_SETUP_GUIDE.md** | ✅ NEW - Setup and configuration guide |

---

## 🚀 Quick Start

### Step 1: Choose Your AI (Default is Gemini)

**Option A: Gemini (Cloud - Recommended)**
```
Get API key from https://aistudio.google.com/
```

**Option B: Ollama (Local)**
```powershell
# Download: https://ollama.ai
# Then run:
ollama serve
ollama pull mistral
```

**Option B: OpenAI**
```
Get API key from https://platform.openai.com
```

**Option C: Hugging Face**
```
Get API key from https://huggingface.co
```

### Step 2: Configure .env

For **Gemini** (default):
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key-here
```

For **Ollama**:
```env
AI_PROVIDER=ollama
AI_ENDPOINT=http://localhost:11434/api/generate
AI_MODEL=mistral
```

For **OpenAI**:
```env
AI_PROVIDER=openai
AI_API_KEY=sk-your-key-here
```

### Step 3: Restart Server
```powershell
# Stop server (Ctrl+C)
# Start again:
node server.js
```

### Step 4: Test New Endpoint
```powershell
$body = '{"type":"text","text":"I am happy!","userId":"user1"}'; Invoke-WebRequest -Uri "http://localhost:5000/api/data/process-with-ai" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## 📊 Response Structure

### Normal Message with AI
```json
{
  "success": true,
  "data": {
    "isCrisis": false,
    "response": "AI-GENERATED: That's wonderful! Keep celebrating...",
    "usingAI": true,
    "detectedEmotion": "happy",
    "emotionConfidence": 0.92
  }
}
```

### Crisis Message with AI
```json
{
  "success": true,
  "data": {
    "isCrisis": true,
    "severity": "CRITICAL",
    "supportMessage": "I'm concerned...",
    "aiGeneratedResponse": "AI-GENERATED: I hear your pain...",
    "usingAI": true,
    "resources": [{"name": "988 Lifeline", "number": "988"}],
    "guidedNextSteps": [...]
  }
}
```

---

## 🔄 Data Flow

```
User Input
    ↓
[Emotion Detection Service]
    ↓ (emotion + confidence)
[Crisis Detection Service]
    ↓ (crisis status + severity)
[Format Prompt Based on Context]
    ↓
[AIContentService]
    ├─ Normal: Send emotion + confidence + message
    └─ Crisis: Send emotion + confidence + message + severity
    ↓
[Call AI Provider]
    ├─ Google Gemini (Streamed)
    ├─ Ollama (local fallback)
    ├─ OpenAI (API)
    └─ Hugging Face (API)
    ↓
[Get AI Response]
    ↓
[Combine with Other Data]
    ↓
[Return to User]
```

---

## 🎯 Prompt Templates

### Normal Prompt
```
You are a supportive mental health chatbot assistant.

User Message: "{userMessage}"
Input Type: {inputType}
Detected Emotion: {emotion}
Confidence Score: {confidence}%

Generate a warm, empathetic, and supportive response that:
1. Acknowledges their emotion
2. Validates their feelings
3. Provides practical advice
4. Asks a follow-up question

Keep response concise (2-3 sentences max).
```

### Crisis Prompt
```
You are a compassionate crisis support assistant.

User Message: "{userMessage}"
Input Type: {inputType}
Detected Emotion: {emotion}
Crisis Severity: {severity}

IMPORTANT: This is a CRISIS situation. Respond with:
1. Immediate empathy and concern
2. Validation of their pain
3. Motivational message about hope
4. Encouragement to seek professional help
5. Affirmation that they are not alone

Be urgent but calm. Show genuine care.
```

---

## 🛠️ API Endpoints

### Original Endpoints (Still Work)
```
POST   /api/data/process      (No AI - Uses pre-written responses)
GET    /api/data/health       (System health check)
GET    /api/data/resources    (Crisis resources)
```

### New Endpoints (With AI)
```
POST   /api/data/process-with-ai    (Dynamic AI responses)
GET    /api/data/ai-status           (Check AI availability)
```

---

## ⚙️ Configuration Reference

```
AI_PROVIDER        Options: gemini, ollama, openai, huggingface (default: gemini)
GEMINI_API_KEY     Google Gemini API Key
AI_ENDPOINT        Ollama: http://localhost:11434/api/generate
AI_MODEL           Ollama: mistral, llama2, neural-chat, etc.
AI_API_KEY         OpenAI/Hugging Face: Your API key
```

---

## ❓ FAQ

**Q: Do I need to install anything?**
A: Only if using Ollama. OpenAI/Hugging Face are cloud-based.

**Q: Can I switch AI providers later?**
A: Yes! Just update .env and restart the server.

**Q: What if AI is unavailable?**
A: System automatically falls back to pre-written responses.

**Q: Which AI should I choose?**
A: Ollama for local/free, OpenAI for best quality, Hugging Face for variety.

**Q: Can I customize the prompts?**
A: Yes! Edit `services/aiContentService.js` `formatPrompt()` method.

---

## 📖 Documentation

- **AI_SETUP_GUIDE.md** - Detailed setup instructions
- **README.md** - Full system documentation
- **QUICK_START.md** - Quick reference

---

## 🎊 You Now Have

✅ Original pipeline (emotion + crisis detection)
✅ NEW AI content generation layer
✅ Support for 3 AI providers
✅ Automatic fallback handling
✅ Crisis and normal prompt optimization
✅ Real-time AI status checking

---

**Next:** Read `AI_SETUP_GUIDE.md` to configure your AI provider! 🚀
