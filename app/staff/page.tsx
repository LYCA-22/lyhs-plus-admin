"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiServices } from "@/services/api";
import { useAppSelector } from "@/store/hook";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Copy, Check, Ellipsis, Trash2 } from "lucide-react";

interface CodeData {
  createUserId: string;
  createUserEmail: string;
  vuli: boolean;
  level: string;
  user_number: number;
  createdTime: string;
  registerCode: string;
}

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);
  const [createCodeStatus, setCreateCodeStatus] = useState<boolean>(false);
  const [vuli, setVuli] = useState<boolean>(false);
  const [level, setLevel] = useState<string>("");
  const [codeData, setCode] = useState<CodeData[]>([]);
  const [error, setError] = useState<string>("");
  const userData = useAppSelector((state) => state.userData);
  const Loaded = useAppSelector((state) => state.systemStatus.isLoading);

  const getData = useCallback(async () => {
    try {
      setLoading(true);
      setCode([]);
      const response = await apiServices.getAllCodeData(userData.sessionId);
      if (response && response.data) {
        setCode(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("獲取數據失敗");
      setCode([]);
    } finally {
      setLoading(false);
    }
  }, [userData.sessionId]);

  const createCode = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (level !== "L3" && level !== "L2" && level !== "L1") {
        setError("請輸入正確的帳號等級");
        return;
      }
      setCreateCodeStatus(true);
      await apiServices.createCode(
        userData.sessionId,
        vuli,
        level,
        setError,
        setCreateCodeStatus,
      );
      window.location.reload();
    } catch (error) {
      console.error("Error creating code:", error);
      setError("建立代碼失敗");
    } finally {
      setCreateCodeStatus(false);
    }
  };

  const deleteCode = async (code: string) => {
    try {
      await apiServices.deleteCode(userData.sessionId, code);
      setCode([]);
      setTimeout(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Error deleting code:", error);
      setError("刪除代碼失敗");
    }
  };

  useEffect(() => {
    if (!Loaded) {
      getData();
    }

    return () => {
      setCode([]);
      setLoading(true);
    };
  }, [Loaded, getData]);

  // 修改複製功能，為每個代碼設置獨立的複製狀態
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {},
  );

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedStates((prev) => ({ ...prev, [code]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [code]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  if (loading && !codeData) {
    return (
      <div className="p-4 space-x-3 flex items-center">
        <div className="w-6 h-6 rounded-full p-1 border-[3px] border-b-foreground animate-spin bg-transparent"></div>
        <p className="font-medium">載入資料中</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold">Staff 代碼管理</h1>
        <Dialog>
          <DialogTrigger className="text-[14px] font-medium p-2 px-4 rounded-xl border border-border hover:bg-hoverbg">
            建立新代碼
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>建立新代碼</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={createCode}
              className="flex flex-col gap-2 border border-border rounded-xl bg-hoverbg dark:bg-zinc-900 mt-2 p-3"
            >
              <div className="flex justify-between items-center border-b border-border pb-3">
                <div>
                  <label className="font-medium">帳號等級</label>
                  <p className="text-sm opacity-60">
                    請輸入等級，這將會作為新帳號的等級。
                  </p>
                </div>
                <input
                  className="bg-background border rounded-md p-2 text-end max-w-[100px] transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-between items-center pb-2">
                <div>
                  <label className="font-medium">大量授權</label>
                  <p className="text-sm opacity-60">
                    若未打開，此代碼只能使用一次。
                  </p>
                </div>
                <Switch checked={vuli} onCheckedChange={setVuli} />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <button
                className="bg-foreground text-background rounded-md p-2 transition-all hover:opacity-70 font-medium disabled:bg-hoverbg disabled:text-zinc-500 disabled:cursor-not-allowed"
                disabled={createCodeStatus}
              >
                建立代碼
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table className="bg-white dark:bg-zinc-900">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">代碼</TableHead>
            <TableHead>代碼類型</TableHead>
            <TableHead>帳號等級</TableHead>
            <TableHead>可用數量</TableHead>
            <TableHead>動作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!codeData || codeData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                {loading ? "載入中..." : "目前沒有代碼"}
              </TableCell>
            </TableRow>
          ) : (
            <>
              {codeData.map((code, index) => (
                <TableRow key={index}>
                  <TableCell className="flex justify-between items-center">
                    {code.registerCode}
                    <button
                      className="p-1 border border-border rounded-md"
                      onClick={() => handleCopyCode(code.registerCode)}
                    >
                      複製
                    </button>
                  </TableCell>
                  <TableCell>{code.vuli ? "大量授權" : "一般"}</TableCell>
                  <TableCell>{code.level}</TableCell>
                  <TableCell>{code.user_number}</TableCell>
                  <TableCell className="items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex p-1 justify-center w-fit items-center rounded-xl hover:bg-zinc-300 hover:dark:bg-zinc-600">
                          <Ellipsis
                            size={20}
                            className="text-foreground opacity-50"
                          />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="mr-5 -mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              查閱註冊連結
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>註冊連結查閱</DialogTitle>
                            </DialogHeader>
                            <div className="flex gap-3 py-2 w-full">
                              <input
                                className="grow border rounded-xl p-2"
                                value={`https://auth.lyhsca.org/account/register?mode=staff&registerCode=${code.registerCode}`}
                                readOnly
                              />
                              <button
                                className="flex items-center gap-2 font-medium border border-border rounded-xl text-sm p-2 px-3 w-fit bg-foreground text-background"
                                onClick={() => {
                                  const link = `https://auth.lyhsca.org/account/register?mode=staff&registerCode=${code.registerCode}`;
                                  handleCopyCode(link);
                                }}
                              >
                                {copiedStates[code.registerCode] ? (
                                  <Check size={18} />
                                ) : (
                                  <Copy size={18} />
                                )}
                              </button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            deleteCode(code.registerCode);
                          }}
                          className="!text-red-600 hover:!bg-red-100 justify-between"
                        >
                          刪除代碼
                          <Trash2 size={15} />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
