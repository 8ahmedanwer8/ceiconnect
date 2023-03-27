// import "../styles/globals.css";
import type { AppProps } from "next/app";
import SocketsProvider from "../context/sockets.context";
import theme from "../utils/theme";
import { ChakraProvider } from "@chakra-ui/react";
function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <SocketsProvider>
        <Component {...pageProps} />
      </SocketsProvider>
    </ChakraProvider>
  );
}
export default App;
