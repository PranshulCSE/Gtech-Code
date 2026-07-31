import { useEffect, useState } from 'react';
import axiosClient from '../../utils/axiosClient';
import ProblemForm from './ProblemForm';

const difficultyStyles = {
    easy: 'bg-emerald-50 text-emerald-600',
    medium: 'bg-amber-50 text-amber-600',
    hard: 'bg-rose-50 text-rose-600'
};

function ManageProblems() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const loadProblems = () => {
        setLoading(true);
        setError('');
        axiosClient
            .get('/problem/getAllProblem')
            .then(({ data }) => setProblems(Array.isArray(data) ? data : []))
            .catch((err) => {
                const msg = typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message;
                setError(msg || 'Could not load problems.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadProblems();
    }, []);

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await axiosClient.delete(`/problem/delete/${id}`);
            setProblems((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            const msg = typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message;
            alert(`Error: ${msg || err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    if (editingId) {
        return (
            <div>
                <button
                    onClick={() => setEditingId(null)}
                    className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                    ← Back to list
                </button>
                <ProblemForm
                    mode="edit"
                    problemId={editingId}
                    onDone={() => {
                        setEditingId(null);
                        loadProblems();
                    }}
                />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center rounded-3xl border border-slate-200/70 bg-white py-16">
                <span className="loading loading-spinner loading-lg text-indigo-500"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-600">
                {error}
            </div>
        );
    }

    if (problems.length === 0) {
        return (
            <div className="rounded-3xl border border-slate-200/70 bg-white p-10 text-center text-sm text-slate-500">
                No problems yet — create your first one from the "Create Problem" tab.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {problems.map((problem) => (
                <div
                    key={problem._id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{problem.title}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${difficultyStyles[problem.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                                {problem.difficulty}
                            </span>
                            {(Array.isArray(problem.tags) ? problem.tags : [problem.tags]).filter(Boolean).map((tag) => (
                                <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-500">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        <button
                            onClick={() => setEditingId(problem._id)}
                            className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(problem._id, problem.title)}
                            disabled={deletingId === problem._id}
                            className="rounded-full bg-rose-50 px-4 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                            {deletingId === problem._id ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ManageProblems;
