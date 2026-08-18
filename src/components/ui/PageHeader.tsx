export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <header className="mb-8 md:mb-10"><p className="mb-3 text-xs font-semibold tracking-[.18em] text-brand">{eyebrow}</p><h1 className="font-display text-3xl font-semibold leading-tight tracking-[-.03em] md:text-4xl">{title}</h1>{description && <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted">{description}</p>}</header>
}
