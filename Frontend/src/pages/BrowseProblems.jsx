import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import axiosClient from '../../utils/axiosClient';
import { useToast } from '../components/ToastSystem';

function BrowseProblems() {
    const [problems, setProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const toast = useToast();

    const ITEMS_PER_PAGE = 15;

    // Fetch all problems
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/problem/getAllProblem');
                setProblems(response.data || []);
                setCurrentPage(1); // Reset to page 1 when data changes
            } catch (error) {
                console.error('Error fetching problems:', error);
                toast.error('Error', 'Failed to load problems');
                setProblems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, [toast]);

    // Filter problems based on search and filters
    useEffect(() => {
        let filtered = problems;

        // Search filter (title or description)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.title?.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            );
        }

        // Difficulty filter
        if (difficultyFilter) {
            filtered = filtered.filter(p =>
                p.difficulty?.toLowerCase() === difficultyFilter.toLowerCase()
            );
        }

        // Category filter (tags)
        if (categoryFilter) {
            filtered = filtered.filter(p => {
                if (!p.tags || !Array.isArray(p.tags)) return false;
                return p.tags.some(tag =>
                    tag.toLowerCase().includes(categoryFilter.toLowerCase())
                );
            });
        }

        setFilteredProblems(filtered);
        setCurrentPage(1); // Reset to page 1 when filters change
    }, [problems, searchQuery, difficultyFilter, categoryFilter]);

    // Get unique categories from problems
    const getCategories = () => {
        const categories = new Set();
        problems.forEach(p => {
            if (p.tags && Array.isArray(p.tags)) {
                p.tags.forEach(tag => categories.add(tag));
            }
        });
        return Array.from(categories).sort();
    };

    // Pagination
    const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProblems = filteredProblems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const getDifficultyColor = (difficulty) => {
        const level = difficulty?.toLowerCase() || '';
        if (level === 'easy') return 'badge-success';
        if (level === 'medium') return 'badge-warning';
        if (level === 'hard') return 'badge-error';
        return 'badge-info';
    };

    const getDifficultyIcon = (difficulty) => {
        const level = difficulty?.toLowerCase() || '';
        if (level === 'easy') return '⭐';
        if (level === 'medium') return '⭐⭐';
        if (level === 'hard') return '⭐⭐⭐';
        return '✓';
    };

    return (
        <div className="min-h-screen bg-base-200 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Browse Problems</h1>
                    <p className="text-lg opacity-70">
                        {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">🔍 Search Problems</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Search by title or description..."
                                className="input input-bordered w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">📊 Difficulty</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                            >
                                <option value="">All Levels</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">🏷️ Category</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {getCategories().map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center min-h-64">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                )}

                {/* Problems Grid */}
                {!loading && paginatedProblems.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 mb-8">
                        {paginatedProblems.map((problem) => (
                            <Link
                                key={problem._id}
                                to={`/problem/${problem._id}`}
                                className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <div className="card-body">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h2 className="card-title text-xl mb-2">{problem.title}</h2>
                                            <p className="text-sm opacity-70 mb-4 line-clamp-2">
                                                {problem.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {problem.tags && Array.isArray(problem.tags) && (
                                                    problem.tags.map((tag, idx) => (
                                                        <span key={idx} className="badge badge-outline text-xs">
                                                            {tag}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className={`badge ${getDifficultyColor(problem.difficulty)} text-white mb-2 whitespace-nowrap`}>
                                                {getDifficultyIcon(problem.difficulty)} {problem.difficulty || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredProblems.length === 0 && (
                    <div className="card bg-base-100 shadow-md">
                        <div className="card-body text-center">
                            <h3 className="card-title justify-center text-lg">No problems found</h3>
                            <p className="opacity-70">
                                Try adjusting your search or filters to find what you're looking for.
                            </p>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8 flex-wrap">
                        {/* Previous Button */}
                        <button
                            className="btn btn-sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            ← Previous
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            className="btn btn-sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next →
                        </button>
                    </div>
                )}

                {/* Results Info */}
                {!loading && filteredProblems.length > 0 && (
                    <div className="text-center mt-6 opacity-60 text-sm">
                        Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredProblems.length)} of {filteredProblems.length} problems
                        (Page {currentPage} of {totalPages})
                    </div>
                )}
            </div>
        </div>
    );
}

export default BrowseProblems;
