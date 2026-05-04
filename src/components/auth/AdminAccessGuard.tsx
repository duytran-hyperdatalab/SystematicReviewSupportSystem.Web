import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import type { RootState } from "../../redux/store";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { toastInfo } from "../../utils/toast";

const AdminAccessGuard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const [prevBase, setPrevBase] = useState<"admin" | "client">(
    location.pathname.startsWith("/admin") ? "admin" : "client"
  );

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") return;

    const currentBase = location.pathname.startsWith("/admin") ? "admin" : "client";

    // Case 1: Admin moving from Admin Dashboard to Client Pages
    if (prevBase === "admin" && currentBase === "client" && location.pathname !== "/auth/signin") {
      setTargetPath(location.pathname);
      setShowModal(true);
    }

    // Case 2: Admin moving from Client Pages to Admin Dashboard
    if (prevBase === "client" && currentBase === "admin") {
      toastInfo("Accessing to admin dashboard");
    }

    setPrevBase(currentBase);
  }, [location.pathname, user?.role, isAuthenticated, prevBase]);

  const handleConfirmSwitch = () => {
    setShowModal(false);
    setTargetPath(null);
  };

  const handleCancelSwitch = () => {
    setShowModal(false);
    if (targetPath) {
      navigate("/admin");
    }
    setTargetPath(null);
  };

  if (!isAuthenticated || user?.role !== "Admin") return null;

  return (
    <Modal
      isOpen={showModal}
      onClose={() => handleCancelSwitch()}
      title="Switch to Client Pages?"
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          You are currently in the Admin Dashboard. Do you want to switch to the client view?
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={handleCancelSwitch}>
            No, stay in Admin
          </Button>
          <Button variant="primary" onClick={handleConfirmSwitch}>
            Yes, switch to Client
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AdminAccessGuard;
