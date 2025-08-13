"use client";
import { useEffect, useState } from "react";
import { store } from "@/store/store";
import { checkUserSession } from "@/utils/userCheck";
import { IonSpinner } from "@ionic/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/store/hook";
import Link from "next/link";

export default function SystemCheck() {
  const [os, setOS] = useState("");
  const [browser, setBrowser] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const systemData = useAppSelector((state) => state.systemStatus);

  useEffect(() => {
    if (systemData.userCheck) {
      setDialogOpen(true);
    } else {
      setDialogOpen(false);
    }
  }, [systemData]);

  const getDeviceInfo = async () => {
    const userAgent = navigator.userAgent;
    let os = "Unknown";
    let browser = "Unknown";

    // 檢測操作系統
    if (userAgent.indexOf("Win") !== -1) os = "Windows";
    if (userAgent.indexOf("Mac") !== -1) os = "MacOS";
    if (userAgent.indexOf("Linux") !== -1) os = "Linux";
    if (userAgent.indexOf("Android") !== -1) os = "Android";
    if (userAgent.indexOf("iPhone") !== -1) os = "iOS";

    // 檢測瀏覽器
    if (userAgent.indexOf("Chrome") !== -1) browser = "Chrome";
    if (userAgent.indexOf("Firefox") !== -1) browser = "Firefox";
    if (userAgent.indexOf("Safari") !== -1) browser = "Safari";
    if (userAgent.indexOf("Edge") !== -1) browser = "Edge";
    if (userAgent.indexOf("Opera") !== -1) browser = "Opera";

    setOS(os);
    setBrowser(browser);
  };

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 640px)").matches);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  useEffect(() => {
    getDeviceInfo();
    checkUserSession(store.dispatch, os, browser, isMobile);
  }, [os, browser, isMobile]);

  return (
    <Dialog open={dialogOpen}>
      <DialogContent closeBtn={false}>
        {systemData.sessionIdValid ? (
          <div className="flex items-center justify-center flex-col gap-2">
            <IonSpinner name="lines" className="opacity-50"></IonSpinner>
            <h2 className="font-medium opacity-50">正在檢查您的登入憑證</h2>
          </div>
        ) : (
          <DialogHeader className="space-y-3 mt-1">
            <DialogTitle>您的帳號權限不足。</DialogTitle>
            <DialogDescription>
              您的權限過低，導致無法瀏覽本網站。請聯絡班聯會資訊組升級您的帳號等級。
            </DialogDescription>
            <Link
              href="/login"
              className="bg-foreground p-3 rounded-xl text-center w-full text-background"
            >
              重新登入
            </Link>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
}
