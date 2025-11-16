/// <reference types="vite/client" />

interface Window {
  testsprite?: {
    logError: (error: {
      type?: string;
      message?: string;
      stack?: string;
      componentStack?: string;
      filename?: string;
      lineno?: number;
      colno?: number;
      error?: string;
      reason?: string;
      timestamp: string;
    }) => void;
  };
}