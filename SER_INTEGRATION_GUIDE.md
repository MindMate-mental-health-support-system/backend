# 🎭 Speech Emotion Recognition (SER) Integration Guide

## Overview
MindMate now integrates **Speech Emotion Recognition** from HuggingFace Spaces to automatically detect emotions from user voice recordings.

**Integration Stack:**
- **Backend**: Node.js service calls HuggingFace Space API
- **Frontend**: React captures audio and sends to backend
- **HuggingFace Space**: `sidharths9105/mindmate-ser` (Speech Emotion Recognition model)

---

## ✅ What's Installed

### Backend Changes
1. **New Service**: `BACKEND/services/huggingfaceSERService.js`
   - Handles API calls to HuggingFace Space
   - Parses emotion responses
   - Manages error handling

2. **New Routes**: `BACKEND/routes/emotionRoutes.js`
   - `POST /api/emotion/analyze-audio` - Analyze audio file
   - `POST /api/emotion/analyze-audio-buffer` - Analyze base64 audio
   - `GET /api/emotion/health` - Check HuggingFace Space status

3. **Updated Server**: `BACKEND/server.js`
   - Mounted emotion routes at `/api/emotion`

### Frontend Changes
1. **New Service**: `FRONTEND_V2/src/services/audioEmotionService.js`
   - Handles microphone recording
   - Sends audio to backend
   - Manages emotion analysis workflow

2. **Enhanced ChatPage**: `FRONTEND_V2/src/pages/ChatPage.jsx`
   - Integrated AudioEmotionService import
   - Enhanced `handleSendAudio()` to analyze emotion
   - Added emotion badge display in messages
   - Shows detected emotion with confidence score

---

## 🚀 How It Works

### User Journey
1. User clicks **Microphone button** to start recording
2. MindMate records audio from microphone
3. User speaks and clicks send (or button stops automatically)
4. Audio is analyzed by HuggingFace SER model
5. **Emotion badge** appears below audio with emotion + confidence %
6. Message is sent to AI along with detected emotion

### Detected Emotions
- **happy**
- **sad**
- **angry**
- **neutral**
- **fearful**
- **disgusted**
- **surprised**

---

## 🔧 API Endpoints

### 1. Analyze Audio File
```bash
POST /api/emotion/analyze-audio
Content-Type: multipart/form-data

Body:
  audio: <audio file> (wav, mp3, webm, etc.)

Response:
{
  "emotion": "happy",
  "confidence": 0.95,
  "scores": {
    "happy": 0.95,
    "sad": 0.02,
    "angry": 0.01,
    ...
  },
  "analysisTimestamp": "2024-01-15T10:30:45Z",
  "message": "Emotion analyzed successfully"
}
```

### 2. Check Health Status
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

## 📋 Frontend Service Usage

### AudioEmotionService

```javascript
import AudioEmotionService from './services/audioEmotionService';

// Initialize (request microphone permission)
await AudioEmotionService.initialize();

// Start recording
AudioEmotionService.startRecording();

// Stop recording (returns audio blob)
const audioBlob = await AudioEmotionService.stopRecording();

// Analyze emotion
const result = await AudioEmotionService.analyzeAudio(audioBlob);
// Result: { emotion: "happy", confidence: 0.95, scores: {...}, raw: ... }

// Full workflow
const result = await AudioEmotionService.recordAndAnalyze(10000); // 10 seconds
// Automatically: initialize → record → analyze

// Check HuggingFace Space health
await AudioEmotionService.checkHealth();

// Cleanup resources
AudioEmotionService.cleanup();
```

---

## 🧪 Testing

### Backend Test
```bash
# Check if emotion analysis is working
curl -X GET http://localhost:5000/api/emotion/health

# Should return: { "status": "ok", ... }
```

### Frontend Test
1. Open http://localhost:5173 (MindMate app)
2. Go to Chat page
3. Click **Microphone button**
4. Say something (e.g., "I'm happy!")
5. Click **Send**
6. **Emotion badge** should appear with detected emotion

---

## 🐛 Troubleshooting

### Error: "Cannot connect to HuggingFace Space"
- **Cause**: HuggingFace Space not running or unreachable
- **Fix**: 
  1. Go to https://huggingface.co/spaces/sidharths9105/mindmate-ser
  2. Check if Space is "Running" (green status)
  3. If not, click "Restart" button
  4. Wait 2-3 minutes for Space to start

### Error: "Microphone permission denied"
- **Cause**: Browser denied microphone access
- **Fix**:
  1. Check browser permissions for localhost:5173
  2. Reload page and grant permission when prompted
  3. Some browsers: Settings → Privacy → Microphone

### Error: "Audio blob is empty"
- **Cause**: Recording didn't capture audio
- **Fix**:
  1. Check microphone is connected and working
  2. Test microphone in browser (Settings → Privacy → Media)
  3. Try different browser (Chrome/Edge recommended)

### Emotion always "neutral"
- **Cause**: Audio quality too low or noise
- **Fix**:
  1. Speak clearly and naturally
  2. Minimize background noise
  3. Get closer to microphone
  4. Use quality microphone

---

## 📊 Message Data Structure

Messages now include emotion data:

```javascript
{
  id: Date.now(),
  sender: 'user',
  text: "I'm feeling great!",
  audioUrl: "data:audio/webm;base64,...",
  emotion: "happy",           // Detected emotion
  emotionConfidence: 0.95,    // Confidence score (0-1)
  emotionScores: {            // All emotion probabilities
    happy: 0.95,
    sad: 0.02,
    angry: 0.01,
    ...
  }
}
```

---

## 🔐 Security Notes

✅ **What's Encrypted:**
- Audio is sent over HTTPS to backend
- Audio processed server-side (not exposed to frontend directly)
- Emotion data stored with user session

✅ **What's Private:**
- Only emotion label is stored (not raw audio analysis)
- Audio chunks are deleted after analysis
- No audio files stored permanently

---

## 📈 Future Enhancements

Potential improvements you can add:

1. **Text Emotion Detection** - Analyze text messages too
   - Use: `https://huggingface.co/spaces/sidharths9105/mindmate-emotion-detector`

2. **Emotion Trends** - Track emotion over time
   - Store emotion history per user
   - Show daily/weekly mood charts

3. **Personalized Responses** - Adjust AI responses based on detected emotion
   - Happier responses for positive emotions
   - More supportive for negative emotions

4. **Emotion Notifications** - Alert if user detects crisis emotions
   - High stress/anxiety levels
   - Suggest breathing exercises

---

## 📞 Support

If you encounter issues:

1. Check backend logs: `node server.js`
2. Check browser console: `F12` → Console
3. Check HuggingFace Space status
4. Verify .env has all required variables
5. Restart backend and frontend

---

**Status**: ✅ Ready to Use  
**Last Updated**: May 9, 2026  
**Integrated Services**: HuggingFace Spaces (SER)
