export type BookingStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Started';

export interface BookingService {
  name: string;
  addons: string[];
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  services: BookingService[];
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
    services: [
      { name: "Signature ORYX Massage", addons: ["Hot Stones"] }
    ],
    date: "2026-07-14",
    time: "14:30",
    status: "Confirmed",
    amount: 145,
  },
  {
    id: "B-1030",
    customerName: "Fatima K.",
    phone: "+974 5555 5678",
    services: [
      { name: "Radiance Facial", addons: ["LED Light Therapy"] }
    ],
    date: "2026-07-14",
    time: "16:00",
    status: "Pending",
    amount: 125,
  },
  {
    id: "B-1031",
    customerName: "Jessica R.",
    phone: "+974 5555 9012",
    services: [
      { name: "Deep Tissue Therapy", addons: [] }
    ],
    date: "2026-07-15",
    time: "10:00",
    status: "Confirmed",
    amount: 150,
  },
  {
    id: "B-1032",
    customerName: "Aisha B.",
    phone: "+974 5555 3456",
    services: [
      { name: "Signature ORYX Massage", addons: ["Aromatherapy", "Deep Tissue Upgrade"] }
    ],
    date: "2026-07-14",
    time: "11:00",
    status: "Completed",
    amount: 155,
  },
  {
    id: "B-1033",
    customerName: "Mariam H.",
    phone: "+974 5555 7890",
    services: [
      { name: "Radiance Facial", addons: [] }
    ],
    date: "2026-07-16",
    time: "13:00",
    status: "Cancelled",
    amount: 95,
  },
  {
    id: "B-1034",
    customerName: "Noura A.",
    phone: "+974 5555 1111",
    services: [
      { name: "Deep Tissue Therapy", addons: [] }
    ],
    date: "2026-07-14",
    time: "09:00",
    status: "Confirmed",
    amount: 150,
  },
  {
    id: "B-1035",
    customerName: "Chloe D.",
    phone: "+974 5555 2222",
    services: [
      { name: "Signature ORYX Massage", addons: ["Hot Stones"] }
    ],
    date: "2026-07-14",
    time: "11:30",
    status: "Pending",
    amount: 145,
  },
  {
    id: "B-1036",
    customerName: "Latifa Q.",
    phone: "+974 5555 3333",
    services: [
      { name: "Radiance Facial", addons: ["LED Light Therapy"] }
    ],
    date: "2026-07-14",
    time: "14:00",
    status: "Confirmed",
    amount: 125,
  },
  {
    id: "B-1037",
    customerName: "Sara W.",
    phone: "+974 5555 4444",
    services: [
      { name: "Signature ORYX Massage", addons: [] },
      { name: "Radiance Facial", addons: [] }
    ],
    date: "2026-07-14",
    time: "14:45",
    status: "Pending",
    amount: 215, // 120 + 95
  },
  {
    id: "B-1038",
    customerName: "Emily S.",
    phone: "+974 5555 5555",
    services: [
      { name: "Deep Tissue Therapy", addons: [] }
    ],
    date: "2026-07-14",
    time: "18:00",
    status: "Completed",
    amount: 150,
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
