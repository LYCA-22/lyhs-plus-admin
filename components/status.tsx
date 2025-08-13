"use client";
import { apiServices } from "@/services/api";
import { BackendStatus } from "@/types";
import { RotateCw } from "lucide-react";
import { IonSpinner } from "@ionic/react";
import { useEffect, useState } from "react";

export const StatusCard = () => {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    getBackendData();
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border-border border shadow-sm flex flex-col gap-3 transition-all">
      {loading ? (
        <div className="flex items-center justify-center p-5 flex-col gap-5 font-bold">
          <IonSpinner name="lines" className="opacity-50"></IonSpinner>
          檢測中
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-5 text-destructive">
          {error}
        </div>
      ) : status ? (
        <>
          <div className="flex items-center">
            <div>
              <h2 className="text-lg font-bold">後端服務狀態</h2>
              <p className="text-[14px] text-muted-foreground">
                更新時間：{new Date(status.timestamp).toLocaleString("zh-TW")}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="hover:bg-border border border-border transition-all p-2 ml-8 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <RotateCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">系統狀態</span>
              <span
                className={`text-sm font-medium ${getStatusColor(status.status)}`}
              >
                {getStatusText(status.status)}
              </span>
            </div>

            {status.version && (
              <div className="flex justify-between items-center">
                <span className="text-sm">版本</span>
                <span className="text-sm font-medium">{status.version}</span>
              </div>
            )}

            {status.environment && (
              <div className="flex justify-between items-center">
                <span className="text-sm">環境</span>
                <span className="text-sm font-medium">
                  {status.environment}
                </span>
              </div>
            )}
          </div>

          {status.services && (
            <div className="space-y-2 border-t pt-3">
              <h2 className="text-sm font-medium">Cloudflare D1 資料庫狀態</h2>
              <div className="flex justify-between items-center">
                <span className="text-sm">連接狀態</span>
                <span
                  className={`text-sm font-medium ${getStatusColor(status.services.database.status)}`}
                >
                  {getStatusText(status.services.database.status)}
                </span>
              </div>
              {status.services.database.latency && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">延遲</span>
                  <span className="text-sm font-medium">
                    {status.services.database.latency}
                  </span>
                </div>
              )}
              {status.services.database.error && (
                <div className="text-sm text-destructive">
                  {status.services.database.error}
                </div>
              )}
            </div>
          )}

          {status.error && (
            <div className="text-sm text-destructive mt-2">{status.error}</div>
          )}
        </>
      ) : null}
    </div>
  );
};
