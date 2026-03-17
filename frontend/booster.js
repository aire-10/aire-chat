// ── booster.js — shared interactivity for all Mood Booster pages ──

document.addEventListener('DOMContentLoaded', () => {

  // ── Mood selection (mood-booster page) ──
  document.querySelectorAll('.mood-btnmb').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btnmb').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // ── Task Start buttons (mini-tasks & body-booster) ──
  document.querySelectorAll('.task-start-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.task-card') || btn.closest('.bb-card');
      const duration = parseInt(btn.getAttribute('data-duration')) || 10;
      startTaskTimer(btn, card, duration);
    });
  });

  // ── Mind Reset: click row to toggle done ──
  // document.querySelectorAll('.mr-item').forEach(item => {
  //   item.addEventListener('click', () => {
  //     item.classList.toggle('done');
  //   });
  // });

  // ── Mood Lifting: click card to reflect ──
  document.querySelectorAll('.thought-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('reflected');
    });
  });

});

/* ──────────────────────────────────────────────
   Start a countdown timer on a task button.
   Uses a CSS transition on scaleX for the bar
   (more reliable than @keyframes + duration override).
────────────────────────────────────────────── */
function startTaskTimer(btn, card, duration) {
  btn.disabled  = true;
  btn.className = 'btn btn-timer';

  // Build button: full-width fill bar + countdown label on top
  btn.innerHTML =
    '<span class="timer-bar"></span>' +
    '<span class="timer-text">' + duration + 's</span>';

  var bar    = btn.querySelector('.timer-bar');
  var textEl = btn.querySelector('.timer-text');

  // Set the transition duration, then on the next two frames
  // kick off the shrink — double-rAF ensures the initial paint
  // happens before the transition fires.
  bar.style.transition = 'transform ' + duration + 's linear';

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      bar.style.transform = 'scaleX(0)';
    });
  });

  // Countdown text (updates every second)
  var remaining = duration;
  var interval  = setInterval(function () {
    remaining--;
    if (remaining > 0) {
      textEl.textContent = remaining + 's';
    } else {
      clearInterval(interval);
      markTaskDone(btn, card);
    }
  }, 1000);
}

/* Mark a task as completed after the timer finishes */
function markTaskDone(btn, card) {
  btn.innerHTML = 'Completed ✓';
  btn.className = 'btn btn-completed';
  btn.disabled  = true;

  if (!card) return;
  card.classList.add('completed');

  // ✅ SAVE PROGRESS HERE
  saveProgress(card);

  var circle = card.querySelector('.bb-check-circle');
  if (circle) {
    circle.classList.add('done');
    circle.textContent = '✓';
  }

  var leaf = card.querySelector('.task-leaf');
  if (leaf) leaf.textContent = '✓';
}

function saveProgress(card) {
  let storageKey;
  let items;

  // 🔥 Detect which page you're on
  if (card.classList.contains("bb-card")) {
    storageKey = "bodybooster-progress";
    items = document.querySelectorAll(".bb-card");
  } else {
    storageKey = "minitasks-progress";
    items = document.querySelectorAll(".task-card");
  }

  const completed = [];

  items.forEach((item, index) => {
    if (item.classList.contains("completed")) {
      completed.push(index);
    }
  });

  localStorage.setItem(storageKey, JSON.stringify(completed));
}

/* Update Mood button handler (called from onclick in HTML) */
function updateMood() {

  var selected = document.querySelector('.mood-btnmb.selected');
  var btn = document.querySelector('.update-mood-btnmb');

  if (!selected) {
    btn.textContent = 'Pick a mood first!';
    setTimeout(() => btn.textContent = 'Update Mood', 1500);
    return;
  }

  const mood = selected.dataset.mood;

  // SAVE MOOD TO BUTTERFLY SYSTEM
  AireData.logMood(mood);

  btn.textContent = 'Mood Updated ✓';
  btn.disabled = true;
  btn.style.background = '#3a6b35';

  setTimeout(() => {
    btn.textContent = 'Update Mood';
    btn.disabled = false;
    btn.style.background = '';
  }, 2500);
}
