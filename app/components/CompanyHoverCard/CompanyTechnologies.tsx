"use client";

type Props = {
  technologies: string[];
};

const CHIP_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
];

export default function CompanyTechnologies({ technologies }: Props) {
  if (technologies.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5">Technologies</p>
      <div className="flex flex-wrap gap-1">
        {technologies.map((tech, i) => (
          <span
            key={tech}
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${CHIP_COLORS[i % CHIP_COLORS.length]}`}
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
