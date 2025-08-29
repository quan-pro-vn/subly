import { AuthLayout } from './layouts/auth-layout';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';

export const authRoutes = [
  {
    path: '',
    element: <AuthLayout />,
    children: [
      // /auth/login
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
];
