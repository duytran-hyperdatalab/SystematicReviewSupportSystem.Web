import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Outlet } from "react-router-dom";
import AdminAccessGuard from "../components/auth/AdminAccessGuard";
import SectionGuard from "../components/auth/SectionGuard";
import SignalRConnectionManager from "../components/SignalRConnectionManager";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SignalRConnectionManager />
      <Header />
      <main className="flex-grow">
        <AdminAccessGuard />
        <SectionGuard section="client">
          {/* <InteractionGuard> */}
          <Outlet />
          {/* </InteractionGuard> */}
        </SectionGuard>
      </main>
      <Footer />
    </div>
  );
}
