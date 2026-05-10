# 🔍 MindMate - Code Understanding Guide

If you need to understand *why* certain code was written the way it was, read this document. It breaks down the most complex logic in the repository.

---

## 1. How does the AI Streaming work?

**The Goal:** We don't want the user waiting 5 seconds for a response. We want words to appear on screen instantly.

**Backend (`routes/dataRoutes.js`):**
To stream text, we don't return a standard JSON object. Instead, we keep the HTTP connection open and send discrete "packets" of text. This is called Server-Sent Events (SSE).
```javascript
// 1. Tell the browser we are streaming a continuous stream of events
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');

// 2. We pass an 'onChunk' callback to Gemini. Every time Gemini generates a word, this function runs.
const response = await aiContentService.generateResponse(prompt, {
    onChunk: (textChunk) => {
        // 3. We write the chunk to the open HTTP connection
        res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
    }
});
```

**Frontend (`ChatPage.jsx`):**
Browsers cannot read streams using standard `axios.post`. We have to use the native browser `fetch` API.
```javascript
const response = await fetch('/api/data/process-with-ai?stream=true');
const reader = response.body.getReader(); // Get a stream reader
const decoder = new TextDecoder("utf-8"); // Decode bytes into text

// We enter a loop, constantly reading the stream until it closes
while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    // Convert the raw bytes to text ("data: {"text": "hello"}\n\n")
    const chunk = decoder.decode(value, { stream: true });
    
    // We parse the JSON out of the chunk and append it to our React State.
    // Because React State updates instantly, the word appears on screen immediately!
}
```

---

## 2. How does the Pagination (Infinite Scrolling) work?

**The Goal:** If a user has 10,000 messages in a chat session, fetching them all at once will freeze the browser. We want to load the newest 20, and only load older ones when they scroll up.

**Backend (`routes/sessionRoutes.js`):**
The API accepts `limit` and `offset` parameters.
- `limit`: How many messages to fetch (e.g., 20).
- `offset`: How many messages to skip (e.g., skip the first 20, give me the NEXT 20).
```javascript
const limitOffset = parseInt(req.query.offset) || 0;
const limitAmount = parseInt(req.query.limit) || 20;

// Tell PostgreSQL to pull the chat array, slice it from the back, and return only the requested chunk!
```

**Frontend (`ChatPage.jsx`):**
We use an `onScroll` event listener on the main chat container. When the user scrolls all the way to the top (`scrollTop === 0`), we trigger a fetch for the older messages.
```javascript
<main
    className="glass-panel"
    style={{ overflowY: 'auto' }}
    onScroll={(e) => {
        // Did the user scroll to the very top?
        // If yes, and we have more history, fetch the older messages!
        if (e.target.scrollTop === 0 && hasMoreHistory && !isLoadingHistory && selectedSessionId) {
            // Offset by the number of messages currently loaded
            fetchSessionHistory(selectedSessionId, messages.length);
        }
    }}
>
```

---

## 3. How does the Authentication Security work?

**The Goal:** Prevent a hacker from reading another person's chat history.

**The Mistake (Phase 1):**
Early on, the API just trusted whatever `userId` the frontend sent in the JSON body.
`{ "userId": "admin's ID", "text": "hello" }`
A hacker could intercept this request, change the `userId`, and send messages as someone else!

**The Fix (Phase 7):**
We implemented robust JWT (JSON Web Token) Security.
1. When a user logs in via Supabase, Supabase gives them a signed JWT. This JWT proves who they are and cannot be forged.
2. The frontend attaches this JWT to the `Authorization: Bearer <token>` header of every single API request.
3. The backend middleware (`authMiddleware.js`) intercepts the request.
4. It calls `supabase.auth.getUser(token)`. Supabase cryptographically verifies the signature. 
5. The backend assigns `req.user = user`. All routes now use `req.user.id` instead of trusting the request body!

---

## 4. How does the Custom Light/Dark Mode work?

**The Goal:** Smooth toggles without making React recalculate inline styles on 100 components.

**The Implementation (`index.css`):**
We define CSS Variables on the root HTML element.
```css
:root {
  /* Default variables (Light Mode) */
  --bg-primary: #f8fafc;
  --text-primary: #0f172a;
}

[data-theme='dark'] {
  /* When the 'data-theme' attribute is added, these variables overwrite the defaults! */
  --bg-primary: #0f172a;
  --text-primary: #f8fafc;
}
```

When the user clicks the "Toggle Theme" button in the Sidebar, React literally just changes the attribute on the HTML tag:
`document.documentElement.setAttribute('data-theme', newTheme);`

The browser instantly repaints every element using `--bg-primary` to the new color, natively! Faster than JS.
