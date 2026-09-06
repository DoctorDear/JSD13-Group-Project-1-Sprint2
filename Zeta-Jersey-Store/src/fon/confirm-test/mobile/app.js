/* app.js */
(function () {
  const confirmBtn = document.getElementById('confirmBtn');
  const resendBtn  = document.getElementById('resendBtn');
  const status     = document.getElementById('status');

  const setStatus = (msg) => { status.textContent = msg; };

  async function fakeRequest(ms = 900) {
    return new Promise((res) => setTimeout(res, ms));
  }

  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Confirming…';
    setStatus('');
    await fakeRequest();
    confirmBtn.textContent = 'Confirmed ✓';
    setStatus('Your email has been confirmed.');
  });

  resendBtn.addEventListener('click', async () => {
    if (resendBtn.disabled) return;
    resendBtn.disabled = true;
    setStatus('Sending…');
    await fakeRequest(700);

    let left = 30;
    setStatus('Email sent. Check your inbox.');
    resendBtn.textContent = `Resend in ${left}s`;

    const timer = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(timer);
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend email';
      } else {
        resendBtn.textContent = `Resend in ${left}s`;
      }
    }, 1000);
  });
})();