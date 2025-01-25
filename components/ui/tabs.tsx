"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

// 定義樣式變體類型
type TabsVariant = "default" | "underline" | "button" | "card";

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: TabsVariant;
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default:
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
    underline: "inline-flex w-full justify-start relative",
    button: "inline-flex p-1 space-x-1 bg-gray-100 rounded-xl dark:bg-gray-800",
    card: "inline-flex space-x-2 p-2",
  };

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName; // 添加这行

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: TabsVariant;
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default:
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
    underline: `
      relative
      inline-flex items-center px-3 py-2 text-sm font-normal mr-2
      transition-colors duration-300
      hover:bg-hoverbg
      data-[state=active]:text-primary
      before:absolute before:bottom-[-1px] before:left-0 before:h-[2px]
      before:w-full before:scale-x-0 before:bg-primary
      before:transition-transform before:duration-300
      data-[state=active]:before:scale-x-100
    `,
    button:
      "px-3 py-1.5 text-sm font-medium transition-all rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 data-[state=active]:bg-white data-[state=active]:text-primary dark:data-[state=active]:bg-gray-700 shadow-sm data-[state=active]:shadow",
    card: "px-4 py-2 text-sm font-medium rounded-lg transition-all bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=active]:bg-primary data-[state=active]:text-white border border-gray-200 dark:border-gray-700",
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
