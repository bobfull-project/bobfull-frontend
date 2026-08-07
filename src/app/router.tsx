import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { OwnerLayout } from '@/components/layout/OwnerLayout'
import { HomePage } from '@/features/home/pages/HomePage'
import { NotFoundPage } from '@/features/system/pages/NotFoundPage'

const AuthPage = lazy(() => import('@/features/auth/pages/AuthPage').then((module) => ({ default: module.AuthPage })))
const MyPage = lazy(() => import('@/features/mypage/pages/MyPage').then((module) => ({ default: module.MyPage })))
const PaymentHistoryPage = lazy(() => import('@/features/mypage/pages/PaymentHistoryPage').then((module) => ({ default: module.PaymentHistoryPage })))
const MyReservationsPage = lazy(() => import('@/features/reservations/pages/MyReservationsPage').then((module) => ({ default: module.MyReservationsPage })))
const RecruitingReservationListPage = lazy(() => import('@/features/reservations/pages/RecruitingReservationListPage').then((module) => ({ default: module.RecruitingReservationListPage })))
const ReservationDetailPage = lazy(() => import('@/features/reservations/pages/ReservationDetailPage').then((module) => ({ default: module.ReservationDetailPage })))
const ReservationFormPage = lazy(() => import('@/features/reservations/pages/ReservationFormPage').then((module) => ({ default: module.ReservationFormPage })))
const RestaurantDetailPage = lazy(() => import('@/features/restaurants/pages/RestaurantDetailPage').then((module) => ({ default: module.RestaurantDetailPage })))
const RestaurantListPage = lazy(() => import('@/features/restaurants/pages/RestaurantListPage').then((module) => ({ default: module.RestaurantListPage })))
const OwnerRestaurantFormPage = lazy(() => import('@/features/owner/pages/OwnerRestaurantFormPage').then((module) => ({ default: module.OwnerRestaurantFormPage })))
const OwnerRestaurantListPage = lazy(() => import('@/features/owner/pages/OwnerRestaurantListPage').then((module) => ({ default: module.OwnerRestaurantListPage })))
const OwnerRestaurantManagePage = lazy(() => import('@/features/owner/pages/OwnerRestaurantManagePage').then((module) => ({ default: module.OwnerRestaurantManagePage })))
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })))
const OwnerOperationsPage = lazy(() => import('@/features/owner/pages/OwnerOperationsPage').then((module) => ({ default: module.OwnerOperationsPage })))
const ReservationChatPage = lazy(() => import('@/features/chat/pages/ReservationChatPage').then((module) => ({ default: module.ReservationChatPage })))

function loadPage(page: ReactNode) {
  return <Suspense fallback={<div className="page-container page-section text-center text-sm text-muted">화면을 불러오는 중입니다.</div>}>{page}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'restaurants', element: loadPage(<RestaurantListPage />) },
      { path: 'recruiting', element: loadPage(<RecruitingReservationListPage />) },
      { path: 'restaurants/:restaurantId', element: loadPage(<RestaurantDetailPage />) },
      { path: 'restaurants/:restaurantId/reservations/new', element: loadPage(<ReservationFormPage />) },
      { path: 'reservations', element: loadPage(<MyReservationsPage />) },
      { path: 'reservations/:reservationId', element: loadPage(<ReservationDetailPage />) },
      { path: 'reservations/:reservationId/chat', element: loadPage(<ReservationChatPage />) },
      { path: 'mypage', element: loadPage(<MyPage />) },
      { path: 'mypage/payments', element: loadPage(<PaymentHistoryPage />) },
    ],
  },
  { path: '/login', element: loadPage(<AuthPage mode="login" audience="member" />) },
  { path: '/signup', element: loadPage(<AuthPage mode="signup" audience="member" />) },
  { path: '/owner/login', element: loadPage(<AuthPage mode="login" audience="owner" />) },
  { path: '/owner/signup', element: loadPage(<AuthPage mode="signup" audience="owner" />) },
  {
    path: '/owner',
    element: <OwnerLayout />,
    children: [
      { index: true, element: <Navigate to="restaurants" replace /> },
      { path: 'restaurants', element: loadPage(<OwnerRestaurantListPage />) },
      { path: 'restaurants/new', element: loadPage(<OwnerRestaurantFormPage />) },
      { path: 'restaurants/:restaurantId', element: loadPage(<OwnerRestaurantManagePage />) },
      { path: 'restaurants/:restaurantId/operations', element: loadPage(<OwnerOperationsPage />) },
    ],
  },
  { path: '/admin', element: <AppLayout />, children: [{ index: true, element: loadPage(<AdminDashboardPage />) }] },
  { path: '*', element: <NotFoundPage /> },
])
