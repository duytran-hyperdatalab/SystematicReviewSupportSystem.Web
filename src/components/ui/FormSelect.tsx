import React from "react";
import Label from "./Label";
import Select, { type SelectProps } from "./Select";
import HelperText from "./HelperText";
import { cn } from "../../utils/cn";

interface FormSelectProps extends SelectProps {
  id: string;
  label: string;
  errorMessage?: string;
  helperText?: string;
  containerClassName?: string;
}

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      id,
      label,
      errorMessage,
      helperText,
      containerClassName,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!errorMessage;

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        <Label htmlFor={id}>{label}</Label>
        <Select
          ref={ref}
          id={id}
          error={hasError}
          className={className}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          {...props}
        />
        {hasError ? (
          <HelperText message={errorMessage} variant="error" id={`${id}-error`} />
        ) : helperText ? (
          <HelperText message={helperText} variant="default" id={`${id}-helper`} />
        ) : null}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";

export default FormSelect;
