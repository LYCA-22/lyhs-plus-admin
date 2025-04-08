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
import Link from "next/link";
import { LogOut, UserPen } from "lucide-react";
import {
  House,
  EnvelopeSimple,
  EnvelopeSimpleOpen,
  UserFocus,
  CalendarDots,
  Wrench,
} from "@phosphor-icons/react";

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
  icon: React.ReactNode;
  "active-icon": React.ReactNode;
};

const ITEMS: Props[] = [
  {
    id: 1,
    tile: "總覽",
    link: "/",
    icon: <House size={23} />,
    "active-icon": <House size={23} weight="fill" />,
  },
  {
    id: 2,
    tile: "學權信箱",
    link: "/mailList",
    icon: <EnvelopeSimple size={23} />,
    "active-icon": <EnvelopeSimpleOpen size={23} weight="fill" />,
  },
  {
    id: 3,
    tile: "註冊代碼管理",
    link: "/staff",
    icon: <UserFocus size={23} />,
    "active-icon": <UserFocus size={23} weight="fill" />,
  },
  {
    id: 4,
    tile: "行事曆",
    link: "/calendar",
    icon: <CalendarDots size={23} />,
    "active-icon": <CalendarDots size={23} weight="fill" />,
  },
  {
    id: 5,
    tile: "報修案件",
    link: "/repair",
    icon: <Wrench size={23} />,
    "active-icon": <Wrench size={23} weight="fill" />,
  },
];

export function Header() {
  const [theme, setTheme] = useState("");
  const [mounted, setMounted] = useState(false);
  const [gradient] = useState(
    () => gradientPresets[Math.floor(Math.random() * gradientPresets.length)],
  );
  const pathname = usePathname();
  const userData = useAppSelector((state) => state.userData);
  const isLoaded = useAppSelector((state) => state.systemStatus.isLoading);
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
    if (userData.type !== "staff" && !isLoaded) {
      setDialogOpen(true);
    } else {
      setDialogOpen(false);
    }
  }, [userData, isLoaded]);

  if (!mounted) {
    return null;
  }

  return (
    <header className="p-3 border-r border-border flex flex-col justify-between items-center py-5 dark:bg-zinc-900">
      <SystemCheck />
      <div className="flex flex-col justify-between">
        <div
          aria-label="header-part-one"
          className="flex flex-col gap-2 justify-center"
        >
          <Image
            alt="lyhs-plus-logo"
            src={`${theme === "dark" ? "/logo-light.svg" : "/logo.svg"}`}
            height={40}
            width={40}
          />
        </div>
      </div>
      <div aria-label="navbar" className="mt-2">
        <div className="flex overflow-x-auto flex-col gap-4">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              className={`relative transition-all hover:bg-hoverbg hover:text-primary flex items-center rounded-[10px] justify-center active:scale-95 ${pathname === item.link ? "bg-primary text-background" : ""}`}
            >
              <Link className="relative p-[10px]" href={item.link}>
                {pathname === item.link ? (
                  <>{item["active-icon"]}</>
                ) : (
                  <>{item.icon}</>
                )}
              </Link>
            </button>
          ))}
        </div>
      </div>
      <div aria-label="header-part-two" className="flex flex-col gap-2">
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
          <DropdownMenuContent className="ml-5">
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
      <Dialog open={dialogOpen}>
        <DialogContent closeBtn={false}>
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
