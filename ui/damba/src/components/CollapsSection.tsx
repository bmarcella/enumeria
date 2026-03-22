import { Card } from "@/components/ui";
import React from "react";
import { HiChevronDown } from "react-icons/hi";

export function CollapsSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const toggle = () => setOpen((v) => !v);

  return (
    <Card className="shadow-sm rounded-2xl p-4">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between gap-3"
        aria-expanded={open}
      >
        <h5 className="text-lg font-medium text-left">{title}</h5>
        <HiChevronDown className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`} />
      </button>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ${
          open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3">{children}</div>
          {open && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button type="button" onClick={toggle} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">
                <HiChevronDown className="h-4 w-4 rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
