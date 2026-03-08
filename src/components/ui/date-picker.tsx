import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = "yyyy/mm/dd", disabled = false, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    try { return parse(value, "yyyy-MM-dd", new Date()); } catch { return undefined; }
  }, [value]);

  // Sync inputValue when dateValue changes externally
  React.useEffect(() => {
    setInputValue(dateValue ? format(dateValue, "yyyy/MM/dd") : "");
  }, [dateValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    setInputValue(raw);

    // Auto-format: insert slashes
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 8) {
      const formatted = `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6, 8)}`;
      setInputValue(formatted);
      const parsed = parse(formatted, "yyyy/MM/dd", new Date());
      if (isValid(parsed)) {
        onChange?.(parsed);
      }
    }
  };

  const handleInputBlur = () => {
    if (!inputValue) {
      onChange?.(undefined);
      return;
    }
    // Try parsing various formats
    for (const fmt of ["yyyy/MM/dd", "yyyy-MM-dd", "yyyy.MM.dd"]) {
      const parsed = parse(inputValue, fmt, new Date());
      if (isValid(parsed) && parsed.getFullYear() > 1900) {
        onChange?.(parsed);
        setInputValue(format(parsed, "yyyy/MM/dd"));
        return;
      }
    }
    // Invalid input — revert
    setInputValue(dateValue ? format(dateValue, "yyyy/MM/dd") : "");
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative flex items-center", className)}>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="h-8 text-xs border-border pr-8 font-normal"
        />
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="absolute right-1.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
            onClick={() => setOpen(!open)}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleCalendarSelect}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
