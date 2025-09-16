import { useEffect } from 'react';

export default function PageTitle({ title, suffix }) {
  const appName = import.meta.env.VITE_APP_NAME || 'Application';
  const finalTitle = title ? `${title} - ${suffix || appName}` : appName;

  useEffect(() => {
    document.title = finalTitle;
    return () => {
      // Optional: revert to app name on unmount
      document.title = appName;
    };
  }, [finalTitle, appName]);

  return null;
}

