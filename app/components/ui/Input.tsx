"use client";

import { forwardRef } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  error?: boolean;
};

const Input = forwardRef<HTMLInputElement, Props>(
  ({ icon, error, className = "", ...props }, ref) => {
    return (
      <div className="relative">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          ref={ref}
          className={`input ${icon ? "input--with-icon" : ""} ${error ? "input-error" : ""} ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
