import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  LoaderCircleIcon,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`;

const signinSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  rememberMe: z.boolean().default(true),
});

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const pwdReset = searchParams.get('pwd_reset');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (pwdReset === 'success') {
      setSuccessMessage(
        'Mật khẩu đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới.',
      );
    }

    if (errorParam) {
      setError(errorDescription || 'Có lỗi xác thực. Vui lòng thử lại.');
    }
  }, [searchParams]);

  const form = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: 'demo@kt.com',
      password: 'demo123',
      rememberMe: true,
    },
  });

  // Gọi API login
  const handleLogin = async (values) => {
    // Fake login cho demo
    if (
      values.email.trim().toLowerCase() === 'demo@kt.com' &&
      values.password === 'demo123'
    ) {
      const storage = form.getValues('rememberMe')
        ? localStorage
        : sessionStorage;
      storage.setItem('auth_token', 'demo-token-123456');
      storage.setItem(
        'auth_user',
        JSON.stringify({ id: 1, email: 'demo@kt.com', name: 'Demo User' }),
      );
      await new Promise((r) => setTimeout(r, 300));
      return;
    }

    // Uncomment và sửa lại phần dưới để gọi API thật khi có backend
    // const res = await fetch(LOGIN_ENDPOINT, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     email: values.email,
    //     password: values.password,
    //   }),
    // });

    // if (!res.ok) {
    //   let msg = 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
    //   try {
    //     const data = await res.json();
    //     if (data?.message) msg = data.message;
    //     if (Array.isArray(data?.errors)) msg = data.errors.join(', ');
    //   } catch {
    //     /* noop */
    //   }
    //   throw new Error(msg);
    // }

    // const data = await res.json();
    // const accessToken = data.access_token || data.token || data.accessToken;

    // if (!accessToken) {
    //   throw new Error('Phản hồi không chứa access token.');
    // }

    // const storage = form.getValues('rememberMe') ? localStorage : sessionStorage;
    // storage.setItem('auth_token', accessToken);

    // if (data.user) {
    //   storage.setItem('auth_user', JSON.stringify(data.user));
    // }
  };

  async function onSubmit(values) {
    setIsProcessing(true);
    setError(null);
    try {
      await handleLogin(values);
      const nextPath = searchParams.get('next') || '/layout-1';
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="block w-full space-y-5"
      >
        <div className="text-center space-y-1 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Log in with your credentials.
          </p>
        </div>

        <Alert appearance="light" size="sm" close={false}>
          <AlertIcon>
            <AlertCircle className="text-primary" />
          </AlertIcon>
          <AlertTitle className="text-accent-foreground">
            Dùng <strong>demo@kt.com</strong> và <strong>demo123</strong> để thử
            nhanh.
          </AlertTitle>
        </Alert>

        {error && (
          <Alert
            variant="destructive"
            appearance="light"
            onClose={() => setError(null)}
          >
            <AlertIcon>
              <AlertCircle />
            </AlertIcon>
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        {successMessage && (
          <Alert appearance="light" onClose={() => setSuccessMessage(null)}>
            <AlertIcon>
              <Check />
            </AlertIcon>
            <AlertTitle>{successMessage}</AlertTitle>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your email"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center gap-2.5">
                <FormLabel>Password</FormLabel>
              </div>
              <div className="relative">
                <Input
                  placeholder="Your password"
                  type={passwordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  onClick={() => setPasswordVisible((v) => !v)}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                >
                  {passwordVisible ? (
                    <EyeOff className="text-muted-foreground" />
                  ) : (
                    <Eye className="text-muted-foreground" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    Remember me
                  </FormLabel>
                </div>
                <Link
                  to="/auth/reset-password"
                  className="text-sm font-semibold text-foreground hover:text-primary"
                >
                  Forgot Password?
                </Link>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <LoaderCircleIcon className="h-4 w-4 animate-spin" /> Loading...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            to="/auth/signup"
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            Sign Up
          </Link>
        </div>
      </form>
    </Form>
  );
}
