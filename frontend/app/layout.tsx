import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Sidebar from "@/components/Sidebar";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "MagnitudeAI - Earthquake Prediction",
  description: "Klasifikasi magnitude gempa di sekitar Anak Krakatau menggunakan XGBoost",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className={`${poppins.className} min-h-screen flex bg-brokenwhite`}>
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-72 p-6 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
