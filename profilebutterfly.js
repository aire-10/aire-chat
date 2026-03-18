// ── profile.js ──

document.addEventListener('DOMContentLoaded', () => {
  // Restore saved profile fields
  const name = localStorage.getItem('aire_name');
  const email = localStorage.getItem('aire_email');
  if (name)  document.getElementById('inp-name').value  = name;
  if (email) document.getElementById('inp-email').value = email;

  // Disable inputs by default (read-only until edit clicked)
  ['inp-name','inp-email','inp-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.readOnly = true;
  });

  // Update butterfly card stats from AireData
  updateButterflyCard();
});

function updateButterflyCard() {

  const health = AireData.getHealth();
  const bond   = AireData.getBondLevel();
  const mood   = AireData.getMoodReflected();

  document.getElementById('butterflyHealth').textContent = "Health: " + health;
  document.getElementById('butterflyBond').textContent   = "Bond Level: " + bond;
  document.getElementById('butterflyMood').textContent   = "Mood reflected: " + mood;

  const stage = AireData.getButterflyStage();

  const stageImages = {
    sick: "assets/butterfly/sick.png",
    egg: "assets/butterfly/egg.png",
    caterpillar: "assets/butterfly/caterpillar.png",
    pupa: "assets/butterfly/pupa.png",
    emerging: "assets/butterfly/emerging.png",
    butterfly: "assets/butterfly/butterfly.png",
    adult_glow: "assets/butterfly/adult_glow.png"
  };

  const img = document.getElementById("butterflyImg");

  if (img) {
    img.src = stageImages[stage] || stageImages.egg;

    img.classList.remove("is-glowing");
    if (stage === "adult_glow") {
      img.classList.add("is-glowing");
    }
  }
}

// ── Growth History Modal ──
function openGrowthModal() {
  const modal = document.getElementById('growth-modal');
  const list  = document.getElementById('growth-list');

  // Build history list
  const history = AireData.getGrowthHistory();
  const moodEmoji = {
    happy: '😄 Happy', joyful: '✨ Joyful', content: '🙂 Content',
    neutral: '😐 Neutral', anxious: '😰 Anxious', sad: '😢 Sad', tired: '😩 Tired'
  };
  const positive = AireData.POSITIVE;

  if (history.length === 0) {
    list.innerHTML = '<p style="color:#888;text-align:center;padding:16px 0;">No check-ins yet. Start tracking your mood!</p>';
  } else {
    list.innerHTML = history.map(entry => {
      const cls = positive.includes(entry.mood) ? 'positive' : 'negative';
      return `<div class="growth-item ${cls}">
        <span class="g-date">${formatDate(entry.date)}</span>
        <span class="g-mood">${moodEmoji[entry.mood] || entry.mood}</span>
        <span class="g-dot"></span>
      </div>`;
    }).join('');
  }

  // Stats
  document.getElementById('m-bond-days').textContent = AireData.getBondDays();
  document.getElementById('m-streak').textContent    = AireData.getStreak();
  document.getElementById('m-health').textContent    = AireData.getHealth();

  modal.classList.add('open');
}

function closeGrowthModal(event) {
  if (!event || event.target === document.getElementById('growth-modal')) {
    document.getElementById('growth-modal').classList.remove('open');
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
  
