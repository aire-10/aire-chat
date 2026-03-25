/* ================================================================
   profilebutterfly.js  —  Butterfly card logic for profile.html
   ================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  updateButterflyCard();
});

function updateButterflyCard() {
  const stageKey  = AireData.getButterflyStage();   // e.g. "egg", "pupa", etc.
  const stageInfo = AireData.getStageInfo();         // { label, img }
  const streak    = AireData.getStreak();
  const latest    = AireData.getLatestMood();
  const moodMeta  = latest ? AireData.MOOD_META[latest] : null;
  const todayCount = AireData.getTodayCheckInCount();

  /* Butterfly image */
  const img = document.getElementById("butterflyImg");
  if (img) {
    img.src = stageInfo.img;
    img.alt = stageInfo.label;

    /* Remove all filter classes then apply correct one */
    img.classList.remove(
      "butterfly-excelling", "butterfly-thriving",
      "butterfly-surviving", "butterfly-struggling", "is-glowing"
    );
    img.classList.add(AireData.getButterflyClass());

    if (stageKey === "butterfly") img.classList.add("is-glowing");
  }

  /* Health = stage name */
  const healthEl = document.getElementById("butterflyHealth");
  if (healthEl) healthEl.textContent = stageInfo.label;

  /* Latest mood */
  const moodEl = document.getElementById("butterflyMood");
  if (moodEl) {
    moodEl.textContent = moodMeta
      ? `${moodMeta.emoji} ${moodMeta.label}`
      : "None yet";
  }

  /* Streak */
  const streakEl = document.getElementById("butterflyStreak");
  if (streakEl) streakEl.textContent = `${streak} day${streak !== 1 ? "s" : ""}`;

  /* Check-ins today */
  const checkinsEl = document.getElementById("butterflyCheckins");
  if (checkinsEl) checkinsEl.textContent = todayCount;

  /* Notice for declining stages */
  const noticeEl = document.getElementById("butterflyNotice");
  if (noticeEl) {
    if (stageKey === "struggling" || stageKey === "surviving") {
      noticeEl.textContent = "Log positive moods to help your butterfly grow 💚";
      noticeEl.style.display = "block";
    } else {
      noticeEl.style.display = "none";
    }
  }
}

/* ── Growth history modal (used by View Growth History button) ── */
function openGrowthModal() {
  const modal = document.getElementById("growth-modal");
  const list  = document.getElementById("growth-list");
  if (!modal || !list) return;

  const history  = AireData.getGrowthHistory();
  const moodMeta = AireData.MOOD_META;

  if (!history.length) {
    list.innerHTML = `<p style="color:#888;text-align:center;padding:16px 0;">
      No check-ins yet. Start tracking your mood!
    </p>`;
  } else {
    list.innerHTML = history.map(entry => {
      const meta = moodMeta[entry.mood] || {};
      const isPositive = AireData.POSITIVE.includes(entry.mood);
      return `
        <div class="growth-item ${isPositive ? "positive" : "negative"}">
          <span class="g-date">${formatDate(entry.date)}</span>
          <span class="g-mood">${meta.emoji || ""} ${meta.label || entry.mood}</span>
          <span class="g-dot"></span>
        </div>`;
    }).join("");
  }

  /* Modal stats */
  const bondEl   = document.getElementById("m-bond-days");
  const streakEl = document.getElementById("m-streak");
  const healthEl = document.getElementById("m-health");
  if (bondEl)   bondEl.textContent   = AireData.getDaysTracked();
  if (streakEl) streakEl.textContent = AireData.getStreak();
  if (healthEl) healthEl.textContent = AireData.getHealth();

  modal.classList.add("open");
}

function closeGrowthModal(event) {
  const modal = document.getElementById("growth-modal");
  if (!event || event.target === modal) {
    modal?.classList.remove("open");
  }
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
}



