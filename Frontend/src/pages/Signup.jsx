import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../authSlice';
import { useToast } from '../components/ToastSystem.jsx';

const signUpSchema = z.object({
    firstname: z.string().min(3, 'Name should contain at least 3 characters').max(30, 'Name is too long'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must contain at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must contain at least 8 characters')
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});

function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    const { success, error: showError } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({ resolver: zodResolver(signUpSchema) });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data) => {
        setSubmitError('');

        try {
            await dispatch(registerUser(data)).unwrap();
            success('Account created', 'Please verify your email to complete signup.');
            navigate('/login');
        } catch (err) {
            const message = err || 'Unable to sign up';
            setSubmitError(message);
            showError('Signup failed', message);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(255,192,125,0.18),transparent_25%),linear-gradient(180deg,#f7f9fd_0%,#eef3fa_100%)] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="portal-card hidden overflow-hidden rounded-[2.25rem] bg-[linear-gradient(145deg,#10224a_0%,#173d86_55%,#2f5ec3_100%)] p-10 text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)] lg:block">
                    <p className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white/75">Join the portal</p>
                    <h1 className="mt-5 text-5xl font-black leading-tight">Create your academic workspace in minutes.</h1>
                    <p className="mt-4 text-base leading-7 text-white/80">Get access to coding problems, progress analytics, bookmarks, and a dashboard that stays responsive on every screen.</p>
                    <div className="mt-10 grid gap-4 sm:grid-cols-2">
                        {['Email verification', 'Fast problem solving', 'Progress tracking', 'Campus-style UI'].map((item) => (
                            <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                                <p className="text-sm font-semibold text-white/85">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="portal-card rounded-[2.25rem] p-6 sm:p-8">
                    <div className="mb-6 text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.28em] text-slate-500">Get started</p>
                        <h2 className="mt-2 text-3xl font-black text-slate-900">Create your account</h2>
                        <p className="mt-2 text-sm text-slate-500">Start with your student details and a strong password.</p>
                    </div>

                    {submitError ? (
                        <div className="alert mb-5 border border-rose-200 bg-rose-50 text-rose-800">
                            <span>{submitError}</span>
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-700">First name</span>
                            <input
                                type="text"
                                placeholder="Enter your first name"
                                className={`portal-input input input-bordered w-full rounded-2xl ${errors.firstname ? 'input-error' : ''}`}
                                {...register('firstname')}
                            />
                            {errors.firstname ? <span className="mt-2 block text-sm text-rose-600">{errors.firstname.message}</span> : null}
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                            <input
                                type="email"
                                placeholder="Enter your email"
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

                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</span>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={`portal-input input input-bordered w-full rounded-2xl pr-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                                    {...register('confirmPassword')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                    onClick={() => setShowConfirmPassword((current) => !current)}
                                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                >
                                    {showConfirmPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {errors.confirmPassword ? <span className="mt-2 block text-sm text-rose-600">{errors.confirmPassword.message}</span> : null}
                        </label>

                        <button
                            type="submit"
                            className="btn w-full rounded-full bg-slate-950 text-white hover:bg-slate-800"
                            disabled={loading}
                        >
                            {loading ? <span className="loading loading-spinner loading-sm" /> : 'Create account'}
                        </button>
                    </form>

                    <div className="mt-5 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <NavLink to="/login" className="font-semibold text-slate-900 hover:text-amber-600">
                            Login
                        </NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;