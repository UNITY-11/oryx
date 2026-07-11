import { SwipableFavorites } from "@/features/favorites/swipeable-tabs";

export default function FavoritesPage() {
  return (
    <div className="flex flex-col h-full pt-6">
      <div className="px-6">
        <h1 className="font-serif text-3xl font-medium text-primary-dark">Favorites</h1>
      </div>
      <SwipableFavorites />
    </div>
  );
}
