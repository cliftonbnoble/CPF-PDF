import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CHP 108A Inspector - Bus Maintenance & Safety Inspection Form',
  description: 'Automated form filling tool for California Highway Patrol CHP 108A Bus Maintenance & Safety Inspection forms',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
