import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import axiosClient from '../../utils/axiosClient';
import { logoutUser } from '../../authSlice';
import { useToast } from '../components/ToastSystem.jsx';

const emptyProfile = {
    firstname: '',
    lastname: '',
    age: '',
    phone: '',
    address: '',
    bio: ''
};

function Profile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { success, error: showError, info } = useToast();
    const [profile, setProfile] = useState(emptyProfile);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const [profileResponse, statsResponse] = await Promise.all([
                    axiosClient.get('/user/profile'),
                    axiosClient.get('/user/stats')
                ]);

                setProfile({
                    firstname: profileResponse.data.firstname || '',
                    lastname: profileResponse.data.lastname || '',
                    age: profileResponse.data.age || '',
                    phone: profileResponse.data.phone || '',
                    address: profileResponse.data.address || '',
                    bio: profileResponse.data.bio || ''
                });
                setStats(statsResponse.data);
            } catch (err) {
                showError('Profile unavailable', err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [showError]);

    const handleProfileChange = (field, value) => {
        setProfile((current) => ({ ...current, [field]: value }));
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        try {
            setSavingProfile(true);
            await axiosClient.put('/user/profile', profile);
            success('Profile saved', 'Your account details were updated successfully.');
        } catch (err) {
            showError('Profile update failed', err.response?.data?.message || err.message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        try {
            setSavingPassword(true);
            await axiosClient.post('/user/change-password', passwordForm);
            setPasswordForm({ currentPassword: '', newPassword: '' });
            success('Password changed', 'Your password was updated successfully.');
        } catch (err) {
            showError('Password change failed', err.response?.data?.message || err.message);
        } finally {
            setSavingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm('Delete your account permanently? This cannot be undone.');
        if (!confirmed) {
            return;
        }

        try {
            setDeletingAccount(true);
            await axiosClient.delete('/user/deleteprofile');
            success('Account deleted', 'Your account has been removed.');
            await dispatch(logoutUser());
            navigate('/signup');
        } catch (err) {
            showError('Delete failed', err.response?.data?.message || err.message);
        } finally {
            setDeletingAccount(false);
        }
    };

    const handleLogout = async () => {
        await dispatch(logoutUser());
        info('Logged out', 'You have been signed out of your account.');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <span className="loading loading-spinner loading-lg text-amber-400"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(228,236,247,0.94)_35%,rgba(237,242,250,1)_75%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="portal-hero mb-6 overflow-hidden rounded-2rem border border-white/70 bg-[linear-gradient(135deg,#10224a_0%,#173d86_55%,#2f5ec3_100%)] p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)] sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white/80">Account Center</p>
                            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Profile and account settings</h1>
                            <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">Update your profile, change your password, and keep an eye on the activity that matters most.</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-420px lg:grid-cols-3">
                            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Role</p>
                                <p className="mt-1 text-xl font-bold capitalize">{user?.role || 'user'}</p>
                            </div>
                            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Solved</p>
                                <p className="mt-1 text-xl font-bold">{stats?.solvedCount ?? 0}</p>
                            </div>
                            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Streak</p>
                                <p className="mt-1 text-xl font-bold">{stats?.streak ?? 0} days</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
                    <div className="portal-card rounded-2rem p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                        <h2 className="text-2xl font-black text-slate-900">Edit profile</h2>
                        <p className="mt-1 text-sm text-slate-500">Keep your public student profile up to date.</p>
                        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleProfileSubmit}>
                            {['firstname', 'lastname', 'age', 'phone', 'address'].map((field) => (
                                <label key={field} className={field === 'address' ? 'sm:col-span-2' : ''}>
                                    <span className="mb-2 block text-sm font-semibold capitalize text-slate-700">{field}</span>
                                    <input
                                        type={field === 'age' ? 'number' : 'text'}
                                        value={profile[field]}
                                        onChange={(event) => handleProfileChange(field, event.target.value)}
                                        className="portal-input input input-bordered w-full rounded-2xl bg-white/90"
                                        placeholder={`Enter ${field}`}
                                    />
                                </label>
                            ))}
                            <label className="sm:col-span-2">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Bio</span>
                                <textarea
                                    value={profile.bio}
                                    onChange={(event) => handleProfileChange('bio', event.target.value)}
                                    className="textarea textarea-bordered min-h-32 w-full rounded-2xl bg-white/90"
                                    placeholder="Tell others a little about yourself"
                                />
                            </label>
                            <div className="sm:col-span-2 flex flex-wrap gap-3">
                                <button type="submit" className="btn rounded-full bg-slate-950 text-white hover:bg-slate-800" disabled={savingProfile}>
                                    {savingProfile ? 'Saving...' : 'Save profile'}
                                </button>
                                <button type="button" className="btn btn-ghost rounded-full text-slate-700" onClick={() => setProfile(emptyProfile)}>
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="grid gap-6">
                        <div className="portal-card rounded-2rem p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                            <h3 className="text-xl font-black text-slate-900">Change password</h3>
                            <form className="mt-4 space-y-4" onSubmit={handlePasswordSubmit}>
                                <input
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                                    placeholder="Current password"
                                    className="portal-input input input-bordered w-full rounded-2xl bg-white/90"
                                />
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                                    placeholder="New password"
                                    className="portal-input input input-bordered w-full rounded-2xl bg-white/90"
                                />
                                <button type="submit" className="btn w-full rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300" disabled={savingPassword}>
                                    {savingPassword ? 'Updating...' : 'Update password'}
                                </button>
                            </form>
                        </div>

                        <div className="portal-card rounded-ee-4xl p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                            <h3 className="text-xl font-black text-slate-900">Account actions</h3>
                            <div className="mt-4 space-y-3">
                                <button type="button" className="btn btn-outline w-full rounded-full border-slate-300 text-slate-700 hover:bg-slate-950 hover:text-white" onClick={handleLogout}>
                                    Log out
                                </button>
                                <button type="button" className="btn w-full rounded-full border-0 bg-rose-500 text-white hover:bg-rose-600" onClick={handleDeleteAccount} disabled={deletingAccount}>
                                    {deletingAccount ? 'Deleting...' : 'Delete account'}
                                </button>
                            </div>
                        </div>

                        <div className="portal-card rounded-4xl p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                            <h3 className="text-xl font-black text-slate-900">Recent activity</h3>
                            <div className="mt-4 space-y-3">
                                {(stats?.recentActivity || []).slice(0, 4).map((activity) => (
                                    <div key={activity._id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                                        <p className="font-semibold text-slate-800">{activity.title}</p>
                                        <p className="text-sm text-slate-500">{activity.status} • {activity.language} • {new Date(activity.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                                {!(stats?.recentActivity?.length) && <p className="text-sm text-slate-500">No recent activity yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;