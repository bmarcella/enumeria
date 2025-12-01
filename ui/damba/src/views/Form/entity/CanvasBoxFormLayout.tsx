// canvas-box/CanvasBoxFormLayout.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Card } from '@/components/ui';

type ErrorMap = {
  key: string;
  data: any;
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
  errors?: ErrorMap;
};

export function Field({ label, children, errors }: FieldProps) {
  const errorKey = errors?.key;
  const error = errorKey ? errors?.data?.[errorKey] : undefined;
  return (
    <div className="flex flex-col gap-1 py-1">
      <label className="text-sm font-medium">{label}</label>
      <div>{children}</div>
      {error?.message && (
        <span className="text-xs text-red-500">{error.message}</span>
      )}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode, shadow?:boolean }) {
  return (
    <Card className="shadow-sm rounded-2xl p-4 space-y-3 overflow-y-auto max-h-[570px]">
      <h5 className="text-lg font-semibold mb-2">{title}</h5>
      {children}
    </Card>
  );
}
