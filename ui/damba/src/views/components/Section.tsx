import Card from "@/components/ui/Card";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-sm rounded-2xl p-4">
      <h5 className="text-lg">{title}</h5>
      <div className="space-y-3">{children}</div>
    </Card>
  );
}
