"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiServices } from "@/services/api";
import { useAppSelector } from "@/store/hook";
import { BookOpenText, Info } from "lucide-react";

export const runtime = "edge";
interface MailItem {
  id: string;
  searchCode: string;
  email: string;
  name: string;
  type: string;
  title: string;
  description: string;
  class: string;
  number: string;
  solution: string;
  handler?: string;
  status?: string;
  createdTime: string;
  updatedTime: string;
}

export default function MailItemPage() {
  const params = useParams();
  const id = params.id as string;
  const code = useSearchParams().get("code") as string;
  const userId = useAppSelector((state) => state.userData.id);
  const isLoaded = useAppSelector((state) => state.systemStatus.isLoading);
  const [data, setData] = useState<MailItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMailItem = async () => {
      try {
        setLoading(true);
        const data = await apiServices.getMailDetail(code, userId);
        setData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoaded) {
      getMailItem();
    }
  }, [code, userId, isLoaded]);

  useEffect(() => {
    if (!loading && data) {
      if (id !== data.id) {
        window.alert("發生不明錯誤");
        window.location.href = "/mailList";
      }
    }
  }, [id, data, loading]);

  if (loading) {
    return (
      <div className="p-4 space-x-3 flex items-center">
        <div className="w-6 h-6 rounded-full p-1 border-[3px] border-b-foreground animate-spin bg-transparent"></div>
        <p className="font-medium">載入資料中</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-4">發生錯誤</h1>
        <p className="text-muted-foreground">
          系統無法找到對應的郵件資訊，可能是您帳號的權限無法檢視此信件，或是信件已被刪除。
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col">
      <h1 className="text-xl font-semibold">信件管理</h1>
      <div
        aria-label="content"
        className="flex grow gap-5 max-sm:flex-col mt-2"
      >
        <div
          aria-label="box-leftside"
          className="bg-white rounded-xl border my-2"
        >
          <ul className="m-4">
            <li
              aria-label="mail-title"
              className="flex items-center gap-2 font-medium text-[18px]"
            >
              <BookOpenText />
              寄件人資訊
            </li>
            <div className="flex flex-col space-y-3 mt-3 pr-2">
              <li
                aria-label="mail-name"
                className="flex justify-between items-center"
              >
                <span className="min-w-[100px]">姓名</span>
                <span className="grow border-b py-1 border-border flex justify-end">
                  {data.name}
                </span>
              </li>
              <li
                aria-label="mail-email"
                className="flex justify-between items-center"
              >
                <span className="min-w-[100px]">電子郵件</span>
                <span className="grow border-b py-1 border-border flex justify-end">
                  {data.email}
                </span>
              </li>
              <li
                aria-label="mail-class"
                className="flex justify-between items-center"
              >
                <span className="min-w-[100px]">班級</span>
                <span className="grow border-b py-1 border-border flex justify-end">
                  {data.class}
                </span>
              </li>
              <li
                aria-label="mail-name"
                className="flex justify-between items-center"
              >
                <span className="min-w-[100px]">座號</span>
                <span className="grow pt-1 flex justify-end">
                  {data.number}
                </span>
              </li>
            </div>
          </ul>
          <div className="h-[1px] w-full bg-border"></div>
          <ul className="m-4">
            <li
              aria-label="inf-title"
              className="flex items-center gap-2 font-medium text-[18px]"
            >
              <Info />
              信件資訊
            </li>
            <li
              aria-label="inf-code"
              className="flex justify-between items-center mt-2"
            >
              <span className="min-w-[100px]">信件專用代碼</span>
              <span className="grow border-b py-1 border-border flex justify-end font-bold">
                {data.searchCode}
              </span>
            </li>
            <li
              aria-label="inf-id"
              className="flex justify-between items-center mt-2"
            >
              <span className="min-w-[100px]">信件ID</span>
              <span className="border-b py-1 border-border flex justify-end grow text-sm text-end">
                {data.id}
              </span>
            </li>
            <li
              aria-label="inf-crtime"
              className="flex justify-between items-center mt-2"
            >
              <span className="min-w-[100px]">建立時間</span>
              <span className="border-b py-1 border-border flex justify-end grow text-sm ">
                {data.createdTime}
              </span>
            </li>
            <li
              aria-label="inf-uptime"
              className="flex justify-between items-center mt-2"
            >
              <span className="min-w-[100px]">更新時間</span>
              <span className="py-1 flex justify-end grow text-sm ">
                {data.updatedTime}
              </span>
            </li>
          </ul>
        </div>
        <div
          aria-label="box-rightside"
          className="bg-white rounded-xl border p-4 my-2"
        ></div>
      </div>
    </div>
  );
}
