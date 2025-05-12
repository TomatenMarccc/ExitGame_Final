startOrResumeTimer(); // 20 Minuten

function handleLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    // ✅ Hier kannst du die Login-Daten anpassen
    const correctUsername = "admin";
    const correctPassword = "1234";
  
    if (username === correctUsername && password === correctPassword) {
      window.location.href = "index5_1.html";
    } else {
      alert("Falsche Zugangsdaten!");
    }
  }