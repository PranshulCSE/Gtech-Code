import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import axiosClient from '../../utils/axiosClient';

const newAdminSchema = z.object({
    firstname: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email'),
    password: z
        .string()
        .min(8, 'At least 8 characters')
        .regex(/[A-Z]/, 'Needs an uppercase letter')
        .regex(/[a-z]/, 'Needs a lowercase letter')
        .regex(/[0-9]/, 'Needs a number')
        .regex(/[^A-Za-z0-9]/, 'Needs a symbol')
});



const inputClasses = (hasError) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-indigo-200 ${hasError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-indigo-400'
    }`;

function ManageAdmins() {
    const { user: currentUser } = useSelector((state) => state.auth);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const isSuperAdmin = !!currentUser?.isSuperAdmin;
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({ resolver: zodResolver(newAdminSchema) });

    const loadAdmins = () => {
        setLoading(true);
        setError('');
        axiosClient
            .get('/user/admins')
            .then(({ data }) => setAdmins(Array.isArray(data) ? data : []))
            .catch((err) => {
                const msg = typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message;
                setError(msg || 'Could not load admins.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadAdmins();
    }, []);

    const onCreateAdmin = async (data) => {
        setCreating(true);
        try {
            await axiosClient.post('/user/admin/register', data);
            reset();
            setShowForm(false);
            loadAdmins();
        } catch (err) {
            const msg = typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message;
            alert(`Error: ${msg || err.message}`);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove admin access for "${name}"?`)) return;
        setDeletingId(id);
        try {
            await axiosClient.delete(`/user/admins/${id}`);
            setAdmins((prev) => prev.filter((a) => a._id !== id));
        } catch (err) {
            const msg = typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message;
            alert(`Error: ${msg || err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Admins can create, edit, and delete problems, and manage other admins.</p>
                <button
                    onClick={() => setShowForm((s) => !s)}
                    className="shrink-0 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                >
                    {showForm ? 'Cancel' : '+ New Admin'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit(onCreateAdmin)} className="space-y-3 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-600">Full name</label>
                        <input {...register('firstname')} className={inputClasses(errors.firstname)} placeholder="Jane Doe" />
                        {errors.firstname && <p className="mt-1 text-xs font-medium text-red-500">{errors.firstname.message}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-600">Email</label>
                        <input type="email" {...register('email')} className={inputClasses(errors.email)} placeholder="jane@college.edu" />
                        {errors.email && <p className="mt-1 text-xs font-medium text-red-500">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-600">Temporary password</label>
                        <input type="password" {...register('password')} className={inputClasses(errors.password)} placeholder="At least 8 characters, mixed case, number & symbol" />
                        {errors.password && <p className="mt-1 text-xs font-medium text-red-500">{errors.password.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={creating}
                        className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {creating ? 'Creating…' : 'Create Admin'}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="flex items-center justify-center rounded-3xl border border-slate-200/70 bg-white py-16">
                    <span className="loading loading-spinner loading-lg text-indigo-500"></span>
                </div>
            ) : error ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-600">{error}</div>
            ) : (
                <div className="space-y-3">
                    {admins.map((admin) => {
                        const isSelf = currentUser?._id === admin._id;
                        return (
                            <div
                                key={admin._id}
                                className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-bold text-slate-900">
                                        {admin.firstname} {isSelf && <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">YOU</span>}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">{admin.email}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(admin._id, admin.firstname)}
                                    disabled={isSelf || deletingId === admin._id}
                                    title={isSelf ? "You can't remove your own admin access" : 'Remove admin access'}
                                    className="shrink-0 rounded-full bg-rose-50 px-4 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {deletingId === admin._id ? 'Removing…' : 'Remove'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ManageAdmins;
