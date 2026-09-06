const form = document.getElementById("resetForm");
const email = document.getElementById("email");
const error = document.getElementById("error");
const success = document.getElementById("success");
const btn = document.getElementById("submitBtn");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  error.textContent = "";
  success.textContent = "";
  email.classList.remove("is-invalid");

  const value = email.value.trim();

  if (!value) {
    error.textContent = "Please enter your email address.";
    email.classList.add("is-invalid");
    return;
  }
  if (!EMAIL_RE.test(value)) {
    error.textContent = "That doesn't look like a valid email.";
    email.classList.add("is-invalid");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Sending...";

  try {
    // Replace with your real endpoint
    await new Promise((r) => setTimeout(r, 1200));
    success.textContent = `Reset link sent to ${value}. Check your inbox!`;
    form.reset();
  } catch (err) {
    error.textContent = "Something went wrong. Please try again.";
  } finally {
    btn.disabled = false;
    btn.textContent = "Summit email address";
  }
});

email.addEventListener("input", () => {
  error.textContent = "";
  email.classList.remove("is-invalid");
});