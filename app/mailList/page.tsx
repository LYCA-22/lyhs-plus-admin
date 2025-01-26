"use client";
import { FormEvent, useEffect, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const [data, setData] = useState<MailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const systemLoading = useAppSelector((state) => state.systemStatus.isLoading);
  const [update, setUpdate] = useState(false);
  const router = useRouter();

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
    <>
      <div className="p-2">
        <h1 className="text-xl font-semibold mb-3">MailBox List</h1>
        <Table className="bg-background dark:bg-zinc-900">
          <TableHeader>
            <TableRow>
              <TableHead>案件代碼</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>標題</TableHead>
              <TableHead>電子郵件</TableHead>
              <TableHead>承辦人</TableHead>
              <TableHead>提交時間</TableHead>
              <TableHead>行動</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  {loading ? (
                    "載入中..."
                  ) : (
                    <>
                      {userData.level === "L3" || userData.level === "A1"
                        ? "目前沒有郵件"
                        : "您沒有權限查閱，若需查閱此頁內容請聯絡資訊組升級您帳號的等級。"}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((mail) => {
                return (
                  <TableRow
                    key={mail.id}
                    className="cursor-pointer hover:bg-hoverbg"
                    onClick={(e) => {
                      const target = e.target as Element;
                      if (
                        mail.handler !== "" &&
                        !target.closest('[role="menuitem"]')
                      ) {
                        router.push(
                          `/mailItem/${mail.id}?code=${mail.searchCode}`,
                        );
                      }
                    }}
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
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="rounded-xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex p-1 justify-center items-center rounded-xl hover:bg-zinc-50 hover:dark:bg-zinc-700">
                            <Ellipsis
                              size={20}
                              className="text-foreground opacity-50"
                            />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="mr-5">
                          {mail.handler === "" && (
                            <>
                              <p className="p-2 text-xs opacity-50 max-w-[150px]">
                                目前信件尚無人接管，點擊下方的接管即可開始作業。
                              </p>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => TakeOver(mail.searchCode, e)}
                              >
                                {update ? "處理中..." : "接管"}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            disabled={
                              mail.handler === "" ||
                              mail.handler !== userData.name
                            }
                          >
                            結案
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="!text-red-600 hover:!bg-red-100"
                            disabled={
                              mail.handler === "" ||
                              mail.handler !== userData.name
                            }
                          >
                            刪除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
