import { PinGuardLayout } from "@/shared/ui/pin-guard-layout";

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PinGuardLayout description="Enter the 6-digit admin PIN to access services.">
      {children}
    </PinGuardLayout>
  );
}
