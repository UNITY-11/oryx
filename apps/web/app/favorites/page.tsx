import { SwipableFavorites } from "@/features/favorites/swipeable-tabs";

export default function FavoritesPage() {
  return (
    <div className="flex flex-col h-full pt-6 md:pt-32">
      <div className="px-6">
        <h1 className="font-serif text-3xl font-medium text-primary-dark">Favorites</h1>
      </div>
      <div className="flex-1 min-h-0 w-full flex flex-col">
        <SwipableFavorites />
      </div>
    </div>
  );
}
