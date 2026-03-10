"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle, InfoCircle } from "@boxicons/react";
import Image from "next/image";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch("https://api.lyhssa.org/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: account + "@ms.ly.kh.edu.tw",
          password: password,
        }),
      });
      if (!response.ok) {
        setError("登入失敗");
        throw new Error("登入失敗");
      }
      const data = await response.json();
      document.cookie = `lyps_access_token=${data.access_token}; path=/; expires=${new Date(Date.now() + data.expires_in * 1000).toUTCString()}; SameSite=Strict; Secure`;
      document.cookie = `lyps_refresh_token=${data.refresh_token}; path=/; expires=${new Date(Date.now() + data.refresh_expires_in * 1000).toUTCString()}; SameSite=Strict; Secure`;
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="items-center flex justify-center h-dvh bg-zinc-100">
      <Image
        src={"/assets/lyps.svg"}
        alt="lyps logo"
        width={40}
        height={40}
        className="fixed top-0 left-0 m-5"
      />

      <form onSubmit={handleLogin} className="space-y-6 p-5">
        <div className="text-center">
          <h1 className="text-xl font-bold">登入</h1>
          <p className="opacity-50">請先登入您的管理員帳號以繼續。</p>
        </div>
        {error && (
          <div className="bg-red-200 rounded-md p-4 py-2 flex items-center gap-1 font-medium text-red-800">
            <AlertTriangle size="sm" />
            {error}
          </div>
        )}
        <div className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label htmlFor="account">帳號</Label>
            <div className="flex items-center">
              <Input
                id="account"
                type="text"
                placeholder="學號"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
                className="shadow-none bg-white"
              />
              <p className="font-sans mx-2">@ms.ly.kh.edu.tw</p>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">密碼</Label>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="⋯⋯"
            />
          </div>
        </div>
        <div className="border border-zinc-300 bg-zinc-200/80 rounded-md">
          <Button
            type="submit"
            className="w-full text-base h-11"
            size="icon-lg"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "登入"}
          </Button>
          <div className="flex items-center gap-1 p-2 opacity-50">
            <InfoCircle size="sm" />
            <p className="text-sm font-medium">管理員帳號請洽學生會資訊組</p>
          </div>
        </div>
        <div className="text-center opacity-50 text-base">
          <p>登入即代表您同意我們的隱私權政策與使用者協議</p>
        </div>
      </form>
    </div>
  );
}
