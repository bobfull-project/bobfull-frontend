export const formatDateTime = (value: string) => new Intl.DateTimeFormat('ko-KR', {
  month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit',
}).format(new Date(value))

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')
