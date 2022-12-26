// import "../styles/globals.css";
import type { AppProps } from "next/app";
import SocketsProvider from "../context/sockets.context";

function App({ Component, pageProps }: AppProps) {
  return (
    <SocketsProvider>
      <Component {...pageProps} />
    </SocketsProvider>
  );
}
export default App;
