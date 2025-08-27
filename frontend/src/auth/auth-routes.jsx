import { AuthLayout } from './layouts/auth-layout';
import LoginPage from './pages/login';

export const authRoutes = [
  {
    path: '',
    element: <AuthLayout />,
    children: [
      // /auth/login
      { path: 'login', element: <LoginPage /> },

    ],
  },
];
