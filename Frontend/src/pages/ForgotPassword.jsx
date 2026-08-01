import { useState } from 'react';
import axiosClient from '../../utils/axiosClient';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await axiosClient.post('/user/forgot-password', { email });

            setMessage(response.data?.message || 'Reset link sent to your email');
            setEmail('');
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title justify-center text-3xl">Forgot Password</h2>
                    <p className="text-sm opacity-80 text-center">
                        Enter your email address and we’ll send a reset link if the account exists.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-control mt-4">
                            <label className="label mb-1">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                className="input input-bordered"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="text-error mt-4">{error}</p>}
                        {message && <p className="text-success mt-4">{message}</p>}

                        <div className="form-control mt-6 flex justify-center">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;