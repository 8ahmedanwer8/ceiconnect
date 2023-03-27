import { extendTheme } from "@chakra-ui/react";
import { Inter, Libre_Franklin } from "@next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

const libre = Libre_Franklin({
  subsets: ["latin"],
});

const theme = extendTheme({
  fonts: {
    inter: inter.style.fontFamily,
    libre: libre.style.fontFamily,
  },
});

export default theme;
