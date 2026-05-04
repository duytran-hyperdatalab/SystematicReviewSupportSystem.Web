import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FiHome, FiAlertCircle } from "react-icons/fi";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

const NotFoundPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleGoHome = () => {
    if (user?.role === "Admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main container fade in
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      );

      // Content slide up and scale
      gsap.fromTo(
        contentRef.current,
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1, delay: 0.2, ease: "back.out(1.7)" }
      );

      // Icon float animation (continuous)
      gsap.fromTo(
        iconRef.current,
        { y: 0 },
        { y: -15, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 opacity-0"
    >
      <div
        ref={contentRef}
        className="max-w-max w-full text-center space-y-8"
      >
        {/* Animated Icon Section */}
        <div className="flex justify-center mb-6">
          <div
            ref={iconRef}
            className="w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-full flex items-center justify-center text-primary"
          >
            <FiAlertCircle className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-6xl sm:text-8xl font-extrabold text-gray-900 tracking-tight">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Page Not Found
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-w-[160px]"
            onClick={handleGoHome}
          >
            <FiHome className="mr-2 w-5 h-5" />
            Go to Home
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto min-w-[160px] bg-white"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
