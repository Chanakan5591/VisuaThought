import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { NextUIProvider } from "@nextui-org/react";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <NextUIProvider>
      <ClerkProvider {...pageProps}>
        <Component {...pageProps} />,
      </ClerkProvider>
    </NextUIProvider>
  )
};

export default api.withTRPC(MyApp);
