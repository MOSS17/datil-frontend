import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/auth/ProtectedRoute';

const LandingPage = lazy(() => import('./LandingPage'));
const LoginPage = lazy(() => import('./auth/LoginPage'));
const RegisterPage = lazy(() => import('./auth/RegisterPage'));

const DashboardLayout = lazy(() => import('./dashboard/DashboardLayout'));
const HomePage = lazy(() => import('./dashboard/home/HomePage'));
const ServicesPage = lazy(() => import('./dashboard/servicios/ServicesPage'));
const ServiceFormPage = lazy(() => import('./dashboard/servicios/ServiceFormPage'));
const CategoriesPage = lazy(() => import('./dashboard/CategoriesPage'));
const CalendarioPage = lazy(() => import('./dashboard/citas/CalendarioPage'));
const SchedulePage = lazy(() => import('./dashboard/schedule/SchedulePage'));
const PersonalTimePage = lazy(() => import('./dashboard/PersonalTimePage'));
const ConfiguracionPage = lazy(() => import('./dashboard/configuracion/ConfiguracionPage'));
const BankDetailsPage = lazy(() => import('./dashboard/BankDetailsPage'));

const BookingLayout = lazy(() => import('./booking/BookingLayout'));
const BusinessPage = lazy(() => import('./booking/BusinessPage'));
const SelectServicesPage = lazy(() => import('./booking/SelectServicesPage'));
const SelectTimePage = lazy(() => import('./booking/SelectTimePage'));
const ConfirmBookingPage = lazy(() => import('./booking/ConfirmBookingPage'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <LandingPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/registro',
    element: (
      <SuspenseWrapper>
        <RegisterPage />
      </SuspenseWrapper>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: (
          <SuspenseWrapper>
            <DashboardLayout />
          </SuspenseWrapper>
        ),
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <HomePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'servicios',
            element: (
              <SuspenseWrapper>
                <ServicesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'servicios/nuevo',
            element: (
              <SuspenseWrapper>
                <ServiceFormPage mode="create" />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'servicios/:id/editar',
            element: (
              <SuspenseWrapper>
                <ServiceFormPage mode="edit" />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'servicios/complementos/nuevo',
            element: (
              <SuspenseWrapper>
                <ServiceFormPage mode="create" kind="extra" />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'servicios/complementos/:id/editar',
            element: (
              <SuspenseWrapper>
                <ServiceFormPage mode="edit" kind="extra" />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'categorias',
            element: (
              <SuspenseWrapper>
                <CategoriesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'citas',
            element: (
              <SuspenseWrapper>
                <CalendarioPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'horario',
            element: (
              <SuspenseWrapper>
                <SchedulePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'tiempo-personal',
            element: (
              <SuspenseWrapper>
                <PersonalTimePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'configuracion',
            element: (
              <SuspenseWrapper>
                <ConfiguracionPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'perfil',
            element: <Navigate to="/dashboard/configuracion" replace />,
          },
          {
            path: 'calendario',
            element: <Navigate to="/dashboard/configuracion" replace />,
          },
          {
            path: 'banco',
            element: (
              <SuspenseWrapper>
                <BankDetailsPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '/:slug',
    element: (
      <SuspenseWrapper>
        <BookingLayout />
      </SuspenseWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <BusinessPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'servicios',
        element: (
          <SuspenseWrapper>
            <SelectServicesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'horario',
        element: (
          <SuspenseWrapper>
            <SelectTimePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'confirmar',
        element: (
          <SuspenseWrapper>
            <ConfirmBookingPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);
