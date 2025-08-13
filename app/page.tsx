"use client";
import { apiServices } from "@/services/api";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hook";
import Link from "next/link";
import { StatusCard } from "@/components/status";

enum AccountType {
  staff = "管理帳號",
  stu = "學生帳號",
}

interface AccountTypeData {
  type: keyof typeof AccountType;
  count: number;
}

interface AccountCount {
  totalUsers: { "COUNT(*)": number };
  typeStatistics: AccountTypeData[];
}

export default function Page() {
  const [accountCount, setAccountCount] = useState<AccountCount>({
    totalUsers: { "COUNT(*)": 0 },
    typeStatistics: [],
  });
  const userData = useAppSelector((state) => state.userData);

  useEffect(() => {
    const getAccountCount = async () => {
      if (!userData.sessionId) return;
      const count = await apiServices.getAccountTotal();
      setAccountCount(count);
    };

    getAccountCount();
  }, [userData.sessionId]);

  return (
    <div className="flex flex-wrap gap-4 font-custom">
      <div className="w-full text-2xl p-2 font-bold opacity-80">
        LYHS Plus 總覽表
      </div>
      <StatusCard />
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border-border border shadow-sm flex flex-col justify-center gap-2">
        <h2 className="text-lg font-bold flex items-center">系統使用者人數</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-5">
            <p className="text-lg opacity-50">目前</p>
            <p className="font-custom text-4xl font-bold">
              {accountCount.totalUsers["COUNT(*)"]}
            </p>
            <p className="text-lg opacity-50">人</p>
          </div>
          {accountCount.typeStatistics.map((item, index) => (
            <p key={index} className="font-medium">
              {AccountType[item.type as keyof typeof AccountType]}：{item.count}
            </p>
          ))}
        </div>
        <Link
          href={"/"}
          className="px-4 mt-auto p-2 rounded-xl bg-foreground text-background opacity-80 text-center font-medium transition-all hover:bg-sky-500 hover:text-white text-sm"
        >
          管理所有帳號
        </Link>
        <Link
          href={"https://auth.lyhsca.org/account/register"}
          target="_blank"
          className="px-4 p-2 rounded-xl bg-hoverbg font-medium text-center transition-all hover:bg-sky-500 hover:text-white text-sm"
        >
          前往一般用戶註冊
        </Link>
      </div>
    </div>
  );
}
