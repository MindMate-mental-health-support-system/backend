# 🎭 Complete Emotion Detection Integration Guide

## Overview
MindMate now has **dual emotion detection**:
- **Speech Emotion Recognition (SER)** - Detects emotions from voice recordings
- **Text Emotion Analysis** - Detects emotions from written messages

Both use HuggingFace Spaces for accurate emotion detection.

---

## ✅ What's Been Added

### Backend
- **Services**:
  - `BACKEND/services/huggingfaceSERService.js` - Audio emotion detection
  - `BACKEND/services/huggingfaceTextEmotionService.js` - Text emotion detection

- **Routes** (`BACKEND/routes/emotionRoutes.js`):
  - `POST /api/emotion/analyze-audio` - Analyze audio files
  - `POST /api/emotion/analyze-text` - Analyze text input
  - `GET /api/emotion/health` - Check status

### Frontend
- **Services**:
  - `FRONTEND_V2/src/services/audioEmotionService.js` - Microphone recording + audio emotion
  - `FRONTEND_V2/src/services/textEmotionService.js` - Text emotion analysis

- **Updated**: `FRONTEND_V2/src/pages/ChatPage.jsx`
  - Automatic text emotion detection on message send
  - Audio emotion detection on voice message
  - Emotion badges with confidence scores

---

## 🎯 Detected Emotions

Both services detect 7 emotions:

| Emotion | Emoji | Color | Use Case |
|---------|-------|-------|----------|
| Happy | 😊 | Green | Positive, joyful mood |
| Sad | 😢 | Blue | Negative, melancholic |
| Angry | 😠 | Red | Frustrated, irritated |
| Fear/Fearful | 😨 | Amber | Anxious, scared |
| Disgust/Disgusted | 🤢 | Purple | Disgusted, averse |
| Surprise/Surprised | 😲 | Pink | Shocked, amazed |
| Neutral | 😐 | Gray | No strong emotion |

---

## 🚀 How It Works

### Text Message Flow
```
User types message
         ↓
Click "Send" button
         ↓
Text emotion analyzed by HuggingFace
         ↓
Emotion badge displayed
         ↓
Message sent to AI
         ↓
Response saved with emotion data
```

### Voice Message Flow
```
User clicks microphone
         ↓
Speaks into microphone
         ↓
Click send button
         ↓
Audio emotion analyzed by HuggingFace SER
         ↓
Emotion badge displayed
         ↓
Audio + transcript sent to AI
         ↓
Response saved with emotion data
```

---

## 📋 API Reference

### Analyze Text Emotion
```bash
POST /api/emotion/analyze-text
Content-Type: application/json

Request:
{
  "text": "I'm feeling amazing today!"
}

Response:
{
  "emotion": "happy",
  "confidence": 0.92,
  "scores": {
    "happy": 0.92,
    "sad": 0.03,
    "angry": 0.02,
    "fear": 0.01,
    "disgust": 0.01,
    "surprise": 0.01,
    "neutral": 0.00
  },
  "analysisTimestamp": "2024-01-15T10:30:45Z",
  "message": "Text emotion analyzed successfully"
}
```

### Analyze Audio Emotion
```bash
POST /api/emotion/analyze-audio
Content-Type: multipart/form-data

Body:
  audio: <audio.wav file>

Response: Same structure as text analysis
```

### Check Service Health
```bash
GET /api/emotion/health

Response:
{
  "status": "ok",
  "message": "HuggingFace SER Space is accessible",
  "timestamp": "2024-01-15T10:30:45Z"
}
```

---

## 💻 Frontend Service Usage

### Text Emotion Service
```javascript
import TextEmotionService from './services/textEmotionService';

// Analyze text
const result = await TextEmotionService.analyzeText("I love this!");
// Result: { emotion: "happy", confidence: 0.95, scores: {...} }

// Get emoji for emotion
const emoji = TextEmotionService.getEmojiForEmotion("happy");
// Returns: 😊

// Get color for badge
const color = TextEmotionService.getColorForEmotion("sad");
// Returns: #3b82f6

// Check service health
await TextEmotionService.checkHealth();
```

### Audio Emotion Service
```javascript
import AudioEmotionService from './services/audioEmotionService';

// Full workflow
const result = await AudioEmotionService.recordAndAnalyze(10000); // 10 sec
// Returns: { emotion: "happy", confidence: 0.95, scores: {...} }

// Or step by step
await AudioEmotionService.initialize();
AudioEmotionService.startRecording();
// ... user speaks ...
const blob = await AudioEmotionService.stopRecording();
const result = await AudioEmotionService.analyzeAudio(blob);

// Cleanup
AudioEmotionService.cleanup();
```

---

## 🧪 Testing

### Test Backend Endpoint
```bash
# Check if services are running
curl http://localhost:5000/api/emotion/health

# Test text emotion
curl -X POST http://localhost:5000/api/emotion/analyze-text \
  -H "Content-Type: application/json" \
  -d '{"text": "I am very happy!"}'

# Expected response:
# {"emotion":"happy","confidence":0.95,"scores":{...},...}
```

### Test in Frontend
1. Go to **http://localhost:5173**
2. Navigate to **Chat page**
3. **Type a message** with emotion (e.g., "I'm so sad")
4. ⚡ **Emotion badge appears** (e.g., "😢 sad 89%")
5. Click **Microphone** button
6. **Speak something emotional**
7. ⚡ **Audio emotion badge appears**

---

## 🔧 Configuration

### Environment Variables (Already Set)
```env
SUPABASE_URL=https://bckvyipaatjesovupnfm.supabase.co
SUPABASE_KEY=...
```

### API Base URL (Frontend)
```javascript
// Automatically uses http://localhost:5000 in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

---

## 📊 Message Structure with Emotions

### Text Message
```javascript
{
  id: 1234567890,
  sender: 'user',
  text: "I'm feeling great!",
  emotion: "happy",
  emotionConfidence: 0.92,
  emotionScores: {
    happy: 0.92,
    sad: 0.03,
    // ... other emotions
  }
}
```

### Audio Message
```javascript
{
  id: 1234567891,
  sender: 'user',
  text: "I'm feeling great",
  audioUrl: "data:audio/webm;base64,...",
  emotion: "happy",
  emotionConfidence: 0.87,
  emotionScores: {...}
}
```

---

## 🐛 Troubleshooting

### "Text emotion analysis failed"
**Cause**: HuggingFace Space not running
**Fix**:
1. Visit https://huggingface.co/spaces/sidharths9105/mindmate-emotion-detector
2. Verify Space status is "Running" (green)
3. Click "Restart" if needed
4. Wait 2-3 minutes to start

### "Cannot connect to backend"
**Cause**: Backend not running
**Fix**:
1. Start backend: `cd BACKEND && node server.js`
2. Verify running on http://localhost:5000
3. Check console for errors

### Emotion always "neutral"
**Cause**: Text too short or ambiguous
**Fix**:
1. Use more expressive language
2. Use punctuation (!!!, ???) to convey emotion
3. Write longer sentences
4. Test with clearly emotional text first

### "No emotion detected"
**Cause**: Text has no emotional content
**Examples that may return neutral**:
- "The weather is nice"
- "What time is it?"
- "Tell me facts about Python"

**Use emotional text**:
- "I love this weather!"
- "I'm so angry about this!"
- "That's amazing news!"

---

## 📈 Analytics Opportunities

Emotion data can power:

1. **Mood Tracking Dashboard**
   - Daily emotion trends
   - Weekly charts
   - Emotion frequency analysis

2. **Smart Responses**
   - Adjust AI tone based on user emotion
   - Suggest coping strategies
   - Identify crisis patterns

3. **Session Insights**
   - Emotional journey through conversation
   - Emotion transitions
   - Recovery indicators

4. **Wellness Reports**
   - Monthly mood summary
   - Emotional patterns
   - Suggestions for improvement

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] `/api/emotion/health` returns `status: ok`
- [ ] Text emotion detection works
- [ ] Audio emotion detection works
- [ ] Emotion badges display correctly
- [ ] Messages save with emotion data
- [ ] HuggingFace Spaces status: Running

---

## 📞 Quick Support

**Issue**: Services returning 503  
**Solution**: Check HuggingFace Space status and restart if needed

**Issue**: Microphone permission denied  
**Solution**: Allow microphone access in browser settings for localhost:5173

**Issue**: Backend error on startup  
**Solution**: Verify all .env variables are set correctly

---

**Status**: ✅ Production Ready  
**Last Updated**: May 9, 2026  
**Integrated Services**: 
- HuggingFace Speech Emotion Recognition
- HuggingFace Text Emotion Detection
