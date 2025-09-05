"use client";
import { useCallback, useEffect, useState } from "react";
import { apiServices } from "@/services/api";
import { useAppSelector } from "@/store/hook";
import { memberDataRaw, Class, Grade } from "@/types";
import { Switch } from "@/components/ui/switch";
import { exportMembersToExcel } from "./exportUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Ellipsis,
  Plus,
  Trash2,
  Save,
  X,
  Download,
  TriangleAlert,
} from "lucide-react";

interface NewMemberRow {
  id: string;
  name: string;
  stu_id: string;
  number: string;
  class: string;
  grade: string;
  lyps_id: string;
  isActive: boolean;
  isEditing: boolean;
}

interface BatchAddConfig {
  quantity: number;
  class: string;
  grade: string;
  startingNumber: string;
  isActive: boolean;
}

export default function Page() {
  const [loading, setLoading] = useState<boolean>(true);
  const [memberData, setMemberData] = useState<memberDataRaw[]>([]);
  const [newMemberRows, setNewMemberRows] = useState<NewMemberRow[]>([]);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [showBatchDialog, setShowBatchDialog] = useState<boolean>(false);
  const [batchError, setBatchError] = useState<string>("");
  const [batchConfig, setBatchConfig] = useState<BatchAddConfig>({
    quantity: 1,
    class: "",
    grade: "",
    startingNumber: "",
    isActive: true,
  });
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, boolean>>(
    new Map(),
  );
  const [batchUpdating, setBatchUpdating] = useState<boolean>(false);
  const userData = useAppSelector((state) => state.userData);
  const Loaded = useAppSelector((state) => state.systemStatus.isLoading);

  const schoolData = {
    id: 1,
    full_name: "高雄市立林園高級中學",
    short_name: "林園高中",
    hd: "ms.ly.kh.edu.tw" as const,
  };

  const getMemberData = useCallback(async () => {
    try {
      setLoading(true);
      setMemberData([]);
      if (!userData.sessionId) return;
      const response = await apiServices.getMemberList();
      setMemberData(response);
    } catch (error) {
      console.error("Error fetching member data:", error);
      setError("獲取會員數據失敗");
      setMemberData([]);
    } finally {
      setLoading(false);
    }
  }, [userData.sessionId]);

  useEffect(() => {
    if (!Loaded && userData.sessionId) {
      getMemberData();
    } else {
      setLoading(false);
    }
  }, [Loaded, getMemberData, userData]);

  const addNewMemberRow = () => {
    const newRow: NewMemberRow = {
      id: Date.now().toString(),
      name: "",
      stu_id: "",
      number: "",
      class: "",
      grade: "",
      lyps_id: "",
      isActive: true,
      isEditing: true,
    };
    setNewMemberRows([newRow, ...newMemberRows]);
  };

  const addBatchMembers = () => {
    setBatchError("");

    if (
      !batchConfig.class ||
      !batchConfig.grade ||
      !batchConfig.startingNumber
    ) {
      setBatchError("請填寫所有必填欄位");
      return;
    }

    const startNumber = parseInt(batchConfig.startingNumber);
    if (isNaN(startNumber)) {
      setBatchError("座號起始值必須是數字");
      return;
    }

    const newRows: NewMemberRow[] = [];
    for (let i = 0; i < batchConfig.quantity; i++) {
      const newRow: NewMemberRow = {
        id: `${Date.now()}_${i}`,
        name: "",
        stu_id: "",
        number: (startNumber + i).toString(),
        class: batchConfig.class,
        grade: batchConfig.grade,
        lyps_id: "",
        isActive: batchConfig.isActive,
        isEditing: true,
      };
      newRows.push(newRow);
    }

    setNewMemberRows([...newRows, ...newMemberRows]);
    setShowBatchDialog(false);
    setBatchError("");
    setBatchConfig({
      quantity: 1,
      class: "",
      grade: "",
      startingNumber: "",
      isActive: true,
    });
  };

  const exportToExcel = () => {
    try {
      exportMembersToExcel(memberData);
    } catch (error) {
      console.error("匯出Excel失敗:", error);
      setError("匯出Excel失敗");
    }
  };

  const updateNewMemberRow = (
    id: string,
    field: keyof NewMemberRow,
    value: string | boolean,
  ) => {
    setNewMemberRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removeNewMemberRow = (id: string) => {
    setNewMemberRows((rows) => rows.filter((row) => row.id !== id));
  };

  const saveNewMembers = async () => {
    try {
      setSaving(true);
      setError("");

      // Validate all rows
      const invalidRows = newMemberRows.filter(
        (row) =>
          !row.name || !row.stu_id || !row.number || !row.class || !row.grade,
      );

      if (invalidRows.length > 0) {
        setError("請填寫所有必填欄位");
        return;
      }

      // Prepare data for API
      const membersToAdd = newMemberRows.map((row) => ({
        name: row.name,
        stu_id: row.stu_id,
        info: {
          stu: {
            name: row.name,
            number: parseInt(row.number),
            class: row.class,
            grade: row.grade,
          },
          school: schoolData,
          memberShip: {
            isActive: row.isActive,
            actived_at: new Date().toISOString(),
            underTaker: userData.name,
            updated_at: new Date().toISOString(),
          },
        },
        status: {
          lyps: {
            isLypsUser: !!row.lyps_id,
            isconnected: false,
            connected_at: "",
          },
        },
        lyps_id: row.lyps_id || "",
      }));

      await apiServices.addMembers(membersToAdd);
      setNewMemberRows([]);
      await getMemberData(); // Refresh the data
    } catch (error) {
      console.error("Error saving members:", error);
      setError("儲存會員失敗");
    } finally {
      setSaving(false);
    }
  };

  const toggleMemberStatus = (stuId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setPendingUpdates((prev) => {
      const newMap = new Map(prev);

      // Find original status from memberData
      const originalMember = memberData.find((m) => m.stu_id === stuId);
      const originalStatus = originalMember?.info.memberShip.isActive || false;

      if (newStatus === originalStatus) {
        // If new status matches original, remove from pending updates
        newMap.delete(stuId);
      } else {
        // Add to pending updates
        newMap.set(stuId, newStatus);
      }

      return newMap;
    });
  };

  const commitPendingUpdates = async () => {
    try {
      setBatchUpdating(true);
      setError("");

      const updateData = Array.from(pendingUpdates.entries()).map(
        ([stuId, status]) => {
          const member = memberData.find((m) => m.stu_id === stuId);
          return {
            id: member?.id || 0,
            info: {
              stu: {
                name: member?.name || "",
                number: member?.info.stu.number || 0,
                class: member?.info.stu.class || "",
                grade: member?.info.stu.grade || "",
              },
              school: schoolData,
              memberShip: {
                isActive: status,
                actived_at: status
                  ? new Date().toISOString()
                  : member?.info.memberShip.actived_at ||
                    new Date().toISOString(),
                underTaker: userData.name,
                updated_at: new Date().toISOString(),
              },
            },
          };
        },
      );

      await apiServices.batchUpdateMemberStatus(updateData);

      // Update local state
      setMemberData((prevData) =>
        prevData.map((member) =>
          pendingUpdates.has(member.stu_id)
            ? {
                ...member,
                info: {
                  ...member.info,
                  memberShip: {
                    ...member.info.memberShip,
                    isActive: pendingUpdates.get(member.stu_id)!,
                    updated_at: new Date().toISOString(),
                  },
                },
              }
            : member,
        ),
      );

      setPendingUpdates(new Map());
    } catch (error) {
      console.error("Failed to batch update member status:", error);
      setError("批次更新會員狀態失敗");
    } finally {
      setBatchUpdating(false);
    }
  };

  const cancelPendingUpdates = () => {
    setPendingUpdates(new Map());
  };

  const deleteMember = async (memberId: number, memberName: string) => {
    if (!confirm(`確定要刪除會員「${memberName}」嗎？此操作無法復原。`)) {
      return;
    }

    try {
      await apiServices.deleteMember(memberId);
      // Update local state by removing the deleted member
      setMemberData((prevData) =>
        prevData.filter((member) => member.id !== memberId),
      );
      // Remove from pending updates if exists
      setPendingUpdates((prev) => {
        const newMap = new Map(prev);
        const deletedMember = memberData.find((m) => m.id === memberId);
        if (deletedMember) {
          newMap.delete(deletedMember.stu_id);
        }
        return newMap;
      });
    } catch (error) {
      console.error("Failed to delete member:", error);
      setError("刪除會員失敗");
    }
  };

  if (loading && !userData.level) {
    return (
      <div className="p-4 space-x-3 flex items-center justify-center h-full w-full">
        <div className="w-6 h-6 rounded-full border-[2px] border-border border-t-foreground animate-spin" />
        <p className="font-medium">載入資料中</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold">會員管理</h1>
        <div className="flex gap-2">
          {newMemberRows.length > 0 ? (
            <>
              <Button
                variant="outline"
                onClick={() => setNewMemberRows([])}
                disabled={saving}
                className="rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                取消
              </Button>
              <Button
                onClick={saveNewMembers}
                disabled={saving}
                className="rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "儲存中..." : "儲存"}
              </Button>
              <Button onClick={addNewMemberRow} className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                新增單筆
              </Button>
            </>
          ) : (
            <>
              {pendingUpdates.size > 0 && (
                <>
                  <Button
                    onClick={commitPendingUpdates}
                    disabled={batchUpdating}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {batchUpdating
                      ? "更新中..."
                      : `確認更新 ${pendingUpdates.size} 位會員`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelPendingUpdates}
                    disabled={batchUpdating}
                    className="rounded-xl"
                  >
                    取消變更
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={exportToExcel}
                disabled={memberData.length === 0}
                className="rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                匯出Excel
              </Button>
              <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    批量新增
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>批量新增會員</DialogTitle>
                  </DialogHeader>
                  {batchError && (
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md">
                      <p className="text-red-600 dark:text-red-400 text-sm">
                        {batchError}
                      </p>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quantity">新增人數</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={batchConfig.quantity}
                          onChange={(e) =>
                            setBatchConfig({
                              ...batchConfig,
                              quantity: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="startingNumber">座號起始值</Label>
                        <Input
                          id="startingNumber"
                          placeholder="例如: 1"
                          value={batchConfig.startingNumber}
                          onChange={(e) =>
                            setBatchConfig({
                              ...batchConfig,
                              startingNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="batch-class">班級</Label>
                        <Select
                          value={batchConfig.class}
                          onValueChange={(value) =>
                            setBatchConfig({ ...batchConfig, class: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選擇班級" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(Class).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="batch-grade">年級</Label>
                        <Select
                          value={batchConfig.grade}
                          onValueChange={(value) =>
                            setBatchConfig({ ...batchConfig, grade: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="選擇年級" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(Grade).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="batch-active"
                        checked={batchConfig.isActive}
                        onCheckedChange={(checked) =>
                          setBatchConfig({ ...batchConfig, isActive: checked })
                        }
                      />
                      <Label htmlFor="batch-active">預設啟用會員狀態</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowBatchDialog(false);
                        setBatchError("");
                      }}
                    >
                      取消
                    </Button>
                    <Button onClick={addBatchMembers}>
                      新增 {batchConfig.quantity} 位會員
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button onClick={addNewMemberRow} className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                新增單筆
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="w-full flex gap-4 items-center border-border border rounded-xl bg-background p-3 px-5 text-sm mb-5">
        <TriangleAlert />
        <div>
          <h2 className="font-medium">使用警告</h2>
          <p className="opacity-50 text-[12px]">
            此頁面為林園高中學生會會員資料，請勿將個資作為娛樂或恐嚇霸凌用途。系統皆會記載各個幹部的使用紀錄，若發現不當行為將依法處理。
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Table className="bg-white dark:bg-zinc-900">
        <TableHeader>
          <TableRow>
            <TableHead>姓名</TableHead>
            <TableHead>學號</TableHead>
            <TableHead>班級</TableHead>
            <TableHead>年級</TableHead>
            <TableHead>座號</TableHead>
            <TableHead>LYPS ID</TableHead>
            <TableHead>啟用</TableHead>
            <TableHead>會員狀態</TableHead>
            <TableHead>LYPS狀態</TableHead>
            <TableHead>加入時間</TableHead>
            <TableHead>動作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* New member rows */}
          {newMemberRows.map((row) => (
            <TableRow key={row.id} className="bg-blue-50 dark:bg-blue-900/20">
              <TableCell>
                <Input
                  value={row.name}
                  onChange={(e) =>
                    updateNewMemberRow(row.id, "name", e.target.value)
                  }
                  placeholder="姓名"
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.stu_id}
                  onChange={(e) =>
                    updateNewMemberRow(row.id, "stu_id", e.target.value)
                  }
                  placeholder="學號"
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Select
                  value={row.class}
                  onValueChange={(value) =>
                    updateNewMemberRow(row.id, "class", value)
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="選擇班級" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(Class).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={row.grade}
                  onValueChange={(value) =>
                    updateNewMemberRow(row.id, "grade", value)
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="選擇年級" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(Grade).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  value={row.number}
                  onChange={(e) =>
                    updateNewMemberRow(row.id, "number", e.target.value)
                  }
                  placeholder="座號"
                  type="number"
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.lyps_id}
                  onChange={(e) =>
                    updateNewMemberRow(row.id, "lyps_id", e.target.value)
                  }
                  placeholder="LYPS ID (選填)"
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={row.isActive}
                  onCheckedChange={(checked) =>
                    updateNewMemberRow(row.id, "isActive", checked)
                  }
                />
              </TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                  新會員
                </span>
              </TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  未連接
                </span>
              </TableCell>
              <TableCell>-</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNewMemberRow(row.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {/* Existing member rows */}
          {memberData.map((member) => {
            const currentStatus = pendingUpdates.has(member.stu_id)
              ? pendingUpdates.get(member.stu_id)!
              : member.info.memberShip.isActive;
            const isPending = pendingUpdates.has(member.stu_id);

            return (
              <TableRow
                key={member.stu_id}
                className={
                  isPending ? "bg-yellow-50 dark:bg-yellow-900/20" : ""
                }
              >
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.stu_id}</TableCell>
                <TableCell>
                  {Class[member.info.stu.class as keyof typeof Class] ||
                    member.info.stu.class}
                </TableCell>
                <TableCell>
                  {Grade[member.info.stu.grade as keyof typeof Grade] ||
                    member.info.stu.grade}
                </TableCell>
                <TableCell>{member.info.stu.number}</TableCell>
                <TableCell>{member.lyps_id || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={currentStatus}
                      onCheckedChange={() =>
                        toggleMemberStatus(member.stu_id, currentStatus)
                      }
                    />
                    {isPending && (
                      <span className="text-xs text-orange-600 dark:text-orange-400">
                        待更新
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      member.info.memberShip.isActive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                    }`}
                  >
                    {member.info.memberShip.isActive ? "已繳費" : "未繳費"}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      member.status.lyps.isconnected
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {member.status.lyps.isconnected ? "已連接" : "未連接"}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(
                    member.info.memberShip.actived_at,
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-xl">
                      <div className="flex p-1 justify-center w-fit items-center rounded-xl hover:bg-zinc-300 hover:dark:bg-zinc-600">
                        <Ellipsis
                          size={20}
                          className="text-foreground opacity-50"
                        />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-5 -mt-2">
                      <DropdownMenuItem
                        className="!text-red-600 dark:!text-red-500 hover:!bg-red-100 dark:hover:!bg-red-950"
                        onClick={() => deleteMember(member.id, member.name)}
                      >
                        <Trash2 size={15} className="mr-2" />
                        刪除會員
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}

          {/* Show empty state only when no data and not loading */}
          {memberData.length === 0 &&
            newMemberRows.length === 0 &&
            !loading && (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center text-muted-foreground"
                >
                  目前沒有會員
                </TableCell>
              </TableRow>
            )}

          {/* Show loading state */}
          {loading && memberData.length === 0 && newMemberRows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={11}
                className="text-center text-muted-foreground"
              >
                載入中...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
