"use client";

import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";
import { ArrowFromBottomStroke, CaretRight, EmptySet } from "@boxicons/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiService } from "@/service/api";
import { getCookie } from "cookies-next/client";
import { Spinner } from "@/components/ui/spinner";

interface StudentDataFromExcel {
  中文姓名: string;
  學號: string;
  年級: string;
  座號: number;
  會費身份: number;
  班級: string;
}

export interface FormattedStudent {
  stu_id: string;
  zh_name: string;
  class_name: string;
  grade: string;
  number: number;
  is_member: boolean;
}

export default function MemberBatchAddPage() {
  const [students, setStudents] = useState<StudentDataFromExcel[]>([]);
  const [formatedStudents, setFormatedStudents] = useState<FormattedStudent[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const access_token = getCookie("lyps_access_token");

  const handleUpload = async () => {
    setIsLoading(true);
    try {
      const success = await ApiService.batchUser(
        access_token || "",
        formatedStudents,
      );
      if (success) {
        alert("上傳成功");
      } else {
        alert("上傳失敗");
      }
    } catch (e) {
      console.error(e);
      alert("上傳失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet) as StudentDataFromExcel[];
      setStudents(json);
      const formatted = json.map((row: StudentDataFromExcel) => ({
        stu_id: row["學號"].toString(),
        zh_name: row["中文姓名"],
        class_name: row["班級"],
        grade: row["年級"],
        number: Number(row["座號"]),
        is_member: row["會費身份"] == 1,
      }));
      setFormatedStudents(formatted);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href={"/app/member"}
          className="opacity-50 hover:opacity-100 flex items-center gap-2"
        >
          <p className="font-medium">會員資料管理</p>
          <CaretRight size="sm" />
        </Link>

        <h1 className="text-xl font-bold">會員批量新增</h1>
      </div>

      {/* STEP 1 */}
      <div className="space-y-4">
        <div className="flex items-center font-medium gap-2">
          <p className="p-1 rounded-full border border-border px-3 w-fit">
            STEP 1
          </p>
          <p>上傳 EXCEL 檔案</p>
        </div>

        <Input
          type="file"
          accept=".xlsx,.xls"
          className="rounded-xl"
          onChange={handleFile}
        />
      </div>

      {/* STEP 2 */}
      <div className="space-y-4">
        <div className="flex items-center font-medium gap-2">
          <p className="p-1 rounded-full border border-border px-3 w-fit">
            STEP 2
          </p>
          <div>
            <p>預覽會員名單</p>
            <p className="text-sm opacity-50">
              請先人工檢查名單是否重複或錯誤。
            </p>
          </div>
        </div>

        {students.length > 0 ? (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  {Object.keys(students[0]).map((key) => (
                    <th key={key} className="p-2 text-left">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {students.map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="p-2">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gap-2 flex flex-col items-center justify-center p-5 border border-border rounded-xl">
            <EmptySet />
            <p className="font-medium text-sm">請先上傳檔案</p>
          </div>
        )}
      </div>
      <div className="space-y-4 flex justify-end">
        <Button
          onClick={() => handleUpload()}
          className="rounded-xl"
          disabled={students.length === 0}
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <ArrowFromBottomStroke />
              建立會員資料
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
