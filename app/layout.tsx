import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt Chain Tool",
  description: "Admin tool for humor flavors, flavor steps, and caption testing.",
};

const themeScript = `
(() => {
  const storageKey = "caption-admin-theme";
  const root = document.documentElement;
  const stored = localStorage.getItem(storageKey);
  const mode = stored === "light" || stored === "dark" ? stored : "system";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
  root.dataset.themeMode = mode;
  root.dataset.theme = resolved;
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bauhaus-app antialiased">{children}</body>
    </html>
  );
}
