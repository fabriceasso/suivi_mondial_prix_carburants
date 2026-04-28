import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fuel Price Tracker',
  description: 'Comparez les prix de l\'essence et du diesel dans le monde entier. Carte thermique interactive, détails par pays et tendances historiques.',
  keywords: ['prix carburant', 'essence', 'diesel', 'suivi mondial'],
  openGraph: {
    title: 'Fuel Price Tracker',
    description: 'Comparez les prix de l\'essence et du diesel dans le monde entier en temps réel.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <div className="fixed inset-0 pointer-events-none -z-[1] overflow-hidden">
          <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -top-48 -left-48" />
          <div className="absolute w-[500px] h-[500px] bg-[#60a5fa]/10 rounded-full blur-[120px] top-1/4 -right-24" />
          <div className="absolute w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] bottom-0 left-1/4" />
        </div>
        {children}
      </body>
    </html>
  );
}
