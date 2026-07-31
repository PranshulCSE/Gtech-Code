import { useState } from 'react';
import { useNavigate } from 'react-router';
import ProblemForm from '../components/ProblemForm';
import ManageProblems from '../components/ManageProblems';
import ManageAdmins from '../components/ManageAdmins';
import Logo from '../components/Logo.jsx';

const TABS = [
    { key: 'create', label: 'Create Problem', icon: '➕' },
    { key: 'manage', label: 'Manage Problems', icon: '📚' },
    { key: 'admins', label: 'Manage Admins', icon: '🛡️' }
];

function AdminPanel() {
    const [activeTab, setActiveTab] = useState('manage');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(255,192,125,0.16),transparent_25%),linear-gradient(180deg,#f7f9fd_0%,#eef3fa_100%)] px-4 py-6 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-slate-950 px-5 py-4 text-white shadow-lg shadow-slate-950/15 sm:flex-row sm:items-center sm:justify-between">
                    <Logo size={40} showWordmark />
                    <div className="flex items-center gap-3">
                        <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/70">Admin</span>
                        <button
                            onClick={() => navigate('/')}
                            className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/70 bg-white p-1.5 shadow-sm">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition ${activeTab === tab.key
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'create' && <ProblemForm mode="create" />}
                {activeTab === 'manage' && <ManageProblems />}
                {activeTab === 'admins' && <ManageAdmins />}
            </div>
        </div>
    );
}

export default AdminPanel;
