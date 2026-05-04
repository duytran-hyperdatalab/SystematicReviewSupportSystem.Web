import React, { useLayoutEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import type { Toast } from "react-hot-toast";
import {
  HiCheckCircle,
  HiXCircle,
  HiInformationCircle,
  HiXMark,
} from "react-icons/hi2";
import { HiExclamationTriangle } from "react-icons/hi2";
import { CgSpinner } from "react-icons/cg";
import { cn } from "../../../utils/cn";
import gsap from "gsap";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface CustomToastProps {
  t: Toast;
  type: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
}

const toastStyles: Record<
  ToastType,
  { bg: string; border: string; iconColor: string; icon: React.ReactNode; barColor: string }
> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconColor: "text-emerald-600",
    icon: <HiCheckCircle className="w-6 h-6" />,
    barColor: "bg-emerald-500",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    iconColor: "text-red-600",
    icon: <HiXCircle className="w-6 h-6" />,
    barColor: "bg-red-500",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-600",
    icon: <HiExclamationTriangle className="w-6 h-6" />,
    barColor: "bg-amber-500",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconColor: "text-blue-600",
    icon: <HiInformationCircle className="w-6 h-6" />,
    barColor: "bg-blue-500",
  },
  loading: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    iconColor: "text-slate-600",
    icon: <CgSpinner className="w-6 h-6 animate-spin" />,
    barColor: "bg-slate-400",
  },
};

export const CustomToast: React.FC<CustomToastProps> = ({
  t,
  type,
  title,
  message,
  onClose,
}) => {
  const style = toastStyles[type];
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Entrance & Exit Animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (t.visible) {
        // Entrance sequence
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: -20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            ease: "power3.out",
          }
        );

        // Icon pop effect
        gsap.fromTo(
          iconRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.7)", delay: 0.1 }
        );

        // Staggered text appearance
        gsap.fromTo(
          contentRef.current?.children || [],
          { y: 5, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out", delay: 0.15 }
        );

        // Progress bar animation
        if (type !== 'loading' && t.duration !== Infinity) {
          gsap.fromTo(
            progressBarRef.current,
            { scaleX: 1 },
            {
              scaleX: 0,
              duration: (t.duration || 4000) / 1000,
              ease: "none",
              transformOrigin: "left",
            }
          );
        }
      } else {
        // Exit sequence
        gsap.to(containerRef.current, {
          opacity: 0,
          y: -20,
          scale: 0.95,
          duration: 0.3,
          ease: "power2.in",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [t.visible, t.duration, type]);

  // Hover Interactions
  const handleMouseEnter = () => {
    gsap.to(containerRef.current, {
      scale: 1.02,
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      duration: 0.15,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(containerRef.current, {
      scale: 1,
      boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      duration: 0.15,
      ease: "power2.in",
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "max-w-md w-full pointer-events-auto flex flex-col rounded-lg border shadow-sm overflow-hidden",
        style.bg,
        style.border
      )}
    >
      <div className="flex flex-1 w-full">
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div ref={iconRef} className={cn("flex-shrink-0 pt-0.5", style.iconColor)}>
              {style.icon}
            </div>
            <div ref={contentRef} className="ml-3 flex-1">
              <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                {title}
              </p>
              {message && (
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-slate-200">
          <button
            onClick={() => {
              if (onClose) onClose();
              toast.dismiss(t.id);
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Progress Bar (Auto-dismiss timer) */}
      {type !== 'loading' && t.duration !== Infinity && (
        <div className="h-0.5 w-full bg-slate-200/50">
          <div
            ref={progressBarRef}
            className={cn("h-full w-full origin-left", style.barColor)}
          />
        </div>
      )}
    </div>
  );
};
