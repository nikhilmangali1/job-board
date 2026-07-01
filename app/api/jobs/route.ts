import { query } from "@/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";

  const jobs = await query`
    SELECT * FROM jobs
    WHERE (
      ${search === ""} OR
      title ILIKE ${"%" + search + "%"} OR
      company ILIKE ${"%" + search + "%"} OR
      location ILIKE ${"%" + search + "%"}
    )
    AND (${type === ""} OR type = ${type})
    ORDER BY created_at DESC
  `;

  return Response.json(jobs);
}

export async function POST(request: Request) {
  try {
    const { title, company, location, type, salary_range, description, requirements } = await request.json();

    if (!title || !company || !location || !type || !description) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await query`
      INSERT INTO jobs (title, company, location, type, salary_range, description, requirements)
      VALUES (${title}, ${company}, ${location}, ${type}, ${salary_range || null}, ${description}, ${requirements || null})
      RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create job" }, { status: 500 });
  }
}
