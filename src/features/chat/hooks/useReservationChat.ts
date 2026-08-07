import { Client } from '@stomp/stompjs'
import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '@/features/chat/api/chatApi'
import { useAuthStore } from '@/stores/authStore'

function websocketUrl() {
  const configured = import.meta.env.VITE_WS_URL
  if (configured) return configured
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
  return `${apiBase.replace(/^http/, 'ws').replace(/\/api\/?$/, '')}/ws`
}

export function useReservationChat(chatRoomId: number | null, canSend: boolean) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const clientRef = useRef<Client | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    if (!chatRoomId || !accessToken) return

    const client = new Client({
      brokerURL: websocketUrl(),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      reconnectDelay: 3_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      beforeConnect: () => {
        setConnectionState('connecting')
        setConnectionError(null)
      },
      onConnect: () => {
        setConnectionState('connected')
        client.subscribe(`/sub/chat/rooms/${chatRoomId}`, (frame) => {
          const incoming = JSON.parse(frame.body) as ChatMessage
          setMessages((current) => current.some((message) => message.messageId === incoming.messageId)
            ? current
            : [...current, incoming])
        })
      },
      onStompError: (frame) => {
        setConnectionError(frame.headers.message ?? '채팅 연결에 실패했습니다.')
        setConnectionState('disconnected')
      },
      onWebSocketClose: () => setConnectionState('disconnected'),
    })
    clientRef.current = client
    client.activate()
    return () => {
      clientRef.current = null
      void client.deactivate()
    }
  }, [accessToken, chatRoomId])

  const sendMessage = (content: string) => {
    const client = clientRef.current
    if (!chatRoomId || !canSend || !client?.connected) return false
    client.publish({
      destination: `/pub/chat/rooms/${chatRoomId}/messages`,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: JSON.stringify({ content }),
    })
    return true
  }

  return { messages, connectionState, connectionError, sendMessage }
}
