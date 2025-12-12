
'use client';

import * as React from 'react';
import { CheckIcon, ChevronDown, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface MultiSelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  placeholder?: string;
  className?: string;
  selected: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      placeholder,
      className,
      selected,
      onChange,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (item: string) => {
      onChange(selected.filter((i) => i !== item));
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between', selected.length > 0 ? 'h-full' : 'h-10', className)}
            onClick={() => setOpen(!open)}
            {...props}
          >
            <div className="flex gap-1 flex-wrap">
              {selected.length > 0 ? (
                selected.map((item) => {
                  const option = options.find(opt => opt.value === item);
                  if (!option) return null;
                  return (
                    <Badge
                      variant="secondary"
                      key={item}
                      className="mr-1 mb-1"
                      onClick={(e) => {
                          e.preventDefault();
                          handleUnselect(item);
                      }}
                    >
                      {option.label}
                      <span
                        role="button"
                        tabIndex={0}
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUnselect(item);
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUnselect(item);
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </span>
                    </Badge>
                  )
                })
              ) : (
                <span className="text-muted-foreground">{placeholder || 'Select...'}</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command className={className}>
            <CommandInput placeholder="Search ..." />
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandList>
                <CommandGroup>
                {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                          onChange(
                          selected.includes(option.value)
                              ? selected.filter((item) => item !== option.value)
                              : [...selected, option.value]
                          );
                          setOpen(true);
                      }}
                    >
                    <CheckIcon
                        className={cn(
                        'mr-2 h-4 w-4',
                        selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
                        )}
                    />
                    {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    {option.label}
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect };
