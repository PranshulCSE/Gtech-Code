import { useState } from 'react';
import { useParams } from 'react-router';

function ResetPassword() {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch('/user/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword })
            });

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(responseText || 'Unable to reset password');
            }

            setMessage(responseText);
            setNewPassword('');
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
                    <h2 className="card-title justify-center text-3xl">Reset Password</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-control mt-4">
                            <label className="label mb-1">
                                <span className="label-text">New Password</span>
                            </label>
                            <input
                                type="password"
                                className="input input-bordered"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                minLength={8}
                                required
                            />
                        </div>

                        {error && <p className="text-error mt-4">{error}</p>}
                        {message && <p className="text-success mt-4">{message}</p>}

                        <div className="form-control mt-6 flex justify-center">
                            <button type="submit" className="btn btn-primary" disabled={loading || !token}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;