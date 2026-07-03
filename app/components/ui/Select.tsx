"use client";

import { forwardRef } from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
};

const Select = forwardRef<HTMLSelectElement, Props>(
  ({ error, className = "", children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`select ${error ? "input-error" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
export default Select;
