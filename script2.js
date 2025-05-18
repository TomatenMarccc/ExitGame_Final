startOrResumeTimer(); // 20 Minuten

const inputs = document.querySelectorAll('.number-inputs input');
let idChecked = false;

inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        if (input.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === "Backspace" && input.value === '' && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

document.getElementById('check-btn').addEventListener('click', () => {
    if (idChecked) return;

    let enteredID = '';
    inputs.forEach(input => enteredID += input.value);

    const correctID = "46108";

    if (enteredID === correctID) {
        idChecked = true;

        const instruction = document.getElementById('instruction');
        instruction.classList.remove('hidden');

        // 🛰️ HTTP-Request an den Mikrocontroller senden
        fetch('http://192.168.0.123/check') // <-- Deine IP / Route hier anpassen
            .then(res => res.json())
            .then(data => {
                console.log('Antwort vom Mikrocontroller:', data);
                if (data.status === 'ok') {
                    // Nur wenn Rückmeldung positiv ist -> Weiterbutton nach 2 Sekunden zeigen
                    setTimeout(() => {
                        const nextButton = document.getElementById('nextPageBtn');
                        if (nextButton) {
                            nextButton.style.display = 'block';
                        }
                    }, 2000);
                } else {
                    alert("⚠️ Mikrocontroller-Antwort negativ.");
                }
            })
            .catch(err => {
                console.error("❌ Fehler bei der Kommunikation mit dem Mikrocontroller:", err);
                alert("❌ Keine Verbindung zum Mikrocontroller.");
            });

    } else {
        alert("❌ Falsche ID! Bitte nochmal prüfen.");
    }
});