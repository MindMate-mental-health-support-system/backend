# 🤖 AI Content Generation Setup Guide

Your MindMate system now supports **dynamic AI-generated responses**!

---

## 🎯 How It Works

### Normal Message
```
User Input → Emotion Detection → Crisis Check → Format AI Prompt → Call AI → Return AI Response
```

### Crisis Message
```
User Input → Emotion Detection → Crisis Check (SEVERE) → Format Crisis Prompt → Call AI → Return Crisis Response + Emergency Resources
```

---

## ⚙️ Configuration Options

### Option 1: Ollama (Local AI - Recommended for Development)

**Step 1: Install Ollama**
- Download: https://ollama.ai
- Install it

**Step 2: Start Ollama**
```bash
# In PowerShell
ollama serve
```

**Step 3: Pull a Model**
```bash
# In another terminal
ollama pull mistral
# or: ollama pull llama2
```

**Step 4: Configure .env**
```env
AI_PROVIDER=ollama
AI_ENDPOINT=http://localhost:11434/api/generate
AI_MODEL=mistral
```

---

### Option 2: OpenAI API

**Step 1: Get API Key**
- Sign up: https://platform.openai.com
- Create API key

**Step 2: Configure .env**
```env
AI_PROVIDER=openai
AI_API_KEY=sk-your-key-here
```

---

### Option 3: Hugging Face API

**Step 1: Get API Key**
- Sign up: https://huggingface.co
- Create API token

**Step 2: Configure .env**
```env
AI_PROVIDER=huggingface
AI_MODEL=mistralai/Mistral-7B-Instruct-v0.1
AI_API_KEY=hf_your-key-here
```

---

## 🚀 Using the New AI Endpoint

### Test 1: Normal Message (Happy)
```powershell
$body = '{"type":"text","text":"I just got promoted! I am so happy!","userId":"user123"}'; Invoke-WebRequest -Uri "http://localhost:5000/api/data/process-with-ai" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isCrisis": false,
    "response": "That's wonderful news! Getting promoted shows your hard work paid off. Keep celebrating this achievement and don't forget to reward yourself!",
    "usingAI": true,
    "detectedEmotion": "happy",
    "emotionConfidence": 0.92
  }
}
```

---

### Test 2: Crisis Message (SEVERE)
```powershell
$body = '{"type":"text","text":"I feel so depressed and hopeless. I cannot go on anymore.","userId":"user789"}'; Invoke-WebRequest -Uri "http://localhost:5000/api/data/process-with-ai" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isCrisis": true,
    "severity": "SEVERE",
    "supportMessage": "Your pain is real, but you are stronger than you believe. This moment will pass, and recovery is possible. Please reach out to the resources below.",
    "usingAI": true,
    "aiGeneratedResponse": "I hear the depth of your pain, and I want you to know that these feelings, while overwhelming now, can be treated and managed. Professional support can help you find hope again.",
    "resources": [
      {"name": "SAMHSA National Helpline", "number": "1-800-662-4357"}
    ]
  }
}
```

---

### Test 3: Check AI Status
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/data/ai-status" -Method GET -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Response:**
```json
{
  "aiAvailable": true,
  "aiProvider": "ollama",
  "aiModel": "mistral",
  "timestamp": "2026-02-23T..."
}
```

---

## 📊 API Endpoints Summary

| Endpoint | Type | Purpose | AI? |
|----------|------|---------|-----|
| `/api/data/process` | POST | Original pipeline | ❌ No |
| `/api/data/process-with-ai` | POST | **With AI responses** | ✅ Yes |
| `/api/data/health` | GET | System health | - |
| `/api/data/ai-status` | GET | AI availability | - |
| `/api/data/resources` | GET | Crisis resources | - |

---

## 🔄 Prompt Examples

### Normal Message Prompt (Sent to AI)
```
You are a supportive mental health chatbot assistant.

User Message: "I just got promoted! I am so happy!"
Input Type: text
Detected Emotion: happy
Confidence Score: 92.0%

Generate a warm, empathetic, and supportive response that:
1. Acknowledges their happy emotion
2. Validates their feelings
3. Provides practical, actionable advice
4. Asks a follow-up question to continue the conversation

Keep response concise (2-3 sentences max).
Make it personal and caring.
```

### Crisis Message Prompt (Sent to AI)
```
You are a compassionate crisis support assistant.

User Message: "I feel so depressed and hopeless..."
Input Type: text
Detected Emotion: sad
Crisis Severity: SEVERE

IMPORTANT: This is a CRISIS situation. Respond with:
1. Immediate empathy and concern
2. Validation of their pain
3. Motivational message about hope and recovery
4. Encouragement to seek professional help
5. Affirmation that they are not alone

Be urgent but calm. Show genuine care.
Keep response concise but impactful (3-4 sentences).
Include hope and recovery message.
```

---

## 🛠️ Troubleshooting

### "AI Service not available"
**Fix:** Make sure your AI service is running:
- **Ollama:** Run `ollama serve` in a terminal
- **OpenAI:** Check your API key is valid
- **Hugging Face:** Check internet connection

### "No response from Ollama"
**Fix:** 
1. Pull a model: `ollama pull mistral`
2. Check it's running: `ollama serve`

### Getting fallback responses instead of AI
**Solution:** This is normal! If AI is unavailable, the system automatically falls back to pre-written responses. The field `"usingAI": false` tells you this.

---

## 📈 Advanced Configuration

### Use Different Model with Ollama
```env
AI_MODEL=llama2
# or
AI_MODEL=neural-chat
# or
AI_MODEL=zephyr
```

### Adjust AI Temperature (Creativity)
Edit `services/aiContentService.js` and change:
```javascript
temperature: 0.7  // Change to 0.3 (conservative) or 0.9 (creative)
```

### Customize Prompts
Edit `services/aiContentService.js` `formatPrompt()` method to change the system prompt.

---

## 🎯 Next Steps

1. **Choose your AI:** Ollama (local), OpenAI, or Hugging Face
2. **Install and configure** based on option above
3. **Update .env** with your settings
4. **Restart server:** Stop and run `node server.js` again
5. **Test with `/api/data/process-with-ai`** endpoint

---

## 📋 Quick Reference

```
OLLAMA (Local - Free):
  Install: https://ollama.ai
  Start: ollama serve
  Pull: ollama pull mistral
  Config: AI_PROVIDER=ollama

OPENAI (Premium API):
  API: https://platform.openai.com
  Config: AI_PROVIDER=openai + API_KEY

HUGGINGFACE (Free/Paid):
  API: https://huggingface.co
  Config: AI_PROVIDER=huggingface + API_KEY
```

---

**Your system now has dynamic AI-powered responses!** 🚀

Choose your AI provider and get started!
