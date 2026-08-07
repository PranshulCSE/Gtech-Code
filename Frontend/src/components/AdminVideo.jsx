import { useEffect, useState } from 'react';
import axiosClient from '../../utils/axiosClient'
import { useNavigate } from 'react-router';

const AdminVideo = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get('/problem/admin/all');
            setProblems(data);
        } catch (err) {
            setError('Failed to fetch problems');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete the editorial video for this problem?')) return;

        try {
            await axiosClient.delete(`/video/delete/${id}`);
            alert('Editorial video deleted successfully.');
        } catch (err) {
            const message = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.error || err.message;
            setError(message || 'Failed to delete video');
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-600">
                {error}
            </div>
        );
    }

    if (problems.length === 0) {
        return (
            <div className="rounded-3xl border border-slate-200/70 bg-white p-8 text-center shadow-sm">
                <p className="text-lg font-black text-slate-900">No problems found</p>
                <p className="mt-2 text-sm text-slate-500">Create a problem first, then open its uploader from here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-500">Editorial videos</p>
                        <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Manage problem videos</h1>
                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                            Upload, replace, or remove editorial videos for each problem from a clean, problem-focused list.
                        </p>
                    </div>
                    <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Problems loaded</p>
                        <p className="text-2xl font-black">{problems.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {problems.map((problem, index) => (
                    <div key={problem._id} className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">#{index + 1}</span>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${String(problem.difficulty || '').toLowerCase() === 'easy'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : String(problem.difficulty || '').toLowerCase() === 'medium'
                                            ? 'bg-amber-50 text-amber-700'
                                            : 'bg-rose-50 text-rose-700'
                                        }`}>
                                        {problem.difficulty}
                                    </span>
                                </div>
                                <h2 className="mt-3 truncate text-lg font-black text-slate-900">{problem.title}</h2>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(Array.isArray(problem.tags) ? problem.tags : [problem.tags]).filter(Boolean).map((tag) => (
                                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/upload/${problem._id}`, { state: { tab: 'videos' } })}
                                    className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
                                >
                                    Open uploader
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(problem._id)}
                                    className="rounded-full bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                                >
                                    Delete video
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminVideo;