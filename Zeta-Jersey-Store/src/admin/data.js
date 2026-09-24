
export const initialSettings = {
  company: "InventoryPro LLC",
  email: "contact@inventorypro.com",
  phone: "+1 (555) 123-4567",
  address: "123 Business Street, Suite 100",
  city: "New York",
  currency: "USD",
  tax: 10,
  emails: true,
  lowStock: true,
  reminders: false,
};
export const initialTasks = [
  {
    id: "task-1",
    title: "Restock low inventory products",
    description: "Contact suppliers for laptop stands and wireless mice.",
    priority: "High",
    status: "To do",
    due: "2026-09-25",
  },
  {
    id: "task-2",
    title: "Review pending quotation",
    description: "Follow up with Tech Solutions Inc.",
    priority: "Medium",
    status: "In progress",
    due: "2026-09-24",
  },
  {
    id: "task-3",
    title: "Complete warehouse stock audit",
    description: "Reconcile the latest inventory count.",
    priority: "Low",
    status: "Done",
    due: "2026-09-22",
  },
];

export const stockStatus = (p) =>
  p.stock === 0
    ? "Out of Stock"
    : p.stock <= p.reorder
      ? "Low Stock"
      : "In Stock";
export const matches = (query, ...values) =>
  values.join(" ").toLowerCase().includes(query.trim().toLowerCase());
