const form = document.getElementById('verifyForm');
const email = document.getElementById('email');
const password = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const success = document.getElementById('success');
const togglePwd = document.getElementById('togglePwd');

togglePwd.addEventListener('click', () => {
  const isPwd = password.type === 'password';
  password.type = isPwd ? 'text' : 'password';
  togglePwd.textContent = isPwd ? 'Hide' : 'Show';
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  emailError.textContent = '';
  passwordError.textContent = '';
  success.textContent = '';

  let valid = true;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRe.test(email.value.trim())) {
    emailError.textContent = 'Please enter a valid email address.';
    valid = false;
  }
  if (password.value.length < 8) {
    passwordError.textContent = 'Password must be at least 8 characters.';
    valid = false;
  }
  if (!valid) return;

  const btn = form.querySelector('.btn-submit');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = 'Reset password';
    success.textContent = `Reset link sent to ${email.value.trim()}`;
    form.reset();
  }, 1200);
});