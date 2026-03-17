// ─── MOOD LIFTING PAGE - CROSS-OFF FUNCTIONALITY ───

// Toggle cross-off state when a thought card is clicked
function toggleCrossOff(card) {
  card.classList.toggle('crossed-off');
  
  // Optional: Save progress to localStorage
  saveThoughtProgress();
  
  // Optional: Update counter if it exists
  updateThoughtCounter();
}

// Reset all thoughts to uncrossed state
function resetAllThoughts() {
  const cards = document.querySelectorAll('.thought-card');
  cards.forEach(card => {
    card.classList.remove('crossed-off');
  });
  
  // Clear saved progress
  localStorage.removeItem('mood_lifting_progress');
  
  // Update counter
  updateThoughtCounter();
}

// Save which thoughts are crossed off to localStorage
function saveThoughtProgress() {
  const cards = document.querySelectorAll('.thought-card');
  const progress = [];
  
  cards.forEach((card, index) => {
    progress.push({
      index: index,
      crossedOff: card.classList.contains('crossed-off')
    });
  });
  
  localStorage.setItem('mood_lifting_progress', JSON.stringify(progress));
}

// Load saved progress from localStorage
function loadThoughtProgress() {
  const saved = localStorage.getItem('mood_lifting_progress');
  if (!saved) return;
  
  try {
    const progress = JSON.parse(saved);
    const cards = document.querySelectorAll('.thought-card');
    
    progress.forEach(item => {
      if (item.crossedOff && cards[item.index]) {
        cards[item.index].classList.add('crossed-off');
      }
    });
  } catch (e) {
    console.error('Error loading saved progress:', e);
  }
}

// Update counter showing how many thoughts are completed
function updateThoughtCounter() {
  const cards = document.querySelectorAll('.thought-card');
  const crossedCount = Array.from(cards).filter(card => 
    card.classList.contains('crossed-off')
  ).length;
  
  // Check if counter exists, if not create it
  let counter = document.querySelector('.ml-counter');
  if (!counter) {
    counter = document.createElement('div');
    counter.className = 'ml-counter';
    const header = document.querySelector('.ml-header');
    if (header) {
      header.appendChild(counter);
    }
  }
  
  counter.textContent = `${crossedCount} / ${cards.length} thoughts reflected`;
  
  // Add a little message when all are done
  if (crossedCount === cards.length && cards.length > 0) {
    counter.innerHTML = `✨ All done! You've reflected on all thoughts! ✨`;
    counter.style.color = '#2d5c28';
    counter.style.fontWeight = 'bold';
  } else {
    counter.style.color = '';
    counter.style.fontWeight = '';
  }
}

// Add double-click to toggle cross-off (alternative)
function setupDoubleClick() {
  const cards = document.querySelectorAll('.thought-card');
  cards.forEach(card => {
    card.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      this.classList.toggle('crossed-off');
      saveThoughtProgress();
      updateThoughtCounter();
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load saved progress
  loadThoughtProgress();
  
  // Create and update counter
  updateThoughtCounter();
  
  // Setup double-click as alternative (optional)
  // setupDoubleClick();
  
  // Add keyboard support (press 'r' to reset)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      // Only reset if not typing in an input
      if (document.activeElement.tagName !== 'INPUT' && 
          document.activeElement.tagName !== 'TEXTAREA') {
        resetAllThoughts();
      }
    }
  });
});

// Export functions for global use
window.toggleCrossOff = toggleCrossOff;
window.resetAllThoughts = resetAllThoughts;