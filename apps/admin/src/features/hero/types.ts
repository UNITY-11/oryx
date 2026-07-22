export interface HeroItem {
  id: string;
  type: "image" | "video";
  src: string;
  title: string;
  subtitle?: string;
  order: number;
  createdAt?: string;
}
