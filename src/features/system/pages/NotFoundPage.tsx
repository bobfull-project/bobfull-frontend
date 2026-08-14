import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { BrandLogo } from '@/components/brand/BrandLogo'

export function NotFoundPage() { return <main className="grid min-h-screen place-items-center p-6 text-center"><div><Link to="/" aria-label="밥풀 홈"><BrandLogo className="mb-8" imageClassName="size-12" /></Link><p className="text-sm font-semibold text-brand">404</p><h1 className="mt-3 text-3xl font-semibold">페이지를 찾을 수 없습니다</h1><p className="mt-3 text-sm text-muted">주소가 변경되었거나 존재하지 않는 페이지입니다.</p><Link to="/"><Button className="mt-7">홈으로 돌아가기</Button></Link></div></main> }
