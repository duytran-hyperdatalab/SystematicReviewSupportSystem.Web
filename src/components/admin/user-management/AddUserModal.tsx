import React, { useState } from "react";
import Modal from "../../ui/Modal";
import FormField from "../../ui/FormField";
import Button from "../../ui/Button";
import { useRegisterMutation } from "../../../hooks/useUsers";
import { toastSuccess, toastError } from "../../../utils/toast";
import { FiRefreshCw } from "react-icons/fi";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DEFAULT_PASSWORD = "prismaslruser";

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        username: "",
        password: DEFAULT_PASSWORD,
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const { register, isLoading } = useRegisterMutation();

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

    const handleResetPassword = () => {
        setFormData(prev => ({ ...prev, password: DEFAULT_PASSWORD }));
        if (fieldErrors.password) {
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated.password;
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
        if (!formData.password.trim()) errors.password = "Password is required";
        else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const result = await register({
                ...formData,
                role: 0,
            });

            if (result.isSuccess) {
                toastSuccess("User Created Successfully", `Account for ${formData.fullName} has been created.`);
                handleClose();
            } else {
                toastError("Registration Failed", result.message || "Could not register user.");

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
            toastError("System Error", "An unexpected error occurred while creating the user.");
        }
    };

    const handleClose = () => {
        setFormData({ fullName: "", email: "", username: "", password: DEFAULT_PASSWORD });
        setFieldErrors({});
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Create System User"
            description="Add a new account to the systematic review support system."
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

                <div className="space-y-2">
                    <FormField
                        id="password"
                        label="Account Password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        errorMessage={fieldErrors.password}
                        disabled={isLoading}
                        required
                        helperText={formData.password === DEFAULT_PASSWORD ? "Security Tip: Standard default password applied." : "Custom password provided."}
                    />
                    {formData.password !== DEFAULT_PASSWORD && (
                        <button
                            type="button"
                            onClick={handleResetPassword}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors ml-1"
                        >
                            <FiRefreshCw size={10} />
                            Reset to System Default
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                    <button
                        type="button"
                        onClick={handleClose}
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
                        Register User
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddUserModal;
