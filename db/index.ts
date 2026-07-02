type Value = string | number | boolean | null;

export async function query(strings: TemplateStringsArray, ...values: Value[]) {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("POSTGRES_URL not set");
  const { neon } = await import("@neondatabase/serverless");
  return neon(url)(strings, ...values);
}

export async function initDB() {
  await query`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      salary_range VARCHAR(100),
      description TEXT NOT NULL,
      requirements TEXT,
      apply_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await query`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apply_url VARCHAR(500)`;
}
