"use client";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hook";
import { apiServices } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const userId = useAppSelector((state) => state.userData.id);
  const [data, setData] = useState<MailItem[]>([]);

  const getList = async (userId: string) => {
    if (!userId) return;
    const data = await apiServices.getMailList(userId);
    console.log(data);
    setData(data);
  };

  useEffect(() => {
    getList(userId);
  }, [userId]);

  return (
    <>
      <div className="mt-2 max-sm:hidden">
        <Table className="bg-background dark:bg-zinc-900">
          <TableHeader>
            <TableRow>
              <TableHead>案件代碼</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>標題</TableHead>
              <TableHead>電子郵件</TableHead>
              <TableHead>承辦人</TableHead>
              <TableHead>提交時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  目前沒有郵件
                </TableCell>
              </TableRow>
            ) : (
              data.map((mail) => {
                return (
                  <TableRow
                    key={mail.id}
                    className="cursor-pointer hover:bg-hoverbg"
                  >
                    <TableCell className="font-medium">
                      {mail.searchCode}
                    </TableCell>
                    <TableCell>{mail.status}</TableCell>
                    <TableCell>{mail.title}</TableCell>
                    <TableCell>{mail.email}</TableCell>
                    <TableCell>
                      {mail.handler === "" ? "無" : mail.handler}
                    </TableCell>
                    <TableCell>{mail.createdTime}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <div className="sm:hidden">此頁面暫不支援手機</div>
    </>
  );
}
