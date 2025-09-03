'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

const Toaster = ({ ...props }) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme}
      richColors
      position="top-right"
      closeButton
      className="toaster"
      toastOptions={{
        classNames: {
          toast:
            'rounded-md border shadow-lg text-sm',
          description: 'opacity-90',
          actionButton: 'rounded-md px-3 py-1',
          cancelButton: 'rounded-md px-3 py-1',
        },
        success: {
          classNames: {
            toast: 'border-green-500 bg-green-50 text-green-700',
            description: 'text-green-600',
          },
        },
        error: {
          classNames: {
            toast: 'border-red-500 bg-red-50 text-red-700',
            description: 'text-red-600',
          },
        },
        info: {
          classNames: {
            toast: 'border-blue-500 bg-blue-50 text-blue-700',
            description: 'text-blue-600',
          },
        },
        warning: {
          classNames: {
            toast: 'border-yellow-500 bg-yellow-50 text-yellow-800',
            description: 'text-yellow-700',
          },
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
