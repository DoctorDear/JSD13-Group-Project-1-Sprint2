// app.js
const form = document.getElementById("resetForm");
const emailEl = document.getElementById("email");
const passEl  = document.getElementById("password");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setError(input, message) {
  const box = document.querySelector(`.error[data-for="${input.id}"]`);
  box.textContent = message;
  input.classList.toggle("is-invalid", Boolean(message));
  return !message;
}

[emailEl, passEl].forEach((el) =>
  el.addEventListener("input", () => setError(el, ""))
);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const okEmail = setError(
    emailEl,
    EMAIL_RE.test(emailEl.value.trim()) ? "" : "Please enter a valid email address."
  );
  const okPass = setError(
    passEl,
    passEl.value.length >= 8 ? "" : "Password must be at least 8 characters."
  );

  if (!okEmail || !okPass) return;

  const btn = form.querySelector(".btn");
  btn.disabled = true;
  btn.textContent = "Resetting…";

  try {
    // await fetch("/api/reset-password", { method: "POST", body: JSON.stringify({...}) })
    await new Promise((r) => setTimeout(r, 1200));
    alert("Password reset link sent!");
    form.reset();
  } finally {
    btn.disabled = false;
    btn.textContent = "Reset password";
  }
});