"use client";
import { useCallback, useEffect, useState } from "react";
import { apiServices } from "@/services/api";
import { useAppSelector } from "@/store/hook";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UpdateUserInfo from "./updateUserInfo";
import { ApiUserData, Class, Grade } from "@/types";
import { TriangleAlert } from "lucide-react";

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ApiUserData[]>([]);
  const [display, setDisplay] = useState<string>("all");
  const [displayData, setDisplayData] = useState<ApiUserData[]>([]);
  const userData = useAppSelector((state) => state.userData);
  const Loaded = useAppSelector((state) => state.systemStatus.isLoading);

  const handleDisplay = (value: string) => {
    setDisplay(value);
    if (value === "all") {
      setDisplayData(data);
    } else if (value === "G1") {
      setDisplayData(data.filter((item) => item.grade === "G1"));
    } else if (value === "G2") {
      setDisplayData(data.filter((item) => item.grade === "G2"));
    } else if (value === "G3") {
      setDisplayData(data.filter((item) => item.grade === "G3"));
    }
  };

  const getAccountData = useCallback(async () => {
    try {
      setLoading(true);
      if (!userData.sessionId) return;
      const data = await apiServices.getAccountList();
      setData(data);
      setDisplayData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userData.sessionId, setDisplayData]);

  useEffect(() => {
    if (!Loaded && userData.level === "A1") {
      getAccountData();
    } else {
      setLoading(false);
    }
  }, [Loaded, getAccountData, userData.level]);

  if (loading && !userData.level) {
    return (
      <div className="p-4 space-x-3 flex items-center">
        <div className="w-6 h-6 rounded-full border-[2px] border-border border-t-foreground animate-spin" />
        <p className="font-medium">載入資料中</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">平台使用者管理</h2>
      </div>
      <div className="w-full flex gap-4 items-center border-border border rounded-xl bg-background p-3 px-5 text-sm mb-5">
        <TriangleAlert />
        <div>
          <h2 className="font-medium">使用警告</h2>
          <p className="opacity-50 text-[12px]">
            此頁面為LYHS+平台所有使用者資料，僅供使用者提出需求時尚可進行調整。請勿將個資作為娛樂或恐嚇霸凌用途。系統皆會記載各個幹部的使用紀錄，若發現不當行為將依法處理。
          </p>
        </div>
      </div>
      <div className="my-2 flex items-center gap-2 font-medium text-[14px]">
        <button
          className={`border ${display == "all" ? "bg-foreground text-background border-transparent" : "text-foreground bg-background border-border"} rounded-xl p-2 px-4`}
          onClick={() => handleDisplay("all")}
        >
          全部
        </button>
        <button
          className={`border ${display == "G1" ? "bg-foreground text-background border-transparent" : "text-foreground bg-background border-border"} rounded-xl p-2 px-4`}
          onClick={() => handleDisplay("G1")}
        >
          高一
        </button>
        <button
          className={`border ${display == "G2" ? "bg-foreground text-background border-transparent" : "text-foreground bg-background border-border"} rounded-xl p-2 px-4`}
          onClick={() => handleDisplay("G2")}
        >
          高二
        </button>
        <button
          className={`border ${display == "G3" ? "bg-foreground text-background border-transparent" : "text-foreground bg-background border-border"} rounded-xl p-2 px-4`}
          onClick={() => handleDisplay("G3")}
        >
          高三
        </button>
      </div>
      {!Loaded && userData.level === "A1" ? (
        <Table className="bg-white dark:bg-zinc-900">
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-2 w-fit">ID</TableHead>
              <TableHead className="min-w-48">姓名</TableHead>
              <TableHead>電子郵件</TableHead>
              <TableHead>班級座號</TableHead>
              <TableHead>學號</TableHead>
              <TableHead>Oauth</TableHead>
              <TableHead>建立時間</TableHead>
              <TableHead>更新時間</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground"
                >
                  {loading ? "載入中..." : "目前沒有資料"}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {displayData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-fit">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{`${Grade[item.grade]}${Class[item.class]} ${item.number}號`}</TableCell>
                    <TableCell>{item.stu_id}</TableCell>
                    <TableCell>{item.oauth}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString("zh-TW", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(item.updated_at).toLocaleString("zh-TW", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <UpdateUserInfo itemData={item} />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-muted-foreground">
          您無權限查看此頁面
        </div>
      )}
    </div>
  );
}
