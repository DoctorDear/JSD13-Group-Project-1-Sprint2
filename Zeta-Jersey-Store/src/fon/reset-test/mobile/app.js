/* app.js */
const form  = document.getElementById('resetForm');
const email = document.getElementById('email');
const error = document.getElementById('error');
const btn   = form.querySelector('.btn');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const showError = (msg) => {
  error.textContent = msg;
  error.hidden = !msg;
  email.classList.toggle('is-invalid', Boolean(msg));
};

email.addEventListener('input', () => showError(''));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = email.value.trim();

  if (!value)                return showError('Please enter your email.');
  if (!EMAIL_RE.test(value)) return showError('That email doesn’t look right.');

  btn.disabled = true;
  btn.textContent = 'Sending…';

  try {
    // await fetch('/api/auth/reset', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email:value }) });
    await new Promise(r => setTimeout(r, 900));      // demo delay
    btn.textContent = 'Link sent ✓';
  } catch {
    showError('Something went wrong. Try again.');
    btn.disabled = false;
    btn.textContent = 'Submit email address';
  }
});