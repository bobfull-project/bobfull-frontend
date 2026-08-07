import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarPlus, Clock3, MapPin, Plus, Store, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { deleteRestaurant, getMyRestaurant, updateRestaurant } from '@/features/owner/api/restaurantApi'
import { deleteSession, getOwnerSessions, registerSessionsBulk, updateSession } from '@/features/owner/api/sessionApi'
import { deleteTable, getTables, registerTablesBulk, updateTable } from '@/features/owner/api/tableApi'

const TABLE_CAPACITIES = [2, 4, 6, 8] as const

const today = new Date().toLocaleDateString('sv-SE')

const tableSchema = z.object({
  capacity: z.number().refine((value) => TABLE_CAPACITIES.includes(value as 2 | 4 | 6 | 8), '2, 4, 6, 8명 중 선택해주세요.'),
  count: z.number().int().min(1, '생성할 테이블 수는 1개 이상이어야 합니다.').max(10, '한 번에 최대 10개까지 등록할 수 있습니다.'),
})

const slotSchema = z.object({
  reservationDate: z.string().min(1, '예약 날짜를 선택해주세요.'),
  startTime: z.string().min(1, '시작 시간을 선택해주세요.'),
  endTime: z.string().min(1, '종료 시간을 선택해주세요.'),
  intervalMinutes: z.number().positive('회차 길이는 0보다 커야 합니다.'),
  // 체크박스 배열은 문자열로 수집된다(react-hook-form의 valueAsNumber는 checkbox에 적용되지 않음).
  tableIds: z.array(z.string()).min(1, '적용할 테이블을 한 개 이상 선택해주세요.'),
}).superRefine((value, context) => {
  if (value.reservationDate && value.reservationDate < today) {
    context.addIssue({ code: 'custom', path: ['reservationDate'], message: '과거 날짜는 선택할 수 없습니다.' })
  }
  if (value.startTime && value.endTime && value.endTime <= value.startTime) {
    context.addIssue({ code: 'custom', path: ['endTime'], message: '종료 시간은 시작 시간보다 늦어야 합니다.' })
  }
})

type TableValues = z.infer<typeof tableSchema>
type SlotValues = z.infer<typeof slotSchema>

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}
const toTime = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

function mutationErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return '삭제하지 못했습니다. 연결된 예약·회차가 있는지 확인해주세요.'
}

function formatSessionTime(iso: string) {
  const date = new Date(iso)
  return date.toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function OwnerRestaurantManagePage() {
  const restaurantId = Number(useParams().restaurantId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editingRestaurant, setEditingRestaurant] = useState(false)
  const [restaurantDraft, setRestaurantDraft] = useState({ name: '', description: '', keyword: '', depositPerPerson: 0 })
  const [editingTableId, setEditingTableId] = useState<number | null>(null)
  const [tableCapacity, setTableCapacity] = useState(4)
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null)
  const [sessionDraft, setSessionDraft] = useState({ startAt: '', endAt: '' })
  const [managementError, setManagementError] = useState<string | null>(null)

  const restaurantQuery = useQuery({
    queryKey: ['owner', 'restaurant', restaurantId],
    queryFn: () => getMyRestaurant(restaurantId),
    enabled: Number.isFinite(restaurantId),
  })
  const tablesQuery = useQuery({
    queryKey: ['owner', 'restaurant', restaurantId, 'tables'],
    queryFn: () => getTables(restaurantId),
    enabled: Number.isFinite(restaurantId),
  })
  const sessionsQuery = useQuery({
    queryKey: ['owner', 'restaurant', restaurantId, 'sessions'],
    queryFn: () => getOwnerSessions(restaurantId),
    enabled: Number.isFinite(restaurantId),
  })

  const tables = useMemo(() => tablesQuery.data ?? [], [tablesQuery.data])
  const sessions = sessionsQuery.data ?? []

  const tableForm = useForm<TableValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: { capacity: 4, count: 1 },
  })
  const slotForm = useForm<SlotValues>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      reservationDate: today,
      startTime: '11:00',
      endTime: '13:00',
      intervalMinutes: 60,
      tableIds: [],
    },
    mode: 'onChange',
  })
  const watched = useWatch({ control: slotForm.control })
  const selectedCapacity = useWatch({ control: tableForm.control, name: 'capacity' })

  const addTablesMutation = useMutation({
    mutationFn: (values: TableValues) => registerTablesBulk(restaurantId, values.capacity, values.count),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'restaurant', restaurantId, 'tables'] })
      tableForm.reset({ capacity: 4, count: 1 })
    },
  })

  const addSessionsMutation = useMutation({
    mutationFn: async (values: SlotValues) => {
      for (const tableId of values.tableIds) {
        await registerSessionsBulk(Number(tableId), {
          dates: [values.reservationDate],
          startTime: values.startTime,
          endTime: values.endTime,
          intervalMinutes: values.intervalMinutes,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'restaurant', restaurantId, 'sessions'] })
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: number) => deleteSession(sessionId),
    onMutate: () => setManagementError(null),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['owner', 'restaurant', restaurantId, 'sessions'] }) },
    onError: (error) => setManagementError(mutationErrorMessage(error)),
  })
  const updateRestaurantMutation = useMutation({ mutationFn: () => updateRestaurant(restaurantId, restaurantDraft), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['owner', 'restaurant', restaurantId] }); setEditingRestaurant(false) } })
  const deleteRestaurantMutation = useMutation({ mutationFn: () => deleteRestaurant(restaurantId), onMutate: () => setManagementError(null), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['owner', 'restaurants'] }); queryClient.removeQueries({ queryKey: ['owner', 'restaurant', restaurantId] }); navigate('/owner/restaurants', { replace: true }) }, onError: (error) => setManagementError(mutationErrorMessage(error)) })
  const updateTableMutation = useMutation({ mutationFn: ({ tableId, capacity }: { tableId: number; capacity: number }) => updateTable(tableId, capacity), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['owner', 'restaurant', restaurantId, 'tables'] }); setEditingTableId(null) } })
  const deleteTableMutation = useMutation({
    mutationFn: deleteTable,
    onMutate: () => setManagementError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'restaurant', restaurantId, 'tables'] })
      await queryClient.invalidateQueries({ queryKey: ['owner', 'restaurant', restaurantId, 'sessions'] })
    },
    onError: (error) => setManagementError(mutationErrorMessage(error)),
  })
  const updateSessionMutation = useMutation({ mutationFn: ({ sessionId, startAt, endAt }: { sessionId: number; startAt: string; endAt: string }) => updateSession(sessionId, { startAt, endAt }), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['owner', 'restaurant', restaurantId, 'sessions'] }); setEditingSessionId(null) } })

  // 백엔드 생성 규칙과 동일하게 미리보기를 계산한다: startTime부터 intervalMinutes씩 연속 생성, endTime을 넘지 않는다.
  const preview = useMemo(() => {
    if (!watched.startTime || !watched.endTime || !watched.intervalMinutes) return []
    const interval = Number(watched.intervalMinutes)
    if (interval <= 0) return []
    const start = toMinutes(watched.startTime)
    const end = toMinutes(watched.endTime)
    if (end <= start) return []
    const times: Array<{ startTime: string; endTime: string }> = []
    let current = start
    while (current < end) {
      times.push({ startTime: toTime(current), endTime: toTime(current + interval) })
      current += interval
    }
    const selectedTables = tables.filter((table) => (watched.tableIds ?? []).includes(String(table.tableId)))
    return selectedTables.map((table) => ({ table, times }))
  }, [tables, watched])
  const previewCount = preview.reduce((total, item) => total + item.times.length, 0)

  if (!restaurantQuery.data) {
    if (restaurantQuery.isLoading) return <div className="mx-auto max-w-4xl py-20 text-center text-sm text-muted">불러오는 중입니다.</div>
    return <div className="mx-auto max-w-4xl py-20 text-center"><h1 className="text-2xl font-semibold">식당을 찾을 수 없습니다</h1><Link to="/owner/restaurants"><Button className="mt-6">식당 목록으로</Button></Link></div>
  }
  const restaurant = restaurantQuery.data

  const selectedIds = watched.tableIds ?? []
  const allSelected = tables.length > 0 && selectedIds.length === tables.length
  const toggleAll = () => slotForm.setValue('tableIds', allSelected ? [] : tables.map((table) => String(table.tableId)), { shouldValidate: true })

  return <div className="mx-auto max-w-6xl">
    <header className="mb-8"><p className="text-sm font-semibold text-brand">RESTAURANT MANAGEMENT</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">식당 관리</h1><p className="mt-2 text-sm text-muted">물리적 테이블을 등록한 뒤, 선택한 테이블에 날짜별 예약 시간을 생성하세요.</p><div className="mt-4 flex flex-wrap gap-2"><Link to={`/owner/restaurants/${restaurantId}/operations`}><Button variant="secondary">노쇼·지급 예정 관리</Button></Link><Button variant="secondary" onClick={() => { setRestaurantDraft({ name: restaurant.name, description: restaurant.description, keyword: restaurant.keyword, depositPerPerson: restaurant.depositPerPerson }); setEditingRestaurant(true) }}>식당 정보 수정</Button><Button type="button" variant="secondary" className="text-red-700" disabled={deleteRestaurantMutation.isPending} onClick={() => { if (window.confirm('식당을 삭제할까요? 이 작업은 되돌릴 수 없습니다.')) deleteRestaurantMutation.mutate() }}>{deleteRestaurantMutation.isPending ? '삭제 중...' : '식당 삭제'}</Button></div>{managementError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{managementError}</p>}</header>

    <section className="card overflow-hidden">
      <div className="border-b border-line bg-brand-soft px-6 py-4 text-sm font-semibold text-brand">식당 정보 미리보기</div>
      <div className="grid gap-6 p-6 md:grid-cols-[120px_1fr] md:p-8">
        {restaurant.imageUrl
          ? <img src={restaurant.imageUrl} alt={`${restaurant.name} 이미지`} className="size-24 rounded-[24px] object-cover" />
          : <span className="grid size-24 place-items-center rounded-[24px] bg-accent-soft text-accent"><Store size={38} /></span>}
        <div>
          <div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-semibold">{restaurant.name}</h2><span className="rounded-full bg-sub-soft px-3 py-1 text-xs font-semibold text-brand">{restaurant.category}</span></div>
          <p className="mt-4 flex items-start gap-2 text-sm text-muted"><MapPin size={16} className="mt-0.5 shrink-0" />{restaurant.address}</p>
          <p className="mt-5 max-w-3xl leading-7 text-muted">{restaurant.description}</p>
        </div>
      </div>
    </section>
    {editingRestaurant && <section className="card mt-6 p-6"><h2 className="text-xl font-semibold">식당 정보 수정</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><label><span className="label">식당명</span><input className="field" value={restaurantDraft.name} onChange={(e) => setRestaurantDraft({ ...restaurantDraft, name: e.target.value })} /></label><label><span className="label">키워드</span><input className="field" value={restaurantDraft.keyword} onChange={(e) => setRestaurantDraft({ ...restaurantDraft, keyword: e.target.value })} /></label><label><span className="label">1인당 예약금</span><input type="number" className="field" value={restaurantDraft.depositPerPerson} onChange={(e) => setRestaurantDraft({ ...restaurantDraft, depositPerPerson: Number(e.target.value) })} /></label><label className="md:col-span-2"><span className="label">소개</span><textarea className="field h-28" value={restaurantDraft.description} onChange={(e) => setRestaurantDraft({ ...restaurantDraft, description: e.target.value })} /></label></div><div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setEditingRestaurant(false)}>취소</Button><Button onClick={() => updateRestaurantMutation.mutate()} disabled={updateRestaurantMutation.isPending}>저장</Button></div></section>}

    <section className="card mt-6 p-6 md:p-8">
      <p className="text-sm font-semibold text-brand">DINING TABLES</p>
      <h2 className="mt-2 text-xl font-semibold">테이블 등록</h2>
      <p className="mt-2 text-sm text-muted">테이블 번호는 식당별로 자동 생성되며, 한 번에 최대 10개까지 등록할 수 있습니다.</p>
      <form className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={tableForm.handleSubmit((values) => addTablesMutation.mutate(values))}>
        <div><span className="label">최대 이용 인원</span><div className="grid grid-cols-4 gap-2">{TABLE_CAPACITIES.map((capacity) => <button key={capacity} type="button" className={`h-12 rounded-xl border font-semibold transition-colors ${selectedCapacity === capacity ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-muted hover:border-brand hover:text-brand'}`} onClick={() => tableForm.setValue('capacity', capacity, { shouldValidate: true })}>{capacity}명</button>)}</div><span className="mt-1 block text-xs text-red-700">{tableForm.formState.errors.capacity?.message}</span></div>
        <label><span className="label">생성할 테이블 수</span><input type="number" min="1" max="10" className="field h-12" {...tableForm.register('count', { valueAsNumber: true })} /><span className="mt-1 block text-xs text-red-700">{tableForm.formState.errors.count?.message}</span></label>
        <Button type="submit" className="h-12 gap-2" disabled={addTablesMutation.isPending}><Plus size={17} />{addTablesMutation.isPending ? '등록 중...' : '테이블 등록'}</Button>
      </form>
      {addTablesMutation.isError && <p className="mt-2 text-sm text-red-700">테이블 등록에 실패했습니다.</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tables.map((table) => <div key={table.tableId} className="rounded-2xl border border-line bg-surface p-4"><p className="font-semibold">테이블 {table.displayNumber}</p>{editingTableId === table.tableId ? <><select className="field mt-3" value={tableCapacity} onChange={(e) => setTableCapacity(Number(e.target.value))}>{TABLE_CAPACITIES.map((capacity) => <option key={capacity} value={capacity}>{capacity}명</option>)}</select><div className="mt-3 flex gap-2"><Button onClick={() => updateTableMutation.mutate({ tableId: table.tableId, capacity: tableCapacity })}>저장</Button><Button variant="ghost" onClick={() => setEditingTableId(null)}>취소</Button></div></> : <><p className="mt-1 text-sm text-muted">최대 {table.capacity}명</p><div className="mt-3 flex gap-2"><Button variant="ghost" onClick={() => { setEditingTableId(table.tableId); setTableCapacity(table.capacity) }}>수정</Button><Button type="button" variant="ghost" className="text-red-700" disabled={deleteTableMutation.isPending} onClick={() => { const linkedCount = sessions.filter((session) => session.tableId === table.tableId).length; if (linkedCount > 0) { setManagementError(`테이블 ${table.displayNumber}에 연결된 회차 ${linkedCount}개가 있습니다. 아래 회차 관리에서 해당 회차를 먼저 삭제해주세요.`); return } if (window.confirm(`테이블 ${table.displayNumber}을 삭제할까요?`)) deleteTableMutation.mutate(table.tableId) }}>{deleteTableMutation.isPending ? '삭제 중...' : '삭제'}</Button></div></>}</div>)}
        {tablesQuery.isLoading && <p className="text-sm text-muted">불러오는 중입니다.</p>}
        {!tablesQuery.isLoading && tables.length === 0 && <p className="text-sm text-muted">등록된 테이블이 없습니다.</p>}
      </div>
    </section>

    <section className="card mt-6 p-6 md:p-8">
      <p className="text-sm font-semibold text-brand">RESERVATION SLOTS</p>
      <h2 className="mt-2 text-xl font-semibold">예약 회차 생성</h2>
      <form className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3" onSubmit={slotForm.handleSubmit((values) => addSessionsMutation.mutate(values))}>
        <label><span className="label">예약 날짜</span><input type="date" min={today} className="field h-12" {...slotForm.register('reservationDate')} /><span className="mt-1 block text-xs text-red-700">{slotForm.formState.errors.reservationDate?.message}</span></label>
        <label><span className="label">시작 시간</span><input type="time" className="field h-12" {...slotForm.register('startTime')} /></label>
        <label><span className="label">종료 시간</span><input type="time" className="field h-12" {...slotForm.register('endTime')} /><span className="mt-1 block text-xs text-red-700">{slotForm.formState.errors.endTime?.message}</span></label>
        <label><span className="label">회차 길이(분)</span><input type="number" min="0" step="30" className="field h-12" {...slotForm.register('intervalMinutes', { valueAsNumber: true })} /><span className="mt-1 block text-xs text-muted">시작 시간부터 이 길이만큼 연속으로 회차가 생성됩니다.</span><span className="mt-1 block text-xs text-red-700">{slotForm.formState.errors.intervalMinutes?.message}</span></label>
        <div className="md:col-span-2 xl:col-span-3">
          <span className="label">적용할 테이블</span>
          <div className="grid gap-3 rounded-2xl border border-line p-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex cursor-pointer items-center gap-3 font-semibold"><input type="checkbox" checked={allSelected} onChange={toggleAll} />전체 테이블</label>
            {tables.map((table) => <label key={table.tableId} className="flex cursor-pointer items-center gap-3"><input type="checkbox" value={table.tableId} {...slotForm.register('tableIds')} />테이블 {table.displayNumber} · 최대 {table.capacity}명</label>)}
          </div>
          <span className="mt-2 block text-xs text-red-700">{slotForm.formState.errors.tableIds?.message}</span>
        </div>

        <div className="rounded-2xl bg-brand-soft p-5 md:col-span-2 xl:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">생성 결과 미리보기</h3><span className="text-sm font-semibold text-brand">총 {previewCount}개 회차</span></div>
          <p className="mt-1 text-sm text-muted">{watched.reservationDate ? new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(new Date(`${watched.reservationDate}T00:00:00`)) : '예약 날짜를 선택해주세요.'}</p>
          {preview.length === 0 ? <p className="mt-4 text-sm text-muted">테이블과 올바른 시간 조건을 선택하면 생성 결과가 표시됩니다.</p> : <div className="mt-4 grid gap-3 md:grid-cols-2">{preview.map(({ table, times }) => <div key={table.tableId} className="rounded-2xl bg-white p-4"><p className="font-semibold">테이블 {table.displayNumber} · 최대 {table.capacity}명</p><ul className="mt-3 space-y-1 text-sm text-muted">{times.map((time) => <li key={time.startTime}>- {time.startTime}~{time.endTime}</li>)}</ul></div>)}</div>}
        </div>
        <Button type="submit" className="gap-2 md:col-span-2 xl:col-span-3" disabled={tables.length === 0 || addSessionsMutation.isPending}><CalendarPlus size={17} />{addSessionsMutation.isPending ? '생성 중...' : '예약 회차 생성'}</Button>
      </form>
      {addSessionsMutation.isError && <p className="mt-2 text-sm text-red-700">예약 회차 생성에 실패했습니다.</p>}
    </section>

    <section className="card mt-6 overflow-hidden">
      <div className="border-b border-line px-6 py-5"><p className="text-sm font-semibold text-brand">SLOT MANAGEMENT</p><h2 className="mt-1 text-xl font-semibold">예약 회차 관리</h2></div>
      {sessionsQuery.isLoading && <div className="grid min-h-52 place-items-center p-8 text-center text-sm text-muted">불러오는 중입니다.</div>}
      {!sessionsQuery.isLoading && sessions.length === 0 && <div className="grid min-h-52 place-items-center p-8 text-center text-sm text-muted">생성된 예약 회차가 없습니다.</div>}
      {sessions.length > 0 && <div>{sessions.map((session) => <article key={session.sessionId} className="grid gap-3 border-b border-line p-5 last:border-0 md:grid-cols-[auto_1fr_auto_auto] md:items-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand"><Clock3 size={20} /></span>
        <div><p className="font-semibold">테이블 {tables.find((table) => table.tableId === session.tableId)?.displayNumber ?? session.tableId}</p><p className="mt-1 text-sm text-muted">{formatSessionTime(session.startAt)} ~ {new Date(session.endAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p></div>
        <p className="flex items-center gap-2 text-sm text-muted"><Users size={15} />정원 {session.capacity}명</p>
        {editingSessionId === session.sessionId ? <div className="grid gap-2"><input type="datetime-local" className="field" value={sessionDraft.startAt} onChange={(e) => setSessionDraft({ ...sessionDraft, startAt: e.target.value })} /><input type="datetime-local" className="field" value={sessionDraft.endAt} onChange={(e) => setSessionDraft({ ...sessionDraft, endAt: e.target.value })} /><div className="flex gap-2"><Button onClick={() => updateSessionMutation.mutate({ sessionId: session.sessionId, ...sessionDraft })}>저장</Button><Button variant="ghost" onClick={() => setEditingSessionId(null)}>취소</Button></div></div> : <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => { setEditingSessionId(session.sessionId); setSessionDraft({ startAt: session.startAt.slice(0, 16), endAt: session.endAt.slice(0, 16) }) }}>수정</Button><Button type="button" variant="ghost" className="gap-2 text-red-700" disabled={deleteSessionMutation.isPending} onClick={() => { if (window.confirm('회차를 삭제할까요?')) deleteSessionMutation.mutate(session.sessionId) }}><Trash2 size={16} />삭제</Button></div>}
      </article>)}</div>}
    </section>
  </div>
}
