import { PinGuardLayout } from "@/shared/ui/pin-guard-layout";

export default function EditProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PinGuardLayout description="Enter the 6-digit admin PIN to edit this product.">
      {children}
    </PinGuardLayout>
  );
}
