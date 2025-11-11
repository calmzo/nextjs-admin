import { Outfit } from "next/font/google";
import "./globals.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import { Suspense } from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Toaster from "@/components/common/Toaster";
import { SimpleConfirmDialogProvider } from "@/components/ui/SimpleConfirmDialogProvider";
import AuthInitializer from "@/components/auth/AuthInitializer";
import RouteLoadingIndicator from "@/components/common/RouteLoadingIndicator";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <Suspense fallback={null}>
          <RouteLoadingIndicator />
        </Suspense>
        <ThemeProvider>
          <SidebarProvider>
            <AuthInitializer />
            {children}
          </SidebarProvider>
        </ThemeProvider>
        <Toaster />
        <SimpleConfirmDialogProvider />
      </body>
    </html>
  );
}
