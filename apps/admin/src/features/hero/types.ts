export interface HeroItem {
  id: string;
  type: "image" | "video";
  src: string;
  title: string;
  order: number;
  createdAt?: string;
}
