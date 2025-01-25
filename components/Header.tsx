"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ThemeToggle } from "./themeToggle";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useRouter, usePathname } from "next/navigation";
import SystemCheck from "./initUserCheck";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/store/hook";
import { apiServices } from "@/services/api";
import { motion } from "framer-motion";

const gradientPresets = [
  "from-blue-500 via-purple-500 to-pink-500",
  "from-green-400 via-teal-500 to-blue-500",
  "from-yellow-400 via-orange-500 to-red-500",
  "from-purple-500 via-pink-500 to-red-500",
  "from-blue-400 via-indigo-500 to-purple-500",
  "from-green-500 via-emerald-500 to-teal-500",
  "from-rose-400 via-fuchsia-500 to-indigo-500",
];

type Props = {
  id: number;
  tile: string;
};

const ITEMS: Props[] = [
  { id: 1, tile: "Overview" },
  { id: 2, tile: "Integrations" },
  { id: 3, tile: "Activity" },
  { id: 4, tile: "Domains" },
  { id: 5, tile: "Usage" },
  { id: 6, tile: "AI" },
  { id: 7, tile: "Settings" },
];

export function Header() {
  const [active, setActive] = useState<Props>(ITEMS[0]);
  const [isHover, setIsHover] = useState<Props | null>(null);
  const [theme, setTheme] = useState("");
  const [mounted, setMounted] = useState(false);
  const [gradient] = useState(
    () => gradientPresets[Math.floor(Math.random() * gradientPresets.length)],
  );
  const router = useRouter();
  const pathname = usePathname();
  const sessionId = useAppSelector((state) => state.userData.sessionId);
  const email = useAppSelector((state) => state.userData.email);

  // 根據路徑獲取當前頁面值
  const getCurrentTab = () => {
    if (pathname === "/") return "overview";
    if (pathname === "/mailbox") return "mailbox";
    if (pathname === "/account") return "account";
    return "overview"; // 默認值
  };

  const userLogout = async () => {
    await apiServices.Logout(sessionId, email);
    window.location.reload();
  };

  useEffect(() => {
    setMounted(true);
    // 可以加入對主題變化的監聽
    const html = document.querySelector("html");
    const observer = new MutationObserver(() => {
      if (html?.classList.contains("dark")) {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    });

    observer.observe(html!, { attributes: true });

    // 初始化主題
    if (html?.classList.contains("dark")) {
      setTheme("dark");
    } else {
      setTheme("light");
    }

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return null;
  }

  const handleTabChange = (value: string) => {
    // 根據 tab 值導航到相應路徑
    switch (value) {
      case "overview":
        router.push("/");
        break;
      case "mailbox":
        router.push("/mailbox");
        break;
      case "account":
        router.push("/account");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <header className="p-5 pt-3 pb-0 border-b border-border">
      <SystemCheck />
      <div className="flex items-center justify-between">
        <div aria-label="header-part-one" className="flex gap-2 items-center">
          <Image
            alt="lyhs-plus-logo"
            src={`${theme === "dark" ? "/logo-light.svg" : "/logo.svg"}`}
            height={40}
            width={40}
          />
          <div className="p-1 px-2 border border-border rounded-full text-sm">
            Admin
          </div>
        </div>
        <div aria-label="header-part-two" className="flex justify-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div
                className={`
                    inset-0
                    bg-gradient-to-r ${gradient}
                    opacity-80 group-hover:opacity-100
                    transition-opacity
                    h-8 w-8 rounded-full
                  `}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-5">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={userLogout}>登出</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div aria-label="navbar" className="mt-2">
        <Tabs
          defaultValue={getCurrentTab()}
          value={getCurrentTab()}
          onValueChange={handleTabChange}
        >
          <TabsList variant="underline">
            <TabsTrigger variant="underline" value="overview">
              總覽
            </TabsTrigger>
            <TabsTrigger variant="underline" value="mailbox">
              學權信箱
            </TabsTrigger>
            <TabsTrigger variant="underline" value="account">
              帳號管理
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex overflow-x-auto">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              className="py-2 relative duration-300 transition-colors hover:!text-white"
              onClick={() => setActive(item)}
              onMouseEnter={() => setIsHover(item)}
              onMouseLeave={() => setIsHover(null)}
              style={{ color: active.id === item.id ? "#FFF" : "#888888" }}
            >
              <div className="px-5 py-2 relative">
                {item.tile}
                {isHover?.id === item.id && (
                  <motion.div
                    layoutId="hover-bg"
                    className="absolute bottom-0 left-0 right-0 w-full h-full bg-white/10"
                    style={{
                      borderRadius: 6,
                    }}
                  />
                )}
              </div>
              {active.id === item.id && (
                <motion.div
                  layoutId="active"
                  className="absolute bottom-0 left-0 right-0 w-full h-0.5 bg-white"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
