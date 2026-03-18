const TOTAL_STEPS = 5;
const completedSteps = new Set();

function toggleStep(index) {
  // Don't re-open a completed step
  if (completedSteps.has(index)) return;

  const panel = document.getElementById(`panel-${index}`);
  const arrow  = document.getElementById(`arrow-${index}`);

  const isOpen = panel.classList.contains('open');
  // Close all panels first
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.step-arrow').forEach(a => a.classList.remove('open'));

  if (!isOpen) {
    panel.classList.add('open');
    arrow.classList.add('open');
    // Focus first empty input
    const firstInput = panel.querySelector('.step-input');
    if (firstInput) firstInput.focus();
  }
}

function doneStep(event, index) {
  event.stopPropagation();

  completedSteps.add(index);

  // Mark the button row as done
  const stepBtn = document.getElementById(`step-0`.replace('0', index));
  document.getElementById(`step-${index}`).classList.add('done');

  // Change icon to ✓
  const icon = document.getElementById(`step-${index}`).querySelector('.step-icon');
  if (icon) icon.textContent = '✓';

  // Close panel
  const panel = document.getElementById(`panel-${index}`);
  const arrow  = document.getElementById(`arrow-${index}`);
  panel.classList.remove('open');
  arrow.classList.remove('open');
  arrow.textContent = '✓';
  arrow.style.color = '#2d5c28';

  // Update progress
  updateProgress();
}

function updateProgress() {
  const done  = completedSteps.size;
  const pct   = (done / TOTAL_STEPS) * 100;

  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('progress-label').textContent = `${done} / ${TOTAL_STEPS} complete`;

  if (done === TOTAL_STEPS) {
    const msg = document.getElementById('completion-msg');
    msg.classList.add('visible');
    msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
