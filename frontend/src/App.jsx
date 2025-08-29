import { AppRouting } from '@/routes/app-routing';
import { ThemeProvider } from 'next-themes';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { AuthProvider } from '@/providers/auth';
import { Toaster } from '@/components/ui/sonner';

export function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="vite-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <LoadingBarContainer>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <AppRouting />
          </AuthProvider>
        </BrowserRouter>
      </LoadingBarContainer>
    </ThemeProvider>
  );
}
