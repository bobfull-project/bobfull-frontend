import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { OwnerLayout } from '@/components/layout/OwnerLayout'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { MyPage } from '@/features/mypage/pages/MyPage'
import { PaymentDevTestPage } from '@/features/payments/pages/PaymentDevTestPage'
import { MyReservationsPage } from '@/features/reservations/pages/MyReservationsPage'
import { RecruitingReservationListPage } from '@/features/reservations/pages/RecruitingReservationListPage'
import { ReservationFormPage } from '@/features/reservations/pages/ReservationFormPage'
import { RestaurantDetailPage } from '@/features/restaurants/pages/RestaurantDetailPage'
import { RestaurantListPage } from '@/features/restaurants/pages/RestaurantListPage'
import { OwnerRestaurantFormPage } from '@/features/owner/pages/OwnerRestaurantFormPage'
import { OwnerRestaurantListPage } from '@/features/owner/pages/OwnerRestaurantListPage'
import { OwnerRestaurantManagePage } from '@/features/owner/pages/OwnerRestaurantManagePage'
import { NotFoundPage } from '@/features/system/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'restaurants', element: <RestaurantListPage /> },
      { path: 'recruiting', element: <RecruitingReservationListPage /> },
      { path: 'restaurants/:restaurantId', element: <RestaurantDetailPage /> },
      { path: 'restaurants/:restaurantId/reservations/new', element: <ReservationFormPage /> },
      { path: 'reservations', element: <MyReservationsPage /> },
      { path: 'mypage', element: <MyPage /> },
      { path: 'dev/payment-test', element: <PaymentDevTestPage /> },
    ],
  },
  { path: '/login', element: <AuthPage mode="login" audience="member" /> },
  { path: '/signup', element: <AuthPage mode="signup" audience="member" /> },
  { path: '/owner/login', element: <AuthPage mode="login" audience="owner" /> },
  { path: '/owner/signup', element: <AuthPage mode="signup" audience="owner" /> },
  {
    path: '/owner',
    element: <OwnerLayout />,
    children: [
      { index: true, element: <Navigate to="restaurants" replace /> },
      { path: 'restaurants', element: <OwnerRestaurantListPage /> },
      { path: 'restaurants/new', element: <OwnerRestaurantFormPage /> },
      { path: 'restaurants/:restaurantId', element: <OwnerRestaurantManagePage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
