// app.js
const form = document.getElementById('loginForm');
const email = document.getElementById('email');
const password = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setError(input, node, msg) {
  node.textContent = msg;
  input.classList.toggle('invalid', Boolean(msg));
  return !msg;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const okEmail = setError(email, emailError,
    !email.value.trim() ? 'Email is required'
    : !EMAIL_RE.test(email.value.trim()) ? 'Enter a valid email' : '');

  const okPass = setError(password, passwordError,
    !password.value ? 'Password is required'
    : password.value.length < 6 ? 'Minimum 6 characters' : '');

  if (!okEmail || !okPass) return;

  const btn = form.querySelector('.btn');
  btn.disabled = true;
  btn.textContent = 'Logging in...';

  try {
    // await fetch('/api/login', { method:'POST', body: JSON.stringify({...}) })
    await new Promise(r => setTimeout(r, 900));
    console.log('Login:', { email: email.value, password: password.value });
  } finally {
    btn.disabled = false;
    btn.textContent = 'Log in';
  }
});

[email, password].forEach(i =>
  i.addEventListener('input', () => i.classList.remove('invalid'))
);