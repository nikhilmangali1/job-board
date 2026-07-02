export const SKILL_CATEGORIES: Record<string, string[]> = {
  languages: [
    "JavaScript", "TypeScript", "Python", "Java", "C#", "Go", "Rust",
    "C++", "Swift", "Kotlin", "PHP", "Ruby", "Scala", "Dart", "R", "Perl",
    "C", "Elixir", "Haskell", "Clojure", "Zig",
  ],
  frameworks: [
    "React", "Next.js", "Vue", "Angular", "Svelte", "Express", "Django",
    "Flask", "Spring Boot", "Rails", "Laravel", "ASP.NET", "Node.js",
    "Deno", "Nuxt", "Gatsby", "NestJS", "FastAPI", "Ruby on Rails",
    "Tailwind CSS", "Bootstrap", "jQuery", "Electron", "React Native",
    "Flutter", "Tauri",
  ],
  databases: [
    "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis", "Elasticsearch",
    "DynamoDB", "Firestore", "MariaDB", "Oracle", "SQL Server", "Neo4j",
    "Cassandra", "CockroachDB", "Supabase", "Neon",
  ],
  cloud: [
    "AWS", "Azure", "GCP", "Vercel", "Netlify", "Cloudflare",
    "DigitalOcean", "Heroku", "Firebase", "AWS Lambda", "S3", "EC2",
    "ECS", "CloudFront",
  ],
  devops: [
    "Docker", "Kubernetes", "GitHub Actions", "CI/CD", "Terraform",
    "Ansible", "Jenkins", "Nginx", "Apache", "Helm", "ArgoCD", "Git",
    "GitLab CI", "CircleCI", "Prometheus", "Grafana",
  ],
  testing: [
    "Jest", "Vitest", "Cypress", "Playwright", "Mocha", "Chai", "Jasmine",
    "Karma", "Testing Library", "Selenium", "Puppeteer",
  ],
  web: [
    "HTML", "CSS", "REST", "GraphQL", "WebSocket", "gRPC", "WebRTC",
    "Webpack", "Vite", "Babel", "tRPC", "Redux", "Zustand", "React Query",
    "SCSS", "Sass", "Less",
  ],
};

export const allSkills: string[] = Object.values(SKILL_CATEGORIES).flat();

export const allSkillsLower: string[] = allSkills.map((s) => s.toLowerCase());

export function extractSkills(text: string): string[] {
  if (!text.trim()) return [];
  const lower = text.toLowerCase();
  const found = new Set<string>();

  for (let i = 0; i < allSkillsLower.length; i++) {
    if (lower.includes(allSkillsLower[i])) {
      found.add(allSkills[i]);
    }
  }

  return Array.from(found).sort();
}
