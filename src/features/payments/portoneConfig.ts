import { apiConfig } from '@/lib/api/config'

const PORTONE_DEMO_STORE_ID = 'store-4ff4af41-85e3-4559-8eb8-0d08a2c6ceec'
const PORTONE_DEMO_CHANNEL_KEY = 'channel-key-893597d6-e62d-410f-83f9-119f530b4b11'

/**
 * Mock 모드에서는 PortOne 공식 문서의 테스트 채널을 사용한다.
 * 실제 채널은 관리자 콘솔에서 발급한 값을 .env.local에 주입해야 한다.
 * PortOne API Secret은 프론트에 절대 넣지 않는다.
 */
export const portoneConfig = {
  storeId: import.meta.env.VITE_PORTONE_STORE_ID || (apiConfig.useMock ? PORTONE_DEMO_STORE_ID : undefined),
  channelKey: import.meta.env.VITE_PORTONE_CHANNEL_KEY || (apiConfig.useMock ? PORTONE_DEMO_CHANNEL_KEY : undefined),
  isDemo: apiConfig.useMock && !import.meta.env.VITE_PORTONE_STORE_ID && !import.meta.env.VITE_PORTONE_CHANNEL_KEY,
}

export function assertPortoneConfigured() {
  if (!portoneConfig.storeId || !portoneConfig.channelKey) {
    throw new Error('VITE_PORTONE_STORE_ID, VITE_PORTONE_CHANNEL_KEY 환경변수가 설정되지 않았습니다.')
  }
}
