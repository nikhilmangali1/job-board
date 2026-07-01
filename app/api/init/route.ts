import { initDB } from "@/db";

export async function GET() {
  try {
    await initDB();
    return Response.json({ status: "ok", message: "Database initialized" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ status: "error", message }, { status: 500 });
  }
}
