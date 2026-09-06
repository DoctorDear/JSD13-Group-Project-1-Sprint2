const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = form.email;
  const password = form.password;

  [email, password].forEach((el) => el.classList.remove("invalid"));
  msg.classList.remove("ok");

  if (!isEmail(email.value.trim())) {
    email.classList.add("invalid");
    msg.textContent = "Please enter a valid email address.";
    return email.focus();
  }
  if (password.value.length < 6) {
    password.classList.add("invalid");
    msg.textContent = "Password must be at least 6 characters.";
    return password.focus();
  }

  msg.classList.add("ok");
  msg.textContent = "Signing you in…";
  console.log({ email: email.value.trim(), password: password.value });
});