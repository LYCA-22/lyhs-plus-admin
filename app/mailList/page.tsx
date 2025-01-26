"use client";
import { FormEvent, useEffect, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { apiServices } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MailTable } from "@/components/mailTable";
import { MailGrid } from "@/components/MailGrid";
import { Grid2x2, Rows3 } from "lucide-react";

interface MailItem {
  id: string;
  searchCode: string;
  title: string;
  status: string;
  createdTime: string;
  handler: string;
  email: string;
}

export default function Page() {
  const userData = useAppSelector((state) => state.userData);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<MailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const systemLoading = useAppSelector((state) => state.systemStatus.isLoading);
  const [update, setUpdate] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const getList = async (userId: string) => {
    setLoading(true);
    if (!userId) {
      setLoading(false);
      return;
    }
    const data = await apiServices.getMailList(userId);
    setData(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!systemLoading) {
      getList(userData.id);
    }
  }, [userData, systemLoading]);

  const TakeOver = async (code: string, e: FormEvent) => {
    e.preventDefault();
    setUpdate(true);
    await apiServices.updateMail(code, userData.name, "處理中");
    setUpdate(false);
    window.location.reload();
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-semibold">MailBox List</h1>
        <div className="flex items-center gap-5">
          <p className="text-sm font-medium opacity-70">顯示模式</p>
          <div className="flex gap-2 bg-background border border-border rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`${viewMode === "grid" ? "bg-hoverbg" : ""} p-2 rounded-lg`}
            >
              <Grid2x2 className="opacity-60" size={20} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`${viewMode === "table" ? "bg-hoverbg" : ""} p-2 rounded-lg`}
            >
              <Rows3 className="opacity-60" size={20} />
            </button>
          </div>
        </div>
      </div>
      {viewMode === "table" ? (
        <MailTable
          data={data}
          loading={loading}
          userData={userData}
          update={update}
          onTakeOver={TakeOver}
          setIsOpen={setIsOpen}
        />
      ) : (
        <MailGrid
          data={data}
          loading={loading}
          userData={userData}
          update={update}
          onTakeOver={TakeOver}
          setIsOpen={setIsOpen}
        />
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader className="space-y-3 mt-1">
            <DialogTitle>您無權限查閱此信件。</DialogTitle>
            <DialogDescription>
              此信件有可能尚未有人承辦，或是您無權限查閱此信件。如有任何問題請聯絡資訊組。
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
