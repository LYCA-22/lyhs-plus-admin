import { FormEvent } from "react";
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
import { Ellipsis, Trash2, Stamp, Hand } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserData } from "@/types";

interface MailItem {
  id: string;
  searchCode: string;
  title: string;
  status: string;
  createdTime: string;
  handler: string;
  email: string;
}

interface MailTableProps {
  data: MailItem[];
  loading: boolean;
  userData: UserData;
  update: boolean;
  onTakeOver: (code: string, e: FormEvent) => void;
  setIsOpen: (value: boolean) => void;
  deleteProject: (code: string) => void;
  deleteLoading: boolean;
}

export function MailTable({
  data,
  loading,
  userData,
  update,
  onTakeOver,
  setIsOpen,
  deleteProject,
  deleteLoading,
}: MailTableProps) {
  const router = useRouter();

  const transformTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleString("zh-TW");
  };

  return (
    <div>
      <Table className="bg-background dark:bg-zinc-900">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">案件代碼</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead>標題</TableHead>
            <TableHead>電子郵件</TableHead>
            <TableHead>承辦人</TableHead>
            <TableHead>提交時間</TableHead>
            <TableHead className="min-w-[50px]">動作</TableHead>
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
                    {userData.level === "L3" ||
                    (userData.level === "A1" && userData.type === "staff")
                      ? "目前沒有郵件"
                      : "您沒有權限查閱，若需查閱此頁內容請聯絡資訊組升級您帳號的等級。"}
                  </>
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((mail) => (
              <TableRow
                key={mail.id}
                className="cursor-pointer hover:bg-hoverbg"
                onClick={(e) => {
                  const target = e.target as Element;
                  if (
                    mail.handler === userData.name &&
                    !target.closest('[role="menuitem"]')
                  ) {
                    router.push(`/mailItem/${mail.id}?code=${mail.searchCode}`);
                  } else {
                    setIsOpen(true);
                  }
                }}
              >
                <TableCell className="font-medium pl-4">
                  {mail.searchCode}
                </TableCell>
                <TableCell>{mail.status}</TableCell>
                <TableCell>{mail.title}</TableCell>
                <TableCell>{mail.email}</TableCell>
                <TableCell>
                  {mail.handler === "" ? "無" : mail.handler}
                </TableCell>
                <TableCell>{transformTime(mail.createdTime)}</TableCell>
                <TableCell className="min-w-[50px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="rounded-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex p-1 justify-center items-center rounded-xl hover:bg-zinc-300 hover:dark:bg-zinc-600">
                        <Ellipsis
                          size={20}
                          className="text-foreground opacity-50"
                        />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="mr-5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {mail.handler === "" && (
                        <>
                          <p className="p-2 text-xs opacity-50 max-w-[220px]">
                            目前信件尚無人承辦，點擊下方的接管即可開始作業。
                          </p>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => onTakeOver(mail.searchCode, e)}
                            className="justify-between"
                          >
                            {update ? (
                              "處理中..."
                            ) : (
                              <>
                                承辦此信件
                                <Hand size={15} />
                              </>
                            )}
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        className="justify-between"
                        disabled={
                          mail.handler === "" || mail.handler !== userData.name
                        }
                      >
                        結案
                        <Stamp size={15} />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="!text-red-600 dark:hover:!bg-red-950 hover:!bg-red-100 justify-between"
                        disabled={
                          mail.handler === "" || mail.handler !== userData.name
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          deleteProject(mail.searchCode);
                        }}
                      >
                        {deleteLoading ? "刪除中..." : "刪除"}
                        <Trash2 size={15} />
                      </DropdownMenuItem>
                      {userData.level === "A1" &&
                        mail.handler !== userData.name && (
                          <DropdownMenuItem className="!text-red-600 dark:hover:!bg-red-950 hover:!bg-red-100 justify-between">
                            強制刪除
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
