import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lafiya Verifier",
  description:
    "CHW registration and Soroban attestation tool for the Lafiya emergency health card.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
