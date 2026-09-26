import './globals.css';
import AuthProvider from '../components/providers/AuthProvider';

export const metadata = {
  title: 'ExpenseMate — Personal Expense Manager',
  description: 'Smart personal finance, expense tracking, and budget management dashboard.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}