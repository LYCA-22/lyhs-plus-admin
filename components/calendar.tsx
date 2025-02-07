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
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiServices } from "@/services/api";
import { Event } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventEdit } from "./eventEdit";

interface OfficeItem {
  color: string;
  name: string;
}

const officesInfo: { [key: string]: OfficeItem } = {
  lyca: { color: "var(--office-lyca-color)", name: "班聯會" },
  equip: { color: "var(--office-equip-color)", name: "總務處" },
  edu: { color: "var(--office-edu-color)", name: "教務處" },
  stu: { color: "var(--office-stu-color)", name: "學務處" },
  lib: { color: "var(--office-lib-color)", name: "圖書館" },
};

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

  useEffect(() => {
    const GetEvents = async () => {
      const events = await apiServices.getAllEvent();
      setEvents(events.data.results);
    };
    GetEvents();
  }, []);

  return (
    <div className="w-full font-custom">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h1>
        <div className="flex gap-3 items-center">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full border shadow bg-background h-9 w-9 flex items-center justify-center hover:bg-hoverbg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full border shadow bg-background h-9 w-9 flex items-center justify-center hover:bg-hoverbg"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <Dialog onOpenChange={setIsOpen} open={isOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-foreground text-background rounded-full p-2 px-3 font-sans font-medium text-[14px] hover:opacity-80">
                <Plus className="h-4 w-4" />
                新增事件
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增事件</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={addEvent}
                className="space-y-4 rounded-xl bg-hoverbg dark:bg-zinc-900 p-4 border border-border mt-2"
              >
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <div>
                    <label className="font-medium">標題</label>
                    <p className="text-sm opacity-60">事件的主旨</p>
                  </div>
                  <input
                    className="bg-background border rounded-md p-2 text-end min-w-[300px] transition-all focus:outline-none focus:ring-2 focus:ring-primary dark:bg-zinc-800 dark:border-zinc-700"
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <div>
                    <label className="font-medium">說明</label>
                    <p className="text-sm opacity-60">事件的詳細內容</p>
                  </div>
                  <input
                    className="bg-background border rounded-md p-2 text-end min-w-[300px] transition-all focus:outline-none focus:ring-2 focus:ring-primary dark:bg-zinc-800 dark:border-zinc-700"
                    type="text"
                    required
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <div>
                    <label className="font-medium">發布處室</label>
                    <p className="text-sm opacity-60">發布此事件的來源</p>
                  </div>
                  <Select
                    onValueChange={(e) => {
                      setNewEvent({
                        ...newEvent,
                        office: e,
                      });
                    }}
                    defaultValue={newEvent.office}
                  >
                    <SelectTrigger className="w-[180px] bg-background dark:bg-zinc-800 dark:border-zinc-700">
                      <SelectValue placeholder="點擊這裡選擇" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(officesInfo).map((key) => (
                        <SelectItem value={key} key={key}>
                          <div className="flex items-center justify-between gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: officesInfo[key].color,
                              }}
                            ></div>
                            <p>{officesInfo[key].name}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <label className="font-medium">日期</label>
                    <p className="text-sm opacity-60">事件的舉辦日期</p>
                  </div>
                  <input
                    className="bg-background border rounded-md p-2 text-end min-w-[100px] transition-all focus:outline-none focus:ring-2 focus:ring-primary dark:bg-zinc-800 dark:border-zinc-700"
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  新增
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-background dark:bg-zinc-900 rounded-xl overflow-auto mt-5 border font-custom">
        <div className="grid grid-cols-7 overflow-clip border-border min-w-[600px]">
          {[
            "星期日",
            "星期一",
            "星期二",
            "星期三",
            "星期四",
            "星期五",
            "星期六",
          ].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-sm opacity-50 my-3"
            >
              {day}
            </div>
          ))}
          {monthDays.map((day, index) => (
            <div
              key={index}
              className={`p-2 pt-7 border-t ${
                isSameMonth(day, currentDate)
                  ? "bg-transparent"
                  : "bg-hoverbg dark:bg-zinc-800/50"
              } min-h-[100px] relative`}
            >
              <span
                className={`absolute top-2 left-3 text-sm ${isToday(day) ? "bg-primary text-background rounded-full h-6 w-6 flex font-bold items-center justify-center" : ""}`}
              >
                {format(day, "d")}
              </span>
              {events
                .filter((event) => isSameDay(parseISO(event.date), day))
                .map((event) => (
                  <div
                    key={event.id}
                    className="p-1 px-2 font-medium rounded-[10px] my-2 text-xs flex justify-between items-center"
                    style={{
                      backgroundColor: officesInfo[event.office]?.color,
                    }}
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
      </div>
      <EventEdit
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        officesInfo={officesInfo}
        setEvents={setEvents}
        events={events}
        setIsEditing={setIsEditing}
        isEditing={isEditing}
        loading={loading}
        setLoading={setLoading}
      />
    </div>
  );
}
