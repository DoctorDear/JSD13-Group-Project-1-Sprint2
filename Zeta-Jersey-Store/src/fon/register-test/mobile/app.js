// app.js
const form = document.getElementById('registerForm');

const showError = (input, msg) => {
  input.classList.toggle('invalid', Boolean(msg));
  input.parentElement.querySelector('.error').textContent = msg;
};

const validators = {
  firstName: v => (v.trim() ? '' : 'First name is required'),
  lastName:  v => (v.trim() ? '' : 'Last name is required'),
  email:     v => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email'),
  password:  v => (v.length >= 8 ? '' : 'Password must be at least 8 characters'),
};

form.addEventListener('input', e => {
  const fn = validators[e.target.name];
  if (fn) showError(e.target, fn(e.target.value));
});

form.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;

  Object.keys(validators).forEach(name => {
    const input = form.elements[name];
    const msg = validators[name](input.value);
    showError(input, msg);
    if (msg) valid = false;
  });

  if (!form.elements.terms.checked) {
    valid = false;
    alert('Please accept the Terms & Conditions.');
  }
  if (!valid) return;

  const data = Object.fromEntries(new FormData(form).entries());
  console.log('Register payload:', data);
  // fetch('/api/register', { method:'POST', body: JSON.stringify(data) })
});

document.querySelectorAll('.social-btn').forEach(btn =>
  btn.addEventListener('click', () => console.log(`${btn.textContent.trim()} sign-in`))
);