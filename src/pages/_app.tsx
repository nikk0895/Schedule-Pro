// src/pages/_app.tsx
import '@/styles/globals.css';
import { SnackbarProvider } from 'notistack';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SnackbarProvider maxSnack={3}>
      <Component {...pageProps} />
    </SnackbarProvider>
  );
}

export default MyApp;
