import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../../utils/axiosClient';
import { logoutUser } from '../../authSlice';
import { useToast } from '../components/ToastSystem.jsx';

const pageSize = 8;

function Homepage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { success, error: showError } = useToast();
    const [problems, setProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [stats, setStats] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        difficulty: 'all',
        tag: 'all',
        status: 'all',
        sort: 'recommended'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const bookmarkKey = user?._id ? `gtech-bookmarks:${user._id}` : 'gtech-bookmarks';

    useEffect(() => {
        const storedBookmarks = localStorage.getItem(bookmarkKey);
        if (storedBookmarks) {
            try {
                setBookmarks(JSON.parse(storedBookmarks));
            } catch {
                setBookmarks([]);
            }
        }
    }, [bookmarkKey]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [problemsResponse, solvedResponse, statsResponse] = await Promise.all([
                    axiosClient.get('/problem/getAllProblem'),
                    axiosClient.get('/problem/problemSolvedByUser'),
                    axiosClient.get('/user/stats').catch(() => ({ data: null }))
                ]);

                setProblems(Array.isArray(problemsResponse.data) ? problemsResponse.data : []);
                setSolvedProblems(Array.isArray(solvedResponse.data) ? solvedResponse.data : []);
                setStats(statsResponse.data);
            } catch (err) {
                showError('Dashboard unavailable', err.response?.data?.message || err.message);
            }
        };

        fetchDashboard();
    }, [showError]);

    const solvedIds = useMemo(() => new Set(solvedProblems.map((problem) => problem._id)), [solvedProblems]);
    const bookmarkedIds = useMemo(() => new Set(bookmarks), [bookmarks]);

    const filteredProblems = useMemo(() => {
        const search = filters.search.trim().toLowerCase();

        const nextProblems = problems.filter((problem) => {
            const titleMatch = !search || problem.title?.toLowerCase().includes(search);
            const tagValue = Array.isArray(problem.tags) ? problem.tags.join(' ') : String(problem.tags || '');
            const tagMatch = filters.tag === 'all' || tagValue.toLowerCase().includes(filters.tag.toLowerCase());
            const difficultyMatch = filters.difficulty === 'all' || String(problem.difficulty || '').toLowerCase() === filters.difficulty;
            const solved = solvedIds.has(problem._id);
            const statusMatch = filters.status === 'all' || (filters.status === 'solved' ? solved : !solved);

            return titleMatch && tagMatch && difficultyMatch && statusMatch;
        });

        nextProblems.sort((a, b) => {
            if (filters.sort === 'title-asc') return String(a.title || '').localeCompare(String(b.title || ''));
            if (filters.sort === 'title-desc') return String(b.title || '').localeCompare(String(a.title || ''));
            if (filters.sort === 'difficulty') return difficultyRank(a.difficulty) - difficultyRank(b.difficulty);
            if (filters.sort === 'bookmarked') return Number(bookmarkedIds.has(b._id)) - Number(bookmarkedIds.has(a._id));
            return Number(solvedIds.has(b._id)) - Number(solvedIds.has(a._id));
        });

        return nextProblems;
    }, [bookmarkedIds, filters, problems, solvedIds]);

    const totalPages = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
    const visibleProblems = filteredProblems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters.search, filters.difficulty, filters.tag, filters.status, filters.sort]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            success('Logged out', 'You have been signed out.');
            navigate('/login');
        } catch (err) {
            showError('Logout failed', err || 'Unable to sign out');
        }
    };

    const toggleBookmark = (problemId) => {
        setBookmarks((current) => {
            const nextValue = current.includes(problemId)
                ? current.filter((item) => item !== problemId)
                : [...current, problemId];

            localStorage.setItem(bookmarkKey, JSON.stringify(nextValue));
            return nextValue;
        });
    };

    const solvedCount = stats?.solvedCount ?? solvedProblems.length;
    const acceptanceRate = stats?.acceptanceRate ?? 0;
    const streak = stats?.streak ?? 0;

    return (
        <div className="portal-shell flex min-h-screen">
            <aside className="portal-sidebar sticky top-0 hidden h-screen w-72 flex-col justify-between px-5 py-6 lg:flex">
                <div>
                    <div className="flex items-center gap-3 rounded-3xl bg-slate-950 px-4 py-3 text-white shadow-lg shadow-slate-950/15">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-xl font-black text-slate-950">G</div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-white/65">GTech-Code</p>
                            <p className="text-sm font-bold">Student Portal</p>
                        </div>
                    </div>

                    <nav className="mt-8 space-y-2">
                        {[
                            { to: '/', label: 'Dashboard' },
                            { to: '/profile', label: 'Profile' },
                            ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin panel' }] : [])
                        ].map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10' : 'text-slate-600 hover:bg-white hover:text-slate-950'}`}
                            >
                                <span>{item.label}</span>
                                <span className="text-xs opacity-60">↗</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="rounded-[1.75rem] bg-white/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Signed in as</p>
                    <p className="mt-1 text-lg font-black text-slate-900">{user?.firstname || 'Student'}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <button type="button" className="btn btn-outline mt-4 w-full rounded-full border-slate-300 text-slate-700 hover:bg-slate-950 hover:text-white" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <header className="portal-card flex flex-col gap-4 rounded-2rem p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:hidden">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">GTech-Code</p>
                            <h1 className="text-xl font-black text-slate-900">Dashboard</h1>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <NavLink to="/profile" className="btn btn-sm rounded-full bg-slate-950 text-white hover:bg-slate-800">Profile</NavLink>
                            {user?.role === 'admin' ? <NavLink to="/admin" className="btn btn-sm rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300">Admin</NavLink> : null}
                            <button type="button" className="btn btn-sm btn-outline rounded-full border-slate-300 text-slate-700" onClick={handleLogout}>Logout</button>
                        </div>
                    </header>

                    <section className="portal-hero overflow-hidden rounded-2rem bg-[linear-gradient(135deg,#10224a_0%,#173d86_52%,#2f5ec3_100%)] p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8">
                        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
                            <div className="max-w-2xl">
                                <p className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white/75">Student portal</p>
                                <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Hello, {user?.firstname || 'there'}!</h1>
                                <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">Stay connected with everything GTech-Code has to offer, from problems and progress to account settings and quick actions.</p>

                                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                    {[
                                        { label: 'Solved', value: solvedCount },
                                        { label: 'Acceptance', value: `${acceptanceRate}%` },
                                        { label: 'Streak', value: `${streak} days` }
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                                            <p className="text-xs uppercase tracking-[0.2em] text-white/65">{item.label}</p>
                                            <p className="mt-1 text-2xl font-black">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                                    <p className="text-xs uppercase tracking-[0.25em] text-white/60">Recent activity</p>
                                    <div className="mt-3 space-y-2 text-sm text-white/85">
                                        {(stats?.recentActivity || []).slice(0, 3).map((activity) => (
                                            <div key={activity._id} className="rounded-2xl bg-white/10 px-3 py-2">
                                                {activity.title}
                                            </div>
                                        ))}
                                        {!(stats?.recentActivity?.length) ? <p>No recent submissions yet.</p> : null}
                                    </div>
                                </div>

                                <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                                    <p className="text-xs uppercase tracking-[0.25em] text-white/60">Bookmarks</p>
                                    <p className="mt-2 text-3xl font-black">{bookmarks.length}</p>
                                    <p className="text-sm text-white/75">Save problems to revisit them quickly.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            { label: 'All problems', value: problems.length },
                            { label: 'Solved count', value: solvedCount },
                            { label: 'Bookmarked', value: bookmarks.length },
                            { label: 'Current page', value: `${currentPage} / ${totalPages}` }
                        ].map((item) => (
                            <div key={item.label} className="portal-card rounded-[1.75rem] p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                                <p className="mt-2 text-3xl font-black text-slate-900">{item.value}</p>
                            </div>
                        ))}
                    </section>

                    <section className="portal-card rounded-2rem p-5 sm:p-6">
                        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Search</span>
                                <input
                                    value={filters.search}
                                    onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                                    placeholder="Search by title"
                                    className="portal-input input input-bordered w-full rounded-2xl"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Difficulty</span>
                                <select
                                    value={filters.difficulty}
                                    onChange={(event) => setFilters((current) => ({ ...current, difficulty: event.target.value }))}
                                    className="portal-input select select-bordered w-full rounded-2xl"
                                >
                                    <option value="all">All difficulties</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Sort</span>
                                <select
                                    value={filters.sort}
                                    onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
                                    className="portal-input select select-bordered w-full rounded-2xl"
                                >
                                    <option value="recommended">Recommended</option>
                                    <option value="bookmarked">Most bookmarked</option>
                                    <option value="difficulty">Difficulty</option>
                                    <option value="title-asc">Title A-Z</option>
                                    <option value="title-desc">Title Z-A</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Tag</span>
                                <select
                                    value={filters.tag}
                                    onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value }))}
                                    className="portal-input select select-bordered w-full rounded-2xl"
                                >
                                    <option value="all">All tags</option>
                                    <option value="array">Array</option>
                                    <option value="string">String</option>
                                    <option value="math">Math</option>
                                    <option value="dp">DP</option>
                                    <option value="graph">Graph</option>
                                    <option value="tree">Tree</option>
                                    <option value="hash">Hash</option>
                                    <option value="stack">Stack</option>
                                    <option value="queue">Queue</option>
                                    <option value="linked list">Linked List</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Status</span>
                                <select
                                    value={filters.status}
                                    onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                                    className="portal-input select select-bordered w-full rounded-2xl"
                                >
                                    <option value="all">All problems</option>
                                    <option value="solved">Solved</option>
                                    <option value="unsolved">Unsolved</option>
                                </select>
                            </label>

                            <label className="block lg:col-span-2">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Quick links</span>
                                <div className="flex flex-wrap gap-3">
                                    <NavLink to="/profile" className="btn rounded-full bg-slate-950 text-white hover:bg-slate-800">Profile</NavLink>
                                    {user?.role === 'admin' ? <NavLink to="/admin" className="btn rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300">Admin panel</NavLink> : null}
                                </div>
                            </label>
                        </div>
                    </section>

                    <section>
                        <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-500">Your essentials</p>
                                <h2 className="text-2xl font-black text-slate-900">Quick access</h2>
                            </div>
                            <p className="hidden text-sm text-slate-500 sm:block">Jump straight into the tools you use most.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {[
                                { title: 'Solved Problems', description: 'Review the problems you have already completed.', icon: '✓', tone: 'bg-emerald-50 text-emerald-700' },
                                { title: 'Bookmarks', description: 'Open the problems you saved for later.', icon: '★', tone: 'bg-amber-50 text-amber-700' },
                                { title: 'Recent Activity', description: 'Check your latest submissions and attempts.', icon: '↻', tone: 'bg-blue-50 text-blue-700' }
                            ].map((card) => (
                                <div key={card.title} className="portal-card rounded-[1.75rem] p-5 transition hover:-translate-y-0.5">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black ${card.tone}`}>{card.icon}</div>
                                    <h3 className="mt-4 text-lg font-black text-slate-900">{card.title}</h3>
                                    <p className="mt-2 text-sm text-slate-500">{card.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="mb-4 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Browse</p>
                                <h2 className="text-2xl font-black text-slate-900">Problems</h2>
                            </div>
                            <p className="text-sm text-slate-500">{filteredProblems.length} results</p>
                        </div>

                        <div className="grid gap-4">
                            {visibleProblems.map((problem) => {
                                const solved = solvedIds.has(problem._id);
                                const bookmarked = bookmarkedIds.has(problem._id);

                                return (
                                    <article key={problem._id} className="portal-card rounded-[1.75rem] p-5 transition hover:-translate-y-0.5 hover:shadow-[0_30px_60px_rgba(15,23,42,0.12)]">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-black text-slate-900">
                                                        <NavLink to={`/problem/${problem._id}`} className="hover:text-slate-600">
                                                            {problem.title}
                                                        </NavLink>
                                                    </h3>
                                                    {solved ? <span className="badge badge-success border-0 text-white">Solved</span> : <span className="badge badge-outline border-slate-300 text-slate-600">Unsolved</span>}
                                                </div>
                                                <p className="mt-1 text-sm text-slate-500">{problem.description?.slice?.(0, 140) || 'Open the problem to start coding.'}</p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className={`badge ${getDifficultyBadgeColor(problem.difficulty)} border-0 text-white`}>{problem.difficulty || 'unknown'}</span>
                                                    <span className="badge badge-outline border-slate-200 text-slate-600">{renderTags(problem.tags)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className={`btn btn-circle ${bookmarked ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' : 'btn-outline border-slate-300 text-slate-700 hover:bg-slate-950 hover:text-white'}`}
                                                    onClick={() => toggleBookmark(problem._id)}
                                                    aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark problem'}
                                                >
                                                    {bookmarked ? '★' : '☆'}
                                                </button>
                                                <NavLink to={`/problem/${problem._id}`} className="btn rounded-full bg-slate-950 text-white hover:bg-slate-800">
                                                    Open
                                                </NavLink>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}

                            {!visibleProblems.length ? (
                                <div className="portal-card rounded-[1.75rem] p-8 text-center text-slate-500">
                                    No problems match the current filters.
                                </div>
                            ) : null}
                        </div>

                        {totalPages > 1 ? (
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                <button type="button" className="btn btn-sm rounded-full" disabled={currentPage === 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}>
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 7).map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        className={`btn btn-sm rounded-full ${pageNumber === currentPage ? 'bg-slate-950 text-white' : 'btn-ghost'}`}
                                        onClick={() => setCurrentPage(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                                <button type="button" className="btn btn-sm rounded-full" disabled={currentPage === totalPages} onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}>
                                    Next
                                </button>
                            </div>
                        ) : null}
                    </section>
                </div>
            </main>
        </div>
    );
}

function difficultyRank(difficulty) {
    switch (String(difficulty || '').toLowerCase()) {
        case 'easy':
            return 1;
        case 'medium':
            return 2;
        case 'hard':
            return 3;
        default:
            return 4;
    }
}

function getDifficultyBadgeColor(difficulty) {
    switch (String(difficulty || '').toLowerCase()) {
        case 'easy':
            return 'bg-emerald-500';
        case 'medium':
            return 'bg-amber-500';
        case 'hard':
            return 'bg-rose-500';
        default:
            return 'bg-slate-500';
    }
}

function renderTags(tags) {
    if (Array.isArray(tags)) {
        return tags.join(', ');
    }

    return String(tags || 'general');
}

export default Homepage;