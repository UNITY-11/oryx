export interface CompanyDetails {
  id: string;
  name: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  mapUrl: string;
  mapEmbedUrl: string;
  updatedAt: string | null;
}

export type CompanyInput = Omit<CompanyDetails, "id" | "updatedAt">;

export const EMPTY_COMPANY: CompanyInput = {
  name: "",
  tagline: "",
  email: "",
  phone: "",
  whatsapp: "",
  website: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  mapUrl: "",
  mapEmbedUrl: "",
};

export const COMPANY_DOC_ID = "companyDetails";
