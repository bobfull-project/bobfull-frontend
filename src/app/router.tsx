import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { OwnerLayout } from '@/components/layout/OwnerLayout'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { MyPage } from '@/features/mypage/pages/MyPage'
import { MyReservationsPage } from '@/features/reservations/pages/MyReservationsPage'
import { ReservationFormPage } from '@/features/reservations/pages/ReservationFormPage'
import { RestaurantDetailPage } from '@/features/restaurants/pages/RestaurantDetailPage'
import { RestaurantListPage } from '@/features/restaurants/pages/RestaurantListPage'
import { OwnerDashboardPage } from '@/features/owner/pages/OwnerDashboardPage'
import { NotFoundPage } from '@/features/system/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'restaurants', element: <RestaurantListPage /> },
      { path: 'restaurants/:restaurantId', element: <RestaurantDetailPage /> },
      { path: 'restaurants/:restaurantId/reservations/new', element: <ReservationFormPage /> },
      { path: 'reservations', element: <MyReservationsPage /> },
      { path: 'mypage', element: <MyPage /> },
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
      { path: 'restaurants', element: <OwnerDashboardPage view="restaurants" /> },
      { path: 'reservations', element: <OwnerDashboardPage view="reservations" /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
