import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border-default py-8 mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-center text-text-muted text-sm font-medium tracking-wide">
          © {currentYear} Systematic Review Support System
          <span className="mx-3 text-border-default">|</span>
          Following PRISMA Framework
        </p>
      </div>
    </footer>
  );
};

export default Footer;
