document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chatMessages");
  const chatForm = document.querySelector(".chat-inputbar");
  const chatInput = document.getElementById("chatInput");
  const clearChatBtn = document.getElementById("clearChatBtn");

  if (!chatMessages || !chatForm || !chatInput) {
    console.error("Missing required chat elements");
    return;
  }


  // -----------------------------
  // Utilities
  // -----------------------------
  const pad2 = (n) => String(n).padStart(2, "0");

  const formatTime = (ts) => {
    const d = new Date(ts);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

  const dayKey = (ts) => {
    const d = new Date(ts);
    // local day key
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  };

  const dayLabel = (ts) => {
    const d = new Date(ts);
    const now = new Date();

    const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const d1 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    const diffDays = Math.round((d1 - d0) / 86400000);

    if (diffDays === 0) return "Today";
    if (diffDays === -1) return "Yesterday";

    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  const STORAGE_SESSIONS = "AIRE_CHAT_SESSIONS";
  const STORAGE_ACTIVE = "AIRE_CHAT_ACTIVE_ID";

  const sessionKey = (id) => `AIRE_CHAT_SESSION_${id}`;

  const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  function getSessionIdFromURL() {
    const url = new URL(window.location.href);
    return url.searchParams.get("session");
  }
  const urlSessionId = getSessionIdFromURL();
  if (urlSessionId) {
    setActiveSessionId(urlSessionId); // use your existing function that sets active session
  }

  function loadSessions() {
    return JSON.parse(localStorage.getItem(STORAGE_SESSIONS) || "[]");
  }

  function saveSessions(sessions) {
    localStorage.setItem(STORAGE_SESSIONS, JSON.stringify(sessions));
  }

  function loadSessionMessages(id) {
    return JSON.parse(localStorage.getItem(sessionKey(id)) || "[]");
  }

  function saveSessionMessages(id, messages) {
    localStorage.setItem(sessionKey(id), JSON.stringify(messages));
  }

  function setActiveSessionId(id) {
    localStorage.setItem(STORAGE_ACTIVE, id);
  }

  function getActiveSessionId() {
    return localStorage.getItem(STORAGE_ACTIVE);
  }

  function ensureActiveSession() {
    let sessions = loadSessions();
    let activeId = new URLSearchParams(location.search).get("id") || getActiveSessionId();

    // if there is no session at all, create one
    if (sessions.length === 0) {
      const id = uid();
      sessions = [{ id, title: "New Chat", updatedAt: Date.now() }];
      saveSessions(sessions);
      saveSessionMessages(id, []);
      activeId = id;
    }

    // if active doesn't exist anymore, fallback to newest
    if (!activeId || !sessions.some(s => s.id === activeId)) {
      activeId = sessions[0].id;
    }

    setActiveSessionId(activeId);
    return { sessions, activeId };
  }

  function touchSession(id) {
    const sessions = loadSessions();
    const idx = sessions.findIndex(s => s.id === id);
    if (idx === -1) return;

    sessions[idx].updatedAt = Date.now();

    // move updated session to top
    const updated = sessions.splice(idx, 1)[0];
    sessions.unshift(updated);

    saveSessions(sessions);
  }

  // -----------------------------
  // Storage
  // -----------------------------


  const { activeId } = ensureActiveSession();
  let messages = loadSessionMessages(activeId);
  let lastRenderedDay = null;

  // -----------------------------
  // Rendering
  // -----------------------------
  const renderDayDividerIfNeeded = (ts) => {
    const dk = dayKey(ts);
    if (dk === lastRenderedDay) return;

    lastRenderedDay = dk;

    const div = document.createElement("div");
    div.className = "day-divider";
    div.textContent = dayLabel(ts);
    chatMessages.appendChild(div);
  };

  const renderMessage = ({ role, text, ts }) => {
    renderDayDividerIfNeeded(ts);

    const row = document.createElement("div");
    row.className = `msg ${role}`;

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";

    // title (only for bot)
    if (role === "bot") {
      const title = document.createElement("div");
      title.className = "msg-title";
      title.textContent = "AI Bot: Airé";
      bubble.appendChild(title);
    }

    const body = document.createElement("div");
    body.className = "msg-text";
    body.textContent = text; // safe text
    bubble.appendChild(body);

    const time = document.createElement("div");
    time.className = "msg-time";
    time.textContent = formatTime(ts);
    bubble.appendChild(time);

    row.appendChild(bubble);
    chatMessages.appendChild(row);
  };

  const renderAll = () => {
    chatMessages.innerHTML = "";
    lastRenderedDay = null;

    if (messages.length === 0) {
      // Welcome message if empty
      const welcome = {
        role: "bot",
        text: "I’m here to listen 💚\nHow can I support you today? 🦋",
        ts: Date.now(),
      };
      messages = [welcome];
  saveSessionMessages(activeId, messages);
  touchSession(activeId);
    }

    messages.forEach(renderMessage);
    scrollToBottom();
  };

  // -----------------------------
  // Typing indicator
  // -----------------------------
  let typingEl = null;

  const showTyping = () => {
    if (typingEl) return;

    typingEl = document.createElement("div");
    typingEl.className = "msg bot typing";

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";

    const title = document.createElement("div");
    title.className = "msg-title";
    title.textContent = "AI Bot: Airé";
    bubble.appendChild(title);

    const body = document.createElement("div");
    body.className = "msg-text";
    body.innerHTML = `Airé is typing<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>`;
    bubble.appendChild(body);

    typingEl.appendChild(bubble);
    chatMessages.appendChild(typingEl);
    scrollToBottom();
  };

  const hideTyping = () => {
    if (typingEl) typingEl.remove();
    typingEl = null;
  };

  // -----------------------------
  // Message actions
  // -----------------------------
  const addMessage = (role, text, ts = Date.now()) => {
    const msg = { role, text, ts };
    messages.push(msg);
    saveSessionMessages(activeId, messages);
    touchSession(activeId);
    renderMessage(msg);
  };

  const sendUserText = (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    addMessage("user", trimmed);
    maybeSetSessionTitle(activeId, text);

    // Fake bot reply (until API is connected)
    showTyping();
    window.setTimeout(() => {
      hideTyping();
      addMessage("bot", "I hear you. Want to tell me a bit more?");
    }, 600);
  };

    function maybeSetSessionTitle(id, userText) {
      const sessions = loadSessions();
      const idx = sessions.findIndex(s => s.id === id);
      if (idx === -1) return;

      // only set title if still default-ish
      const current = sessions[idx].title || "";
      if (current !== "New Chat") return;

      const title = userText.trim().slice(0, 28) || "New Chat";
      sessions[idx].title = title;
      sessions[idx].updatedAt = Date.now();
      saveSessions(sessions);
    }

  // -----------------------------
  // Events: form submit + Enter key
  // -----------------------------
    chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = chatInput.value.trim();
    if (!text) return;

    sendUserText(text);  // ✅ correct function
    chatInput.value = "";
    });

  // -----------------------------
  // Suggestions: auto send
  // -----------------------------
  document.querySelectorAll(".suggest-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.dataset.fill || btn.innerText || "";
      sendUserText(text);
    });
  });

  // -----------------------------
  // Mood buttons: auto send
  // -----------------------------
  const moodMap = {
    happy: "happy",
    good: "good",
    neutral: "neutral",
    sad: "sad",
    tired: "tired",
  };

  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mood = moodMap[btn.dataset.mood] || btn.dataset.mood || "okay";

      // save mood into mood log
      logMood(mood);

      // send message to chat
      sendUserText(`I'm feeling ${mood} today.`);
    });
  });

  const MOOD_LOG_KEY = "aire_mood_log_v1";

  function loadMoodLog(){
    try { return JSON.parse(localStorage.getItem(MOOD_LOG_KEY)) || []; }
    catch { return []; }
  }

  function saveMoodLog(log){
    localStorage.setItem(MOOD_LOG_KEY, JSON.stringify(log));
  }

  const BOND_KEY = "aire_bond_level";

  function updateBond(mood){
    const moodPoints = {
      happy: 3,
      good: 2,
      calm: 1,
      neutral: 0,
      tired: -1,
      stressed: -2,
      anxious: -2,
      sad: -3,
      down: -3
    };

    let bond = parseInt(localStorage.getItem(BOND_KEY) || "0");

    bond += moodPoints[mood] || 0;
    bond = Math.max(-10, Math.min(40, bond)); // clamp range, keeps the system stable

    localStorage.setItem(BOND_KEY, bond);
  }

  function logMood(mood){
    const log = loadMoodLog();
    log.push({ mood, ts: Date.now() });
    saveMoodLog(log);

    updateBond(mood); // NEW
  }

  // -----------------------------
  // Clear chat
  // -----------------------------
    if (clearChatBtn) {
      clearChatBtn.addEventListener("click", () => {
        // Clear ONLY the active conversation
        messages = [];
        localStorage.removeItem(sessionKey(activeId));

        // Update session "last updated"
        touchSession(activeId);

        // Re-render (this will show the welcome message again)
        renderAll();
      });
    }

    // --- Auto-scroll control + "New messages" button ---
    const newMsgBtn = document.getElementById("newMsgBtn");
    const newMsgCount = document.getElementById("newMsgCount");

    let userAtBottom = true;
    let unreadCount = 0;

    const isNearBottom = (threshold = 80) => {
    // distance from bottom
    const distance = chatMessages.scrollHeight - (chatMessages.scrollTop + chatMessages.clientHeight);
    return distance < threshold;
    };

    const scrollToBottom = () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const showNewBtn = () => {
    unreadCount += 1;
    newMsgCount.textContent = unreadCount;
    newMsgBtn.style.display = "inline-flex";
    };

    const hideNewBtn = () => {
    unreadCount = 0;
    newMsgCount.textContent = 0;
    newMsgBtn.style.display = "none";
    };

    const updateUserAtBottom = () => {
    userAtBottom = isNearBottom();
    if (userAtBottom) hideNewBtn();
    };

    // When user scrolls messages, update bottom state
    chatMessages.addEventListener("scroll", updateUserAtBottom);

    // Clicking button jumps to latest
    newMsgBtn.addEventListener("click", () => {
    scrollToBottom();
    hideNewBtn();
    userAtBottom = true;
    });

    // Watch for new messages being added (works no matter where messages are appended)
    const observer = new MutationObserver(() => {
    // If user is at bottom → keep them at bottom
    if (userAtBottom) {
        scrollToBottom();
    } else {
        showNewBtn();
    }
    });

    observer.observe(chatMessages, { childList: true });

    const newChatBtn = document.getElementById("newChatBtn");
    if (newChatBtn) {
      newChatBtn.addEventListener("click", () => {
        const id = uid();
        const sessions = loadSessions();
        sessions.unshift({ id, title: "New Chat", updatedAt: Date.now() });
        saveSessions(sessions);
        saveSessionMessages(id, []);
        setActiveSessionId(id);
        location.href = `chat.html?id=${encodeURIComponent(id)}`;
      });
    }

    
  // Initial render
  renderAll();
  updateUserAtBottom();
});
