"use client";
import { useEffect, useState } from "react";
import { AnnouncementForm } from "./form";
import { apiServices } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash } from "@phosphor-icons/react";

interface announcementItem {
  id: number;
  title: string;
  content: string;
  info: {
    isPriority: boolean;
    link: {
      haveLink: boolean;
      link: string;
    };
    created_info: {
      created_userId: number;
    };
  };
  imgData: string;
}

export default function AnnouncementPage() {
  const [data, setData] = useState<announcementItem[]>([]);

  const deleteAnnouncement = async (id: number) => {
    await apiServices.deleteAnnouncement(id);
    window.location.reload();
  };

  useEffect(() => {
    const getData = async () => {
      const data = await apiServices.getAllAnnouncements();
      setData(data.data);
      console.log(data);
    };

    getData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold">公告管理</h1>
        <AnnouncementForm />
      </div>

      <div className="space-y-4">
        <h2 className="font-medium">已發佈公告</h2>
        <Table className="bg-background dark:bg-zinc-900">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[20px]">id</TableHead>
              <TableHead>標題</TableHead>
              <TableHead>內容</TableHead>
              <TableHead>連結網址</TableHead>
              <TableHead>圖片</TableHead>
              <TableHead className="min-w-[50px]">動作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              <>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-10 max-w-10 min-w-1">
                      {item.id}
                    </TableCell>
                    <TableCell className="min-w-44">{item.title}</TableCell>
                    <TableCell>{item.content}</TableCell>
                    <TableCell>
                      {item.info.link.haveLink ? item.info.link.link : "-"}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      <button
                        onClick={() => deleteAnnouncement(item.id)}
                        className="font-medium bg-red-200 dark:bg-red-900 flex items-center gap-2 dark:text-red-300 rounded-xl p-2 px-3 text-[14px] text-red-700 hover:opacity-50"
                      >
                        <Trash size={20} /> 刪除
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  沒有任何公告
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
