# 🎤 MindMate Voice Transcription & Language Setup Guide

## Overview

MindMate supports **two-tier voice transcription**:

1. **Browser Web Speech API** (FREE, LOCAL) - Recommended ✅
2. **Backend STT Service** (Optional) - For fallback/advanced scenarios

---

## Solution 1: Browser Web Speech API (Recommended) ✅

### What It Is
The browser's native **Web Speech API** transcribes audio locally in the user's browser **without sending to external servers**. This is:
- ✅ **Free** - No API costs
- ✅ **Private** - Audio stays on user's device
- ✅ **Fast** - Instant local processing
- ✅ **Supported** - Chrome, Edge, Opera

### How It Works in MindMate

```
User clicks Mic
        ↓
Browser's Web Speech API starts recording
        ↓
User speaks Malayalam: "എനിക്കു കഷ്ടമായിരിക്കുന്നു" (I'm sad)
        ↓
Browser transcribes locally → Text: "എനിക്കു കഷ്ടമായിരിക്കുന്നു"
        ↓
Frontend sends to backend with:
  - type: 'voice'
  - text: 'എനിക്കു കഷ്ടമായിരിക്കുന്നു' ← ALREADY TRANSCRIBED
  - voice: (audio blob)
        ↓
Backend uses the text directly
        ↓
NO STT_API_URL NEEDED! ✅
```

### Setup (No Configuration Needed!)

**Your current setup already works!** Just ensure:

1. **In frontend (ChatPage.jsx) - Language must be set to Malayalam:**
   ```javascript
   // Current code (after our fix):
   recognition.lang = currentLanguage || 'en-IN';  // Should be 'ml-IN'
   ```

2. **User must give microphone permission**
   - Chrome will ask on first use
   - Allow access to microphone

3. **Browser must support Web Speech API**
   - ✅ Chrome/Chromium-based
   - ✅ Edge
   - ✅ Opera
   - ⚠️ Safari (limited)
   - ❌ Firefox (not supported)

### Testing Web Speech API

**In Chrome DevTools Console:**
```javascript
const recognition = new webkitSpeechRecognition();
recognition.lang = 'ml-IN';  // Malayalam
recognition.onresult = (e) => console.log(e.results[0][0].transcript);
recognition.start();
// Speak now...
```

### Why You Saw "transcription unavailable"

Before our fix, the code was:
```javascript
// OLD CODE (problematic):
userText = text || await TranscriptionService.transcribe(voiceFile);
```

If the browser provided text, this worked fine. But the backend logs showed "transcription unavailable" because:
1. If backend had to transcribe → needs STT_API_URL
2. But you didn't set STT_API_URL
3. TranscriptionService returns mock message

**Our fix** (applied):
```javascript
// NEW CODE (correct):
if (text && text.trim() && !text.includes('transcription unavailable')) {
    userText = text.trim();  // USE BROWSER TRANSCRIPTION ✅
} else {
    userText = await TranscriptionService.transcribe(voiceFile);  // Fallback only
}
```

---

## Language Settings (Malayalam)

### Current Setup

After our fixes, Malayalam is now properly configured:

1. **Frontend defaults to Malayalam:**
   ```javascript
   const [currentLanguage, setCurrentLanguage] = useState(() => {
       return localStorage.getItem('mindmate_language') || 'ml-IN';
   });
   ```

2. **Language persists in localStorage:**
   ```javascript
   useEffect(() => {
       localStorage.setItem('mindmate_language', currentLanguage);
   }, [currentLanguage]);
   ```

3. **Web Speech API uses Malayalam:**
   ```javascript
   recognition.lang = currentLanguage;  // Will be 'ml-IN'
   ```

4. **Text-to-Speech uses Malayalam:**
   ```javascript
   utterance.lang = currentLanguage;  // Will be 'ml-IN'
   ```

### Testing Malayalam Transcription

1. **Open Chat Page**
2. **Language dropdown** - Ensure set to **Malayalam (ml-IN)**
3. **Click Mic button**
4. **Speak in Malayalam** - "എനിക്കു വിഷമമായിരിക്കുന്നു"
5. **Result** - Text should appear in Malayalam in the input box
6. **Send** - Backend receives Malayalam text

### Backend Will See Malayalam

When you send Malayalam voice:
```
Backend logs:
✓ Using browser-transcribed text (Web Speech API): എനിക്കു വിഷമമായിരിക്കുന്നു
🎤 VOICE MESSAGE TRANSCRIBED:
"എനിക്കു വിഷമമായിരിക്കുന്നു"
```

---

## Solution 2: Backend STT Service (Optional)

If you **want backend transcription as fallback**, set up OpenAI Whisper:

### Setup STT_API_URL (Optional)

**In `BACKEND/.env`:**
```env
# Use OpenAI Whisper for backend transcription
STT_API_URL=https://api.openai.com/v1/audio/transcriptions
STT_API_KEY=sk-...your-openai-key...
STT_MODEL=whisper-1
STT_LANGUAGE=ml  # Optional: force Malayalam
```

**Alternative: Local Whisper Server**
```env
STT_API_URL=http://localhost:8000/v1/audio/transcriptions
STT_API_KEY=  # Not needed for local
```

### When Backend STT Is Used

Backend STT only activates if:
1. Frontend doesn't provide `text` field
2. OR `text` is empty/invalid
3. OR `text` contains "transcription unavailable"

**Fallback flow:**
```
Frontend records voice
        ↓
Web Speech API fails (or unsupported browser)
        ↓
Frontend sends only audio blob (no text field)
        ↓
Backend detects: text is empty
        ↓
Backend calls STT_API_URL (Whisper)
        ↓
Whisper transcribes: "എനിക്കു വിഷമമായിരിക്കുന്നു"
        ↓
Backend continues processing
```

---

## Troubleshooting

### Issue: "Microphone not working"

**Solutions:**
1. **Check browser permission**
   - Chrome: Settings → Privacy → Microphone → Allow
   - Reset site permissions if needed

2. **Check browser support**
   - Use Chrome, Edge, or Opera
   - Firefox doesn't support Web Speech API

3. **HTTPS Required**
   - Microphone only works on HTTPS (or localhost)
   - Not on plain HTTP from unknown servers

### Issue: "Malayalam text shows as Manglish"

**Solutions:**
1. **Ensure Malayalam font is installed**
   - Windows: Download Malayalam Unicode font
   - Check browser's font settings

2. **Check HTML encoding**
   ```html
   <meta charset="UTF-8">
   ```

3. **Set CSS font**
   ```css
   body {
       font-family: 'Noto Sans Malayalam', 'Malayalam', Arial, sans-serif;
   }
   ```

### Issue: "Backend shows 'transcription unavailable'"

**Solutions:**
1. **Frontend is providing text properly** ✅
   - Check browser console: `[Speech Recognition] Language set to: ml-IN`
   - Verify Web Speech API is transcribing

2. **If using STT fallback:**
   - Set `STT_API_URL` in `.env`
   - Verify API key is valid
   - Check backend logs for error details

### Issue: "Emotion not detected correctly from voice"

**Solutions:**
1. **SED API not configured**
   - Voice emotion (SED) requires `SED_API_URL`
   - Falls back to mock if not set
   - Set optional: `SED_API_URL`, `SED_API_KEY`

2. **Text emotion detects fine instead**
   - Browser transcription provides text
   - EmotionService.detectTextEmotion() works great
   - Uses Hugging Face model (no config needed)

---

## Language Codes Reference

Supported in Web Speech API:

| Language | Code | Native |
|---|---|---|
| English (India) | `en-IN` | English |
| Malayalam | `ml-IN` | മലയാളം |
| Hindi | `hi-IN` | हिंदी |
| Tamil | `ta-IN` | தமிழ் |
| Telugu | `te-IN` | తెలుగు |
| Kannada | `kn-IN` | ಕನ್ನಡ |
| Bengali | `bn-IN` | বাংলা |

**To add support, update frontend language selector and backend crisis keywords.**

---

## Architecture After Fix

```
┌──────────────────────────────────┐
│     User Speaks Malayalam         │
│   "എനിക്കു കഷ്ടമായിരിക്കുന്നു"      │
└──────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│    Browser Web Speech API         │
│                                  │
│  1. Records audio                │
│  2. Transcribes locally          │
│  3. Outputs Malayalam text ✅     │
└──────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│     Frontend (ChatPage.jsx)       │
│                                  │
│  1. Display text in input        │
│  2. Send to backend with:        │
│     - type: 'voice'              │
│     - text: 'മലയാളം'  ✅         │
│     - voice: (audio blob)        │
└──────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│      Backend (dataRoutes.js)      │
│                                  │
│  1. Check if text provided       │
│  2. Use frontend text directly ✅ │
│  3. No STT_API_URL needed!       │
│  4. Emotion detection works      │
│  5. Crisis detection works       │
│  6. AI response in Malayalam ✅  │
└──────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│    Response Stream to Frontend    │
│                                  │
│  Words appear one-by-one ✅      │
│  In Malayalam text ✅            │
│  TTS can speak Malayalam ✅      │
└──────────────────────────────────┘
```

---

## What You Need to Do NOW

### ✅ Already Fixed (Applied)

1. ✅ Backend prioritizes browser transcription
2. ✅ Malayalam language properly configured
3. ✅ Speech Recognition with Malayalam support
4. ✅ Speech Synthesis with Malayalam support
5. ✅ Language preference saved in localStorage

### ✅ Test It

```bash
# 1. Restart backend
cd BACKEND
npm start

# 2. Restart frontend
cd FRONTEND_V2
npm run dev

# 3. Go to http://localhost:5173
# 4. Click Mic button
# 5. Speak Malayalam
# 6. Text should appear in Malayalam
# 7. Send and backend should show Malayalam
```

### ✅ In Browser Console, You'll See

```
[Speech Recognition] Language set to: ml-IN
[Speech Synthesis] Language set to: ml-IN
[ChatPage] Language changed to: ml-IN
✓ Using browser-transcribed text (Web Speech API): എനിക്കു കഷ്ടമായിരിക്കുന്നു
🎤 VOICE MESSAGE TRANSCRIBED:
"എനിക്കു കഷ്ടമായിരിക്കുന്നു"
```

---

## Optional: Add STT Fallback (Not Required)

If you want **extra safety** for fallback scenarios:

### 1. Get OpenAI Whisper API Key

```bash
# Get key from https://platform.openai.com/api-keys
```

### 2. Add to BACKEND/.env

```env
STT_API_URL=https://api.openai.com/v1/audio/transcriptions
STT_API_KEY=sk-...
STT_MODEL=whisper-1
STT_LANGUAGE=ml
```

### 3. That's It!

Now if Web Speech API ever fails, backend will use Whisper as fallback.

---

## Summary

| Feature | Status | Details |
|---------|--------|---------|
| **Web Speech API** | ✅ Works | Browser transcribes Malayalam |
| **Frontend Language** | ✅ Fixed | Defaults to Malayalam (ml-IN) |
| **Backend Processing** | ✅ Fixed | Uses browser transcription directly |
| **Malayalam Text** | ✅ Works | Preserved throughout pipeline |
| **STT_API_URL** | ❌ Not Required | Only needed for Firefox/fallback |
| **Cost** | ✅ Free | No external API calls needed |

---

## Questions?

- **Q: Do I need to set STT_API_URL?**
  - A: No! Web Speech API works out of the box.

- **Q: Why is text still showing as Manglish?**
  - A: Check font settings. Your system may not have Malayalam font installed.

- **Q: Can I use this on mobile?**
  - A: Yes, but support varies. Chrome on Android works great. iOS Safari is limited.

- **Q: How do I switch to English?**
  - A: Use the language dropdown in the chat UI. Saves preference automatically.

---

**Document Last Updated:** March 6, 2026
**Status:** Ready for Production ✅
