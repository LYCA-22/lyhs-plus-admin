"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Laptop } from "lucide-react"; // Assuming you want to use Lucide icons

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Tabs defaultValue={theme} onValueChange={setTheme}>
      <TabsList className="rounded-full gap-1 m-1">
        <TabsTrigger value="light" className="p-1 rounded-full shadow-none">
          <Sun className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="system" className="p-1 rounded-full shadow-none">
          <Laptop className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="dark" className="p-1 rounded-full shadow-none">
          <Moon className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
