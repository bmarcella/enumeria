export type ErrorMap = { key: string; data: any };

export function Field({
  label,
  children,
  errors,
}: {
  label: string;
  children: React.ReactNode;
  errors?: ErrorMap;
}) {
  const errorKey = errors?.key;
  const error = errorKey ? errors?.data?.[errorKey] : undefined;

  return (
    <div className="flex flex-col gap-1 py-1">
      <label className="text-sm font-medium">{label}</label>
      <div>{children}</div>
      {error?.message && <span className="text-sm text-red-500">{error.message}</span>}
    </div>
  );
}