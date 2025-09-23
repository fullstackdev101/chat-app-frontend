// app/layout.tsx
import "./globals.css";
import ProtectedLayout from "./ProtectedLayout";

export const metadata = {
  title: "Chat App",
  description: "Minimal realtime chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        <ProtectedLayout>{children}</ProtectedLayout>
      </body>
    </html>
  );
}
