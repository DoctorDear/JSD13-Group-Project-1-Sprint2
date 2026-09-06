// script.js
const confirmBtn = document.getElementById("confirmBtn");
const resendBtn  = document.getElementById("resendBtn");
const status     = document.getElementById("status");

const setStatus = (msg) => { status.textContent = msg; };

const fakeRequest = (ms = 1200) => new Promise((res) => setTimeout(res, ms));

confirmBtn.addEventListener("click", async () => {
  confirmBtn.disabled = true;
  setStatus("Confirming your email…");
  await fakeRequest();
  setStatus("✅ Your email has been confirmed. Redirecting…");
  confirmBtn.disabled = false;
});

resendBtn.addEventListener("click", async () => {
  resendBtn.disabled = true;
  setStatus("Sending a new link…");
  await fakeRequest(900);

  let seconds = 30;
  setStatus(`📩 Email sent! You can resend again in ${seconds}s`);

  const timer = setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      clearInterval(timer);
      resendBtn.disabled = false;
      setStatus("");
      return;
    }
    setStatus(`📩 Email sent! You can resend again in ${seconds}s`);
  }, 1000);
});