"use client";
import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { Header } from "@/components/Header";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system">
        <main className="w-full h-dvh flex flex-col">
          <Header />
          <div className="grow overflow-y-auto bg-contentbg p-3 px-5 max-sm:px-3">
            {children}
          </div>
        </main>
      </ThemeProvider>
    </Provider>
  );
}
