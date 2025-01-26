"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ThemeToggle } from "./themeToggle";
import { usePathname } from "next/navigation";
import SystemCheck from "./initUserCheck";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/store/hook";
import { apiServices } from "@/services/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { SquareArrowOutUpRight, LogOut, UserPen } from "lucide-react";

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
  link: string;
};

const ITEMS: Props[] = [
  { id: 1, tile: "總覽", link: "/" },
  { id: 2, tile: "學權信箱", link: "/mailList" },
  { id: 3, tile: "帳號管理", link: "/account" },
];

export function Header() {
  const [isHover, setIsHover] = useState<Props | null>(null);
  const [theme, setTheme] = useState("");
  const [mounted, setMounted] = useState(false);
  const [gradient] = useState(
    () => gradientPresets[Math.floor(Math.random() * gradientPresets.length)],
  );
  const pathname = usePathname();
  const userData = useAppSelector((state) => state.userData);
  const [dialogOpen, setDialogOpen] = useState(false);

  const userLogout = async () => {
    await apiServices.Logout(userData.sessionId, userData.email);
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

  useEffect(() => {
    if (userData.type !== "staff") {
      setDialogOpen(true);
    }
  }, [userData]);

  if (!mounted) {
    return null;
  }

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
          <div className="p-1 px-2 font-medium text-[16px]">
            LYHS Plus 管理中心
          </div>
        </div>
        <div aria-label="header-part-two" className="flex justify-center gap-2">
          <div className="flex gap-2 max-sm:hidden">
            <a
              href="https://dev.plus.lyhsca.org"
              className="text-sm p-1 text-zinc-500 justify-center items-center hover:text-foreground flex gap-1"
            >
              APP
              <SquareArrowOutUpRight size={12} />
            </a>
            <a
              href="https://dev.plus.lyhsca.org"
              className="text-sm flex p-1 text-zinc-500 justify-center items-center hover:text-foreground"
            >
              Feedback
            </a>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div
                className={`
                    inset-0
                    bg-gradient-to-r ${gradient}
                    opacity-80 group-hover:opacity-100
                    transition-opacity
                    h-8 w-8 rounded-full ml-1
                  `}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-5">
              <DropdownMenuLabel className="text-[14px] pb-0 pr-4">
                {userData.name}
              </DropdownMenuLabel>
              <DropdownMenuLabel className="text-[14px] opacity-50 pt-0 font-normal pr-4">
                {userData.email}
              </DropdownMenuLabel>
              <DropdownMenuItem className="mt-1 justify-between cursor-pointer">
                帳號設定
                <UserPen size={15} />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="flex justify-between items-center text-sm pl-3">
                <p className="opacity-70">主題</p>
                <ThemeToggle />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="mt-1 cursor-pointer">
                LYHS+ 形象網站
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={userLogout}
                className="justify-between mt-1 cursor-pointer"
              >
                登出
                <LogOut size={15} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div aria-label="navbar" className="mt-2">
        <div className="flex overflow-x-auto">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              className={`py-3 relative duration-300 transition-colors ${pathname === item.link ? "text-foreground" : "text-zinc-400"}`}
              onMouseEnter={() => setIsHover(item)}
              onMouseLeave={() => setIsHover(null)}
            >
              <Link className="px-4 py-2 relative text-[15px]" href={item.link}>
                {item.tile}
                {isHover?.id === item.id && (
                  <motion.div
                    layoutId="hover-bg"
                    className="absolute bottom-0 left-0 right-0 w-full h-full bg-zinc-200/40 dark:bg-zinc-50/10"
                    style={{
                      borderRadius: 6,
                    }}
                  />
                )}
              </Link>
              {pathname === item.link && (
                <motion.div
                  layoutId="active"
                  className="absolute bottom-0 left-0 right-0 w-full h-0.5 bg-foreground"
                />
              )}
            </button>
          ))}
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader className="space-y-3 mt-1">
            <DialogTitle>您的權限不足。</DialogTitle>
            <DialogDescription>
              您的權限過低，導致無法瀏覽本網站。請聯絡班聯會資訊組升級您的帳號等級。
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
  );
}
