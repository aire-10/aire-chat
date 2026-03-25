const STORAGE_KEY = "grounding-progress";
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

  //✅ SAVE steps
  saveSteps();

  // Mark the button row as done
  const stepBtn = document.getElementById(`step-${index}`);
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

function saveInputs() {
  const allInputs = document.querySelectorAll(".step-input");

  const values = Array.from(allInputs).map(input => input.value);

  localStorage.setItem(STORAGE_KEY + "-inputs", JSON.stringify(values));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".step-input").forEach(input => {
    input.addEventListener("input", saveInputs);
  });
});

function loadInputs() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY + "-inputs")) || [];

  const allInputs = document.querySelectorAll(".step-input");

  allInputs.forEach((input, index) => {
    if (saved[index]) {
      input.value = saved[index];
    }
  });
}

function autoCompleteStepsFromInputs() {
  for (let i = 0; i < TOTAL_STEPS; i++) {
    const inputs = document.querySelectorAll(`#inputs-${i} .step-input`);
    
    const allFilled = Array.from(inputs).every(input => input.value.trim() !== "");

    if (allFilled && !completedSteps.has(i)) {
      completedSteps.add(i);

      const step = document.getElementById(`step-${i}`);
      if (step) {
        step.classList.add("done");
        const icon = step.querySelector(".step-icon");
        if (icon) icon.textContent = "✓";
      }

      const arrow = document.getElementById(`arrow-${i}`);
      if (arrow) {
        arrow.textContent = "✓";
        arrow.style.color = "#2d5c28";
      }
    }
  }

  updateProgress();
}

function saveSteps() {
  const stepsArray = Array.from(completedSteps);
  localStorage.setItem(STORAGE_KEY + "-steps", JSON.stringify(stepsArray));
}

function loadSteps() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY + "-steps")) || [];

  saved.forEach(index => {
    completedSteps.add(index);

    // Restore UI
    const step = document.getElementById(`step-${index}`);
    if (step) {
      step.classList.add("done");

      const icon = step.querySelector(".step-icon");
      if (icon) icon.textContent = "✓";
    }

    const arrow = document.getElementById(`arrow-${index}`);
    if (arrow) {
      arrow.textContent = "✓";
      arrow.style.color = "#2d5c28";
    }
  });

  updateProgress();
}

document.addEventListener("DOMContentLoaded", () => {

  loadInputs();
  loadSteps();
  autoCompleteStepsFromInputs();

});


