import { AppProps } from 'next/app';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <SpeedInsights /> {/* ✅ Add here */}
    </>
  );
}
