"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiServices } from "@/services/api";
import { useAppSelector } from "@/store/hook";

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

    getMailItem();
  }, [code, userId]);

  if (loading) {
    return <div className="p-4 space-y-4"></div>;
  }

  if (!data) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-4">找不到郵件資料</h1>
        <p className="text-muted-foreground">
          無法找到對應的郵件資訊，請確認連結是否正確。
        </p>
      </div>
    );
  }

  return <div>{id}</div>;
}
