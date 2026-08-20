import { fetchCompany } from "@/features/company/sanity";
import { ContactView } from "@/features/contact/contact-view";

export const revalidate = 3600;

export default async function ContactPage() {
  let company: Awaited<ReturnType<typeof fetchCompany>> = null;
  let error: string | null = null;

  try {
    company = await fetchCompany();
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Failed to load contact details";
  }

  return <ContactView company={company} error={error} />;
}
