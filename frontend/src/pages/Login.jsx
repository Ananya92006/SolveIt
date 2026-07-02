import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser, clearError } from "../authSlice";

const schema = z.object({
  emailId: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 bg-grid flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-flex items-center gap-2 group">
            <span className="text-4xl font-bold font-mono gradient-text">⟨/⟩</span>
          </NavLink>
          <h1 className="mt-3 text-2xl font-bold text-base-content">Welcome back</h1>
          <p className="mt-1 text-base-content/50 text-sm">Sign in to continue solving problems</p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl">
          {/* Auth error */}
          {error && (
            <div className="alert alert-error mb-6 py-3 text-sm animate-fade-in">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
              <button onClick={() => dispatch(clearError())} className="ml-auto opacity-70 hover:opacity-100">✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium text-base-content/80">Email</span>
              </label>
              <input
                {...register("emailId")}
                type="email"
                placeholder="you@example.com"
                onChange={() => error && dispatch(clearError())}
                className={`input input-bordered w-full bg-base-300/50 focus:bg-base-300 transition-all duration-300 ${errors.emailId ? "input-error" : "focus:input-primary"}`}
              />
              {errors.emailId && (
                <label className="label pt-1">
                  <span className="label-text-alt text-error">{errors.emailId.message}</span>
                </label>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium text-base-content/80">Password</span>
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  onChange={() => error && dispatch(clearError())}
                  className={`input input-bordered w-full bg-base-300/50 focus:bg-base-300 transition-all duration-300 pr-12 ${errors.password ? "input-error" : "focus:input-primary"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/80 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <label className="label pt-1">
                  <span className="label-text-alt text-error">{errors.password.message}</span>
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Sign In"}
            </button>
          </form>

          <div className="divider text-base-content/30 text-xs mt-6">Don't have an account?</div>

          <NavLink to="/signup" className="btn btn-outline btn-sm w-full hover:btn-primary transition-all duration-300">
            Create Account
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Login;