import { query } from "@/db";
import { computeStats } from "@/lib/analytics";

export async function GET() {
  const jobs = await query`SELECT * FROM jobs`;
  const stats = computeStats(jobs as any[]);
  return Response.json(stats);
}
