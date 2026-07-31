import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../../utils/axiosClient';

const LANGUAGES = ['C++', 'Java', 'Python', 'JavaScript'];

const TAGS = [
    { value: 'arrays', label: 'Array' },
    { value: 'strings', label: 'String' },
    { value: 'maths', label: 'Maths' },
    { value: 'dynamic programming', label: 'DP' },
    { value: 'greedy', label: 'Greedy' },
    { value: 'trees', label: 'Trees' },
    { value: 'graphs', label: 'Graphs' },
    { value: 'hashing', label: 'Hashing' },
    { value: 'recursion', label: 'Recursion' },
    { value: 'backtracking', label: 'Backtracking' },
    { value: 'stack', label: 'Stack' },
    { value: 'queue', label: 'Queue' },
    { value: 'linked list', label: 'Linked List' },
    { value: 'sorting', label: 'Sorting' },
    { value: 'heap', label: 'Heap' },
    { value: 'trie', label: 'Trie' },
    { value: 'bit manipulation', label: 'Bit Manipulation' },
    { value: 'searching', label: 'Searching' },
    { value: 'dp on trees', label: 'DP on Trees' },
    { value: 'dp on graphs', label: 'DP on Graphs' }
];

// Display-label -> backend-value (e.g. "C++" -> "cpp")
const toBackendLang = (lang) => {
    const map = { 'C++': 'cpp', Java: 'java', Python: 'python', JavaScript: 'javascript' };
    return map[lang] || lang;
};

// backend-value -> Display-label (e.g. "cpp" -> "C++"), used when pre-filling the edit form
const toDisplayLang = (lang) => {
    const map = { cpp: 'C++', java: 'Java', python: 'Python', javascript: 'JavaScript' };
    return map[lang] || lang;
};

const emptyBoilerplate = LANGUAGES.map((language) => ({ language, initialCode: '' }));
const emptyReferenceSolution = LANGUAGES.map((language) => ({ language, completeCode: '' }));

const problemSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    tags: z.enum(TAGS.map((t) => t.value)),
    visibleTestCases: z.array(
        z.object({
            input: z.string().min(1, 'Input is required'),
            output: z.string().min(1, 'Output is required'),
            explanation: z.string().min(1, 'Explanation is required')
        })
    ).min(1, 'At least one visible test case required'),
    hiddenTestCases: z.array(
        z.object({
            input: z.string().min(1, 'Input is required'),
            output: z.string().min(1, 'Output is required')
        })
    ).min(1, 'At least one hidden test case required'),
    BoilerplateCode: z.array(
        z.object({
            language: z.enum(LANGUAGES),
            initialCode: z.string().min(1, 'Initial code is required')
        })
    ).length(4, 'All four languages required'),
    referenceSolution: z.array(
        z.object({
            language: z.enum(LANGUAGES),
            completeCode: z.string().min(1, 'Complete code is required')
        })
    ).length(4, 'All four languages required')
});

const inputClasses = (hasError) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-indigo-200 ${hasError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-indigo-400'
    }`;

const sectionCard = 'rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6';

function ProblemForm({ mode = 'create', problemId = null, onDone }) {
    const isEdit = mode === 'edit';
    const [loadingExisting, setLoadingExisting] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [loadError, setLoadError] = useState('');

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(problemSchema),
        defaultValues: {
            title: '',
            description: '',
            difficulty: 'easy',
            tags: 'arrays',
            visibleTestCases: [{ input: '', output: '', explanation: '' }],
            hiddenTestCases: [{ input: '', output: '' }],
            BoilerplateCode: emptyBoilerplate,
            referenceSolution: emptyReferenceSolution
        }
    });

    const {
        fields: visibleFields,
        append: appendVisible,
        remove: removeVisible
    } = useFieldArray({ control, name: 'visibleTestCases' });

    const {
        fields: hiddenFields,
        append: appendHidden,
        remove: removeHidden
    } = useFieldArray({ control, name: 'hiddenTestCases' });

    // Pre-fill the form when editing an existing problem
    useEffect(() => {
        if (!isEdit || !problemId) return;

        let cancelled = false;
        setLoadingExisting(true);
        setLoadError('');

        axiosClient
            .get(`/problem/admin/${problemId}`)
            .then(({ data: problem }) => {
                if (cancelled) return;
                reset({
                    title: problem.title || '',
                    description: problem.description || '',
                    difficulty: problem.difficulty || 'easy',
                    tags: Array.isArray(problem.tags) ? problem.tags[0] : problem.tags || 'arrays',
                    visibleTestCases: (problem.VisibleTestCases?.length ? problem.VisibleTestCases : [{ input: '', output: '', explanation: '' }])
                        .map((tc) => ({ input: tc.input || '', output: tc.output || '', explanation: tc.explanation || '' })),
                    hiddenTestCases: (problem.InvisibleTestCases?.length ? problem.InvisibleTestCases : [{ input: '', output: '' }])
                        .map((tc) => ({ input: tc.input || '', output: tc.output || '' })),
                    BoilerplateCode: LANGUAGES.map((lang) => {
                        const existing = problem.BoilerplateCode?.find((b) => toDisplayLang(b.language) === lang);
                        return { language: lang, initialCode: existing?.startingCode || '' };
                    }),
                    referenceSolution: LANGUAGES.map((lang) => {
                        const existing = problem.ReferenceSolution?.find((r) => toDisplayLang(r.language) === lang);
                        return { language: lang, completeCode: existing?.code || '' };
                    })
                });
            })
            .catch((err) => {
                if (cancelled) return;
                const msg = typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message;
                setLoadError(msg || 'Could not load this problem for editing.');
            })
            .finally(() => {
                if (!cancelled) setLoadingExisting(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isEdit, problemId, reset]);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            const normalizedData = {
                ...data,
                tags: data.tags ? [data.tags] : [],
                VisibleTestCases: (data.visibleTestCases || []).map((tc) => ({
                    input: tc.input,
                    output: tc.output,
                    explanation: tc.explanation
                })),
                InvisibleTestCases: (data.hiddenTestCases || []).map((tc) => ({
                    input: tc.input,
                    output: tc.output
                })),
                BoilerplateCode: (data.BoilerplateCode || []).map((item) => ({
                    language: toBackendLang(item.language),
                    startingCode: item.initialCode || ''
                })),
                ReferenceSolution: (data.referenceSolution || []).map((item) => ({
                    language: toBackendLang(item.language),
                    code: item.completeCode || ''
                }))
            };

            if (isEdit) {
                await axiosClient.put(`/problem/update/${problemId}`, normalizedData);
                alert('Problem updated successfully!');
            } else {
                await axiosClient.post('/problem/create', normalizedData);
                alert('Problem created successfully!');
                reset();
            }

            onDone?.();
        } catch (error) {
            // Backend sends plain-text error bodies, not {message: "..."} JSON objects.
            const backendMessage =
                typeof error.response?.data === 'string' ? error.response.data : error.response?.data?.message;
            alert(`Error: ${backendMessage || error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingExisting) {
        return (
            <div className={`${sectionCard} flex items-center justify-center py-16`}>
                <span className="loading loading-spinner loading-lg text-indigo-500"></span>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className={`${sectionCard} border-red-200 bg-red-50 text-center text-sm font-medium text-red-600`}>
                {loadError}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className={sectionCard}>
                <h2 className="mb-5 text-base font-bold text-slate-900">📋 Basic Information</h2>
                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-600">Title</label>
                        <input {...register('title')} className={inputClasses(errors.title)} placeholder="e.g. Two Sum" />
                        {errors.title && <p className="mt-1 text-xs font-medium text-red-500">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-slate-600">Description</label>
                        <textarea
                            {...register('description')}
                            rows={5}
                            className={inputClasses(errors.description)}
                            placeholder="Explain the problem statement, constraints, and examples..."
                        />
                        {errors.description && <p className="mt-1 text-xs font-medium text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-600">Difficulty</label>
                            <select {...register('difficulty')} className={inputClasses(errors.difficulty)}>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-600">Tag</label>
                            <select {...register('tags')} className={inputClasses(errors.tags)}>
                                {TAGS.map((tag) => (
                                    <option key={tag.value} value={tag.value}>{tag.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Cases */}
            <div className={sectionCard}>
                <h2 className="mb-5 text-base font-bold text-slate-900">🧪 Test Cases</h2>

                <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-700">Visible Test Cases <span className="font-normal text-slate-400">(shown to students)</span></h3>
                        <button
                            type="button"
                            onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                            className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                        >
                            + Add Case
                        </button>
                    </div>

                    {errors.visibleTestCases?.root && <p className="text-xs font-medium text-red-500">{errors.visibleTestCases.root.message}</p>}
                    {errors.visibleTestCases?.message && <p className="text-xs font-medium text-red-500">{errors.visibleTestCases.message}</p>}

                    {visibleFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                            <div className="flex justify-end">
                                <button type="button" onClick={() => removeVisible(index)} className="text-xs font-bold text-red-500 hover:text-red-600">
                                    Remove ✕
                                </button>
                            </div>
                            <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input" className={inputClasses(errors.visibleTestCases?.[index]?.input)} />
                            <input {...register(`visibleTestCases.${index}.output`)} placeholder="Output" className={inputClasses(errors.visibleTestCases?.[index]?.output)} />
                            <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explanation" rows={2} className={inputClasses(errors.visibleTestCases?.[index]?.explanation)} />
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-700">Hidden Test Cases <span className="font-normal text-slate-400">(used for judging only)</span></h3>
                        <button
                            type="button"
                            onClick={() => appendHidden({ input: '', output: '' })}
                            className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                        >
                            + Add Case
                        </button>
                    </div>

                    {errors.hiddenTestCases?.message && <p className="text-xs font-medium text-red-500">{errors.hiddenTestCases.message}</p>}

                    {hiddenFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                            <div className="flex justify-end">
                                <button type="button" onClick={() => removeHidden(index)} className="text-xs font-bold text-red-500 hover:text-red-600">
                                    Remove ✕
                                </button>
                            </div>
                            <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className={inputClasses(errors.hiddenTestCases?.[index]?.input)} />
                            <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className={inputClasses(errors.hiddenTestCases?.[index]?.output)} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Code Templates */}
            <div className={sectionCard}>
                <h2 className="mb-1 text-base font-bold text-slate-900">💻 Code Templates</h2>
                <p className="mb-5 text-xs text-slate-400">Reference solutions are run against every visible test case before the problem can be saved.</p>

                <div className="space-y-5">
                    {LANGUAGES.map((lang, index) => (
                        <div key={lang} className="rounded-2xl border border-slate-200 p-4">
                            <h3 className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{lang}</h3>

                            <input type="hidden" value={lang} {...register(`BoilerplateCode.${index}.language`)} />
                            <input type="hidden" value={lang} {...register(`referenceSolution.${index}.language`)} />

                            <div className="mb-3">
                                <label className="mb-1.5 block text-sm font-semibold text-slate-600">Starter Code (shown to students)</label>
                                <textarea
                                    {...register(`BoilerplateCode.${index}.initialCode`)}
                                    rows={5}
                                    className={`${inputClasses(errors.BoilerplateCode?.[index]?.initialCode)} font-mono !text-xs`}
                                />
                                {errors.BoilerplateCode?.[index]?.initialCode && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{errors.BoilerplateCode[index].initialCode.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-600">Reference Solution (used to auto-verify test cases)</label>
                                <textarea
                                    {...register(`referenceSolution.${index}.completeCode`)}
                                    rows={5}
                                    className={`${inputClasses(errors.referenceSolution?.[index]?.completeCode)} font-mono !text-xs`}
                                />
                                {errors.referenceSolution?.[index]?.completeCode && (
                                    <p className="mt-1 text-xs font-medium text-red-500">{errors.referenceSolution[index].completeCode.message}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {submitting ? (isEdit ? 'Saving changes…' : 'Creating problem…') : isEdit ? 'Save Changes' : 'Create Problem'}
            </button>
        </form>
    );
}

export default ProblemForm;
