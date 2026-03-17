// ── aire-data.js ── shared data layer for Airé app ──
// Persists in localStorage. Import on every page that reads/writes mood/bond data.

const AireData = {

  // ── POSITIVE / NEGATIVE MOOD SETS ──
  POSITIVE: ['happy', 'joyful'],
  BREAKING: ['neutral', 'anxious', 'sad', 'tired', 'content'],

  // ── MOOD LOG ──
  getMoodLog() {
    return JSON.parse(localStorage.getItem('aire_mood_log') || '[]');
  },

  // Save a mood for today (overwrites if already checked in today)
  logMood(mood, note) {

    const log = this.getMoodLog();
    const today = this.today();

    const idx = log.findIndex(e => e.date === today);

    if (idx >= 0) {
      log[idx].mood = mood;
      log[idx].note = note;
    } else {
      log.push({
        date: today,
        mood: mood,
        note: note || ""
      });
    }

    localStorage.setItem("aire_mood_log", JSON.stringify(log));

    this.addBondDay(today);
  },

  // ── STREAK ──
  // Streak = number of positive check-ins after the most recent negative one
  // (skipped days do NOT break the streak; only an explicit negative check-in does)
  getStreak() {
    const log = this.getMoodLog();
    if (!log.length) return 0;

    const sorted = [...log].sort((a, b) => a.date.localeCompare(b.date));

    // Find the most recent negative check-in
    let lastNegativeIdx = -1;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (!this.POSITIVE.includes(sorted[i].mood)) {
        lastNegativeIdx = i;
        break;
      }
    }

    // Count positives after that point
    let streak = 0;
    for (let i = lastNegativeIdx + 1; i < sorted.length; i++) {
      if (this.POSITIVE.includes(sorted[i].mood)) streak++;
    }
    return streak;
  },

  // ── HEALTH STATUS (from streak) ──
  getHealth() {
    const s = this.getStreak();
    if (s >= 3) return 'Excelling';
    if (s === 2) return 'Thriving';
    if (s === 1) return 'Surviving';
    return 'Struggling';
  },

  // ── MOOD REFLECTED ──
  // Latest mood from the current streak window (positive moods preferred)
  getMoodReflected() {
    const labels = {
      happy:   'Happy',
      joyful:  'Calm & Joyful',
      content: 'Content',
      neutral: 'Neutral',
      anxious: 'Anxious',
      sad:     'Sad',
      tired:   'Tired'
    };
    const m = this.getLatestMood();
    return m ? (labels[m] || m) : '—';
  },

  // ── BOND LEVEL ──
  addBondDay(date) {
    date = date || this.today();
    const days = JSON.parse(localStorage.getItem('aire_bond_days') || '[]');
    if (!days.includes(date)) {
      days.push(date);
      localStorage.setItem('aire_bond_days', JSON.stringify(days));
    }
  },

  getBondDays() {
    return JSON.parse(localStorage.getItem('aire_bond_days') || '[]').length;
  },

  getBondLevel() {
    const n = this.getBondDays();
    if (n >= 14) return 'High';
    if (n >= 7)  return 'Medium';
    return 'Low';
  },

  // ── BUTTERFLY TEXT (for home page card) ──
  getButterflyMessage() {
    const msgs = {
      Excelling: 'Your butterfly is soaring and radiant today.',
      Thriving:  'Your butterfly is vibrant and thriving today.',
      Surviving: 'Your butterfly is glowing softly today.',
      Struggling: 'Your butterfly needs some gentle love today.'
    };
    return msgs[this.getHealth()];
  },

  // ── BUTTERFLY CSS CLASS (drives image filter on profile & home) ──
  getButterflyClass() {
    return 'butterfly-' + this.getHealth().toLowerCase();
    // butterfly-excelling / butterfly-thriving / butterfly-surviving / butterfly-struggling
  },

  // ── GROWTH HISTORY (last 14 mood log entries, sorted newest first) ──
  getGrowthHistory() {
    return [...this.getMoodLog()]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14);
  },

  // ── HELPERS ──
  today() {
    return new Date().toISOString().split('T')[0];
  },

  getLatestMood() {

  const log = this.getMoodLog();

  if (!log.length) return null;

  const sorted = [...log].sort((a,b)=>b.date.localeCompare(a.date));

  return sorted[0].mood;

},

getButterflyStage() {

  const streak = this.getStreak();
  const bond = this.getBondDays();
  const health = this.getHealth();

  // Struggling butterfly
  if (health === "Struggling") return "sick";

  if (streak === 1) return "egg";
  if (streak === 2) return "caterpillar";
  if (streak === 3) return "pupa";
  if (streak === 4) return "emerging";

  if (streak >= 5 && bond < 7) return "butterfly";
  if (streak >= 5 && bond >= 7) return "adult_glow";

  return "egg";
}
};