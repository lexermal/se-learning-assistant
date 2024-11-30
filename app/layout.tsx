import { ThemeSwitcher } from "@/components/theme-switcher";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { EventEmitterProvider } from "@/utils/providers/EventEmitterContext";
import CustomNavbar from "@/components/CustomNavbar";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "World Tree",
  description: "Where the community drives the content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <EventEmitterProvider>
            <main className="min-h-screen flex flex-col items-center">
              <div className="flex-1 w-full flex flex-col gap-5 items-center">
                <CustomNavbar />
                <div className="pl-5 w-full">
                  {children}
                </div>

                <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                  <p>
                    Powered by Lexermal
                  </p>
                  <ThemeSwitcher />
                </footer>
              </div>
            </main>
          </EventEmitterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
