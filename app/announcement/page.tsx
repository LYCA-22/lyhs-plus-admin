"use client";
import { useCallback } from "react";
import { useAppSelector } from "@/store/hook";
import { AnnouncementForm } from "./form";

export default function AnnouncementPage() {
  const userData = useAppSelector((state) => state.userData);
  const Loaded = useAppSelector((state) => state.systemStatus.isLoading);

  const handleAnnouncementCreated = useCallback(() => {
    // 這裡可以用來刷新公告列表或其他需要的操作
    // 可以在這裡添加刷新公告列表的邏輯
    console.log("公告創建成功");
  }, []);

  if (Loaded) {
    return (
      <div className="p-4 space-x-3 flex items-center">
        <div className="w-6 h-6 rounded-full border-[2px] border-border border-t-foreground animate-spin" />
        <p className="font-medium">載入資料中</p>
      </div>
    );
  }

  if (userData.level !== "A1" && userData.level !== "A2") {
    return (
      <div className="p-4">
        <div className="text-center text-muted-foreground">
          您無權限查看此頁面
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold">公告管理</h1>
        <AnnouncementForm onSuccess={handleAnnouncementCreated} />
      </div>

      <div className="space-y-4">
        {/* 這裡可以放置公告列表 */}
        <div className="text-center text-muted-foreground py-8">
          <p>未來這裡會顯示公告列表</p>
          <p className="text-sm mt-2">
            點擊右上角的「新增公告」按鈕來建立新的公告
          </p>
        </div>
      </div>
    </div>
  );
}
