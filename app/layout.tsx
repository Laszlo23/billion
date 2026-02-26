import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { CelebrationHost } from "@/src/components/feedback/CelebrationHost";
import { MobileAppShell } from "@/src/components/shell/MobileAppShell";

export const metadata: Metadata = {
  title: "BiteMine - The Incentive Layer for Physical Commerce",
  description:
    "AI-powered infrastructure that turns real-world actions into measurable growth. Built for restaurants and scalable to every local business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <MobileAppShell>{children}</MobileAppShell>
        <CelebrationHost />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
