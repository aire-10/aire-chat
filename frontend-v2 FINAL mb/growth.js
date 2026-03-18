/* ================================================================
   growth.js  —  Growth History page
   ================================================================ */

const STAGE_CONFIG = {
  egg:         { icon: "🥚", color: "#8a7060", label: "Egg"         },
  pupa:        { icon: "🟤", color: "#7aab72", label: "Pupa"        },
  caterpillar: { icon: "🐛", color: "#4c7a60", label: "Caterpillar" },
  butterfly:   { icon: "🦋", color: "#3a8c3a", label: "Butterfly"   },
  surviving:   { icon: "🌤️", color: "#b0a060", label: "Surviving"   },
  struggling:  { icon: "🌧️", color: "#a07070", label: "Struggling"  },
};

function formatDayLabel(dayKey) {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  });
}

function buildSnapshots(log) {
  if (!log.length) return [];

  const byDay = {};
  log.forEach(e => {
    if (!byDay[e.date] || e.ts > byDay[e.date].ts) byDay[e.date] = e;
  });

  const countByDay = {};
  log.forEach(e => { countByDay[e.date] = (countByDay[e.date] || 0) + 1; });

  const days = Object.keys(byDay).sort();
  const POSITIVE = AireData.POSITIVE;
  const NEGATIVE = AireData.NEGATIVE;

  let streak   = 0;
  let stageKey = "egg";

  const snapshots = days.map(day => {
    const mood  = byDay[day].mood;
    const isNeg = NEGATIVE.includes(mood);

    if (POSITIVE.includes(mood)) streak++;
    else streak = 0;

    if      (stageKey === "butterfly" && isNeg)        stageKey = "surviving";
    else if (stageKey === "struggling" && !isNeg)      stageKey = "surviving";
    else if (stageKey === "surviving"  && streak >= 5) stageKey = "butterfly";
    else if (!["surviving","struggling","butterfly"].includes(stageKey) || isNeg) {
      if      (streak === 0) stageKey = "egg";
      else if (streak <= 2)  stageKey = "pupa";
      else if (streak <= 4)  stageKey = "caterpillar";
      else                   stageKey = "butterfly";
    }

    return { dayKey: day, mood, note: byDay[day].note || "", stageKey, streak, checkIns: countByDay[day] || 1 };
  });

  return snapshots.reverse();
}

/* ── Summary ─────────────────────────────────────── */
function renderSummary(snapshots, log) {
  const el = document.getElementById("growthSummary");
  if (!el) return;

  const streak      = AireData.getStreak();
  const daysTracked = AireData.getDaysTracked();
  const todayCount  = AireData.getTodayCheckInCount();
  const latestMood  = AireData.getLatestMood();
  const moodMeta    = AireData.MOOD_META;
  const currentKey  = snapshots.length ? snapshots[0].stageKey : "egg";
  const cfg         = STAGE_CONFIG[currentKey] || STAGE_CONFIG.egg;
  const moodEmoji   = latestMood ? (moodMeta[latestMood]?.emoji || "") : "—";
  const moodLabel   = latestMood ? (moodMeta[latestMood]?.label || latestMood) : "None yet";

  el.innerHTML = `
    <div class="growth-summary-row">
      <div class="growth-kpi">
        <div class="kpi-label">Current Stage</div>
        <div class="kpi-value">${cfg.icon} ${cfg.label}</div>
      </div>
      <div class="growth-kpi">
        <div class="kpi-label">Streak 🔥</div>
        <div class="kpi-value">${streak} day${streak !== 1 ? "s" : ""}</div>
      </div>
      <div class="growth-kpi">
        <div class="kpi-label">Days Tracked</div>
        <div class="kpi-value">${daysTracked}</div>
      </div>
      <div class="growth-kpi">
        <div class="kpi-label">Check-ins Today</div>
        <div class="kpi-value">${todayCount}</div>
      </div>
    </div>

    ${log.length ? `
    <div class="growth-stage-banner">
      <span class="growth-stage-icon">${cfg.icon}</span>
      <div class="growth-stage-info">
        <div class="growth-stage-name">${cfg.label}</div>
        <div class="growth-stage-sub">Current Stage &nbsp;·&nbsp; Latest mood: ${moodEmoji} ${moodLabel}</div>
      </div>
    </div>` : `
    <div class="growth-empty-note">
      No mood check-ins yet — head to <a href="home.html">Home</a> to log your first mood!
    </div>`}
  `;
}

/* ── Timeline ────────────────────────────────────── */
function renderTimeline(snapshots, log) {
  const el = document.getElementById("growthTimeline");
  if (!el) return;
  if (!log.length) { el.innerHTML = ""; return; }

  el.innerHTML = snapshots.map(s => {
    const cfg       = STAGE_CONFIG[s.stageKey] || STAGE_CONFIG.egg;
    const moodMeta  = AireData.MOOD_META[s.mood] || {};
    const emoji     = moodMeta.emoji || "🙂";
    const moodLabel = moodMeta.label || s.mood;

    return `
      <article class="day-card">
        <div class="day-left">
          <div class="day-date">${formatDayLabel(s.dayKey)}</div>
          <div class="day-meta">
            <span class="badge stage">${cfg.icon} ${cfg.label}</span>
            <span class="badge mood">${emoji} ${moodLabel}</span>
            <span class="badge count">${s.checkIns} check-in${s.checkIns === 1 ? "" : "s"}</span>
          </div>
          ${s.note ? `<div class="day-note">"${s.note}"</div>` : ""}
        </div>
        <div class="day-right">
          <div class="day-streak">🔥 ${s.streak} streak</div>
        </div>
      </article>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const log       = AireData.getMoodLog();
  const snapshots = buildSnapshots(log);
  renderSummary(snapshots, log);
  renderTimeline(snapshots, log);
});
