import React from "react";
import Label from "./Label";
import Textarea, { type TextareaProps } from "./Textarea";
import HelperText from "./HelperText";
import { cn } from "../../utils/cn";

interface FormTextareaProps extends TextareaProps {
  id: string;
  label: string;
  errorMessage?: string;
  helperText?: string;
  containerClassName?: string;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
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
        <Textarea
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

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
