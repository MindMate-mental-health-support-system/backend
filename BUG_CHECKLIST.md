# ✅ MINDMATE BUG & ISSUE CHECKLIST

## 🔴 CRITICAL ISSUES (FIX IMMEDIATELY)

- [ ] **Server Port Binding Failure**
  - Error: `ECONNREFUSED ::1:5000` and `127.0.0.1:5000`
  - Location: `server.js` startup
  - Severity: CRITICAL - Blocks all testing
  - Estimated Fix: 30 min - 2 hours
  - Root Cause: Unknown (needs debugging)
  - Action: Debug port binding, check for conflicts
  - Files: `BACKEND/server.js`

- [ ] **Silent Route Loading Failure**
  - Problem: No error handling during route requires
  - Location: `server.js` lines ~45-48
  - Severity: CRITICAL - Causes silent crashes
  - Estimated Fix: 15 minutes
  - Root Cause: Missing try-catch blocks
  - Action: Add error logging to route loading
  - Files: `BACKEND/server.js`

- [ ] **Supabase Connection Not Validated at Startup**
  - Problem: No health check for Supabase on startup
  - Location: `server.js` before listening
  - Severity: CRITICAL - Auth will fail silently
  - Estimated Fix: 20 minutes
  - Root Cause: No connection test
  - Action: Add Supabase connectivity check
  - Files: `BACKEND/server.js`

## 🟠 HIGH-PRIORITY ISSUES (FIX SOON)

- [ ] **Voice Transcription Disabled**
  - Problem: `STT_API_URL` not configured in `.env`
  - Location: `BACKEND/.env` line ~19-20
  - Severity: HIGH - Voice input doesn't work
  - Estimated Fix: 1-2 hours (setup Whisper)
  - Current Fallback: Mock transcription
  - Impact: Users see "[Voice message – transcription unavailable]"
  - Action: Setup OpenAI Whisper or local server
  - Files: `.env`, `BACKEND/services/transcriptionService.js`

- [ ] **Emotion Detection Using Fallback**
  - Problem: HF Spaces endpoint may be unreachable
  - Location: `BACKEND/services/emotionService.js`
  - Severity: HIGH - Emotion accuracy unknown
  - Estimated Fix: 30 minutes
  - Current Status: Using mock keyword detection
  - Impact: Emotions detected from keywords, not ML
  - Action: Test HF Spaces endpoint, verify API works
  - Files: `BACKEND/services/emotionService.js`

- [ ] **Gemini AI API Untested**
  - Problem: API key present but never verified at startup
  - Location: `BACKEND/services/aiContentService.js`
  - Severity: HIGH - AI responses may fail
  - Estimated Fix: 20 minutes
  - Current Status: Key configured, not tested
  - Impact: Users may get errors from AI
  - Action: Add API key validation test
  - Files: `BACKEND/services/aiContentService.js`

- [ ] **No Rate Limiting Bypass for Tests**
  - Problem: Rate limiter may block test requests
  - Location: `BACKEND/server.js` line ~14
  - Severity: MEDIUM-HIGH - Tests might fail
  - Estimated Fix: 15 minutes
  - Current Limit: 200 requests per 15 minutes
  - Impact: Automated tests might hit limit
  - Action: Add NODE_ENV=test bypass
  - Files: `BACKEND/server.js`

## 🟡 MEDIUM-PRIORITY ISSUES (FIX SOON)

- [ ] **No Graceful Shutdown Handler**
  - Problem: Server doesn't clean up on SIGTERM/SIGINT
  - Location: `BACKEND/server.js` end
  - Severity: MEDIUM - Data loss possible
  - Estimated Fix: 20 minutes
  - Current Behavior: Process dies abruptly
  - Impact: Temp files not cleaned, connections not closed
  - Action: Add signal handlers for cleanup
  - Files: `BACKEND/server.js`

- [ ] **JWT Token Expiration Not Explained**
  - Problem: Users get generic 401 error on token expiry
  - Location: `BACKEND/middleware/authMiddleware.js`
  - Severity: MEDIUM - Confusing error message
  - Estimated Fix: 10 minutes
  - Current Error: "Invalid or expired token"
  - Impact: Users don't know to re-login
  - Action: Add specific error code for expired tokens
  - Files: `BACKEND/middleware/authMiddleware.js`

- [ ] **Malayalam Language Detection Incomplete**
  - Problem: Voice input may not properly detect Malayalam
  - Location: `FRONTEND_V2/src/pages/ChatPage.jsx`
  - Severity: MEDIUM - Feature partly broken
  - Estimated Fix: 15 minutes
  - Current Status: Language set but may not be used by Speech API
  - Impact: Voice recognition fails for Malayalam speakers
  - Action: Ensure `recognition.lang = currentLanguage`
  - Files: `FRONTEND_V2/src/pages/ChatPage.jsx`

## 🟢 LOW-PRIORITY ISSUES (NICE TO HAVE)

- [ ] **No API Documentation Endpoint**
  - Problem: Developers must read code to understand API
  - Location: `BACKEND/server.js`
  - Severity: LOW - Documentation available elsewhere
  - Estimated Fix: 10 minutes
  - Action: Add GET /api/docs endpoint
  - Files: `BACKEND/server.js`

- [ ] **No Request Validation Middleware**
  - Problem: Invalid data accepted silently
  - Location: All route files
  - Severity: LOW - Works but not robust
  - Estimated Fix: 2-3 hours (comprehensive validation)
  - Action: Add Joi/Zod schema validation
  - Files: All `BACKEND/routes/*.js`

- [ ] **No API Health Check Endpoint**
  - Problem: No way to check if API is working
  - Location: `BACKEND/server.js`
  - Severity: LOW - Needed for monitoring
  - Estimated Fix: 15 minutes
  - Action: Add GET /health endpoint
  - Files: `BACKEND/server.js`

- [ ] **Missing Request Tracing**
  - Problem: Hard to debug request flow
  - Location: `BACKEND/server.js` logger
  - Severity: LOW - Nice for debugging
  - Estimated Fix: 30 minutes
  - Action: Add request ID tracing
  - Files: `BACKEND/server.js`

---

## 📊 ISSUE STATISTICS

| Severity | Count | Total Fix Time |
|----------|-------|-----------------|
| CRITICAL | 3 | 1-2.5 hours |
| HIGH | 4 | 2-3 hours |
| MEDIUM | 3 | 45 min - 1 hour |
| LOW | 4 | 1-2 hours |
| **TOTAL** | **14** | **5-9 hours** |

---

## 🎯 PRIORITY SCHEDULE

### DAY 1 (Next 4-6 hours)
1. Fix server port binding (CRITICAL)
2. Add route loading error logging (CRITICAL)
3. Add Supabase connectivity check (CRITICAL)
4. Re-run tests (should see 50%+ pass)

### DAY 2 (Next 2-4 hours)
1. Setup voice transcription (HIGH)
2. Verify Emotion detection (HIGH)
3. Test Gemini API (HIGH)
4. Add rate limit bypass (HIGH)

### DAY 3 (Next 2-3 hours)
1. Add graceful shutdown (MEDIUM)
2. Improve JWT error messages (MEDIUM)
3. Fix Malayalam language (MEDIUM)
4. Complete all tests (target 90%+ pass)

### LATER (When Ready)
1. Add API documentation (LOW)
2. Add request validation (LOW)
3. Add health check endpoint (LOW)
4. Add request tracing (LOW)

---

## 🔍 FILES REQUIRING CHANGES

### Critical Changes

```
BACKEND/server.js
├─ Add route loading error handling
├─ Add Supabase connectivity check
├─ Add detailed startup logging
└─ Fix port binding issue (diagnose first)

BACKEND/middleware/authMiddleware.js
├─ Improve JWT expiration error message
└─ Add specific error codes

BACKEND/.env
└─ Configure STT_API_URL (add Whisper)
```

### High-Priority Changes

```
BACKEND/services/aiContentService.js
├─ Add Gemini API key validation
└─ Add startup test for API

BACKEND/services/transcriptionService.js
├─ Ensure STT fallback works
└─ Add better error messages

FRONTEND_V2/src/pages/ChatPage.jsx
├─ Fix Malayalam language detection
└─ Ensure Web Speech API uses language setting
```

### Medium-Priority Changes

```
BACKEND/server.js
├─ Add graceful shutdown handler
└─ Add SIGTERM/SIGINT handlers

BACKEND/routes/*.js
├─ Add input validation
└─ Add error handling
```

### Low-Priority Changes

```
BACKEND/server.js
├─ Add GET /health endpoint
├─ Add GET /api/docs endpoint
└─ Add request tracing

BACKEND/services/*.js
├─ Add comprehensive logging
└─ Add timing metrics
```

---

## ✅ VERIFICATION CHECKLIST

After fixing issues, verify:

- [ ] Server starts without errors
- [ ] All routes load successfully
- [ ] Supabase connection works
- [ ] Authentication endpoints respond
- [ ] Text processing works
- [ ] Emotion detection works
- [ ] Crisis detection works
- [ ] Voice input transcribes
- [ ] AI responses stream correctly
- [ ] Error messages are helpful
- [ ] Performance is acceptable
- [ ] No silent failures
- [ ] Graceful shutdown works
- [ ] Rate limiting works
- [ ] CORS works correctly

---

## 📝 TESTING COMMANDS

```bash
# Test server connectivity
node -e "const http = require('http'); http.get('http://localhost:5000/', r => console.log('✓ Server OK'));"

# Test Supabase
node -e "require('dotenv').config(); const {createClient} = require('@supabase/supabase-js'); const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY); sb.from('profiles').select('count', {head: true}).then(() => console.log('✓ Supabase OK')).catch(e => console.error('✗', e.message));"

# Test Gemini
node -e "require('dotenv').config(); const {GoogleGenAI} = require('@google/genai'); const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY}); ai.getGenerativeModel({model: 'gemini-2.5-flash'}).generateContent('test').then(() => console.log('✓ Gemini OK')).catch(e => console.error('✗', e.message));"

# Run test suite
node BACKEND/test_final.js
```

---

## 🎓 LESSONS LEARNED

1. **Silent Failures are Dangerous**
   - Add logging at every step
   - Test each component independently
   - Never ignore startup errors

2. **External Services Must be Verified**
   - Test API keys on startup
   - Verify endpoints are reachable
   - Have fallbacks ready

3. **Error Messages Matter**
   - Users need to know what went wrong
   - Developers need stack traces
   - Add codes to errors for monitoring

4. **Testing Requires Isolation**
   - Mock external services in tests
   - Run tests frequently (CI/CD)
   - Test edge cases

---

**Last Updated:** March 6, 2026  
**Status:** All issues identified and documented  
**Next Action:** Fix CRITICAL issues immediately  
**Estimated Completion:** 5-9 hours total  
**Expected Test Pass Rate After Fixes:** 85-90%
