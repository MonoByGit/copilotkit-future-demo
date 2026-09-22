import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent UX Demo — Future Vibes",
  description: "Shared state, generative UI, human-in-the-loop. One mock agent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background:
            "radial-gradient(ellipse at 20% 0%, #1a1033 0%, #07060f 55%, #05060d 100%)",
          color: "#e7e9ee",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {children}
      </body>
    </html>
  );
}
