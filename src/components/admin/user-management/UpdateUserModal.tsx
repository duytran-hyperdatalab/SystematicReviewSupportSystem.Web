import React, { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import FormField from "../../ui/FormField";
import Button from "../../ui/Button";
import { useUpdateUserMutation } from "../../../hooks/useUsers";
import { toastSuccess, toastError } from "../../../utils/toast";
import type { User } from "../../../types/user";

interface UpdateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSuccess: (updatedUser: User) => void;
}

const UpdateUserModal: React.FC<UpdateUserModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        username: "",
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { updateUser, isLoading } = useUpdateUserMutation();

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName,
                email: user.email,
                username: user.username,
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (fieldErrors[id]) {
            setFieldErrors((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        }
    };

    const validate = () => {
        const errors: Record<string, string> = {};
        if (!formData.fullName.trim()) errors.fullName = "Full name is required";
        if (!formData.email.trim()) errors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";
        if (!formData.username.trim()) errors.username = "Username is required";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !user) return;

        try {
            const result = await updateUser({
                id: user.id,
                ...formData,
            });

            if (result.isSuccess) {
                toastSuccess("Profile Updated", `User ${formData.fullName} has been updated successfully.`);
                onSuccess(result.data!);
                onClose();
            } else {
                toastError("Update Failed", result.message || "Could not update user.");
                if (result.errors) {
                    const apiErrors: Record<string, string> = {};
                    result.errors.forEach((err: any) => {
                        const field = err.code.toLowerCase();
                        if (field.includes("email")) apiErrors.email = err.message;
                        if (field.includes("username")) apiErrors.username = err.message;
                    });
                    setFieldErrors(prev => ({ ...prev, ...apiErrors }));
                }
            }
        } catch (err: any) {
            toastError("System Error", "An unexpected error occurred.");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Update User Profile"
            description="Modify the identity and contact details of this system user."
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        id="fullName"
                        label="Full Name"
                        placeholder="e.g. Alexander Sterling"
                        value={formData.fullName}
                        onChange={handleChange}
                        errorMessage={fieldErrors.fullName}
                        disabled={isLoading}
                        required
                    />
                    <FormField
                        id="username"
                        label="Username"
                        placeholder="e.g. asterling_admin"
                        value={formData.username}
                        onChange={handleChange}
                        errorMessage={fieldErrors.username}
                        disabled={isLoading}
                        required
                    />
                </div>

                <FormField
                    id="email"
                    label="Email Address"
                    type="email"
                    placeholder="e.g. alex.s@srss.admin.com"
                    value={formData.email}
                    onChange={handleChange}
                    errorMessage={fieldErrors.email}
                    disabled={isLoading}
                    required
                />

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 min-w-[140px]"
                    >
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateUserModal;
