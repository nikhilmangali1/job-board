import { query } from "@/db";

function extractSalaryNum(salary: string | null): number | null {
  if (!salary) return null;
  const match = salary.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const sort = searchParams.get("sort") || "newest";

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

  if (sort === "oldest") {
    jobs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (sort === "salary") {
    jobs.sort((a, b) => (extractSalaryNum(b.salary_range) ?? 0) - (extractSalaryNum(a.salary_range) ?? 0));
  }

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
