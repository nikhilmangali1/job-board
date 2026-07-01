import { query } from "@/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const jobs = await query`SELECT * FROM jobs WHERE id = ${parseInt(id)}`;

  if (jobs.length === 0) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  return Response.json(jobs[0]);
}
