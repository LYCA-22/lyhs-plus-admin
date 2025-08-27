"use client";
import { FormEvent, useState, useRef } from "react";
import Image from "next/image";
import { apiServices } from "@/services/api";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, X, Check, AlertCircle, Plus } from "lucide-react";

interface AnnouncementFormProps {
  onSuccess?: () => void;
}

export function AnnouncementForm({ onSuccess }: AnnouncementFormProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [haveLink, setHaveLink] = useState<boolean>(false);
  const [isPriority, setIsPriority] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [compressionInfo, setCompressionInfo] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 檢查文件類型
      if (!file.type.startsWith("image/")) {
        setError("請選擇圖片檔案");
        return;
      }

      // 檢查文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("圖片大小不能超過 10MB");
        return;
      }

      setSelectedImage(file);
      setError("");
      setCompressionInfo("");

      // 創建預覽
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 顯示原始檔案大小
      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setCompressionInfo(`原始大小: ${originalSizeMB} MB`);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setCompressionInfo("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const compressImage = async (
    file: File,
    maxWidth: number = 800,
    quality: number = 0.8,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = document.createElement("img");

      if (!ctx) {
        reject(new Error("無法創建 canvas context"));
        return;
      }

      img.onload = () => {
        // 計算新的尺寸，保持縱橫比
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // 繪製壓縮後的圖片
        ctx.drawImage(img, 0, 0, width, height);

        // 轉換為 base64，移除前綴
        const base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];
        resolve(base64);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const compressImageWithSizeLimit = async (file: File): Promise<string> => {
    setCompressing(true);
    let maxWidth = 800;
    let quality = 0.7;
    let compressed = await compressImage(file, maxWidth, quality);

    // 檢查壓縮後的大小，如果仍然太大就進一步壓縮
    // Base64 字符串長度 * 0.75 約等於原始字節數
    let estimatedSize = compressed.length * 0.75;
    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    let compressedSizeMB = (estimatedSize / (1024 * 1024)).toFixed(2);

    // 如果超過 500KB，進一步壓縮
    while (estimatedSize > 500 * 1024 && quality > 0.1) {
      quality -= 0.1;
      if (quality <= 0.3) {
        maxWidth = Math.max(400, maxWidth * 0.8);
      }
      compressed = await compressImage(file, maxWidth, quality);
      estimatedSize = compressed.length * 0.75;
      compressedSizeMB = (estimatedSize / (1024 * 1024)).toFixed(2);
    }

    setCompressionInfo(
      `原始: ${originalSizeMB} MB → 壓縮後: ${compressedSizeMB} MB (${Math.round(maxWidth)}px, 品質: ${Math.round(quality * 100)}%)`,
    );
    setCompressing(false);
    return compressed;
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setLink("");
    setHaveLink(false);
    setIsPriority(false);
    removeImage();
    setError("");
    setSuccess(false);
    setCompressionInfo("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // 表單驗證
    if (!title.trim()) {
      setError("請輸入標題");
      return;
    }
    if (!content.trim()) {
      setError("請輸入內容");
      return;
    }
    if (!isPriority && !selectedImage) {
      setError("請選擇圖片");
      return;
    }
    if (isPriority && selectedImage) {
      setError("優先公告不能上傳圖片");
      return;
    }
    if (haveLink && !link.trim()) {
      setError("請輸入連結或關閉連結選項");
      return;
    }

    try {
      setLoading(true);

      // 壓縮並轉換圖片為 base64 (如果不是優先公告)
      let imgBase64 = "";
      if (!isPriority && selectedImage) {
        setCompressionInfo("正在壓縮圖片...");
        imgBase64 = await compressImageWithSizeLimit(selectedImage);
      }

      await apiServices.addAnnouncement(
        title.trim(),
        content.trim(),
        imgBase64,
        isPriority,
        haveLink ? link.trim() : "",
        haveLink,
      );

      setSuccess(true);

      // 延遲關閉對話框和重置表單
      setTimeout(() => {
        setOpen(false);
        resetForm();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (error) {
      console.error("Error creating announcement:", error);
      setError("建立公告失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 p-2 px-4 font-medium rounded-2xl bg-foreground text-background hover:opacity-50">
          <Plus size={16} />
          新增公告
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新增公告</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 flex flex-col gap-2 mt-2">
            <Label htmlFor="title" className="font-medium">
              標題 *
            </Label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="公告標題"
              className="w-full bg-background border rounded-md p-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary dark:bg-zinc-800 dark:border-zinc-700"
              required
            />
          </div>

          {/* 內容 */}
          <div className="space-y-2">
            <Label htmlFor="content" className="font-medium">
              內容 *
            </Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="請輸入公告內容"
              className="w-full min-h-[100px] p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary dark:bg-zinc-800 dark:border-zinc-700 transition-all"
              required
            />
          </div>
          <div className="flex flex-col gap-2 items-center border border-border rounded-lg p-3 bg-hoverbg dark:bg-zinc-900">
            <div className="flex items-center justify-between w-full border-b border-border pb-4">
              <div>
                <Label className="font-medium">緊急公告；無圖片公告</Label>
                <p className="text-sm text-muted-foreground">
                  此類型公告會以文字輪播顯示在LYHS Plus
                  App首頁以及學生會官方網站
                </p>
              </div>
              <Switch
                checked={isPriority}
                onCheckedChange={(checked) => {
                  setIsPriority(checked);
                  if (checked && selectedImage) {
                    removeImage();
                  }
                }}
              />
            </div>
            <div className="flex flex-col justify-between w-full gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="font-medium">包含連結</Label>
                  <p className="text-sm text-muted-foreground">
                    是否在公告中包含外部連結
                  </p>
                </div>
                <Switch checked={haveLink} onCheckedChange={setHaveLink} />
              </div>
              <div className="border-t border-border pt-3 flex gap-4">
                <div className="w-fit">
                  <Label htmlFor="link" className="font-medium">
                    連結網址
                  </Label>
                  <p className="text-sm opacity-50">
                    使用者可直接點擊公告至該網址
                  </p>
                </div>
                <input
                  id="link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com"
                  disabled={!haveLink}
                  className="grow bg-background border rounded-md p-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary dark:bg-zinc-800 dark:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 圖片上傳 */}
          <div className="space-y-2">
            <Label className="font-medium">圖片 {!isPriority && "*"}</Label>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isPriority}
              />

              {!imagePreview ? (
                <div
                  onClick={() => !isPriority && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors ${
                    isPriority
                      ? "cursor-not-allowed opacity-50 bg-muted"
                      : "cursor-pointer hover:bg-hoverbg"
                  }`}
                >
                  <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isPriority ? "優先公告不支援圖片上傳" : "點擊選擇圖片"}
                  </p>
                  {!isPriority && (
                    <p className="text-xs text-muted-foreground mt-1">
                      支援 JPG, PNG 格式，檔案大小不超過 10MB
                    </p>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="預覽"
                    width={400}
                    height={200}
                    className="w-full max-h-48 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  {compressionInfo && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
                      {compressing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          壓縮中...
                        </div>
                      ) : (
                        compressionInfo
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* 成功訊息 */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-green-600 dark:text-green-400 text-sm">
                公告建立成功！
              </p>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6"
          >
            {loading ? "建立中..." : "建立公告"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
