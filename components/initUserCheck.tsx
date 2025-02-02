"use client";
import { useEffect, useState } from "react";
import { store } from "@/store/store";
import { checkUserSession } from "@/utils/userCheck";

function getCookie(name: string) {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const lastPart = parts.pop();
      return lastPart?.split(";")[0] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function SystemCheck() {
  const [os, setOS] = useState("");
  const [browser, setBrowser] = useState("");
  const [isMobile, setIsMobile] = useState(false);

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
    const sessionId = getCookie("sessionId");
    getDeviceInfo();
    if (sessionId) {
      checkUserSession(store.dispatch, os, browser, isMobile, sessionId);
    }
  }, [os, browser, isMobile]);

  return null;
}
