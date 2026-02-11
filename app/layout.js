export const metadata = {
  title: 'Ireland Schedule 2025',
  description: 'Tournament & booking schedule tracker',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
