type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
};

const paddingClasses = {
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export default function Card({
  children,
  className = "",
  as: Tag = "div",
  hover = false,
  padding = "md",
}: Props) {
  return (
    <Tag className={`${hover ? "surface-elevated" : "surface-card"} rounded-2xl ${paddingClasses[padding]} ${className}`}>
      {children}
    </Tag>
  );
}
