import { PinGuardLayout } from "@/shared/ui/pin-guard-layout";

export default function NewProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PinGuardLayout description="Enter the 6-digit admin PIN to add a new product.">
      {children}
    </PinGuardLayout>
  );
}
