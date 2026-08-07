import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../../utils/axiosClient'

function AdminUpload() {

    const { problemId } = useParams();
    const navigate = useNavigate();

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [problem, setProblem] = useState(null);
    const [loadingProblem, setLoadingProblem] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const fetchProblem = async () => {
            try {
                setLoadingProblem(true);
                const { data } = await axiosClient.get(`/problem/admin/${problemId}`);
                if (!cancelled) {
                    setProblem(data);
                }
            } catch (err) {
                if (!cancelled) {
                    const message = typeof err.response?.data === 'string' ? err.response.data : err.response?.data?.message;
                    setLoadError(message || 'Could not load the problem details.');
                }
            } finally {
                if (!cancelled) {
                    setLoadingProblem(false);
                }
            }
        };

        fetchProblem();

        return () => {
            cancelled = true;
        };
    }, [problemId]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
        setError,
        clearErrors
    } = useForm();

    const selectedFile = watch('videoFile')?.[0];

    // Upload video to Cloudinary
    const onSubmit = async (data) => {
        const file = data.videoFile[0];

        setUploading(true);
        setUploadProgress(0);
        clearErrors();

        try {
            // Step 1: Get upload signature from backend
            const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
            const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

            // Step 2: Create FormData for Cloudinary upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('public_id', public_id);
            formData.append('api_key', api_key);

            // Step 3: Upload directly to Cloudinary
            const uploadResponse = await axios.post(upload_url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
            });

            const cloudinaryResult = uploadResponse.data;

            // Step 4: Save video metadata to backend
            const metadataResponse = await axiosClient.post('/video/save', {
                problemId: problemId,
                cloudinaryPublicId: cloudinaryResult.public_id,
                secureUrl: cloudinaryResult.secure_url,
                duration: cloudinaryResult.duration,
            });

            setUploadedVideo(metadataResponse.data.videoSolution);
            reset(); // Reset form after successful upload

        } catch (err) {
            console.error('Upload error:', err);
            setError('root', {
                type: 'manual',
                message: err.response?.data?.message || 'Upload failed. Please try again.'
            });
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format duration
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-[calc(100vh-3rem)] rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-4 sm:p-6">
            <div className="mx-auto max-w-6xl space-y-5">
                <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white shadow-lg shadow-slate-950/15 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/55">Editorial video upload</p>
                            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Upload video for problem</h1>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/admin', { state: { tab: 'videos' } })}
                            className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
                        >
                            ← Back to video manager
                        </button>
                    </div>
                </div>

                {loadingProblem ? (
                    <div className="flex items-center justify-center rounded-3xl border border-slate-200/70 bg-white py-16 shadow-sm">
                        <span className="loading loading-spinner loading-lg text-indigo-500"></span>
                    </div>
                ) : loadError ? (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-600 shadow-sm">
                        {loadError}
                    </div>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Selected problem</p>
                                    <h2 className="mt-2 text-2xl font-black text-slate-900">{problem?.title || 'Unknown problem'}</h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${problem?.difficulty === 'easy'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : problem?.difficulty === 'medium'
                                            ? 'bg-amber-50 text-amber-700'
                                            : 'bg-rose-50 text-rose-700'
                                        }`}>
                                        {problem?.difficulty || 'n/a'}
                                    </span>
                                    {(Array.isArray(problem?.tags) ? problem.tags : [problem?.tags]).filter(Boolean).map((tag) => (
                                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{tag}</span>
                                    ))}
                                </div>
                            </div>

                            <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">
                                {problem?.description || 'No description available.'}
                            </p>

                            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Choose video file</label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        {...register('videoFile', {
                                            required: 'Please select a video file',
                                            validate: {
                                                isVideo: (files) => {
                                                    if (!files || !files[0]) return 'Please select a video file';
                                                    const file = files[0];
                                                    return file.type.startsWith('video/') || 'Please select a valid video file';
                                                },
                                                fileSize: (files) => {
                                                    if (!files || !files[0]) return true;
                                                    const file = files[0];
                                                    const maxSize = 100 * 1024 * 1024;
                                                    return file.size <= maxSize || 'File size must be less than 100MB';
                                                }
                                            }
                                        })}
                                        className={`file-input file-input-bordered w-full bg-white ${errors.videoFile ? 'file-input-error' : ''}`}
                                        disabled={uploading}
                                    />
                                    {errors.videoFile && (
                                        <p className="mt-2 text-xs font-medium text-red-500">{errors.videoFile.message}</p>
                                    )}
                                </div>

                                {selectedFile && (
                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Selected file</p>
                                        <p className="mt-2 truncate text-sm font-bold text-slate-900">{selectedFile.name}</p>
                                        <p className="text-sm text-slate-500">Size: {formatFileSize(selectedFile.size)}</p>
                                    </div>
                                )}

                                {uploading && (
                                    <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-4">
                                        <div className="mb-2 flex justify-between text-sm font-semibold text-indigo-700">
                                            <span>Uploading video</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <progress className="progress progress-primary w-full" value={uploadProgress} max="100"></progress>
                                    </div>
                                )}

                                {errors.root && (
                                    <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
                                        {errors.root.message}
                                    </div>
                                )}

                                {uploadedVideo && (
                                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                                        <p className="text-sm font-black">Upload successful</p>
                                        <p className="mt-1 text-sm">Duration: {formatDuration(uploadedVideo.duration)}</p>
                                        <p className="text-sm">Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</p>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className={`rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 ${uploading ? 'opacity-80' : ''}`}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Video'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Upload checklist</p>
                                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                                    <li className="rounded-2xl bg-slate-50 px-4 py-3">Use a clear walkthrough with explanation first.</li>
                                    <li className="rounded-2xl bg-slate-50 px-4 py-3">Keep the file under 100MB.</li>
                                    <li className="rounded-2xl bg-slate-50 px-4 py-3">The upload is saved after the Cloudinary upload completes.</li>
                                </ul>
                            </div>

                            <div className="rounded-3xl border border-slate-200/70 bg-slate-900 p-5 text-white shadow-sm">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">Problem reference</p>
                                <p className="mt-2 text-lg font-black">{problem?.title || 'Problem details loading'}</p>
                                <p className="mt-2 text-sm text-white/70">
                                    You can return to the video manager after upload to delete or replace this editorial later.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


export default AdminUpload;