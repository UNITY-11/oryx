import { PinGuardLayout } from "@/shared/ui/pin-guard-layout";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PinGuardLayout description="Enter the 6-digit admin PIN to access staff.">
      {children}
    </PinGuardLayout>
  );
}
