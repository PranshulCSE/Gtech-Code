import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import axiosClient from '../../utils/axiosClient';

function VerifyEmail() {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid or missing verification token.');
                return;
            }

            try {
                const response = await axiosClient.post(`/user/verify-email/${token}`);
                setStatus('success');
                setMessage(response.data || 'Your email has been verified successfully!');
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data || 'Verification link is invalid or has expired.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body text-center">
                    <h2 className="card-title justify-center text-3xl mb-4">GTech-Code</h2>

                    {status === 'loading' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <p className="text-lg font-medium">Verifying your email...</p>
                            <p className="text-sm opacity-70">Please wait while we confirm your credentials.</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="bg-success/20 text-success p-4 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-xl font-bold text-success">Email Verified!</p>
                            <p className="text-sm opacity-90">{message}</p>
                            <Link to="/login" className="btn btn-primary mt-4 w-full">
                                Go to Login
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="bg-error/20 text-error p-4 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <p className="text-xl font-bold text-error">Verification Failed</p>
                            <p className="text-sm opacity-95 text-error">{message}</p>
                            <div className="flex flex-col gap-2 w-full mt-4">
                                <Link to="/signup" className="btn btn-outline btn-error">
                                    Back to Sign Up
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;
