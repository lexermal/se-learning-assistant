import { env } from "@/utils/constants";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import CustomNavbar from "@/components/CustomNavbar";
import { EnvProvider } from "@/utils/providers/EnvProvider";
import { EventEmitterProvider } from "@/utils/providers/EventEmitterContext";
import "./globals.css";

export const metadata = {
  title: "Rimori",
  metadataBase: new URL("https://rimori.se"),
  description: "Where the community drives the content.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <EventEmitterProvider>
            <EnvProvider env={env}>
              <main className="min-h-screen flex flex-col items-center dark:bg-gray-950">
                <div className="flex-1 w-full flex flex-col items-center">
                  <CustomNavbar />
                  <div className="w-full mt-12">
                    {children}
                  </div>
                </div>
              </main>
            </EnvProvider>
          </EventEmitterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
