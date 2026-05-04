import React from "react";
import AuthBranding from "./AuthBranding";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-ground p-4 sm:p-6 lg:p-8">
      {/* Main Card Container */}
      <div className="w-full max-w-[1400px] min-h-[600px] h-full lg:h-[85vh] flex overflow-hidden rounded-[2rem] shadow-2xl bg-white border border-white/50 ring-1 ring-black/5">
        
        {/* Left Side - Branding (Hidden on mobile) */}
        <AuthBranding />

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
