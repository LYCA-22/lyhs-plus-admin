"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ThemeToggle } from "./themeToggle";
import { usePathname } from "next/navigation";
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
import Link from "next/link";
import { LogOut, Plus, UserPen } from "lucide-react";
import { ITEMS } from "@/config/route";

const gradientPresets = [
  "from-blue-500 via-purple-500 to-pink-500",
  "from-green-400 via-teal-500 to-blue-500",
  "from-yellow-400 via-orange-500 to-red-500",
  "from-purple-500 via-pink-500 to-red-500",
  "from-blue-400 via-indigo-500 to-purple-500",
  "from-green-500 via-emerald-500 to-teal-500",
  "from-rose-400 via-fuchsia-500 to-indigo-500",
];

export function Header() {
  const [theme, setTheme] = useState("");
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(0);
  const [gradient] = useState(
    () => gradientPresets[Math.floor(Math.random() * gradientPresets.length)],
  );
  const pathname = usePathname();
  const userData = useAppSelector((state) => state.userData);

  const userLogout = async () => {
    await apiServices.Logout();
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

  return (
    <header className="p-3 border-r min-w-60 border-border flex flex-col py-5 dark:bg-zinc-900 relative">
      <div className="flex flex-col gap-4 h-full w-full relative">
        <div className="flex gap-2 items-center mx-2">
          <Image
            alt="lyhs-plus-logo"
            src={`${theme === "dark" ? "/logo-light.svg" : "/logo.svg"}`}
            height={40}
            width={40}
            className="w-10 h-10"
          />
          <div>
            <h1 className="opacity-50 text-sm">LYHS Plus</h1>
            <p className="font-medium font-custom">管理中心</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {ITEMS.map((item, index) => (
            <>
              {item.isGroup ? (
                <div key={index} className="flex flex-col gap-2 m-1">
                  <button
                    onClick={() =>
                      setMenuOpen(menuOpen === index + 1 ? 0 : index + 1)
                    }
                    className="px-3 font-medium opacity-60 flex w-full items-center justify-between"
                  >
                    <p>{item.title}</p>
                    <Plus
                      size={20}
                      className={`${menuOpen == index + 1 ? "rotate-45" : ""} transition-all`}
                    />
                  </button>
                  <ul
                    className={`overflow-y-hidden ${menuOpen == index + 1 ? "max-h-96" : "max-h-0"} pr-2 flex flex-col gap-1 transition-all duration-700 border-l border-border ml-3`}
                  >
                    {item.items?.map((btn, index) => (
                      <li
                        key={index}
                        className={`relative transition-all hover:bg-hoverbg hover:text-primary flex items-center rounded-r-xl justify-start active:scale-95 ${pathname === btn.link ? "bg-primary text-background" : ""}`}
                      >
                        <Link
                          className="relative p-3 px-4 w-full"
                          href={btn.link}
                        >
                          <div className="flex font-medium gap-2">
                            {pathname === btn.link ? (
                              <>
                                {btn["active-icon"]}
                                <p>{btn.title}</p>
                              </>
                            ) : (
                              <>
                                {btn.icon}
                                <p>{btn.title}</p>
                              </>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  key={index}
                  className={`relative transition-all hover:bg-hoverbg hover:text-primary flex items-center rounded-xl justify-start active:scale-95 ${pathname === item.link ? "bg-primary text-background" : ""}`}
                >
                  <Link
                    className="relative p-3 px-4 w-full"
                    href={item.link as string}
                  >
                    <div className="flex font-medium gap-2">
                      {pathname === item.link ? (
                        <>
                          {item.activeIcon}
                          <p>{item.title}</p>
                        </>
                      ) : (
                        <>
                          {item.icon}
                          <p>{item.title}</p>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
              )}
            </>
          ))}
        </div>
      </div>
      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-hoverbg rounded-xl w-full p-3 transition-all">
            <div
              className={`
                  inset-0
                  bg-gradient-to-r ${gradient}
                  opacity-80 group-hover:opacity-100
                  transition-opacity
                  h-6 w-6 rounded-full ml-1
                `}
            />
            <p>{userData.name}</p>
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
    </header>
  );
}
