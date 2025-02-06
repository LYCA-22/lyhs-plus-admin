"use client";
import React, { useState, useEffect } from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiServices } from "@/services/api";
import { Event } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const offices = ["班聯會", "總務處", "校長室", "教務處", "學務處", "圖書館"];
export function CalendarManager() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [events, setEvents] = React.useState<Event[]>([]);
  const [newEvent, setNewEvent] = React.useState({
    title: "",
    description: "",
    date: "",
    office: "",
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newEvent.title &&
      newEvent.date &&
      newEvent.description &&
      newEvent.office
    ) {
      console.log(newEvent);
      const newEventData = { ...newEvent, id: Date.now().toString() };
      const data = [...events, newEventData];
      setEvents(data);
      setNewEvent({ title: "", description: "", date: "", office: "" });
      setLoading(true);
      await apiServices.addEvent(newEventData);
      setIsOpen(false);
      setLoading(false);
    }
  };

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

  useEffect(() => {
    const GetEvents = async () => {
      const events = await apiServices.getAllEvent();
      setEvents(events.data.results);
    };
    GetEvents();
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h1>
        <div className="flex gap-3">
          <Button onClick={prevMonth} variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={nextMonth} variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Dialog onOpenChange={setIsOpen} open={isOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增事件</DialogTitle>
              </DialogHeader>
              <form onSubmit={addEvent} className="space-y-4">
                <div>
                  <Label htmlFor="title">標題</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">說明</Label>
                  <Input
                    id="description"
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-description">發布處室</Label>
                  <Select
                    onValueChange={(e) => {
                      setNewEvent({
                        ...newEvent,
                        office: e,
                      });
                    }}
                    defaultValue={newEvent.office}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="點擊這裡選擇" />
                    </SelectTrigger>
                    <SelectContent>
                      {offices.map((office, index) => (
                        <SelectItem value={office} key={index}>
                          {office}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">日期</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit">新增</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center font-bold p-2 bg-hoverbg mt-5 rounded-lg"
          >
            {day}
          </div>
        ))}
        {monthDays.map((day, index) => (
          <div
            key={index}
            className={`p-2 pt-4 border rounded-lg ${
              isSameMonth(day, currentDate) ? "bg-background" : "bg-hoverbg"
            } min-h-[100px] relative`}
          >
            <span className="absolute top-2 left-3 text-sm">
              {format(day, "d")}
            </span>
            {events
              .filter((event) => isSameDay(parseISO(event.date), day))
              .map((event) => (
                <div
                  key={event.id}
                  className="bg-blue-200 dark:bg-blue-700 p-1 px-2 font-medium rounded-md mt-4 text-xs flex justify-between items-center"
                >
                  <span
                    className="cursor-pointer flex-grow"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsEditing(false);
                    }}
                  >
                    {event.title}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>

      {selectedEvent && (
        <Dialog
          open={!!selectedEvent}
          onOpenChange={() => {
            setSelectedEvent(null);
            setIsEditing(false);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "編輯事件" : selectedEvent.title}
              </DialogTitle>
            </DialogHeader>
            {isEditing ? (
              <form onSubmit={editEvent} className="space-y-4 relative">
                <div>
                  <Label htmlFor="edit-title">標題</Label>
                  <Input
                    id="edit-title"
                    value={selectedEvent.title}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">說明</Label>
                  <Input
                    id="edit-description"
                    value={selectedEvent.description}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        description: e.target.value,
                      })
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
                      });
                    }}
                    defaultValue={selectedEvent.office}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="點擊這裡選擇" />
                    </SelectTrigger>
                    <SelectContent>
                      {offices.map((office, index) => (
                        <SelectItem value={office} key={index}>
                          {office}
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
                        selectedEvent.date
                          ? parseISO(selectedEvent.date)
                          : undefined
                      }
                      onSelect={(newDate) => {
                        if (newDate) {
                          setSelectedEvent({
                            ...selectedEvent,
                            date: format(newDate, "yyyy-MM-dd"),
                          });
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
              <div className="text-sm">
                <p>
                  說明：{selectedEvent.description || "No description provided"}
                </p>
                <p>
                  日期：{format(parseISO(selectedEvent.date), "MMMM d, yyyy")}
                </p>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" /> 編輯
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteEvent(selectedEvent.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> 刪除
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
