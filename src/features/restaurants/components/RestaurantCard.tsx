import { MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Restaurant } from '@/types/domain'

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return <Link to={`/restaurants/${restaurant.id}`} className="group block overflow-hidden rounded-card border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-card">
    {restaurant.imageUrl
      ? <img src={restaurant.imageUrl} alt={`${restaurant.name} 이미지`} className="aspect-[16/10] w-full object-cover transition group-hover:scale-[1.01]" />
      : <div className="grid aspect-[16/10] place-items-center bg-gradient-to-br from-brand-soft to-accent-soft text-7xl transition group-hover:scale-[1.01]">{restaurant.image}</div>}
    <div className="p-5"><div className="mb-2 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold text-brand">{restaurant.category}</p><h3 className="mt-1 text-lg font-semibold">{restaurant.name}</h3></div><span className="flex items-center gap-1 text-sm font-medium"><Star size={14} fill="currentColor" />{restaurant.rating}</span></div><p className="flex items-center gap-1 text-sm text-muted"><MapPin size={14} />{restaurant.area} · {restaurant.priceRange}</p><div className="mt-4 flex flex-wrap gap-2">{restaurant.tags.map((tag) => <span key={tag} className="rounded-full bg-sub-soft px-3 py-1 text-xs text-brand">{tag}</span>)}</div></div>
  </Link>
}
