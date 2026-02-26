import { getLiveCityData } from "@/src/lib/demo/liveCityData";

export async function GET() {
  const data = await getLiveCityData();
  return Response.json(data);
}
