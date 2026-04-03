import './globals.css';

export const metadata = {
  title: 'AdmitOS — Admissions Workflow Platform',
  description: 'AI-native admissions advisory workflow orchestration',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
