type Props = {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
};

export default function Label({ children, className = "", htmlFor }: Props) {
  return (
    <label htmlFor={htmlFor} className={`label ${className}`}>
      {children}
    </label>
  );
}
