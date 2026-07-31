import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../authSlice';
import { useToast } from '../components/ToastSystem.jsx';
import Logo from '../components/Logo.jsx';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
});

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    const { success, error: showError } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({ resolver: zodResolver(loginSchema) });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data) => {
        setSubmitError('');

        try {
            await dispatch(loginUser(data)).unwrap();
            success('Welcome back', 'You are signed in successfully.');
            navigate('/');
        } catch (err) {
            const message = err || 'Unable to sign in';
            setSubmitError(message);
            showError('Login failed', message);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(226,236,250,0.88)_28%,_rgba(21,43,89,0.12)_100%)] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="portal-hero hidden overflow-hidden rounded-[2.25rem] bg-[linear-gradient(145deg,#10224a_0%,#173d86_48%,#2f5ec3_100%)] p-10 text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)] lg:block">
                    <div className="max-w-lg">
                        <Logo size={48} showWordmark className="mb-6" />
                        <p className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white/75">Student portal</p>
                        <h1 className="mt-5 text-5xl font-black leading-tight">Access your dashboard, problems, and progress in one place.</h1>
                        <p className="mt-4 text-base leading-7 text-white/80">Track solved counts, recent submissions, and campus-style updates through a fast, responsive interface.</p>
                    </div>
                    <div className="mt-10 grid gap-4 sm:grid-cols-3">
                        {['Solve faster', 'Stay organized', 'See progress'].map((item) => (
                            <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                                <p className="text-sm font-semibold text-white/85">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="portal-card rounded-[2.25rem] p-6 sm:p-8">
                    <div className="mb-6 text-center">
                        <Logo size={40} showWordmark={false} className="mb-4 justify-center lg:hidden" />
                        <p className="text-sm font-bold uppercase tracking-[0.28em] text-slate-500">Welcome back</p>
                        <h2 className="mt-2 text-3xl font-black text-slate-900">Login to GTech-Code</h2>
                        <p className="mt-2 text-sm text-slate-500">Use your student account to continue coding.</p>
                    </div>

                    {submitError ? (
                        <div className="alert mb-5 border border-rose-200 bg-rose-50 text-rose-800">
                            <span>{submitError}</span>
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                className={`portal-input input input-bordered w-full rounded-2xl ${errors.email ? 'input-error' : ''}`}
                                {...register('email')}
                            />
                            {errors.email ? <span className="mt-2 block text-sm text-rose-600">{errors.email.message}</span> : null}
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={`portal-input input input-bordered w-full rounded-2xl pr-12 ${errors.password ? 'input-error' : ''}`}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                    onClick={() => setShowPassword((current) => !current)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {errors.password ? <span className="mt-2 block text-sm text-rose-600">{errors.password.message}</span> : null}
                        </label>

                        <button
                            type="submit"
                            className="btn w-full rounded-full bg-slate-950 text-white hover:bg-slate-800"
                            disabled={loading}
                        >
                            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Login'}
                        </button>
                    </form>

                    <div className="mt-5 flex items-center justify-between gap-4 text-sm text-slate-500">
                        <Link to="/forgot-password" className="font-semibold text-amber-600 hover:text-amber-700">
                            Forgot password?
                        </Link>
                        <span>
                            No account?{' '}
                            <NavLink to="/signup" className="font-semibold text-slate-900 hover:text-amber-600">
                                Sign up
                            </NavLink>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;