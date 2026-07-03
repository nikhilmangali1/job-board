type Variant = "primary" | "success" | "warning" | "error" | "default";

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

const variantClasses: Record<string, string> = {
  primary: "badge-primary",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
  default: "bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/30",
};

export default function Badge({ children, variant = "default", className = "" }: Props) {
  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
