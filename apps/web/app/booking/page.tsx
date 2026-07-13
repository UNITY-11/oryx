import { BookingFlow } from "@/features/booking/booking-flow";

export default function BookingPage() {
  return (
    <div className="absolute inset-0 md:relative md:inset-auto z-10 md:h-[100dvh] flex flex-col md:items-center md:justify-center bg-[#fcf4f0] md:p-8 md:pt-32 overflow-hidden min-h-0">
      <div className="w-full h-full md:max-h-[80vh] md:max-w-5xl mx-auto relative md:bg-white md:shadow-xl md:rounded-[40px] overflow-hidden md:border md:border-primary/10 flex flex-col min-h-0">
        <BookingFlow />
      </div>
    </div>
  );
}
