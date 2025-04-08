"use client";
import { apiServices } from "@/services/api";
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import { RotateCw } from "lucide-react";
import { BackendStatus } from "@/types";
import { useAppSelector } from "@/store/hook";
import Link from "next/link";
import { UserList } from "@phosphor-icons/react";

export default function Page() {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountCount, setAccountCount] = useState<number>(0);
  const userData = useAppSelector((state) => state.userData);

  const getBackendData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiServices.getBackendStatus();
      setStatus(data);
    } catch (e) {
      console.error(e);
      setError("無法載入系統狀態");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBackendData();
  }, []);

  useEffect(() => {
    const getAccountCount = async () => {
      const count = await apiServices.getAccountTotal(userData.sessionId);
      setAccountCount(count);
    };

    getAccountCount();
  }, [userData.sessionId]);

  const handleRefresh = () => {
    getBackendData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
      case "connected":
        return "text-green-500";
      case "degraded":
      case "disconnected":
        return "text-yellow-500";
      default:
        return "text-destructive";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational":
        return "● 運作正常";
      case "degraded":
        return "部分服務異常";
      case "connected":
        return "● 已連接";
      case "disconnected":
        return "連接失敗";
      default:
        return "狀態未知";
    }
  };

  const StatusCard = ({
    data,
    title,
  }: {
    data: BackendStatus | null;
    title: string;
  }) => (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border-border border shadow-sm flex flex-col gap-3 transition-all">
      {loading ? (
        <div className="flex items-center justify-center p-5 flex-col gap-5 font-bold">
          <Loader />
          檢測中
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-5 text-destructive">
          {error}
        </div>
      ) : data ? (
        <>
          <div>
            <h1 className="text-lg font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">
              更新時間：{new Date(data.timestamp).toLocaleString("zh-TW")}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">系統狀態</span>
              <span
                className={`text-sm font-medium ${getStatusColor(data.status)}`}
              >
                {getStatusText(data.status)}
              </span>
            </div>

            {data.version && (
              <div className="flex justify-between items-center">
                <span className="text-sm">版本</span>
                <span className="text-sm font-medium">{data.version}</span>
              </div>
            )}

            {data.environment && (
              <div className="flex justify-between items-center">
                <span className="text-sm">環境</span>
                <span className="text-sm font-medium">{data.environment}</span>
              </div>
            )}
          </div>

          {data.services && (
            <div className="space-y-2 border-t pt-3">
              <h2 className="text-sm font-medium">Cloudflare D1 資料庫狀態</h2>
              <div className="flex justify-between items-center">
                <span className="text-sm">連接狀態</span>
                <span
                  className={`text-sm font-medium ${getStatusColor(data.services.database.status)}`}
                >
                  {getStatusText(data.services.database.status)}
                </span>
              </div>
              {data.services.database.latency && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">延遲</span>
                  <span className="text-sm font-medium">
                    {data.services.database.latency}
                  </span>
                </div>
              )}
              {data.services.database.error && (
                <div className="text-sm text-destructive">
                  {data.services.database.error}
                </div>
              )}
            </div>
          )}

          {data.error && (
            <div className="text-sm text-destructive mt-2">{data.error}</div>
          )}
        </>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-wrap gap-2">
      <div className="w-full text-2xl p-2 font-bold border-b border-border pb-4 mb-2">
        LYHS Plus 總覽表
      </div>
      <div className="flex flex-col gap-2 p-2">
        <div className="flex justify-between items-center mb-2 min-w-[450px] h-[45px]">
          <h1 className="text-xl font-semibold">服務狀態</h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="hover:bg-border border border-border transition-all px-3 py-2 rounded-full flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <RotateCw size={15} className={loading ? "animate-spin" : ""} />
            重新偵測
          </button>
        </div>
        <StatusCard data={status} title="API 伺服器" />
      </div>
      <div className="flex flex-col font-custom p-2 gap-2">
        <h1 className="p-2 text-lg font-bold flex items-center h-[45px] mb-2">
          系統使用者人數
        </h1>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border-border border shadow-sm flex flex-col justify-center gap-2">
          <UserList size={32} />
          <div className="flex items-center gap-5">
            <p className="text-lg opacity-50">目前</p>
            <p className="font-custom text-4xl font-bold">{accountCount}</p>
            <p className="text-lg opacity-50">人</p>
          </div>
          <Link
            href={"https://auth.lyhsca.org/account/register"}
            target="_blank"
            className="mt-2 px-4 p-2 rounded-lg hover:bg-hoverbg border border-border text-sm"
          >
            前往一般用戶註冊
          </Link>
        </div>
      </div>
    </div>
  );
}
