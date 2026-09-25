export function validateProductForm(form) {
  const errors = {};
  if (!form.name?.trim()) errors.name = "Enter a product name.";
  else if (form.name.length > 120) errors.name = "Name must be 120 characters or fewer.";
  if (!form.description?.trim()) errors.description = "Enter a description.";
  if (form.price === "" || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) errors.price = "Enter a valid price of zero or more.";
  if (form.stock === "" || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errors.stock = "Enter a whole number of zero or more.";
  if (!form.date || Number.isNaN(new Date(form.date).getTime())) errors.date = "Select a valid date.";
  if (!form.tag?.trim()) errors.tag = "Enter at least one tag.";
  return errors;
}
