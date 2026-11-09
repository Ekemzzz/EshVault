import { lazy, type ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { NotFound } from '@/pages/NotFound'
import { Login } from '@/pages/auth/Login'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'

// 
//  Route-level code splitting: every page ships in its own chunk and is
//   fetched on first visit (Suspense boundary lives in RootLayout). Named
//   exports are adapted to lazy()'s default-export requirement here.
//   NotFound stays in the main bundle (it is the errorElement and the
//  cheapest possible 404), and Login is kept for the very common
//  "Sign in" entry click so the auth form never waits on a chunk.
//  
function page<T extends Record<string, unknown>>(loader: () => Promise<T>, name: keyof T) {
  return lazy(() => loader().then((m) => ({ default: m[name] as ComponentType })))
}

const Home = page(() => import('@/pages/Home'), 'Home')
const Browse = page(() => import('@/pages/Browse'), 'Browse')
const Categories = page(() => import('@/pages/Categories'), 'Categories')
const CategoryDetail = page(() => import('@/pages/CategoryDetail'), 'CategoryDetail')
const ExtensionDetail = page(() => import('@/pages/ExtensionDetail'), 'ExtensionDetail')
const Compare = page(() => import('@/pages/Compare'), 'Compare')
const Submit = page(() => import('@/pages/Submit'), 'Submit')
const About = page(() => import('@/pages/About'), 'About')
const Register = page(() => import('@/pages/auth/Register'), 'Register')
const ForgotPassword = page(() => import('@/pages/auth/ForgotPassword'), 'ForgotPassword')
const ResetPassword = page(() => import('@/pages/auth/ResetPassword'), 'ResetPassword')
const AuthCallback = page(() => import('@/pages/auth/AuthCallback'), 'AuthCallback')
const Profile = page(() => import('@/pages/Profile'), 'Profile')
const Dashboard = page(() => import('@/pages/Dashboard'), 'Dashboard')
const MySubmissions = page(() => import('@/pages/MySubmissions'), 'MySubmissions')
const Admin = page(() => import('@/pages/Admin'), 'Admin')

const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'browse', element: <Browse /> },
      { path: 'categories', element: <Categories /> },
      { path: 'categories/:slug', element: <CategoryDetail /> },
      { path: 'extensions/:slug', element: <ExtensionDetail /> },
      { path: 'compare', element: <Compare /> },
      { path: 'submit', element: <Submit /> },
      { path: 'about', element: <About /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'auth/callback', element: <AuthCallback /> },
      {
        path: 'reset-password',
        element: (
          <ProtectedRoute>
            <ResetPassword />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'submissions',
        element: (
          <ProtectedRoute>
            <MySubmissions />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <Admin />
          </AdminRoute>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
