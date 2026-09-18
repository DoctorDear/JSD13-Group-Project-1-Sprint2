const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const rules = {
  required: (label) => (v) => (!v || !String(v).trim() ? `${label} is required` : ""),

  email: () => (v) =>
    !v ? "Email is required" : !EMAIL_RE.test(v) ? "Enter a valid email address" : "",

  password: ({ min = 8 } = {}) => (v) => {
    if (!v) return "Password is required";
    if (v.length < min) return `Password must be at least ${min} characters`;
    if (!/[A-Z]/.test(v)) return "Include at least one uppercase letter";
    if (!/[a-z]/.test(v)) return "Include at least one lowercase letter";
    if (!/\d/.test(v)) return "Include at least one number";
    return "";
  },

  loginPassword: () => (v) => (!v ? "Password is required" : ""),

  checked: (msg) => (v) => (v ? "" : msg),

  /** Ensures the new password differs from the old one. */
notSameAs: (otherField, msg) => (v, values) =>
  v && values?.[otherField] && v === values[otherField] ? msg : "",

};

/** Runs a schema ({ field: [validators] }) against values. Returns { field: message }. */
export function validate(values, schema) {
  const errors = {};
  for (const [field, validators] of Object.entries(schema)) {
    for (const fn of validators) {
      const msg = fn(values[field], values);
      if (msg) {
        errors[field] = msg;
        break;
      }
    }
  }
  return errors;
}

/** Password strength 0–4, for the meter on Register. */
export function passwordStrength(v = "") {
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  return score;
}