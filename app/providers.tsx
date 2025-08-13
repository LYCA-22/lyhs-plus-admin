"use client";
import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { Header } from "@/components/Header";
import SystemCheck from "@/components/initUserCheck";
import { usePathname } from "next/navigation";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system">
        <main className="w-full h-dvh flex">
          {path !== "/login" && (
            <>
              <Header />
              <SystemCheck />
            </>
          )}
          <div className="grow overflow-y-auto bg-contentbg p-3 px-5">
            {children}
          </div>
        </main>
      </ThemeProvider>
    </Provider>
  );
}
