import { forwardRef } from "react";

interface SystemSignatureProps {
  className?: string;
  primaryClassName?: string;
  accentClassName?: string;
}

const SystemSignature = forwardRef<
  HTMLHeadingElement,
  SystemSignatureProps
>(
  (
    {
      className = "",
      primaryClassName = "text-white",
      accentClassName = "text-brand-300",
    },
    ref
  ) => {
    return (
      <h1
        ref={ref}
        className={`text-5xl lg:text-6xl font-bold tracking-tight mb-4 ${primaryClassName} ${className}`}
        style={{ textShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
      >
        Prisma
        <span className={`font-light ${accentClassName}`}>SLR</span>
      </h1>
    );
  }
);

SystemSignature.displayName = "SystemSignature";

export default SystemSignature;
