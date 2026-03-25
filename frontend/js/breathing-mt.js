/* ═══════════════════════════════════════════════════
   BREATHING TIMER — state & constants
═══════════════════════════════════════════════════ */

/* Background colours per phase — matching the PNG designs */
const phaseBg = {
    'phase-inhale': '#9fac9f',   /* default sage — INHALE */
    'phase-hold':   '#7a9480',   /* darker sage — HOLD    */
    'phase-exhale': '#7a9480',   /* darker sage — EXHALE  */
    'phase-done':   '#9fac9f'    /* back to default       */
};

const phases = [
    { name: 'INHALE',  duration: 4, cssClass: 'phase-inhale'  },
    { name: 'HOLD',    duration: 7, cssClass: 'phase-hold'    },
    { name: 'EXHALE',  duration: 8, cssClass: 'phase-exhale'  }
];

let currentPhaseIdx = 0;
let currentTime     = phases[0].duration;
let currentCycle    = 1;
const TOTAL_CYCLES  = 4;
let timerInterval   = null;
let running         = false;

/* ═══════════════════════════════════════════════════
   TAB SWITCHER
═══════════════════════════════════════════════════ */
function switchTab(tab) {
    const breathingSection = document.getElementById('breathing-section');
    const moodSection      = document.getElementById('mood-section');
    const btnBreathing     = document.getElementById('btn-breathing');
    const btnMood          = document.getElementById('btn-mood');
    const butterfly        = document.getElementById('corner-butterfly');

    if (tab === 'breathing') {
        breathingSection.classList.remove('hidden');
        moodSection.classList.add('hidden');
        btnBreathing.classList.add('active');
        btnMood.classList.remove('active');
        butterfly.classList.remove('visible');
        /* Restore breathing background based on current phase */
        const currentClass = phases[currentPhaseIdx].cssClass;
        document.body.style.backgroundColor = phaseBg[currentClass];
    } else {
        breathingSection.classList.add('hidden');
        moodSection.classList.remove('hidden');
        btnBreathing.classList.remove('active');
        btnMood.classList.add('active');
        butterfly.classList.add('visible');
        /* Mood tab always uses the default sage background */
        document.body.style.backgroundColor = '#9fac9f';
    }
}
/* ═══════════════════════════════════════════════════
   BREATHING — display update
═══════════════════════════════════════════════════ */
function updateDisplay() {
    const circle   = document.getElementById('breath-circle');
    const cssClass = phases[currentPhaseIdx].cssClass;

    document.getElementById('timer').textContent = currentTime;
    document.getElementById('phase').textContent = phases[currentPhaseIdx].name;
    document.getElementById('cycle').textContent = currentCycle;

    /* Swap phase colour class on the circle */
    circle.classList.remove('phase-inhale', 'phase-hold', 'phase-exhale', 'phase-done');
    circle.classList.add(cssClass);

    /* Change body background to match the phase */
    document.body.style.backgroundColor = phaseBg[cssClass];
}

/* ═══════════════════════════════════════════════════
   BREATHING — start
═══════════════════════════════════════════════════ */
function startBreathing() {
    if (running) return;
    running = true;
    updateDisplay();

    timerInterval = setInterval(() => {
        currentTime--;

        if (currentTime <= 0) {
            currentPhaseIdx++;

            if (currentPhaseIdx >= phases.length) {
                currentPhaseIdx = 0;
                currentCycle++;

                if (currentCycle > TOTAL_CYCLES) {
                    clearInterval(timerInterval);
                    running = false;

                    /* Done state */
                    const circle = document.getElementById('breath-circle');
                    circle.classList.remove('phase-inhale', 'phase-hold', 'phase-exhale');
                    circle.classList.add('phase-done');
                    document.getElementById('timer').textContent = '✓';
                    document.getElementById('phase').textContent = 'DONE!';
                    document.getElementById('cycle').textContent = TOTAL_CYCLES;
                    document.body.style.backgroundColor = phaseBg['phase-done'];
                    return;
                }
            }
            currentTime = phases[currentPhaseIdx].duration;
        }

        updateDisplay();
    }, 1000);
}

/* ═══════════════════════════════════════════════════
   BREATHING — restart
═══════════════════════════════════════════════════ */
function restartBreathing() {
    clearInterval(timerInterval);
    running         = false;
    currentPhaseIdx = 0;
    currentTime     = phases[0].duration;
    currentCycle    = 1;

    const circle = document.getElementById('breath-circle');
    circle.classList.remove('phase-inhale', 'phase-hold', 'phase-exhale', 'phase-done');

    /* Reset body background to INHALE colour */
    document.body.style.backgroundColor = phaseBg['phase-inhale'];

    updateDisplay();
}

/* ═══════════════════════════════════════════════════
   MOOD TRACKING
═══════════════════════════════════════════════════ */
let selectedMoodEmoji = null;

function selectMood(element, emoji) {
    document.querySelectorAll('.emoji-item').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedMoodEmoji = emoji;
}

function saveMood() {

    if (!selectedMoodEmoji) {
        alert("Please select a mood first!");
        return;
    }

    const moodMap = {
        "😄": "joyful",
        "😊": "happy",
        "😐": "neutral",
        "😰": "anxious",
        "😔": "sad"
    };

    const moodType = moodMap[selectedMoodEmoji];
    const note = document.getElementById("mood-note").value.trim();

    /* SAVE MOOD */
    AireData.logMood(moodType, note);

    console.log("Mood saved:", AireData.getMoodLog());
    
    /* REFRESH UI */
    loadMoodEntries();

    /* Reset form */
    document.querySelectorAll(".emoji-item").forEach(el => el.classList.remove("selected"));
    document.getElementById("mood-note").value = "";
    selectedMoodEmoji = null;
}

/* ═══════════════════════════════════════════════════
   MOOD TRACKING — load past moods
═══════════════════════════════════════════════════ */

function loadMoodEntries() {

  const list = document.getElementById("entries-list");
  if (!list) return;

  const moodLog = AireData.getMoodLog();

  const emojiMap = {
    joyful: "😄",
    happy: "😊",
    neutral: "😐",
    anxious: "😰",
    sad: "😔",
    tired: "😩",
    content: "🙂"
  };

  list.innerHTML = "";

  const sorted = [...moodLog].sort((a,b)=>b.date.localeCompare(a.date));

  sorted.forEach(entry => {

    const date = new Date(entry.date + "T00:00:00");
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dateStr = `${months[date.getMonth()]} ${date.getDate()}`;

    const item = document.createElement("div");
    item.className = "entry-item";

    item.innerHTML = `
      ${dateStr} ${emojiMap[entry.mood] || "🙂"}
      <strong>Notes:</strong> ${entry.note || "—"}
    `;

    list.appendChild(item);

  });

}

/* ═══════════════════════════════════════════════════
   INIT — set correct display on page load
═══════════════════════════════════════════════════ */
window.addEventListener("DOMContentLoaded", () => {
  updateDisplay();
  loadMoodEntries();
});


