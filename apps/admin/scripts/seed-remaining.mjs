/**
 * One-time seed script: pushes the existing mock Products, Customers,
 * Bookings, and Notifications into Sanity so the admin app has real data
 * immediately after switching off mock arrays.
 *
 * Usage: node scripts/seed-remaining.mjs
 * Reads Sanity credentials from apps/admin/.env.local (never printed).
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, "..", ".env.local");
  const content = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

const env = loadEnv();

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: env.SANITY_API_VERSION || "2024-06-01",
  token: env.SANITY_API_TOKEN,
  useCdn: false,
});

const MOCK_PRODUCTS = [
  { id: "prod-1", name: "Rose Hip Facial Oil", brand: "Oryx Naturals", volumeOrWeight: "30 ml", quantity: 24, price: 150, category: "Skincare", image: null, status: "Active" },
  { id: "prod-2", name: "Lavender Body Scrub", brand: "Oryx Naturals", volumeOrWeight: "250 g", quantity: 16, price: 95, category: "Body Care", image: null, status: "Active" },
  { id: "prod-3", name: "Argan Shampoo", brand: "Desert Essence", volumeOrWeight: "500 ml", quantity: 8, price: 120, category: "Hair Care", image: null, status: "Active" },
  { id: "prod-4", name: "Eucalyptus Essential Oil", brand: "Pure Botanics", volumeOrWeight: "15 ml", quantity: 32, price: 65, category: "Aromatherapy", image: null, status: "Active" },
  { id: "prod-5", name: "Bamboo Massage Roller", brand: "Oryx Spa Tools", volumeOrWeight: "200 g", quantity: 5, price: 45, category: "Accessories", image: null, status: "Active" },
  { id: "prod-6", name: "Collagen Booster Serum", brand: "Oryx Naturals", volumeOrWeight: "50 ml", quantity: 0, price: 210, category: "Skincare", image: null, status: "Inactive" },
  { id: "prod-7", name: "Peppermint Foot Cream", brand: "Desert Essence", volumeOrWeight: "100 ml", quantity: 19, price: 75, category: "Body Care", image: null, status: "Active" },
  { id: "prod-8", name: "Biotin Hair Supplement", brand: "Wellness Co", volumeOrWeight: "60 capsules", quantity: 11, price: 180, category: "Supplements", image: null, status: "Active" },
];

const MOCK_CUSTOMERS = [
  { id: "cus-1", name: "Sarah Jenkins", email: "sarah.j@example.com", phone: "+974 5555 1234", avatar: null, tier: "Gold", totalSpent: 4500, lastVisit: "2026-07-10", status: "Active", age: "32" },
  { id: "cus-2", name: "Aisha Al-Thani", email: "aisha.althani@example.com", phone: "+974 3333 5678", avatar: null, tier: "Platinum", totalSpent: 12500, lastVisit: "2026-07-12", status: "Active" },
  { id: "cus-3", name: "Emma Wilson", email: "emma.w@example.com", phone: "+974 6666 9012", avatar: null, tier: "Silver", totalSpent: 1200, lastVisit: "2026-06-25", status: "Active" },
  { id: "cus-4", name: "Fatima Hassan", email: "fatima.h@example.com", phone: "+974 7777 3456", avatar: null, tier: "Bronze", totalSpent: 450, lastVisit: "2026-07-01", status: "Inactive" },
];

const MOCK_BOOKINGS = [
  { id: "B-1029", customerName: "Sarah Al M.", phone: "+974 5555 1234", services: [{ name: "Signature ORYX Massage", options: ["Hot Stones"] }], date: "2026-07-14", time: "14:30", status: "Confirmed", amount: 145 },
  { id: "B-1030", customerName: "Fatima K.", phone: "+974 5555 5678", services: [{ name: "Radiance Facial", options: ["LED Light Therapy"] }], date: "2026-07-14", time: "16:00", status: "Pending", amount: 125 },
  { id: "B-1031", customerName: "Jessica R.", phone: "+974 5555 9012", services: [{ name: "Deep Tissue Therapy", options: [] }], date: "2026-07-15", time: "10:00", status: "Confirmed", amount: 150 },
  { id: "B-1032", customerName: "Aisha B.", phone: "+974 5555 3456", services: [{ name: "Signature ORYX Massage", options: ["Aromatherapy", "Deep Tissue Upgrade"] }], date: "2026-07-14", time: "11:00", status: "Completed", amount: 155 },
  { id: "B-1033", customerName: "Mariam H.", phone: "+974 5555 7890", services: [{ name: "Radiance Facial", options: [] }], date: "2026-07-16", time: "13:00", status: "Cancelled", amount: 95 },
  { id: "B-1034", customerName: "Noura A.", phone: "+974 5555 1111", services: [{ name: "Deep Tissue Therapy", options: [] }], date: "2026-07-14", time: "09:00", status: "Confirmed", amount: 150 },
  { id: "B-1035", customerName: "Chloe D.", phone: "+974 5555 2222", services: [{ name: "Signature ORYX Massage", options: ["Hot Stones"] }], date: "2026-07-14", time: "11:30", status: "Pending", amount: 145 },
  { id: "B-1036", customerName: "Latifa Q.", phone: "+974 5555 3333", services: [{ name: "Radiance Facial", options: ["LED Light Therapy"] }], date: "2026-07-14", time: "14:00", status: "Confirmed", amount: 125 },
  { id: "B-1037", customerName: "Sara W.", phone: "+974 5555 4444", services: [{ name: "Signature ORYX Massage", options: [] }, { name: "Radiance Facial", options: [] }], date: "2026-07-14", time: "14:45", status: "Pending", amount: 215 },
  { id: "B-1038", customerName: "Emily S.", phone: "+974 5555 5555", services: [{ name: "Deep Tissue Therapy", options: [] }], date: "2026-07-14", time: "18:00", status: "Completed", amount: 150 },
];

const MOCK_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "Booking",
    title: "New Booking Request",
    message: "Sarah Jenkins requested a 60 min Signature Massage for tomorrow at 2:00 PM.",
    timestamp: "Just now",
    status: "Unread",
    isStarred: false,
    bookingData: {
      customerId: "cust-1",
      customerName: "Sarah Jenkins",
      customerPhone: "+974 5555 1234",
      serviceName: "Signature Massage",
      duration: "60 mins",
      options: ["Aromatherapy"],
      price: 350,
      date: "Tomorrow, 15 July 2026",
      time: "2:00 PM",
      staffName: "Emma",
      status: "Pending",
    },
  },
  {
    id: "notif-2",
    type: "Stock",
    title: "Low Stock Alert",
    message: "Bamboo Massage Roller is running low. Only 5 items remaining.",
    timestamp: "2 hours ago",
    status: "Unread",
    isStarred: true,
    actionUrl: "/products",
  },
  {
    id: "notif-3",
    type: "Booking",
    title: "New Booking Request",
    message: "Michael Chen requested a Deep Tissue Massage with Hot Stones.",
    timestamp: "4 hours ago",
    status: "Unread",
    isStarred: false,
    bookingData: {
      customerId: "cust-2",
      customerName: "Michael Chen",
      customerPhone: "+974 5555 9876",
      serviceName: "Deep Tissue Massage",
      duration: "90 mins",
      options: ["Hot Stones", "Extra Scalp Massage"],
      price: 520,
      date: "Friday, 17 July 2026",
      time: "10:30 AM",
      staffName: "David",
      status: "Pending",
    },
  },
  {
    id: "notif-4",
    type: "Stock",
    title: "Out of Stock",
    message: "Collagen Booster Serum is completely out of stock. Please reorder.",
    timestamp: "5 hours ago",
    status: "Read",
    actionUrl: "/products",
  },
];

function withServiceKeys(services) {
  return (services ?? []).map((svc, i) => ({ ...svc, _key: `svc-${i}-${svc.name}` }));
}

async function seedEntity(type, docs, buildDoc) {
  const existing = await client.fetch(`count(*[_type == $type])`, { type });
  if (existing > 0) {
    console.log(`Skipping ${type}: ${existing} document(s) already exist.`);
    return;
  }
  const transaction = client.transaction();
  for (const doc of docs) {
    transaction.createOrReplace(buildDoc(doc));
  }
  const result = await transaction.commit();
  console.log(`Seeded ${result.results.length} ${type} document(s).`);
}

async function seed() {
  await seedEntity("product", MOCK_PRODUCTS, (p) => ({
    _id: `product-${p.id}`,
    _type: "product",
    name: p.name,
    brand: p.brand,
    volumeOrWeight: p.volumeOrWeight,
    quantity: p.quantity,
    price: p.price,
    category: p.category,
    image: p.image,
    status: p.status,
  }));

  await seedEntity("customer", MOCK_CUSTOMERS, (c) => ({
    _id: `customer-${c.id}`,
    _type: "customer",
    name: c.name,
    email: c.email,
    phone: c.phone,
    avatar: c.avatar,
    tier: c.tier,
    totalSpent: c.totalSpent,
    lastVisit: c.lastVisit,
    status: c.status,
    age: c.age,
  }));

  await seedEntity("booking", MOCK_BOOKINGS, (b) => ({
    _id: `booking-${b.id}`,
    _type: "booking",
    customerName: b.customerName,
    phone: b.phone,
    services: withServiceKeys(b.services),
    date: b.date,
    time: b.time,
    status: b.status,
    amount: b.amount,
  }));

  await seedEntity("notification", MOCK_NOTIFICATIONS, (n) => ({
    _id: `notification-${n.id}`,
    _type: "notification",
    type: n.type,
    title: n.title,
    message: n.message,
    timestamp: n.timestamp,
    status: n.status,
    isStarred: n.isStarred ?? false,
    actionUrl: n.actionUrl,
    bookingData: n.bookingData,
  }));
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
