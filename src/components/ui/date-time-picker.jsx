import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';

export function DateTimePicker({ date, setDate }) {
  const handleDateSelect = (selectedDate) => {
    const newDate = date ? new Date(date) : new Date();
    newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    setDate(newDate);
  };

  const handleTimeChange = (e) => {
    const newDate = date ? new Date(date) : new Date();
    const [hours, minutes] = e.target.value.split(':');
    newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    setDate(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP 'à' HH:mm", { locale: fr }) : <span>Choisissez une date et heure</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          locale={fr}
          disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
        />
        <div className="p-2 border-t border-border">
          <Input
            type="time"
            value={date ? format(date, 'HH:mm') : ''}
            onChange={handleTimeChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}