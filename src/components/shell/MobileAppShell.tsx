import { MobileBottomNav } from "@/src/components/shell/MobileBottomNav";

type Props = {
  children: React.ReactNode;
};

export function MobileAppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative pb-28">{children}</div>
      <MobileBottomNav />
    </div>
  );
}
