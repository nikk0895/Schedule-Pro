// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import CssBaseline from '@mui/material/CssBaseline';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <CssBaseline /> {/* MUI baseline reset */}
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
}
