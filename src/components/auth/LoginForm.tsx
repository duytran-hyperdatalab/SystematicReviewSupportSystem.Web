import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import { authService } from "../../services/authService";
import { login } from "../../redux/slices/authSlice";
import { toastSuccess, toastError } from "../../utils/toast";

const LoginForm: React.FC = () => {
  const [keyLogin, setKeyLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!keyLogin.trim()) newErrors.keyLogin = "Username or email is required";
    if (!password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.login({ keyLogin, password });

      if (response.isSuccess) {
        const { accessToken, userId, username, email, role } = response.data;

        dispatch(
          login({
            accessToken,
            accessTokenExpiresAt: response.data.accessTokenExpiresAt,
            user: {
              id: userId,
              name: username,
              email,
              username,
              role,
            },
          })
        );

        toastSuccess("Welcome to Systematic Review Support System", `Hello ${response.data.username}`);
        if (role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toastError("Login Failed", "Your account does not exist or invalid credentials.");

        // Map backend errors if specific fields are provided
        const fieldErrors: Record<string, string> = {};
        response.errors?.forEach(err => {
          if (err.code.toLowerCase().includes("password")) fieldErrors.password = err.message;
          if (err.code.toLowerCase().includes("keylogin") || err.code.toLowerCase().includes("username") || err.code.toLowerCase().includes("email")) {
            fieldErrors.keyLogin = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } catch (error: any) {
      toastError("Error", "Your account does not exist or invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] px-6 sm:px-8">
      {/* Header Section */}
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-3xl font-bold text-text-main tracking-tight mb-2">Welcome back</h1>
        <p className="text-text-muted text-base">Please enter your details to sign in</p>
      </div>

      {/* Login Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormField
          id="keyLogin"
          label="Username or Email"
          type="text"
          autoComplete="username"
          placeholder="Enter username or email"
          value={keyLogin}
          onChange={(e) => setKeyLogin(e.target.value)}
          errorMessage={errors.keyLogin}
          disabled={isLoading}
        />

        {/* Password Field with 'Forgot password?' link */}
        <div className="space-y-1.5">
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            errorMessage={errors.password}
            disabled={isLoading}
          />
          <div className="flex justify-end">
            <a href="#" className="text-sm font-medium text-primary hover:text-primary-hover hover:underline outline-none focus:ring-2 focus:ring-primary/20 rounded-sm">
              Forgot password?
            </a>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
