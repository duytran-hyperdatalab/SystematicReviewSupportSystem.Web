import React, { useState, useRef, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import gsap from "gsap";

interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    delay?: number;
    className?: string;
    icon?: React.ReactNode;
    interactive?: boolean;
    open?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    position = "top",
    delay = 150,
    className,
    icon,
    interactive = false,
    open: controlledOpen,
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const [shouldRender, setShouldRender] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const tooltipId = useId();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();

        let top = 0;
        let left = 0;

        // Anchor points for fixed positioning
        switch (position) {
            case "top":
                top = rect.top;
                left = rect.left + rect.width / 2;
                break;
            case "bottom":
                top = rect.bottom;
                left = rect.left + rect.width / 2;
                break;
            case "left":
                top = rect.top + rect.height / 2;
                left = rect.left;
                break;
            case "right":
                top = rect.top + rect.height / 2;
                left = rect.right;
                break;
        }

        setCoords({ top, left });
    };

    const handleShow = () => {
        if (controlledOpen !== undefined) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            updatePosition();
            setInternalOpen(true);
        }, delay);
    };

    const handleHide = () => {
        if (controlledOpen !== undefined || interactive) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setInternalOpen(false);
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            setShouldRender(true);
        } else {
            if (tooltipRef.current) {
                gsap.to(tooltipRef.current, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.2,
                    ease: "power2.inOut",
                    onComplete: () => setShouldRender(false),
                });
            } else {
                setShouldRender(false);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (shouldRender) {
            updatePosition();
            // Capture: true is essential to track scroll even in nested containers
            window.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);
        }
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [shouldRender, position]);

    useEffect(() => {
        if (shouldRender && tooltipRef.current) {
            const offset = 8;
            const initialX = position === "left" ? offset : position === "right" ? -offset : 0;
            const initialY = position === "top" ? offset : position === "bottom" ? -offset : 0;

            gsap.fromTo(
                tooltipRef.current,
                {
                    opacity: 0,
                    scale: 0.95,
                    x: initialX,
                    y: initialY
                },
                {
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                    duration: 0.35,
                    ease: "power3.out"
                }
            );
        }
    }, [shouldRender, position]);

    const positionStyles = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2.5",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2.5",
        left: "right-full top-1/2 -translate-y-1/2 mr-2.5",
        right: "left-full top-1/2 -translate-y-1/2 ml-2.5",
    };

    const arrowStyles = {
        top: "top-full left-1/2 -translate-x-1/2 border-t-white",
        bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-white",
        left: "left-full top-1/2 -translate-y-1/2 border-l-white",
        right: "right-full top-1/2 -translate-y-1/2 border-r-white",
    };

    return (
        <div
            ref={triggerRef}
            className="relative inline-flex items-center"
            onMouseEnter={handleShow}
            onMouseLeave={handleHide}
            onFocusCapture={handleShow}
            onBlurCapture={handleHide}
        >
            {children}
            {shouldRender && createPortal(
                <div
                    style={{
                        position: "fixed",
                        top: coords.top,
                        left: coords.left,
                        zIndex: "var(--z-index-tooltip)",
                        pointerEvents: "none"
                    }}
                >
                    <div
                        ref={tooltipRef}
                        id={tooltipId}
                        role="tooltip"
                        className={cn(
                            "absolute px-4 py-2 bg-white text-slate-800 text-[11px] font-bold rounded-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 whitespace-nowrap select-none",
                            interactive ? "pointer-events-auto" : "pointer-events-none",
                            positionStyles[position],
                            className
                        )}
                    >
                        <div className="flex items-center gap-2.5">
                            {icon && <span className="text-indigo-600 shrink-0">{icon}</span>}
                            <div className="tracking-tight leading-relaxed">{content}</div>
                        </div>

                        {/* Subtle Arrow Pointer */}
                        <div className={cn(
                            "absolute w-0 h-0 border-[5px] border-transparent",
                            arrowStyles[position]
                        )} />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Tooltip;
