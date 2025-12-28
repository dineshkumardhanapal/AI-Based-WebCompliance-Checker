import './globals.css';

export const metadata = {
  title: 'AI Web Compliance Checker',
  description: 'Check your website for accessibility and compliance with WCAG guidelines.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

