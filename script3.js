startOrResumeTimer(20 * 60); // 1200 Sekunden

const allSliders = document.querySelectorAll('.slider');
const sliders = [
  allSliders[2], // 3. Slider
  allSliders[4], // 5. Slider
  allSliders[1], // 2. Slider
  allSliders[3], // 4. Slider
  allSliders[0], // 1. Slider
];

const statusText = document.getElementById('status');
const timerText = document.getElementById('timer');
const lamp = document.getElementById('lamp');

let current = 0;
let nextTime = null;
let timerInterval;
lamp.classList.add('blinking');

// === HTTP-FUNKTIONEN ===
function sendSliderStatus(index, status) {
  fetch('http://dein-microcontroller.local/slider', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slider: index + 1,
      status: status,
    }),
  }).catch(err => console.error('Fehler beim Senden:', err));
}

function sendCompletionStatus() {
  fetch('http://dein-microcontroller.local/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true }),
  }).catch(err => console.error('Fehler beim Senden:', err));
}

// === RESET ===
function resetAll() {
  lamp.classList.remove('green', 'blinking');
  document.querySelectorAll('.slider').forEach(slider => {
    slider.value = 0;
    slider.classList.remove('done');

    const knopf = slider.closest('.slider-container').querySelector('.knopf');
    if (knopf) {
      knopf.style.top = '0px';
    }
  });
  current = 0;
  nextTime = null;
  statusText.textContent = "Fehler! Starte von vorn.";
  lamp.classList.add('blinking');
  clearInterval(timerInterval);
  timerText.textContent = "0.00 s";
  timerText.classList.remove('green', 'red');
}

// === COMPLETE ===
function complete() {
  clearInterval(timerInterval);
  statusText.textContent = "Die Reaktorstäbe wurden erfolgreich heruntergefahren";
  lamp.classList.remove('blinking');
  lamp.classList.add('green');

  sendCompletionStatus(); // ✅ HTTP für Erfolg

  const nextButton = document.getElementById('nextPageBtn');
  if (nextButton) {
    nextButton.style.display = 'block';
  }
}

// === TIMER ===
function timerActivation() {
  lamp.classList.add('blinking');

  if (timerInterval) clearInterval(timerInterval);
  const start = performance.now();

  timerInterval = setInterval(() => {
    let elapsed = (performance.now() - start) / 1000;
    timerText.textContent = `${elapsed.toFixed(2)} s`;

    if (elapsed >= 4 && elapsed <= 5) {
      timerText.classList.add('green');
      timerText.classList.remove('red');
    } else {
      timerText.classList.remove('green');
      timerText.classList.add('red');
    }
  }, 100);
}

// === SLIDER EVENTS ===
sliders.forEach((slider, index) => {
  slider.addEventListener('input', () => {
    const value = parseInt(slider.value);
    if (slider.classList.contains('done')) return;

    if (value >= 100) {
      if (sliders[current] === slider) {
        const now = performance.now();

        if (current === 0) {
          timerActivation();
          nextTime = now;
        } else {
          const elapsed = (now - nextTime) / 1000;
          if (elapsed < 4 || elapsed > 5) {
            sendSliderStatus(current, false); // ❌ falsche Zeit
            resetAll();
            return;
          }
        }

        sendSliderStatus(current, true); // ✅ korrekt
        slider.classList.add('done');
        current++;

        if (current < sliders.length) {
          timerActivation();
          nextTime = performance.now();
        } else {
          complete();
        }
      } else {
        sendSliderStatus(current, false); // ❌ falscher Slider
        resetAll();
      }
    }
  });
});

// === KNOPFBEWEGUNG ===
const sliderContainers = document.querySelectorAll('.slider-container');

sliderContainers.forEach(container => {
  const slider = container.querySelector('.slider');
  const knopf = container.querySelector('.knopf');

  const updateKnopf = () => {
    const value = parseInt(slider.value);
    const max = parseInt(slider.max);
    const min = parseInt(slider.min);
    const percent = (value - min) / (max - min);

    const sliderHeight = slider.offsetHeight;
    const knopfHeight = knopf.offsetHeight;

    const position = percent * (sliderHeight - knopfHeight);
    knopf.style.top = `${position}px`;
  };

  slider.addEventListener('input', updateKnopf);
  updateKnopf();
});