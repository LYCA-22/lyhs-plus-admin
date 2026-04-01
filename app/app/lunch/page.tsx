"use client";

import { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, UploadCloud, Loader2 } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const API_URL = "https://api.lyhssa.org/v1/lyps/lunch/batch";

// ── 型別 ────────────────────────────────────────────────────────────────────
export type ParsedMenu = {
  lunch_date: string;
  staple_food: string;
  main_dish: string;
  side_dish: string;
  vegetable: string;
  soup: string;
  other: string;
  bucket_count: number;
  calories: number;
  is_vegetarian_day: number;
};

function rocToAd(rocYear: number, month: number, day: number): string {
  const y = rocYear + 1911;
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function extractRocYear(text: string): number {
  const m = text.match(/(\d{2,3})年/);
  return m ? parseInt(m[1]) : 115;
}

function detectVegetarianDay(dayOfWeek: string, stapleFood: string): boolean {
  return dayOfWeek === "三" && stapleFood === "特餐";
}

function parseMenuText(raw: string): ParsedMenu[] {
  const rocYear = extractRocYear(raw);
  const results: ParsedMenu[] = [];

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^\d+\s/.test(l));

  for (const line of lines) {
    const cols = line
      .split(/\s{2,}|\t/)
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length < 8) continue;

    const dateStr = cols[1];
    const dayOfWeek = cols[2];
    const dateParts = dateStr.split("/");
    if (dateParts.length < 2) continue;

    const month = parseInt(dateParts[0]);
    const day = parseInt(dateParts[1]);
    if (!month || !day) continue;

    const lunch_date = rocToAd(rocYear, month, day);
    const staple_food = cols[3];
    const main_dish = cols[4];
    const side_dish = cols[5];
    const vegetable = cols[6];
    const soup = cols[7];

    const remaining = cols.slice(8);
    let bucket_count = 0;
    let calories = 0;

    const lastCol = remaining[remaining.length - 1];
    if (lastCol && /^\d{3,4}$/.test(lastCol)) {
      calories = parseInt(lastCol);
      remaining.pop();
    }

    const bucketCol = remaining[remaining.length - 1];
    if (bucketCol && /^\d{1,2}$/.test(bucketCol)) {
      bucket_count = parseInt(bucketCol);
      remaining.pop();
    }

    const other = remaining.join("、");
    const is_vegetarian_day = detectVegetarianDay(dayOfWeek, staple_food)
      ? 1
      : 0;

    results.push({
      lunch_date,
      staple_food,
      main_dish,
      side_dish,
      vegetable,
      soup,
      other,
      bucket_count,
      calories,
      is_vegetarian_day,
    });
  }

  return results;
}

// ── 欄位設定（note 已移除）────────────────────────────────────────────────────
const FIELDS: {
  key: keyof ParsedMenu;
  label: string;
  type: "text" | "number" | "checkbox";
  className?: string;
}[] = [
  {
    key: "lunch_date",
    label: "日期",
    type: "text",
    className: "w-28 font-mono",
  },
  { key: "staple_food", label: "主食", type: "text", className: "w-24" },
  { key: "main_dish", label: "主菜", type: "text", className: "w-32" },
  { key: "side_dish", label: "副菜", type: "text", className: "w-32" },
  { key: "vegetable", label: "青菜", type: "text", className: "w-28" },
  { key: "soup", label: "湯", type: "text", className: "w-32" },
  { key: "other", label: "其他", type: "text", className: "w-24" },
  {
    key: "bucket_count",
    label: "餐桶",
    type: "number",
    className: "w-14 text-center",
  },
  {
    key: "calories",
    label: "熱量",
    type: "number",
    className: "w-16 text-center",
  },
  {
    key: "is_vegetarian_day",
    label: "蔬食",
    type: "checkbox",
    className: "w-12",
  },
];

type Step = "upload" | "preview" | "submitting" | "done";

const STEPS = ["上傳 PDF", "確認 & 編輯", "寫入資料庫"];

// ── 主元件 ───────────────────────────────────────────────────────────────────
export default function LunchMenuUploadPage() {
  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [editMenus, setEditMenus] = useState<ParsedMenu[]>([]);
  const [submitOk, setSubmitOk] = useState(true);
  const [submitMsg, setSubmitMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const stepIdx =
    step === "upload" ? 0 : step === "preview" || step === "submitting" ? 1 : 2;

  // ── PDF 解析 ──────────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setParseError("請選擇 PDF 檔案");
      return;
    }
    setParseError("");
    setFileName(file.name);

    try {
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

      let fullText = "";
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        const items = content.items as { str: string; transform: number[] }[];

        const rows: { y: number; cells: { x: number; str: string }[] }[] = [];
        for (const item of items) {
          const x = item.transform[4];
          const y = item.transform[5];
          const row = rows.find((r) => Math.abs(r.y - y) < 3);
          if (row) row.cells.push({ x, str: item.str });
          else rows.push({ y, cells: [{ x, str: item.str }] });
        }

        rows.sort((a, b) => b.y - a.y);
        for (const row of rows) {
          row.cells.sort((a, b) => a.x - b.x);
          const line = row.cells
            .map((c) => c.str.trim())
            .filter(Boolean)
            .join("  ");
          if (line) fullText += line + "\n";
        }
      }

      const parsed = parseMenuText(fullText);
      if (parsed.length === 0) {
        setParseError("未解析到任何菜單資料，請確認 PDF 格式");
        return;
      }

      setEditMenus(JSON.parse(JSON.stringify(parsed)));
      setStep("preview");
    } catch (err) {
      setParseError(
        `PDF 讀取失敗：${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  // ── 表格編輯 ──────────────────────────────────────────────────────────────
  function updateCell(rowIdx: number, key: keyof ParsedMenu, value: string) {
    setEditMenus((prev) => {
      const next = [...prev];
      const row = { ...next[rowIdx] };
      if (key === "bucket_count" || key === "calories") {
        (row[key] as number) = parseInt(value) || 0;
      } else if (key === "is_vegetarian_day") {
        (row[key] as number) = value === "1" ? 1 : 0;
      } else {
        (row[key] as string) = value;
      }
      next[rowIdx] = row;
      return next;
    });
  }

  async function handleConfirm() {
    setStep("submitting");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: editMenus }),
      });
      const data = await res.json();
      setSubmitOk(data.success);
      setSubmitMsg(data.success ? data.message : data.error);
    } catch (err) {
      setSubmitOk(false);
      setSubmitMsg(err instanceof Error ? err.message : String(err));
    }

    setStep("done");
  }

  function reset() {
    setStep("upload");
    setEditMenus([]);
    setFileName("");
    setParseError("");
    setSubmitMsg("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">午餐菜單匯入</h1>

        {/* 步驟列 */}
        <div className="flex items-center gap-2 text-sm select-none">
          {STEPS.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className={[
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border",
                  stepIdx > i
                    ? "bg-green-500 border-green-500 text-white"
                    : stepIdx === i
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-muted-foreground/30 text-muted-foreground",
                ].join(" ")}
              >
                {stepIdx > i ? "✓" : i + 1}
              </span>
              <span
                className={
                  stepIdx === i ? "font-semibold" : "text-muted-foreground"
                }
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <span className="text-muted-foreground/40 mx-1">›</span>
              )}
            </span>
          ))}
        </div>

        {/* ── STEP 1：上傳 ── */}
        {step === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">選擇菜單 PDF</CardTitle>
              <CardDescription>拖曳檔案至此，或點擊選擇</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={[
                  "flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg py-16 cursor-pointer transition-colors",
                  dragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50",
                ].join(" ")}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={onFileChange}
                />
                <UploadCloud
                  className={`w-10 h-10 ${dragging ? "text-primary" : "text-muted-foreground"}`}
                />
                <div className="text-center">
                  <p className="font-medium">點擊選擇 PDF 或拖曳至此</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    支援高雄市學校午餐菜單格式
                  </p>
                </div>
                {fileName && (
                  <Badge variant="secondary" className="font-mono">
                    {fileName}
                  </Badge>
                )}
              </div>

              {parseError && (
                <Alert variant="destructive" className="mt-4">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{parseError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── STEP 2：預覽 & 編輯 ── */}
        {(step === "preview" || step === "submitting") && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base">
                    確認菜單資料
                    <Badge variant="secondary" className="ml-2">
                      {editMenus.length} 筆
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    可直接點擊儲存格修改內容
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reset}
                    disabled={step === "submitting"}
                  >
                    重新上傳
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirm}
                    disabled={step === "submitting"}
                  >
                    {step === "submitting" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        寫入中…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        確認，寫入資料庫
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {FIELDS.map(({ label }) => (
                        <TableHead
                          key={label}
                          className="whitespace-nowrap text-xs px-2"
                        >
                          {label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editMenus.map((menu, i) => (
                      <TableRow key={i}>
                        {FIELDS.map(({ key, type, className }) => {
                          const val = menu[key];
                          if (type === "checkbox") {
                            return (
                              <TableCell key={key} className="px-3 text-center">
                                <Checkbox
                                  checked={val === 1}
                                  onCheckedChange={(checked) =>
                                    updateCell(i, key, checked ? "1" : "0")
                                  }
                                />
                              </TableCell>
                            );
                          }
                          return (
                            <TableCell key={key} className="px-1 py-1">
                              <Input
                                type={type}
                                value={String(val)}
                                onChange={(e) =>
                                  updateCell(i, key, e.target.value)
                                }
                                className={`h-7 text-xs border-transparent bg-transparent hover:border-input focus:border-input focus-visible:ring-1 ${className ?? ""}`}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── STEP 3：完成 ── */}
        {step === "done" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Alert variant={submitOk ? "default" : "destructive"}>
                {submitOk ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription className="font-medium">
                  {submitMsg}
                </AlertDescription>
              </Alert>
              <Button variant="outline" onClick={reset}>
                繼續上傳下一份
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
