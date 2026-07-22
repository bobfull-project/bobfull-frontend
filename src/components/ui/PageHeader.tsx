export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <header className="mb-8"><p className="mb-2 text-sm font-semibold text-brand">{eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>{description && <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted">{description}</p>}</header>
}
