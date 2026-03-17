// ── Growth History ──
// Uses the same mood data as AireData

const MOOD_LOG_KEY = "aire_mood_log";

/* Mood scoring */
const MOOD_POINTS = {
  joyful: 2,
  happy: 2,
  neutral: 0,
  anxious: -1,
  sad: -2,
  tired: -1,
  content: 1
};

/* Butterfly stages */
const STAGES = [
  { min: 10, id: "adult_glow", label: "Radiant" },
  { min: 7,  id: "butterfly", label: "Butterfly" },
  { min: 5,  id: "emerging", label: "Emerging" },
  { min: 3,  id: "pupa", label: "Pupa" },
  { min: 1,  id: "caterpillar", label: "Caterpillar" },
  { min: -999, id: "sick", label: "Needs Care" }
];

/* Icons */
const STAGE_ICON = {
  egg: "🥚",
  caterpillar: "🐛",
  pupa: "🟤",
  emerging: "🦋",
  butterfly: "🦋",
  adult_glow: "✨🦋",
  sick: "🤒🦋"
};

/* Safe JSON parse */
function safeJsonParse(v, fallback) {
  try { return JSON.parse(v) ?? fallback; }
  catch { return fallback; }
}

/* Load mood log */
function loadMoodLog() {
  return safeJsonParse(localStorage.getItem(MOOD_LOG_KEY), []);
}

/* Determine stage */
function pickStage(score) {
  return STAGES.find(s => score >= s.min) || STAGES[STAGES.length - 1];
}

/* Format date */
function formatDayLabel(dayKey) {

  const [y,m,d] = dayKey.split("-").map(Number);
  const date = new Date(y, m-1, d);

  return date.toLocaleDateString(undefined,{
    weekday:"short",
    month:"short",
    day:"numeric",
    year:"numeric"
  });
}

/* Get dominant mood */
function dominantMood(moods){

  if(!moods.length) return "none";

  const freq = {};
  moods.forEach(m=>{
    freq[m] = (freq[m]||0)+1;
  });

  let best=null;
  let count=0;

  for(const m in freq){
    if(freq[m]>count){
      best=m;
      count=freq[m];
    }
  }

  return best;
}

/* Capitalise mood */
function moodLabel(m){
  if(!m || m==="none") return "None";
  return m.charAt(0).toUpperCase()+m.slice(1);
}

/* Build daily snapshots */
function buildDailySnapshots(log){

  const byDay = {};

  log.forEach(entry=>{
    if(!entry.date) return;

    if(!byDay[entry.date]) byDay[entry.date]=[];
    byDay[entry.date].push(entry);
  });

  const days = Object.keys(byDay).sort();

  let cumulative = 0;

  const snapshots = days.map(dayKey=>{

    const entries = byDay[dayKey];
    const moods = entries.map(e=>e.mood);

    const dayPoints = entries.reduce((sum,e)=>{
      return sum + (MOOD_POINTS[e.mood] || 0);
    },0);

    cumulative += dayPoints;

    const stage = pickStage(cumulative);

    return{
      dayKey,
      entriesCount: entries.length,
      dayPoints,
      cumulative,
      stageId: stage.id,
      stageLabel: stage.label,
      domMood: dominantMood(moods)
    };

  });

  return snapshots.reverse();
}

/* Render summary */
function renderSummary(snapshots,log){

  const el=document.getElementById("growthSummary");
  if(!el) return;

  if(!log.length){

    el.innerHTML=`
      <div class="growth-summary-row">
        <div class="growth-kpi">
          <div class="kpi-label">Stage</div>
          <div class="kpi-value">🥚 Egg</div>
        </div>

        <div class="growth-kpi">
          <div class="kpi-label">Check-ins</div>
          <div class="kpi-value">0</div>
        </div>

        <div class="growth-kpi">
          <div class="kpi-label">Days tracked</div>
          <div class="kpi-value">0</div>
        </div>
      </div>

      <div class="growth-empty-note">
        No mood check-ins yet. Your butterfly is just beginning (egg stage).
      </div>
    `;
    return;
  }

  const newest=snapshots[0];

  el.innerHTML=`
    <div class="growth-summary-row">

      <div class="growth-kpi">
        <div class="kpi-label">Current stage</div>
        <div class="kpi-value">
          ${STAGE_ICON[newest.stageId]||"🦋"} ${newest.stageLabel}
        </div>
      </div>

      <div class="growth-kpi">
        <div class="kpi-label">Total check-ins</div>
        <div class="kpi-value">${log.length}</div>
      </div>

      <div class="growth-kpi">
        <div class="kpi-label">Days tracked</div>
        <div class="kpi-value">${snapshots.length}</div>
      </div>

    </div>
  `;
}

/* Render timeline */
function renderTimeline(snapshots,log){

  const el=document.getElementById("growthTimeline");
  if(!el) return;

  if(!log.length){
    el.innerHTML="";
    return;
  }

  el.innerHTML=snapshots.map(s=>`

    <article class="day-card">

      <div class="day-left">

        <div class="day-date">
          ${formatDayLabel(s.dayKey)}
        </div>

        <div class="day-meta">

          <span class="badge stage">
            ${STAGE_ICON[s.stageId]||"🦋"} ${s.stageLabel}
          </span>

          <span class="badge mood">
            Mood: ${moodLabel(s.domMood)}
          </span>

          <span class="badge count">
            ${s.entriesCount} check-in${s.entriesCount===1?"":"s"}
          </span>

        </div>

      </div>

      <div class="day-right">

        <div class="day-points">
          <div><b>Today:</b> ${s.dayPoints>=0?"+":""}${s.dayPoints}</div>
          <div class="muted"><b>Total:</b> ${s.cumulative>=0?"+":""}${s.cumulative}</div>
        </div>

      </div>

    </article>

  `).join("");

}

/* INIT */

document.addEventListener("DOMContentLoaded",()=>{

  const log = loadMoodLog();

  const snapshots = buildDailySnapshots(log);

  renderSummary(snapshots,log);
  renderTimeline(snapshots,log);

});