export type ServiceCategory =
  "Massage" | "Facial" | "Body Treatment" | "Hair" | "Nails" | "Package";
export type ServiceStatus = "Active" | "Inactive";

export interface ServiceOption {
  id: string;
  name: string;
  price: number;
  duration?: number;
}



export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  status: ServiceStatus;
  description: string;
  shortDescription: string;
  image: string | null;
  price: number;
  options: ServiceOption[];
  preparationTime: number; // minutes before appointment
  cleanupTime: number; // minutes after appointment
  maxCapacity: number;
  tags: string[];
  createdAt: string;
}
