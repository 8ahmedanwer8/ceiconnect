import { extendTheme } from "@chakra-ui/react";
import { Inter, Libre_Franklin, Roboto } from "@next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

const libre = Libre_Franklin({
  subsets: ["latin"],
});

const theme = extendTheme({
  fonts: {
    inter: inter.style.fontFamily,
    libre: libre.style.fontFamily,
    roboto: roboto.style.fontFamily,
  },
});

export default theme;
