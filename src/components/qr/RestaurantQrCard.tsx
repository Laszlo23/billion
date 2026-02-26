import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  slug: string;
};

export function RestaurantQrCard({ slug }: Props) {
  const route = `/r/${slug}`;
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=svg&data=${encodeURIComponent(route)}`;
  return (
    <Card className="glass-surface">
      <CardHeader>
        <CardTitle>QR Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Use this scannable preview when presenting your live menu route.
        </p>
        <img src={qrSvgUrl} alt="QR code preview" className="h-40 w-40 rounded-lg border border-slate-600 bg-slate-100 p-2" />
        <a
          href={qrSvgUrl}
          download={`restaurant-${slug}-qr.svg`}
          className="inline-flex w-fit rounded-lg border border-slate-600 bg-slate-900/55 px-3 py-1.5 text-sm font-medium text-slate-100"
        >
          Download QR (SVG)
        </a>
        <code className="block rounded-md bg-slate-900/55 px-3 py-2 text-sm text-slate-100">{route}</code>
      </CardContent>
    </Card>
  );
}
