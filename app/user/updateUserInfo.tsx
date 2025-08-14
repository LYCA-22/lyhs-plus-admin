"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApiUserData } from "@/types";

export default function UpdateUserInfo({
  itemData,
}: {
  itemData: ApiUserData;
}) {
  return (
    <Dialog>
      <DialogTrigger>
        <button className="bg-hoverbg rounded-xl p-2 font-medium text-sm hover:bg-foreground hover:text-background transition-all">
          更新資訊
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>帳號用戶更新</DialogTitle>
          <div>{itemData.name}</div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
