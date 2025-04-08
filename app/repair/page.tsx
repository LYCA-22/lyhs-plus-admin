"use client";

import { apiServices } from "@/services/api";
import { useAppSelector } from "@/store/hook";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Trash2, ClipboardEdit, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RepairCase {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  imageName: string;
  created_at: string;
  updated_at: string;
  ImageUrl: string;
}

export default function RepairPage() {
  const router = useRouter();
  const userData = useAppSelector((state) => state.userData);
  const [data, setData] = useState<RepairCase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const result = await apiServices.listCases(userData.sessionId);
        setData(result);
        console.log(result);
      } catch (error) {
        console.error("Error fetching repair cases:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData.sessionId) {
      getData();
    }
  }, [userData]);

  const transformTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleString("zh-TW");
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      setUpdateLoading(true);
      setData(
        data.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteCase = async (id: number) => {
    try {
      setDeleteLoading(true);
      setData(data.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting case:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-semibold">報修案件</h1>
        </div>
        <div className="text-center py-8 text-muted-foreground">載入中...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold">報修案件</h1>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          目前沒有報修案件
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((repairCase) => (
            <div
              key={repairCase.id}
              className="bg-background dark:bg-zinc-900 hover:bg-accent dark:hover:bg-zinc-800 rounded-xl border border-border shadow-sm p-4 cursor-pointer transition-colors"
              onClick={(e) => {
                const target = e.target as Element;
                if (
                  !target.closest('[role="menuitem"]') &&
                  !target.closest('[role="dialog"]')
                ) {
                  router.push(`/repair/${repairCase.id}`);
                }
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-sm text-muted-foreground">
                  #{repairCase.id}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="rounded-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="flex p-1 justify-center items-center rounded-sm dark:hover:bg-zinc-700 hover:bg-zinc-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Ellipsis
                        size={20}
                        className="text-foreground opacity-50"
                      />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem
                      className="justify-between"
                      onClick={() =>
                        handleStatusUpdate(repairCase.id, "處理中")
                      }
                      disabled={updateLoading || repairCase.status === "處理中"}
                    >
                      {updateLoading ? "更新中..." : "設為處理中"}
                      <ClipboardEdit size={15} />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="justify-between"
                      onClick={() =>
                        handleStatusUpdate(repairCase.id, "已完成")
                      }
                      disabled={updateLoading || repairCase.status === "已完成"}
                    >
                      {updateLoading ? "更新中..." : "設為已完成"}
                      <CheckCircle size={15} />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="!text-red-600 dark:hover:!bg-red-950 hover:!bg-red-100 justify-between"
                      onClick={() => handleDeleteCase(repairCase.id)}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? "刪除中..." : "刪除案件"}
                      <Trash2 size={15} />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="font-semibold mb-2 line-clamp-2">
                {repairCase.title}
              </h3>

              {repairCase.ImageUrl && (
                <div className="mb-3">
                  <Dialog
                    open={
                      isImageDialogOpen && selectedImage === repairCase.ImageUrl
                    }
                    onOpenChange={(open) => {
                      setIsImageDialogOpen(open);
                      if (!open) setSelectedImage("");
                    }}
                  >
                    <DialogTrigger
                      asChild
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(repairCase.ImageUrl);
                        setIsImageDialogOpen(true);
                      }}
                    >
                      <div className="w-full h-32 relative overflow-hidden rounded-lg cursor-pointer">
                        <Image
                          src={repairCase.ImageUrl}
                          alt="報修照片"
                          layout="fill"
                          objectFit="cover"
                          className="hover:scale-105 transition-transform"
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-3xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DialogHeader>
                        <DialogTitle>照片詳情</DialogTitle>
                      </DialogHeader>
                      <div className="relative w-full h-[60vh]">
                        <Image
                          src={selectedImage}
                          alt="報修照片"
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {repairCase.description}
              </p>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between items-center">
                  <span className="min-w-[80px]">狀態：</span>
                  <span
                    className={`font-medium grow border-b border-border flex justify-end py-1 ${
                      repairCase.status === "已完成"
                        ? "text-green-600"
                        : repairCase.status === "處理中"
                          ? "text-blue-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {repairCase.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="min-w-[80px]">分類：</span>
                  <span className="grow border-b border-border flex justify-end py-1">
                    {repairCase.category}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="min-w-[80px]">提交時間：</span>
                  <span className="grow border-b border-border flex justify-end py-1">
                    {transformTime(repairCase.created_at)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="min-w-[80px]">更新時間：</span>
                  <span className="grow flex justify-end pt-1">
                    {transformTime(repairCase.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
