import "./globals.css";

export const metadata = {
  title: "StockSense",
  description: "Student-friendly bullish/bearish stock dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
