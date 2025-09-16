import PageTitle from '@/components/common/page-title';

export function Layout1Page() {
  const appName = import.meta.env.VITE_APP_NAME || '';
  return (
    <div className="container py-10">
      <PageTitle title="Dashboard" />
      <h1 className="text-2xl font-semibold">
        Chào mừng bạn đến với Demo dự án {appName}
      </h1>
    </div>
  );
}
