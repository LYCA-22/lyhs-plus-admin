"use client";
import { Button } from "@/components/ui/button";
import { ApiService } from "@/service/api";
import { store } from "@/store/store";
import { loadUserData } from "@/store/userSlice";
import { userMemberData } from "@/types";
import {
  ArrowFromLeftStroke,
  Burger,
  DockLeft,
  DockLeftAlt,
  Group,
  HomeAlt2,
  Megaphone,
} from "@boxicons/react";
import { getCookie } from "cookies-next/client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState<userMemberData>();
  const dispatch = useDispatch();

  useEffect(() => {
    const access_token = getCookie("lyps_access_token");

    const fetchUserData = async () => {
      if (!access_token) return;

      const data = await ApiService.getUserData(access_token as string);
      dispatch(loadUserData(data));
      setUserData(data);
    };

    fetchUserData();
  }, [dispatch]);

  const appRoute = [
    {
      name: "首頁",
      icon: (
        <HomeAlt2 size="sm" pack={pathname === "/app" ? "filled" : "basic"} />
      ),
      href: "",
    },
    {
      name: "會員管理",
      icon: (
        <Group
          size="sm"
          pack={pathname === "/app/member" ? "filled" : "basic"}
        />
      ),
      href: "/member",
    },
    {
      name: "公告管理",
      icon: (
        <Megaphone
          size="sm"
          pack={pathname === "/app/ann" ? "filled" : "basic"}
        />
      ),
      href: "/ann",
    },
    {
      name: "午餐管理",
      icon: (
        <Burger
          size="sm"
          pack={pathname === "/app/lunch" ? "filled" : "basic"}
        />
      ),
      href: "/lunch",
    },
  ];

  return (
    <Provider store={store}>
      <main className="relative flex items-center h-dvh overflow-hidden">
        <div
          className={`flex flex-col space-y-3 relative bg-zinc-100 border-r border-border h-full p-3 ${isCollapsed ? "min-w-fit" : "min-w-3xs"}`}
        >
          <div className="flex items-center justify-between">
            <Image
              src={"/assets/lyps.svg"}
              alt="lyps logo"
              width={30}
              height={30}
              className={isCollapsed ? "hidden" : ""}
            />
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-zinc-200 rounded-md"
            >
              {!isCollapsed ? (
                <DockLeftAlt size="sm" />
              ) : (
                <DockLeft size="sm" />
              )}
            </button>
          </div>
          {isCollapsed && <div className="w-full h-px bg-zinc-300"></div>}
          <div className="grow flex flex-col justify-between">
            <ul>
              {appRoute.map((item, index) => (
                <li key={index}>
                  <Link
                    href={"/app" + item.href}
                    className={`font-medium p-2 flex items-center gap-2 hover:bg-zinc-200 transition-all rounded-md ${"/app" + item.href == pathname ? "bg-zinc-200" : "opacity-70"}`}
                  >
                    {item.icon}
                    <p className={isCollapsed ? "hidden" : ""}>{item.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 justify-center">
              <div className="rounded-full h-7 w-7 flex items-center justify-center bg-sky-500 text-white font-medium">
                {userData?.zh_name[0]}
              </div>
              {!isCollapsed && (
                <>
                  <div>
                    <p className="font-medium">{userData?.zh_name}</p>
                    <p className="opacity-50 text-xs">
                      {userData?.grade}
                      {userData?.class_name} {userData?.number}號
                    </p>
                  </div>
                  <Button className="rounded-full ml-auto">
                    <ArrowFromLeftStroke />
                    登出
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white h-full overflow-y-auto grow relative p-5">
          {children}
        </div>
      </main>
    </Provider>
  );
}
