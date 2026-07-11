import { BookingFlow } from "@/features/booking/booking-flow";

export default function BookingPage() {
  return (
    <div className="flex flex-col h-full pt-6">
      <div className="px-6 pb-4">
        <h1 className="font-serif text-3xl font-medium text-primary-dark">Book Session</h1>
      </div>
      <BookingFlow />
    </div>
  );
}
