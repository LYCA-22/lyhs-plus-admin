"use client";
import { useEffect, useState, FormEvent } from "react";
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
  const sessionId = useAppSelector((state) => state.userData.sessionId);
  const userData = useAppSelector((state) => state.userData);
  const isLoaded = useAppSelector((state) => state.systemStatus.isLoading);
  const [data, setData] = useState<MailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");
  const [update, setUpdate] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const transformTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleString();
  };

  const UpdateProject = async (e: FormEvent) => {
    e.preventDefault();
    setUpdate(true);
    await apiServices.updateMail(code, userData.name, status);
    setUpdate(false);
    window.location.reload();
  };

  useEffect(() => {
    const getMailItem = async () => {
      try {
        setLoading(true);
        const data = await apiServices.getMailDetail(code, sessionId);
        setData(data);
        setStatus(data.status);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoaded) {
      getMailItem();
    }
  }, [code, sessionId, isLoaded]);

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
          className="bg-white dark:bg-zinc-900 rounded-xl border my-2 h-[fit-content]"
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
              <div className="grow border-b py-1 border-border flex justify-end font-bold">
                <span>{data.searchCode}</span>
              </div>
              <button
                className="m-1 border border-border rounded-lg p-1 px-2 ml-2 hover:bg-hoverbg"
                onClick={() => copyCode(data.searchCode)}
              >
                {copied ? "已複製" : "複製"}
              </button>
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
                {transformTime(data.createdTime)}
              </span>
            </li>
            <li
              aria-label="inf-uptime"
              className="flex justify-between items-center mt-2"
            >
              <span className="min-w-[100px]">更新時間</span>
              <span className="py-1 flex justify-end grow text-sm ">
                {transformTime(data.updatedTime)}
              </span>
            </li>
          </ul>
        </div>
        <div
          aria-label="box-rightside"
          className="bg-white dark:bg-zinc-900 rounded-xl border p-4 my-2 grow overflow-y-auto"
        >
          <div>
            <ul className="m-4">
              <li
                aria-label="inf-title"
                className="flex items-center gap-2 font-medium text-[18px]"
              >
                <Info />
                信件內容
              </li>
              <li
                aria-label="inf-code"
                className="flex justify-between items-center mt-2"
              >
                <span className="min-w-[100px]">類別</span>
                <div className="grow border-b py-1 border-border flex justify-end">
                  <span>{data.type}</span>
                </div>
              </li>
              <li
                aria-label="inf-code"
                className="flex justify-between items-center mt-2"
              >
                <span className="min-w-[100px]">大綱</span>
                <div className="grow border-b py-1 border-border flex justify-end">
                  <span>{data.title}</span>
                </div>
              </li>
              <li
                aria-label="inf-id"
                className="flex justify-between items-center mt-2"
              >
                <span className="min-w-[100px]">說明</span>
                <span className="border-b py-1 border-border flex justify-end grow text-sm text-end">
                  {data.description}
                </span>
              </li>
              <li
                aria-label="inf-crtime"
                className="flex justify-between items-center mt-2"
              >
                <span className="min-w-[100px]">解決方式</span>
                <span className="py-1 flex justify-end grow text-sm ">
                  {data.solution}
                </span>
              </li>
            </ul>
          </div>
          <div className="w-full h-[1px] bg-border"></div>
          <form className="m-2" onSubmit={(e) => UpdateProject(e)}>
            <div className="p-2 flex flex-col space-y-4">
              <div>
                <label htmlFor="status" className="font-medium">
                  狀態資訊
                </label>
                <p className="my-1 text-sm opacity-60">
                  輸入良好的敘述可幫助投信者更快進入狀況，且不會造成不必要的慌張。辛苦承辦人啦～加油！
                </p>
              </div>
              <input
                id="status"
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 border border-border rounded-lg p-2 px-4 w-full transition-all"
              />
            </div>
            <div className="p-2 flex flex-col space-y-4">
              <div>
                <label htmlFor="handler" className="font-medium">
                  承辦人
                </label>
                <p className="my-1 text-sm opacity-60">
                  負責處理此次信件的人員。
                </p>
              </div>
              <input
                id="handler"
                type="text"
                value={data.handler}
                disabled
                readOnly
                className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 border border-border rounded-lg p-2 px-4 w-full transition-all"
              />
            </div>
            <div className="p-2 flex">
              <button
                disabled={update}
                className="ml-auto bg-foreground text-background rounded-lg p-2 px-4 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {update ? "更新中..." : "更新信件資訊"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
