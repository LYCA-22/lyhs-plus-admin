"use client";
import { FormEvent, useEffect, useState } from "react";
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
import { Copy } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  const createCode = async (e: FormEvent) => {
    e.preventDefault();
    await apiServices.createCode(
      userData.sessionId,
      vuli,
      level,
      setError,
      setCreateCodeStatus,
    );
    window.location.reload();
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  useEffect(() => {
    if (!Loaded) {
      setLoading(true);
      const getCode = async () => {
        const code = await apiServices.getAllCodeData(userData.sessionId);
        setCode(code.data);
        setLoading(false);
      };
      getCode();
    }
  }, [Loaded, userData]);

  if (loading) {
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
          <DialogTrigger>建立新代碼</DialogTrigger>
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
                  className="bg-background border rounded-md p-2 text-end max-w-[100px]"
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
                className="bg-foreground text-background rounded-xl p-2 hover:opacity-50 font-medium disabled:bg-hoverbg disabled:text-zinc-500 disabled:cursor-not-allowed"
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
            <TableHead className="w-[100px]">代碼</TableHead>
            <TableHead>代碼類型</TableHead>
            <TableHead>帳號等級</TableHead>
            <TableHead>可用數量</TableHead>
            <TableHead>註冊連結</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {codeData.length === 0 ? (
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
                  <TableCell>{code.registerCode}</TableCell>
                  <TableCell>{code.vuli ? "大量授權" : "一般"}</TableCell>
                  <TableCell>{code.level}</TableCell>
                  <TableCell>{code.user_number}</TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <TableCell className="cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800">
                        查看
                      </TableCell>
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
                          <Copy size={18} />
                          {copied ? "已複製" : "複製連結"}
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
