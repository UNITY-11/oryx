export type BookingStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  service: string;
  addons: string[];
  date: string;
  time: string;
  status: BookingStatus;
  amount: number;
}

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "B-1029",
    customerName: "Sarah Al M.",
    phone: "+974 5555 1234",
    service: "Signature ORYX Massage",
    addons: ["Hot Stones"],
    date: "2026-07-14",
    time: "14:30",
    status: "Confirmed",
    amount: 145,
  },
  {
    id: "B-1030",
    customerName: "Fatima K.",
    phone: "+974 5555 5678",
    service: "Radiance Facial",
    addons: ["LED Light Therapy"],
    date: "2026-07-14",
    time: "16:00",
    status: "Pending",
    amount: 125,
  },
  {
    id: "B-1031",
    customerName: "Jessica R.",
    phone: "+974 5555 9012",
    service: "Deep Tissue Therapy",
    addons: [],
    date: "2026-07-15",
    time: "10:00",
    status: "Confirmed",
    amount: 150,
  },
  {
    id: "B-1032",
    customerName: "Aisha B.",
    phone: "+974 5555 3456",
    service: "Signature ORYX Massage",
    addons: ["Aromatherapy", "Deep Tissue Upgrade"],
    date: "2026-07-14",
    time: "11:00",
    status: "Completed",
    amount: 155,
  },
  {
    id: "B-1033",
    customerName: "Mariam H.",
    phone: "+974 5555 7890",
    service: "Radiance Facial",
    addons: [],
    date: "2026-07-16",
    time: "13:00",
    status: "Cancelled",
    amount: 95,
  }
];

export const MOCK_SERVICES = [
  {
    id: "s1",
    name: "Signature ORYX Massage",
    price: 120,
    addons: [
      { id: "a1", name: "Hot Stones", price: 25 },
      { id: "a2", name: "Aromatherapy", price: 15 },
      { id: "a3", name: "Deep Tissue Upgrade", price: 20 },
    ]
  },
  {
    id: "s2",
    name: "Deep Tissue Therapy",
    price: 150,
    addons: []
  },
  {
    id: "s3",
    name: "Radiance Facial",
    price: 95,
    addons: [
      { id: "fa1", name: "LED Light Therapy", price: 30 },
      { id: "fa2", name: "Collagen Eye Mask", price: 15 },
    ]
  }
];
