"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiService } from "@/service/api";
import { userMemberData } from "@/types";
import {
  Block,
  Check,
  InfoCircle,
  ListPlus,
  Plus,
  Trash,
  X,
} from "@boxicons/react";
import { getCookie } from "cookies-next/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MemberPage() {
  const [memberList, setMemberList] = useState<userMemberData[]>([]);
  const [filterGrade, setFilterGrade] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const FetchMemberList = async () => {
      const access_token = getCookie("lyps_access_token");
      const memberListData = await ApiService.getMemberList(access_token || "");
      setMemberList(memberListData);
    };

    FetchMemberList();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">會員資料管理</h1>
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push("/app/member/batch")}>
            <ListPlus size="sm" />
            批量新增會員
          </Button>
          <Button variant="secondary" className="border border-border">
            <Plus size="sm" />
            單一新增會員
          </Button>
        </div>
      </div>
      <div className="border border-border font-medium rounded-md p-2 flex items-center gap-2">
        <InfoCircle size="sm" />
        <p>KSA服務只能用本人啟用，系統管理員無法直接從此平台啟用。</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterGrade("")}
          className={`text-sm font-medium border border-border rounded-md p-2 px-4 ${filterGrade === "" ? "bg-primary text-white" : ""}`}
        >
          全部
        </button>
        <button
          onClick={() => setFilterGrade("高一")}
          className={`text-sm font-medium border border-border rounded-md p-2 px-4 ${filterGrade === "高一" ? "bg-primary text-white" : ""}`}
        >
          高一
        </button>
        <button
          onClick={() => setFilterGrade("高二")}
          className={`text-sm font-medium border border-border rounded-md p-2 px-4 ${filterGrade === "高二" ? "bg-primary text-white" : ""}`}
        >
          高二
        </button>
        <button
          onClick={() => setFilterGrade("高三")}
          className={`text-sm font-medium border border-border rounded-md p-2 px-4 ${filterGrade === "高三" ? "bg-primary text-white" : ""}`}
        >
          高三
        </button>
      </div>
      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>學號</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>班級</TableHead>
              <TableHead>座號</TableHead>
              <TableHead>會費身份</TableHead>
              <TableHead>KSA 服務狀態</TableHead>
              <TableHead>建立時間</TableHead>
              <TableHead>動作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberList
              .filter(
                (item) => filterGrade === "" || item.grade === filterGrade,
              )
              .map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.stu_id}</TableCell>
                  <TableCell>{item.zh_name}</TableCell>
                  <TableCell>
                    {item.grade}
                    {item.class_name}
                  </TableCell>
                  <TableCell>{item.number}</TableCell>
                  <TableCell>
                    {item.is_member ? <Check size="sm" /> : <X size="sm" />}
                  </TableCell>
                  <TableCell>{item.ksa_enabled ? "啟用" : "未啟用"}</TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleString("zh-TW")}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <button>
                      <Trash size="sm" />
                    </button>
                    <Block size="sm" />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
