import "./globals.css";
import { Inter, Plus_Jakarta_Sans, Noto_Sans_Bengali } from "next/font/google";
import type { Metadata } from "next";
import ClientProviders from "./components/ClientProviders";

const headline = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-headline"
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body"
});

const bangla = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bangla"
});

export const metadata: Metadata = {
  title: "JatraXpress | Digital Booking",
  description: "Premium multi-modal booking for bus, train, flight, and hotel travel."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${headline.variable} ${body.variable} ${bangla.variable} bg-surface text-on-surface min-h-screen`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
