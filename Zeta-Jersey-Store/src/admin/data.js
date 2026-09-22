import productData from "../data/products.json";

export const initialProducts = productData.map((product) => ({
  id: product.id,
  name: product.name,
  sku: product.id.toUpperCase(),
  category: product.team || "Jerseys",
  stock: product.quantity ?? 0,
  price: product.price ?? 0,
  reorder: 20,
  cost: 0,
  supplier: product.brand || "",
  barcode: "",
  description: product.description || "",
  brand: product.brand,
  team: product.team,
  imageUrl: product.imageUrl,
  originalPrice: product.originalPrice,
  isAvailable: product.isAvailable,
}));

export const initialCustomers = [
  ["Acme Corporation", "contact@acme.com", "+1 (555) 123-4567", 24, 48920.5],
  [
    "Tech Solutions Inc",
    "info@techsolutions.com",
    "+1 (555) 234-5678",
    18,
    32450,
  ],
  ["Global Enterprises", "sales@global.com", "+1 (555) 345-6789", 35, 89200.75],
  ["StartUp Labs", "hello@startuplabs.com", "+1 (555) 456-7890", 8, 12500],
  [
    "Enterprise Corp",
    "contact@enterprise.com",
    "+1 (555) 567-8901",
    42,
    125600,
  ],
  [
    "Digital Agency",
    "team@digitalagency.com",
    "+1 (555) 678-9012",
    15,
    28450.5,
  ],
].map(([name, email, phone, orders, spent], i) => ({
  id: `customer-${i}`,
  name,
  email,
  phone,
  orders,
  spent,
  status: i === 5 ? "Inactive" : "Active",
}));

export const initialMovements = initialProducts.map((p, i) => ({
  id: `movement-${i}`,
  productId: p.id,
  name: p.name,
  sku: p.sku,
  type: "Stock In",
  quantity: p.stock,
  source: "Zeta catalog seed",
  date: `2026-01-${28 - i}T10:30:00`,
}));

export const initialOrders = [
  {
    id: "INV-1234",
    customer: "Acme Corporation",
    total: 2340,
    status: "Paid",
    date: "2026-01-28",
  },
  {
    id: "QUO-5678",
    customer: "Tech Solutions Inc",
    total: 4580,
    status: "Pending",
    date: "2026-01-28",
  },
  {
    id: "INV-1235",
    customer: "Global Enterprises",
    total: 1200,
    status: "Paid",
    date: "2026-01-27",
  },
  {
    id: "INV-1236",
    customer: "Enterprise Corp",
    total: 8290,
    status: "Processing",
    date: "2026-01-26",
  },
];

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
