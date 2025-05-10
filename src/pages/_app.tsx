import { AppProps } from 'next/app';
import GlobalStyles from '../styles/GlobalStyles';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalStyles />
      <Component {...pageProps} />
    </>
  );
}