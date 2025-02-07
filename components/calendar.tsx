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
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
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
  lyca: { color: "#D3F0FF", name: "班聯會" },
  equip: { color: "#98E2E0", name: "總務處" },
  edu: { color: "#F1E3C6", name: "教務處" },
  stu: { color: "#F5D7C4", name: "學務處" },
  lib: { color: "#F0C2BD", name: "圖書館" },
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
                      {Object.keys(officesInfo).map((key) => (
                        <SelectItem value={key} key={key}>
                          {officesInfo[key].name}
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
                  className="p-1 px-2 font-medium rounded-md mt-4 text-xs flex justify-between items-center"
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
