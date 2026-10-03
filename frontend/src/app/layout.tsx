import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoTrack | Location Portal",
  description: "Full-stack geospatial location tracking dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
