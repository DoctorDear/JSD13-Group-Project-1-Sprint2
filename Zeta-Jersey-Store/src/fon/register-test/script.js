const form = document.getElementById("registerForm");
const togglePw = document.getElementById("togglePw");
const pw = document.getElementById("password");
const terms = document.getElementById("terms");

togglePw.addEventListener("click", () => {
  const isHidden = pw.type === "password";
  pw.type = isHidden ? "text" : "password";
  togglePw.textContent = isHidden ? "🙈" : "👁";
});

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const errors = [];

  document.querySelectorAll("input").forEach((i) => i.classList.remove("error"));

  if (!data.firstName?.trim()) { errors.push("First name is required"); firstName.classList.add("error"); }
  if (!data.lastName?.trim())  { errors.push("Last name is required");  lastName.classList.add("error"); }
  if (!isEmail(data.email || "")) { errors.push("Valid email is required"); email.classList.add("error"); }
  if ((data.password || "").length < 8) { errors.push("Password must be 8+ characters"); pw.classList.add("error"); }
  if (!terms.checked) errors.push("You must accept the Terms & Conditions");

  if (errors.length) return alert(errors.join("\n"));

  console.log("Submitting:", data);
  alert(`Welcome, ${data.firstName}! Account created 🎉`);
  form.reset();
  terms.checked = true;
});

document.querySelectorAll(".btn-social").forEach((btn) =>
  btn.addEventListener("click", () => console.log(`OAuth → ${btn.textContent.trim()}`))
);