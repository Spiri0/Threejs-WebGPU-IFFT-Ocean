import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebGPU IFFT Ocean',
  description: 'Real-time ocean simulation using WebGPU and IFFT cascades',
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
