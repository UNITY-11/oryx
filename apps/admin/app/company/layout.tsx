import { PinGuardLayout } from "@/shared/ui/pin-guard-layout";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PinGuardLayout description="Enter the 6-digit admin PIN to access company settings.">
      {children}
    </PinGuardLayout>
  );
}
