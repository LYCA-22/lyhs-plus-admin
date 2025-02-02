import { CalendarManager } from "@/components/calendar";

export default function CalendarPage() {
  return (
    <div className="px-10 py-5 relative flex items-center justify-center flex-col">
      <div className="bg-yellow-300 w-full m-1 rounded-lg p-2 px-4 mb-5 font-medium">
        目前行事曆為測試版，尚未與後端資料庫串接，資料皆為本地儲存。
      </div>
      <CalendarManager />
    </div>
  );
}
