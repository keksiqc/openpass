import { Slider as SliderPrimitive } from "radix-ui";
import { type ComponentProps, useMemo } from "react";

import { cn } from "@/lib/utils";

function resolveValues(
  value: number[] | undefined,
  defaultValue: number[] | undefined,
  min: number,
  max: number,
): number[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (Array.isArray(defaultValue)) {
    return defaultValue;
  }
  return [min, max];
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = useMemo(
    () => resolveValues(value, defaultValue, min, max),
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      data-slot="slider"
      defaultValue={defaultValue}
      max={max}
      min={min}
      value={value}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
        data-slot="slider-track"
      >
        <SliderPrimitive.Range
          className={cn(
            "absolute rounded-full bg-accent data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
          data-slot="slider-range"
        />
      </SliderPrimitive.Track>
      {_values.map((_val, index) => (
        <SliderPrimitive.Thumb
          className="block size-4 shrink-0 cursor-grab rounded-full border border-border bg-background shadow-sm ring-accent/30 transition-shadow hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
          data-slot="slider-thumb"
          key={index}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
