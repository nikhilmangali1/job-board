import { query } from "@/db";
import { computeStats, type Job } from "@/lib/analytics";

export async function GET() {
  const jobs = (await query`SELECT * FROM jobs`) as Job[];
  const stats = computeStats(jobs);
  return Response.json(stats);
}
