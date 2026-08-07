import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Menu, MessageCircle, Send, Smile } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { chatApi, type ChatMessage } from '@/features/chat/api/chatApi'
import { useReservationChat } from '@/features/chat/hooks/useReservationChat'
import { memberRepository } from '@/features/mypage/api/memberRepository'
import { reservationRepository } from '@/features/reservations/api/reservationRepository'
import { useAuthStore } from '@/stores/authStore'

function errorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return '채팅방을 불러오지 못했습니다.'
}

const avatarColors = ['bg-[#f6b26b]', 'bg-[#96c58c]', 'bg-[#c0a78d]', 'bg-[#e9a7a7]', 'bg-[#8eb9c7]']

function avatarColor(name: string) {
  const index = [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0) % avatarColors.length
  return avatarColors[index]
}

function formatChatSchedule(startAt?: string, partySize?: number) {
  if (!startAt) return '함께하는 식사 채팅'
  const date = new Date(startAt)
  const day = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(date)
  const time = new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' }).format(date)
  return `${day} ${time} · ${partySize ?? 1}명 예약`
}

export function ReservationChatPage() {
  const reservationId = Number(useParams().reservationId)
  const accessToken = useAuthStore((state) => state.accessToken)
  const [content, setContent] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const profileQuery = useQuery({
    queryKey: ['member', 'me'],
    queryFn: memberRepository.getMe,
    enabled: Boolean(accessToken),
  })
  const reservationQuery = useQuery({
    queryKey: ['reservations', 'me', reservationId],
    queryFn: () => reservationRepository.getDetail(reservationId),
    enabled: Number.isFinite(reservationId),
  })
  const roomQuery = useQuery({
    queryKey: ['chat-room', reservationId],
    queryFn: () => chatApi.getRoom(reservationId),
    enabled: Number.isFinite(reservationId),
    retry: false,
  })
  const roomId = roomQuery.data?.chatRoomId ?? null
  const historyQuery = useInfiniteQuery({
    queryKey: ['chat-messages', roomId],
    queryFn: ({ pageParam }) => chatApi.getMessages(roomId!, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: roomId !== null,
  })

  const reservation = reservationQuery.data
  const canSend = reservation != null
    && reservation.participationStatus !== 'CANCELLED'
    && reservation.reservationStatus !== 'CANCELLED'
    && reservation.reservationStatus !== 'CLOSED'
  const realtime = useReservationChat(roomId, canSend)
  const messages = useMemo(() => {
    const history = (historyQuery.data?.pages ?? []).flatMap((page) => page.content).reverse()
    const byId = new Map<number, ChatMessage>()
    for (const message of [...history, ...realtime.messages]) byId.set(message.messageId, message)
    return [...byId.values()].sort((a, b) => a.messageId - b.messageId)
  }, [historyQuery.data, realtime.messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || !realtime.sendMessage(trimmed)) return
    setContent('')
  }

  if (roomQuery.isLoading || reservationQuery.isLoading) return <div className="page-container page-section text-center text-sm text-muted">채팅방을 불러오는 중입니다.</div>
  if (roomQuery.isError || !roomQuery.data) return <div className="page-container page-section max-w-2xl text-center"><MessageCircle className="mx-auto text-muted" size={36} /><h1 className="mt-4 text-2xl font-semibold">채팅방에 들어갈 수 없습니다</h1><p className="mt-2 text-sm text-muted">{errorMessage(roomQuery.error)}</p><Link to={`/reservations/${reservationId}`}><Button className="mt-6">예약 상세로</Button></Link></div>

  return <section className="page-container py-5 md:py-8 max-w-3xl">
    <div className="flex h-[calc(100vh-8rem)] min-h-[620px] max-h-[820px] flex-col overflow-hidden rounded-[30px] border border-[#eadfca] bg-white shadow-[0_18px_60px_rgba(107,82,43,0.13)]">
      <header className="relative flex items-center justify-between border-b border-[#eee4d3] bg-[#fffdf8] px-4 py-4 md:px-6">
        <Link to={`/reservations/${reservationId}`} className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-[#f6efe3]" aria-label="예약 상세로"><ArrowLeft size={24} /></Link>
        <div className="min-w-0 px-3 text-center"><h1 className="truncate text-lg font-bold md:text-xl">{reservation?.restaurantName ?? `예약 #${reservationId}`}</h1><p className="mt-0.5 text-xs text-[#998c78]">{formatChatSchedule(reservation?.startAt, reservation?.partySize)}</p></div>
        <div className="grid h-10 w-10 place-items-center rounded-full text-[#665b4b]" aria-hidden="true"><Menu size={24} /></div>
        <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-semibold ${realtime.connectionState === 'connected' ? 'text-[#6a9c62]' : 'text-muted'}`}>{realtime.connectionState === 'connected' ? '● 연결됨' : realtime.connectionState === 'connecting' ? '연결 중' : '연결 끊김'}</span>
      </header>
      <div className="chat-grain-background relative min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        <div className="relative z-10">
        {historyQuery.hasNextPage && <div className="mb-4 text-center"><Button variant="ghost" disabled={historyQuery.isFetchingNextPage} onClick={() => historyQuery.fetchNextPage()}>{historyQuery.isFetchingNextPage ? '불러오는 중...' : '이전 메시지 보기'}</Button></div>}
        {messages.length === 0 && <div className="grid min-h-96 place-items-center text-center text-sm text-muted"><div className="rounded-3xl border border-white/70 bg-white/80 px-8 py-7 shadow-sm backdrop-blur-sm"><div className="mx-auto mb-4 flex w-fit -rotate-6 gap-1" aria-hidden="true"><span className="h-7 w-3 rounded-full border border-[#d8cfb8] bg-[#fffdf7]" /><span className="mt-2 h-7 w-3 rotate-12 rounded-full border border-[#d8cfb8] bg-[#fffdf7]" /><span className="h-7 w-3 rotate-[24deg] rounded-full border border-[#d8cfb8] bg-[#fffdf7]" /></div><p className="font-medium text-ink">아직 메시지가 없습니다.</p><p className="mt-1">함께 식사할 참여자에게 인사해보세요.</p></div></div>}
        <div className="space-y-4">{messages.map((message) => {
          const mine = message.senderMemberId === profileQuery.data?.memberId
          return <article key={message.messageId} className={`flex items-start gap-2.5 ${mine ? 'justify-end' : 'justify-start'}`}>{!mine && <div className={`mt-5 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-white text-lg shadow-sm ${avatarColor(message.senderName)}`} aria-hidden="true">🍚</div>}<div className={`max-w-[76%] ${mine ? 'text-right' : ''}`}>{!mine && <p className="mb-1.5 ml-1 text-xs font-semibold text-[#8d806d]">{message.senderName}</p>}<div className={`chat-bubble ${mine ? 'chat-bubble-mine' : 'chat-bubble-other'}`}><p className="whitespace-pre-wrap break-words leading-6">{message.content}</p></div><p className={`mt-1 text-[11px] text-[#a79b88] ${mine ? 'mr-1' : 'ml-1'}`}>{new Date(message.sentAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p></div></article>
        })}</div><div ref={bottomRef} /></div>
      </div>

      <form className="border-t border-[#eee4d3] bg-[#fffaf2] p-3 md:p-4" onSubmit={submit}>{!canSend && <p className="mb-3 text-sm text-muted">종료되거나 취소된 예약은 기존 메시지만 확인할 수 있습니다.</p>}{realtime.connectionError && <p className="mb-3 text-sm text-red-700">{realtime.connectionError}</p>}<div className="flex items-center gap-2.5"><div className="flex h-14 min-w-0 flex-1 items-center rounded-full border border-[#e6dac5] bg-white px-5 shadow-sm focus-within:border-[#d8c8ad] focus-within:shadow-[0_0_0_3px_rgba(216,200,173,0.18)]"><input className="min-w-0 flex-1 bg-transparent text-[15px] outline-none focus-visible:ring-0 focus-visible:ring-offset-0" maxLength={500} placeholder={canSend ? '메시지를 입력하세요' : '메시지를 보낼 수 없습니다.'} value={content} onChange={(event) => setContent(event.target.value)} disabled={!canSend || realtime.connectionState !== 'connected'} /><Smile className="ml-2 shrink-0 text-[#b8aa95]" size={22} /></div><button type="submit" className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand text-white shadow-[0_7px_18px_rgba(238,132,67,0.32)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40" disabled={!canSend || !content.trim() || realtime.connectionState !== 'connected'} aria-label="전송"><Send size={22} /></button></div></form>
    </div>
  </section>
}
