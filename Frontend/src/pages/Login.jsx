import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser } from "../../authSlice";
import { useEffect, useState } from 'react';

const loginSchema = z.object({
    email: z.string().email("Invalid Email"),
    password: z.string().min(8, "Password is to weak")
});

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(loginSchema) });


    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = (data) => {
        // console.log(data);
        dispatch(loginUser(data));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"> {/* Centering container */}
            <div className="card w-96 bg-base-100 shadow-xl"> {/* Existing card styling */}
                <div className="card-body">
                    <h2 className="card-title justify-center text-3xl">GTech-Code</h2> {/* Centered title */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Existing form fields */}

                        <div className="form-control  mt-4">
                            <label className="label mb-1">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                className={`input input-bordered ${errors.email && 'input-error'}`}
                                {...register('email')}
                            />
                            {errors.email && (
                                <span className="text-error">{errors.email.message}</span>
                            )}
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`input input-bordered w-full pr-10 ${errors.password ? 'input-error' : ''}`}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <span className="text-error text-sm mt-1">{errors.password.message}</span>
                            )}
                        </div>

                        <div className="form-control mt-8 flex justify-center">
                            <button
                                type="submit"
                                className={`btn btn-primary ${loading ? 'loading btn-disabled' : ''}`} // Added btn-disabled for better UX with loading
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Logging in...
                                    </>
                                ) : 'Login'}
                            </button>
                        </div>
                        <div className="mt-4 text-center">
                            <Link to="/forgot-password" className="link link-secondary text-sm">
                                Forgot password?
                            </Link>
                        </div>
                    </form>
                    <div className="text-center mt-6">
                        <span className="text-sm">
                            Don't have an account?{' '} {/* Adjusted text slightly */}
                            <NavLink to="/signup" className="link link-primary">
                                Sign Up
                            </NavLink>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;





// // :3000/user/check:1  Failed to load resource: net::ERR_CONNECTION_REFUSED
// @reduxjs_toolkit.js?v = fef13496: 1525 A non - serializable value was detected in an action, in the path: `payload`.Value: AxiosError: Network Error
//     at XMLHttpRequest.handleError(axios.js ? v = fef13496 : 2260: 16)
//     at Axios$1.request(axios.js ? v = fef13496 : 3024: 37)
//     at async authSlice.js: 33: 24
//     at async @reduxjs_toolkit.js?v = fef13496: 1930: 21 
// Take a look at the logic that dispatched this action: Object
//     (See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants) 
//         (To allow non - serializable values see: https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data)
//         (anonymous) @@reduxjs_toolkit.js ? v = fef13496 : 1525
// measureTime @@reduxjs_toolkit.js ? v = fef13496 : 1336
//         (anonymous) @@reduxjs_toolkit.js ? v = fef13496 : 1521
//             (anonymous) @@reduxjs_toolkit.js ? v = fef13496 : 1253
//                 (anonymous) @@reduxjs_toolkit.js ? v = fef13496 : 1458
//                     (anonymous) @@reduxjs_toolkit.js ? v = fef13496 : 1327
// dispatch @@reduxjs_toolkit.js ? v = fef13496 : 251
//         (anonymous) @@reduxjs_toolkit.js ? v = fef13496 : 1953
// : 3000 / user / check: 1  Failed to load resource: net:: ERR_CONNECTION_REFUSED
// Login.jsx: 25 Uncaught ReferenceError: signupSchema is not defined
//     at Login(Login.jsx: 25: 41)
//     at Object.react_stack_bottom_frame(react - dom_client.js ? v = fef13496 : 12866: 12)
//     at renderWithHooks(react - dom_client.js ? v = fef13496 : 4213: 19)
//     at updateFunctionComponent(react - dom_client.js ? v = fef13496 : 5569: 16)
//     at beginWork(react - dom_client.js ? v = fef13496 : 6140: 20)
//     at runWithFiberInDEV(react - dom_client.js ? v = fef13496 : 851: 66)
//     at performUnitOfWork(react - dom_client.js ? v = fef13496 : 8429: 92)
//     at workLoopSync(react - dom_client.js ? v = fef13496 : 8325: 37)
//     at renderRootSync(react - dom_client.js ? v = fef13496 : 8309: 6)
//     at performWorkOnRoot(react - dom_client.js ? v = fef13496 : 7994: 27)
// Login @Login.jsx: 25
// react_stack_bottom_frame @react - dom_client.js ? v = fef13496 : 12866
// renderWithHooks @react - dom_client.js ? v = fef13496 : 4213
// updateFunctionComponent @react - dom_client.js ? v = fef13496 : 5569
// beginWork @react - dom_client.js ? v = fef13496 : 6140
// runWithFiberInDEV @react - dom_client.js ? v = fef13496 : 851
// performUnitOfWork @react - dom_client.js ? v = fef13496 : 8429
// workLoopSync @react - dom_client.js ? v = fef13496 : 8325
// renderRootSync @react - dom_client.js ? v = fef13496 : 8309
// performWorkOnRoot @react - dom_client.js ? v = fef13496 : 7994
// performWorkOnRootViaSchedulerTask @react - dom_client.js ? v = fef13496 : 9059
// performWorkUntilDeadline @react - dom_client.js ? v = fef13496 : 36
// react - dom_client.js ? v = fef13496 : 5258 An error occurred in the < Login > component.

// Consider adding an error boundary to your tree to customize error handling behavior.
// Visit https://react.dev/link/error-boundaries to learn more about error boundaries.

//         defaultOnUncaughtError @react - dom_client.js ? v = fef13496 : 5258
// logUncaughtError @react - dom_client.js ? v = fef13496 : 5287
// runWithFiberInDEV @react - dom_client.js ? v = fef13496 : 851
// lane.callback @react - dom_client.js ? v = fef13496 : 5315
// callCallback @react - dom_client.js ? v = fef13496 : 4095
// commitCallbacks @react - dom_client.js ? v = fef13496 : 4103
// runWithFiberInDEV @react - dom_client.js ? v = fef13496 : 851
// commitLayoutEffectOnFiber @react - dom_client.js ? v = fef13496 : 6986
// flushLayoutEffects @react - dom_client.js ? v = fef13496 : 8671
// commitRoot @react - dom_client.js ? v = fef13496 : 8584
// commitRootWhenReady @react - dom_client.js ? v = fef13496 : 8079
// performWorkOnRoot @react - dom_client.js ? v = fef13496 : 8051
// performWorkOnRootViaSchedulerTask @react - dom_client.js ? v = fef13496 : 9059
// performWorkUntilDeadline @react - dom_client.js ? v = fef13496 : 36