"use client";
import { apiServices } from "@/services/api";
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import { RotateCw } from "lucide-react";
import { BackendStatus } from "@/types";

export default function Page() {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBackendStatus = async () => {
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
    getBackendStatus();
  }, []);

  const handleRefresh = () => {
    getBackendStatus();
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
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border-border border shadow-sm flex flex-col gap-3 transition-all min-w-[350px]">
      {loading ? (
        <div className="flex items-center justify-center p-5">
          <Loader />
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
              {new Date(data.timestamp).toLocaleString()}
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
    <div className="flex flex-col gap-2 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">System Status</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="hover:bg-hoverbg px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCw size={15} className={loading ? "animate-spin" : ""} />
          重新載入
        </button>
      </div>
      <StatusCard
        data={status}
        title="LYHS+ Backend Status (Cloudflare Worker)"
      />
    </div>
  );
}
