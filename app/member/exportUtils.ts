import * as XLSX from "xlsx";
import { memberDataRaw } from "@/types";
import { Class, Grade } from "@/types";

export const exportMembersToExcel = (memberData: memberDataRaw[]) => {
  try {
    // 準備會員資料
    const exportData = memberData.map((member, index) => ({
      序號: index + 1,
      會員ID: member.id,
      姓名: member.name,
      學號: member.stu_id,
      班級:
        Class[member.info.stu.class as keyof typeof Class] ||
        member.info.stu.class,
      年級:
        Grade[member.info.stu.grade as keyof typeof Grade] ||
        member.info.stu.grade,
      座號: member.info.stu.number,
      "LYPS ID": member.lyps_id || "",
      會員狀態: member.info.memberShip.isActive ? "啟用" : "停用",
      LYPS狀態: member.status.lyps.isconnected ? "已連接" : "未連接",
      是否為LYPS用戶: member.status.lyps.isLypsUser ? "是" : "否",
      加入時間: new Date(
        member.info.memberShip.actived_at,
      ).toLocaleDateString(),
      最後更新: new Date(
        member.info.memberShip.updated_at,
      ).toLocaleDateString(),
      承辦人: member.info.memberShip.underTaker,
      學校: member.info.school.full_name,
      LYPS連接時間: member.status.lyps.connected_at
        ? new Date(member.status.lyps.connected_at).toLocaleDateString()
        : "未連接",
    }));

    // 準備統計資料
    const totalMembers = memberData.length;
    const enabledMembers = memberData.filter(
      (m) => m.info.memberShip.isActive,
    ).length;
    const lypsUsers = memberData.filter((m) => m.status.lyps.isLypsUser).length;
    const connectedUsers = memberData.filter(
      (m) => m.status.lyps.isconnected,
    ).length;

    // 班級統計
    const classStats: { [key: string]: number } = {};
    memberData.forEach((member) => {
      const className =
        Class[member.info.stu.class as keyof typeof Class] ||
        member.info.stu.class;
      classStats[className] = (classStats[className] || 0) + 1;
    });

    // 年級統計
    const gradeStats: { [key: string]: number } = {};
    memberData.forEach((member) => {
      const gradeName =
        Grade[member.info.stu.grade as keyof typeof Grade] ||
        member.info.stu.grade;
      gradeStats[gradeName] = (gradeStats[gradeName] || 0) + 1;
    });

    // 承辦人統計
    const undertakerStats: { [key: string]: number } = {};
    memberData.forEach((member) => {
      const undertaker = member.info.memberShip.underTaker;
      undertakerStats[undertaker] = (undertakerStats[undertaker] || 0) + 1;
    });

    // 建立工作簿
    const workbook = XLSX.utils.book_new();

    // 會員名單工作表
    const memberWorksheet = XLSX.utils.json_to_sheet(exportData);
    const memberColWidths = [
      { wch: 6 }, // 序號
      { wch: 8 }, // 會員ID
      { wch: 12 }, // 姓名
      { wch: 12 }, // 學號
      { wch: 8 }, // 班級
      { wch: 8 }, // 年級
      { wch: 6 }, // 座號
      { wch: 15 }, // LYPS ID
      { wch: 10 }, // 會員狀態
      { wch: 10 }, // LYPS狀態
      { wch: 12 }, // 是否為LYPS用戶
      { wch: 12 }, // 加入時間
      { wch: 12 }, // 最後更新
      { wch: 10 }, // 承辦人
      { wch: 20 }, // 學校
      { wch: 12 }, // LYPS連接時間
    ];
    memberWorksheet["!cols"] = memberColWidths;

    // 統計摘要工作表
    const summaryData = [
      { 項目: "總會員數", 數量: totalMembers },
      { 項目: "啟用會員", 數量: enabledMembers },
      { 項目: "停用會員", 數量: totalMembers - enabledMembers },
      {
        項目: "啟用會員比例",
        數量: `${((enabledMembers / totalMembers) * 100).toFixed(1)}%`,
      },
      { 項目: "LYPS用戶", 數量: lypsUsers },
      { 項目: "已連接LYPS", 數量: connectedUsers },
      {
        項目: "LYPS用戶比例",
        數量: `${((lypsUsers / totalMembers) * 100).toFixed(1)}%`,
      },
      {
        項目: "LYPS連接比例",
        數量: `${((connectedUsers / totalMembers) * 100).toFixed(1)}%`,
      },
      { 項目: "", 數量: "" },
      { 項目: "班級分布", 數量: "" },
      ...Object.entries(classStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([className, count]) => ({
          項目: `　${className}班`,
          數量: `${count}人 (${((count / totalMembers) * 100).toFixed(1)}%)`,
        })),
      { 項目: "", 數量: "" },
      { 項目: "年級分布", 數量: "" },
      ...Object.entries(gradeStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([gradeName, count]) => ({
          項目: `　${gradeName}`,
          數量: `${count}人 (${((count / totalMembers) * 100).toFixed(1)}%)`,
        })),
      { 項目: "", 數量: "" },
      { 項目: "承辦人分布", 數量: "" },
      ...Object.entries(undertakerStats)
        .sort(([, a], [, b]) => b - a)
        .map(([undertaker, count]) => ({
          項目: `　${undertaker}`,
          數量: `${count}人 (${((count / totalMembers) * 100).toFixed(1)}%)`,
        })),
      { 項目: "", 數量: "" },
      { 項目: "匯出時間", 數量: new Date().toLocaleString() },
      { 項目: "匯出者", 數量: "系統管理員" },
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet["!cols"] = [{ wch: 15 }, { wch: 25 }];

    // 啟用會員明細工作表
    const enabledMembers_list = memberData.filter(
      (m) => m.info.memberShip.isActive,
    );
    const enabledMembersData = enabledMembers_list.map((member, index) => ({
      序號: index + 1,
      姓名: member.name,
      學號: member.stu_id,
      班級:
        Class[member.info.stu.class as keyof typeof Class] ||
        member.info.stu.class,
      年級:
        Grade[member.info.stu.grade as keyof typeof Grade] ||
        member.info.stu.grade,
      座號: member.info.stu.number,
      "LYPS ID": member.lyps_id || "",
      LYPS狀態: member.status.lyps.isconnected ? "已連接" : "未連接",
      加入時間: new Date(
        member.info.memberShip.actived_at,
      ).toLocaleDateString(),
      承辦人: member.info.memberShip.underTaker,
    }));

    const enabledMembersWorksheet =
      XLSX.utils.json_to_sheet(enabledMembersData);
    enabledMembersWorksheet["!cols"] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 12 },
      { wch: 8 },
      { wch: 8 },
      { wch: 6 },
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
    ];

    // LYPS用戶明細工作表
    const lypsUsers_list = memberData.filter((m) => m.status.lyps.isLypsUser);
    const lypsUsersData = lypsUsers_list.map((member, index) => ({
      序號: index + 1,
      姓名: member.name,
      學號: member.stu_id,
      班級:
        Class[member.info.stu.class as keyof typeof Class] ||
        member.info.stu.class,
      年級:
        Grade[member.info.stu.grade as keyof typeof Grade] ||
        member.info.stu.grade,
      "LYPS ID": member.lyps_id,
      連接狀態: member.status.lyps.isconnected ? "已連接" : "未連接",
      連接時間: member.status.lyps.connected_at
        ? new Date(member.status.lyps.connected_at).toLocaleDateString()
        : "未連接",
      會員狀態: member.info.memberShip.isActive ? "啟用" : "停用",
    }));

    const lypsUsersWorksheet = XLSX.utils.json_to_sheet(lypsUsersData);
    lypsUsersWorksheet["!cols"] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 12 },
      { wch: 8 },
      { wch: 8 },
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
    ];

    // 加入工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "統計摘要");
    XLSX.utils.book_append_sheet(workbook, memberWorksheet, "完整會員名單");
    XLSX.utils.book_append_sheet(workbook, enabledMembersWorksheet, "啟用會員");
    XLSX.utils.book_append_sheet(workbook, lypsUsersWorksheet, "LYPS用戶");

    // 產生檔案名稱
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    const timeString = today
      .toLocaleTimeString("zh-TW", { hour12: false })
      .replace(/:/g, "");
    const fileName = `林園高中會員名單_${dateString}_${timeString}.xlsx`;

    // 下載檔案
    XLSX.writeFile(workbook, fileName);

    return {
      success: true,
      fileName,
      totalRecords: totalMembers,
      enabledMembers,
      lypsUsers,
    };
  } catch (error) {
    console.error("匯出Excel失敗:", error);
    throw new Error("匯出Excel失敗");
  }
};

// 匯出特定條件的會員資料
export const exportFilteredMembers = (
  memberData: memberDataRaw[],
  options: {
    enabledOnly?: boolean;
    lypsOnly?: boolean;
    grade?: string;
    class?: string;
    undertaker?: string;
  } = {},
) => {
  let filteredData = [...memberData];

  // 套用篩選條件
  if (options.enabledOnly) {
    filteredData = filteredData.filter((m) => m.info.memberShip.isActive);
  }

  if (options.lypsOnly) {
    filteredData = filteredData.filter((m) => m.status.lyps.isLypsUser);
  }

  if (options.grade) {
    filteredData = filteredData.filter(
      (m) => m.info.stu.grade === options.grade,
    );
  }

  if (options.class) {
    filteredData = filteredData.filter(
      (m) => m.info.stu.class === options.class,
    );
  }

  if (options.undertaker) {
    filteredData = filteredData.filter(
      (m) => m.info.memberShip.underTaker === options.undertaker,
    );
  }

  return exportMembersToExcel(filteredData);
};
