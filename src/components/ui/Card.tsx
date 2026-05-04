import React from "react";
import { cn } from "../../utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, className, ...props }) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-md overflow-hidden p-6", className)} {...props}>
      {title && (
        <div className="p-6 pb-0">
          <h3 className="text-xl font-semibold text-text-main">{title}</h3>
        </div>
      )}
      <div className={cn(!title && "p-0")}>{children}</div>
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn("p-6 pt-0", className)} {...props} />;

export default Card;
