import { useState, useCallback, useRef, useEffect } from "react";
import { validate } from "../lib/validation";
import { ApiError } from "../lib/api";

export default function useForm(initialValues, schema, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const abortRef = useRef(null);
  const mounted = useRef(true);
  useEffect(() => () => {
    mounted.current = false;
    abortRef.current?.abort();
  }, []);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const next = type === "checkbox" ? checked : value;
      setValues((prev) => ({ ...prev, [name]: next }));
      setFormError("");
      setErrors((prev) =>
        touched[name] || prev[name]
          ? { ...prev, [name]: validate({ ...values, [name]: next }, schema)[name] || "" }
          : prev
      );
    },
    [values, touched, schema]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({ ...prev, [name]: validate(values, schema)[name] || "" }));
    },
    [values, schema]
  );

  const focusFirst = (obj) => {
    const first = Object.keys(obj)[0];
    if (first) document.querySelector(`[name="${first}"]`)?.focus();
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setFormError("");

      const clientErrors = validate(values, schema);
      setErrors(clientErrors);
      setTouched(Object.keys(schema).reduce((a, k) => ({ ...a, [k]: true }), {}));
      if (Object.keys(clientErrors).length) return focusFirst(clientErrors);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setSubmitting(true);
      try {
        await onSubmit(values, { signal: abortRef.current.signal });
      } catch (err) {
        if (!mounted.current) return;

        if (err instanceof ApiError) {
          const mapped = Object.entries(err.fieldErrors)
            .filter(([k]) => k in schema)
            .reduce((a, [k, v]) => ({ ...a, [k]: v }), {});
          const unmapped = Object.keys(err.fieldErrors).filter((k) => !(k in schema));

          if (Object.keys(mapped).length) {
            setErrors((prev) => ({ ...prev, ...mapped }));
            setTouched((prev) => ({
              ...prev,
              ...Object.keys(mapped).reduce((a, k) => ({ ...a, [k]: true }), {}),
            }));
            focusFirst(mapped);
          }
          if (!Object.keys(mapped).length || unmapped.length) setFormError(err.message);
        } else {
          setFormError("Unexpected error. Please try again.");
        }
      } finally {
        if (mounted.current) setSubmitting(false);
      }
    },
    [values, schema, onSubmit]
  );

  const errorFor = (name) => (touched[name] ? errors[name] : "");

  return {
    values, errors, touched, formError, submitting,
    errorFor, handleChange, handleBlur, handleSubmit,
    setValues, setFormError,
  };
}