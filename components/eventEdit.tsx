import { format, parseISO } from "date-fns";
import { Trash2, Edit2, Signature, Text, CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { apiServices } from "@/services/api";
import { Calendar } from "@/components/ui/calendar";
import { Event } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OfficeItem {
  color: string;
  name: string;
}

export function EventEdit({
  selectedEvent,
  setSelectedEvent,
  officesInfo,
  setIsEditing,
  isEditing,
  setLoading,
  loading,
  setEvents,
  events,
}: {
  selectedEvent: Event | null;
  setSelectedEvent: (selectedEvent: Event | null) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  officesInfo: { [key: string]: OfficeItem };
  setEvents: (events: Event[]) => void;
  events: Event[];
}) {
  const deleteEvent = async (id: string) => {
    setLoading(true);
    await apiServices.deleteEvent(id);
    setLoading(false);
    setEvents(events.filter((event) => event.id !== id));
    setSelectedEvent(null);
    window.location.reload();
  };

  const editEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent && selectedEvent.title && selectedEvent.date) {
      setLoading(true);
      await apiServices.updateEvent(selectedEvent);
      setLoading(false);
      setEvents(
        events.map((event) =>
          event.id === selectedEvent.id ? selectedEvent : event,
        ),
      );
      setIsEditing(false);
    }
  };

  return (
    <Dialog
      open={selectedEvent !== null}
      onOpenChange={() => {
        setSelectedEvent(null);
        setIsEditing(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl m-0">
            {isEditing ? "編輯事件" : selectedEvent?.title}
          </DialogTitle>
        </DialogHeader>
        {isEditing ? (
          <form onSubmit={editEvent} className="space-y-4 relative">
            <div>
              <Label htmlFor="edit-title">標題</Label>
              <Input
                id="edit-title"
                value={selectedEvent?.title || ""}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    title: e.target.value,
                  } as Event)
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">說明</Label>
              <Input
                id="edit-description"
                value={selectedEvent?.description || ""}
                onChange={(e) =>
                  setSelectedEvent({
                    ...selectedEvent,
                    description: e.target.value,
                  } as Event)
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-description">發布處室</Label>
              <Select
                onValueChange={(e) => {
                  setSelectedEvent({
                    ...selectedEvent,
                    office: e,
                  } as Event);
                }}
                defaultValue={selectedEvent?.office}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="點擊這裡選擇" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(officesInfo).map((key) => (
                    <SelectItem value={key} key={key}>
                      {officesInfo[key].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="edit-date">日期</Label>
              <div>
                <Calendar
                  mode="single"
                  selected={
                    selectedEvent?.date
                      ? parseISO(selectedEvent.date)
                      : undefined
                  }
                  onSelect={(newDate) => {
                    if (newDate) {
                      setSelectedEvent({
                        ...selectedEvent,
                        date: format(newDate, "yyyy-MM-dd"),
                      } as Event);
                    }
                  }}
                  className="rounded-md border"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                儲存
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-sm flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <Text />
                <p className="text-[16px] font-medium">說明</p>
              </div>
              <div>
                <p className="text-[16px]">
                  {selectedEvent?.description || "無"}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center border-y border-border py-2">
              <div className="flex gap-2 items-center">
                <Signature />
                <p className="text-[16px] font-medium">發布處室</p>
              </div>
              <div>
                <p className="text-[16px]">
                  {officesInfo[selectedEvent?.office || ""]?.name}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <CalendarDays />
                <p className="text-[16px] font-medium">日期</p>
              </div>
              <div>
                <p className="text-[16px]">{selectedEvent?.date}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" /> 編輯
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteEvent(selectedEvent?.id || "")}
              >
                <Trash2 className="mr-2 h-4 w-4" /> 刪除
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
