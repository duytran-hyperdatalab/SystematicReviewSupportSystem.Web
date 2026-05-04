import React, { useState } from "react";
// import TopHeader from '../protocol/TopHeader';
// import SidebarNavigation from '../protocol/SidebarNavigation';
import Drawer from "../ui/Drawer";

interface ReviewLayoutProps {
  children: React.ReactNode;
  notesPanel?: React.ReactNode;
}

const ReviewLayout: React.FC<ReviewLayoutProps> = ({ children, notesPanel }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-surface-ground overflow-hidden">
      {/* <TopHeader 
        projectName="First Project" 
        onMenuClick={() => setSidebarOpen(true)} 
      /> */}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Desktop (Static) */}
        <div className="hidden lg:block">{/* <SidebarNavigation /> */}</div>

        {/* Sidebar - Mobile Drawer */}
        <div className="lg:hidden">
          <Drawer
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            side="left"
            maxWidth="max-w-[280px]"
          >
            <div className="-m-6 h-full bg-surface-card">{/* <SidebarNavigation /> */}</div>
          </Drawer>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          <div className="flex-1 overflow-hidden p-3 md:p-6 scroll-smooth">
            <div className="max-w-5xl mx-auto h-full overflow-hidden flex flex-col">{children}</div>
          </div>

          {/* Floating Action Button for Notes on Mobile */}
          {notesPanel && (
            <button
              onClick={() => setNotesOpen(true)}
              className="xl:hidden fixed bottom-6 right-6 z-40 bg-brand-600 text-white p-3 rounded-full shadow-lg hover:bg-brand-700 transition-transform active:scale-90"
              aria-label="Toggle notes"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </button>
          )}
        </main>

        {/* Notes Panel Column (Desktop) */}
        {notesPanel && (
          <div className="hidden xl:block w-80 2xl:w-96 border-l border-border-default bg-surface-card overflow-hidden">
            {notesPanel}
          </div>
        )}

        {/* Notes Panel (Mobile Drawer) */}
        {notesPanel && (
          <Drawer
            isOpen={notesOpen}
            onClose={() => setNotesOpen(false)}
            side="right"
            title="Notes & Comments"
            maxWidth="max-w-sm"
          >
            <div className="-mx-6 -my-8 h-full">
              <div className="flex-1 overflow-hidden h-full">{notesPanel}</div>
            </div>
          </Drawer>
        )}
      </div>
    </div>
  );
};

export default ReviewLayout;
