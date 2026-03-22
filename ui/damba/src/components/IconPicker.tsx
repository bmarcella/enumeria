/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { Card, Input, Button } from '@/components/ui';
import * as  LucideIcons  from "react-icons/hi"

type LucideIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface IconPickerProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

/**
 * Build a list of all exported Lucide icons at module load.
 * We filter to only function components (the actual icons).
 */
const ALL_ICONS: { name: string; Icon: LucideIconComponent }[] = Object.entries(
  LucideIcons
)
  .filter(([_, exp]) => typeof exp === 'function')
  .map(([name, Icon]) => ({
    name,
    Icon: Icon as LucideIconComponent,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    if (!search) return ALL_ICONS;
    const q = search.toLowerCase();
    return ALL_ICONS.filter((i) => i.name.toLowerCase().includes(q));
  }, [search]);

  const selectedIcon = useMemo(
    () => ALL_ICONS.find((i) => i.name === value),
    [value]
  );

  return (
    <Card className="p-3 space-y-3 mb-4">
      {/* Top row: search + clear */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search icons…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          type="button"
          variant="default"
          onClick={() => onChange(undefined)}
        >
          Clear
        </Button>
      </div>

      {/* Selected preview */}
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 mt-4">
        {selectedIcon ? (
          <>
            <div className="flex items-center gap-2">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-md border">
                <selectedIcon.Icon />
              </div>
              <span>
                Selected: <strong>{selectedIcon.name}</strong>
              </span>
            </div>
          </>
        ) : (
          <span className="italic text-gray-400">No icon selected</span>
        )}
      </div>

      {/* Icon grid */}
      <div className="grid grid-cols-6 gap-3 max-h-18 overflow-y-auto pt-1">
        {filteredIcons.map(({ name, Icon }) => {
          const isSelected = value === name;
          return (
            <Button
              key={name}
              type="button"
              variant={isSelected ? 'solid' : 'plain'}
              className={`h-10 w-10 p-0 flex items-center justify-center ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onChange(name)}
              title={name}
            >
              <Icon  />
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default IconPicker;
