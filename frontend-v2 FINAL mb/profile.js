// const MOOD_LOG_KEY = "aire_mood_log";

// const MOOD_POINTS = {
//   happy: 2,
//   good: 2,
//   calm: 1,
//   neutral: 1,
//   tired: -1,
//   stressed: -1,
//   anxious: -1,
//   sad: -2,
//   down: -2,
// };

// const STAGES = [
//   { min: 18, id: "adult_glow", label: "Thriving" },
//   { min: 12, id: "butterfly", label: "Healthy" },
//   { min: 7,  id: "emerging", label: "Growing" },
//   { min: 3,  id: "pupa", label: "Developing" },
//   { min: -5, id: "caterpillar", label: "Needs care" },
//   { min: -9999, id: "sick", label: "Sick" },
// ];

// function setButterflyStageWithAnim(imgEl, newSrc, newAlt) {
//   if (!imgEl) return;

//   // If image already the same, do nothing
//   if (imgEl.src.includes(newSrc)) return;

//   imgEl.classList.add("is-fading");

//   // wait for fade-out, then swap, then fade-in + pop
//   setTimeout(() => {
//     imgEl.src = newSrc;
//     imgEl.alt = newAlt || "";
//     imgEl.setAttribute("data-stage-src", newSrc);

//     // fade back in
//     imgEl.classList.remove("is-fading");
//     imgEl.classList.add("is-pop");

//     setTimeout(() => imgEl.classList.remove("is-pop"), 220);
//   }, 220);
// }

// function loadMoodLog(){
//   try { return JSON.parse(localStorage.getItem(MOOD_LOG_KEY)) || []; }
//   catch { return []; }
// }

// function calcScore(log){
//   // use last 7 days
//   const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
//   const recent = log.filter(x => x.ts >= weekAgo);

//   // if no mood data yet
//   if (recent.length === 0) return 0;

//   return recent.reduce((sum, item) => {
//     const pts = MOOD_POINTS[item.mood] ?? 0;
//     return sum + pts;
//   }, 0);
// }

// function pickStage(score){
//   return STAGES.find(s => score >= s.min) || STAGES[STAGES.length - 1];
// }

// function updateButterflyUI(){
//   const log = loadMoodLog();

//   const img = document.getElementById("butterflyImg");
//   const healthText = document.getElementById("butterflyHealth");
//   const notify = document.getElementById("butterflyNotice");

//   const srcMap = {
//     egg: "assets/butterfly/egg.png",
//     caterpillar: "assets/butterfly/caterpillar.png",
//     pupa: "assets/butterfly/pupa.png",
//     emerging: "assets/butterfly/emerging.png",
//     butterfly: "assets/butterfly/butterfly.png",
//     adult_glow: "assets/butterfly/adult_glow.png",
//     sick: "assets/butterfly/sick.png",
//   };

//   // ✅ If no mood data yet → always egg
//   if (!log || log.length === 0) {
//     if (img) {
//       setButterflyStageWithAnim(img, srcMap.egg, "Butterfly stage: egg");
//       img.classList.remove("is-glowing", "is-sick");
//     }
//     if (healthText) healthText.textContent = "Health: New Life";
//     if (notify) notify.style.display = "none";
//     return;
//   }

//   // Otherwise compute stage normally
//   const score = calcScore(log);
//   const stage = pickStage(score);

//   if (img) {
//     setButterflyStageWithAnim(
//     img,
//     srcMap[stage.id] || srcMap.egg,
//     `Butterfly stage: ${stage.id}`
//     );
//     img.classList.toggle("is-glowing", stage.id === "adult_glow");
//     img.classList.toggle("is-sick", stage.id === "sick");
//   }

//   if (healthText) healthText.textContent = `Health: ${stage.label}`;

//   if (notify) {
//     const isSick = stage.id === "sick";
//     notify.style.display = isSick ? "block" : "none";
//     notify.textContent = isSick
//       ? "Your butterfly needs care. Come back to take care of it 💚"
//       : "";
//   }
// }

// -------- Recent Chat History (Profile) --------
const SESSIONS_KEY = "AIRE_CHAT_SESSIONS";
const ACTIVE_KEY = "AIRE_CHAT_ACTIVE_ID";
const SESSION_PREFIX = "AIRE_CHAT_";

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || [];
  } catch {
    return [];
  }
}

function loadSessionMessages(sessionId) {
  try {
    return JSON.parse(localStorage.getItem(SESSION_PREFIX + sessionId)) || [];
  } catch {
    return [];
  }
}

function formatDateTime(ts) {
  const d = new Date(ts);
  // matches your style like: 3/1/26, 8:31 pm
  return d.toLocaleString(undefined, {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderRecentChats(limit = 3) {
  const listEl = document.getElementById("recentChatList");
  if (!listEl) return;

  const sessions = loadSessions()
    .slice()
    .sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));

  listEl.innerHTML = "";

  if (!sessions.length) {
    listEl.innerHTML = `<div class="recent-empty">No chats yet.</div>`;
    return;
  }

  sessions.slice(0, limit).forEach((s) => {
    const msgs = loadSessionMessages(s.id);
    const lastMsg = msgs.length ? msgs[msgs.length - 1] : null;

    const title = s.title || "New Chat";
    const preview = lastMsg?.text?.slice(0, 60) || "No messages yet.";
    const when = formatDateTime(s.lastUpdated || Date.now());

    const item = document.createElement("button");
    item.type = "button";
    item.className = "recent-chat-item";
    item.innerHTML = `
      <div class="recent-title">${title}</div>
      <div class="recent-preview">${preview}</div>
      <div class="recent-date">${when}</div>
    `;

    // Optional: click opens that session in chat.html
    item.addEventListener("click", () => {
      localStorage.setItem(ACTIVE_KEY, s.id);
      window.location.href = `chat.html?id=${encodeURIComponent(s.id)}`;
    });

    listEl.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderRecentChats(3);
});

// ===== Profile storage keys =====
const USER_KEY = "aire_user_profile"; // { name, email, passwordHash, photoDataUrl }

// Simple hash placeholder (NOT secure). Replace with real backend hashing later.
function fakeHash(str) {
  // quick "hash-like" string for demo only
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return "h_" + h.toString(16);
}

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function maskPassword(pwHashOrPw) {
  if (!pwHashOrPw) return "—";
  // Always show bullets only (never show real password)
  return "••••••••";
}

function renderUser() {
  const roName = document.getElementById("roName");
  const roEmail = document.getElementById("roEmail");
  const roPassword = document.getElementById("roPassword");
  const img = document.getElementById("profilePhotoImg");

  const user = loadUser();

  roName.textContent = user?.name || "—";
  roEmail.textContent = user?.email || "—";
  roPassword.textContent = maskPassword(user?.passwordHash);

  if (user?.photoDataUrl) {
    img.src = user.photoDataUrl;
  } else {
    img.src = "profile.jpeg"; // fallback
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderUser();

  const form = document.getElementById("updateProfileForm");
  const updName = document.getElementById("updName");
  const updEmail = document.getElementById("updEmail");
  const updPassword = document.getElementById("updPassword");
  const updPhoto = document.getElementById("updPhoto");
  const img = document.getElementById("profilePhotoImg");

  // Live preview for photo
  updPhoto.addEventListener("change", async () => {
    const file = updPhoto.files?.[0];
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    img.src = dataUrl; // instant preview
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const current = loadUser() || { name: "", email: "", passwordHash: "", photoDataUrl: "" };

    const name = updName.value.trim();
    const email = updEmail.value.trim();
    const pw = updPassword.value;

    // If user selected a photo, store it
    let photoDataUrl = current.photoDataUrl;
    const file = updPhoto.files?.[0];
    if (file) {
      photoDataUrl = await fileToDataUrl(file);
    }

    const next = {
      ...current,
      name: name || current.name,
      email: email || current.email,
      passwordHash: pw ? fakeHash(pw) : current.passwordHash,
      photoDataUrl,
    };

    saveUser(next);

    // clear inputs
    updName.value = "";
    updEmail.value = "";
    updPassword.value = "";
    updPhoto.value = "";

    renderUser();
    alert("Profile updated!");
  });
});

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    window.location.href = "login.html";
  });
}
