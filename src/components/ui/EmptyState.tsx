import { Utensils } from 'lucide-react'

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="card flex min-h-64 flex-col items-center justify-center p-8 text-center"><span className="mb-4 rounded-full bg-brand-soft p-4 text-brand"><Utensils /></span><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p></div>
}
