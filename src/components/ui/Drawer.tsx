import React, { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import gsap from "gsap";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  side?: "left" | "right";
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-md",
  side = "left",
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle Animations
  useEffect(() => {
    if (!containerRef.current || !backdropRef.current || !drawerRef.current) return;

    if (isOpen) {
      // Entrance Animation
      const tl = gsap.timeline();

      tl.set(containerRef.current, { visibility: "visible" })
        .fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: "power2.out" }
        )
        .fromTo(
          drawerRef.current,
          { x: side === "left" ? "-100%" : "100%" },
          { x: "0%", duration: 0.5, ease: "power3.out" },
          "-=0.3"
        );
    } else if (shouldRender) {
      // Exit Animation
      const tl = gsap.timeline({
        onComplete: () => {
          setShouldRender(false);
          if (containerRef.current) {
            gsap.set(containerRef.current, { visibility: "hidden" });
          }
        },
      });

      tl.to(drawerRef.current, {
        x: side === "left" ? "-100%" : "100%",
        duration: 0.4,
        ease: "power3.in",
      })
        .to(
          backdropRef.current,
          { opacity: 0, duration: 0.3, ease: "power2.in" },
          "-=0.2"
        );
    }
  }, [isOpen, shouldRender, side]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[var(--z-index-drawer)] overflow-hidden"
      style={{ visibility: "hidden" }}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className={cn(
        "fixed inset-y-0 flex max-w-full outline-none",
        side === "left" ? "left-0 pr-10" : "right-0 pl-10"
      )}>
        <div
          ref={drawerRef}
          className={cn(
            "pointer-events-auto w-screen bg-white shadow-2xl",
            maxWidth
          )}
        >
          <div className="flex h-full flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex-1 text-lg font-bold text-gray-900">
                {title}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                aria-label="Close"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 py-8 px-6">
              {children}
            </div>

            {/* Drawer Footer */}
            {footer && (
              <div className="p-6 border-t border-gray-100 bg-slate-50/50 sticky bottom-0">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
