import { FormEvent } from "react";
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

interface MailGridProps {
  data: MailItem[];
  loading: boolean;
  userData: UserData;
  update: boolean;
  onTakeOver: (code: string, e: FormEvent) => void;
  setIsOpen: (value: boolean) => void;
}

export function MailGrid({
  data,
  loading,
  userData,
  update,
  onTakeOver,
  setIsOpen,
}: MailGridProps) {
  const router = useRouter();

  const transformTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleString("zh-TW");
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">載入中...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        {userData.level === "L3" ||
        (userData.level === "A1" && userData.type === "staff")
          ? "目前沒有郵件"
          : "您沒有權限查閱，若需查閱此頁內容請聯絡資訊組升級您帳號的等級。"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((mail) => (
        <div
          key={mail.id}
          className="bg-background dark:bg-zinc-900 hover:bg-accent dark:hover:bg-zinc-800 rounded-xl border border-border shadow-sm p-4 cursor-pointer transition-colors"
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
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium text-sm text-muted-foreground">
              {mail.searchCode}
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
                  <Ellipsis size={20} className="text-foreground opacity-50" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
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
                  className="!text-red-600 hover:!bg-red-100 justify-between"
                  disabled={
                    mail.handler === "" || mail.handler !== userData.name
                  }
                >
                  刪除
                  <Trash2 size={15} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="font-semibold mb-2 line-clamp-2">{mail.title}</h3>

          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex justify-between items-center">
              <span className="min-w-[100px]">狀態：</span>
              <span className="font-medium grow border-b border-border flex justify-end py-1">
                {mail.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="min-w-[100px]">承辦人：</span>
              <span className="grow border-b border-border flex justify-end py-1">
                {mail.handler === "" ? "無" : mail.handler}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="min-w-[100px]">提交時間：</span>
              <span className="grow border-b border-border flex justify-end py-1">
                {transformTime(mail.createdTime)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="min-w-[100px]">信箱：</span>
              <span className="grow flex justify-end pt-1">{mail.email}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
