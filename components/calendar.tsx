"use client";

import * as React from "react";
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

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
}

export function CalendarManager() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [events, setEvents] = React.useState<Event[]>([]);
  const [newEvent, setNewEvent] = React.useState({
    title: "",
    description: "",
    date: "",
  });
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date && newEvent.description) {
      setEvents([...events, { ...newEvent, id: Date.now().toString() }]);
      setNewEvent({ title: "", description: "", date: "" });
    }
    setIsOpen(false);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
    setSelectedEvent(null);
  };

  const editEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent && selectedEvent.title && selectedEvent.date) {
      setEvents(
        events.map((event) =>
          event.id === selectedEvent.id ? selectedEvent : event,
        ),
      );
      setIsEditing(false);
    }
  };

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
              isSameMonth(day, currentDate) ? "bg-background" : "bg-gray-100"
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
                  className="bg-blue-200 p-1 px-2 font-medium rounded-md mt-4 text-xs flex justify-between items-center"
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
                {isEditing ? "Edit Event" : selectedEvent.title}
              </DialogTitle>
            </DialogHeader>
            {isEditing ? (
              <form onSubmit={editEvent} className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Event Title</Label>
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
                  <Label htmlFor="edit-description">Event Title</Label>
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
                <div>
                  <Label htmlFor="edit-date">Event Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={selectedEvent.date}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            ) : (
              <>
                <p>
                  Date: {format(parseISO(selectedEvent.date), "MMMM d, yyyy")}
                </p>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteEvent(selectedEvent.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
