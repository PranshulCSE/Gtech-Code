import { useState, useEffect } from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../../authSlice';

// Schema Validation for Signup Form 

const SignUpSchema = z.object({
    firstname: z.string().min(3, "Name should contain atleast 3 Characters").max(30, "Name is too much Long"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must contain atleast 8 Characters"),
    confirmPassword: z.string().min(8, "Password must contain atleast 8 Characters")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

const signup=()=>{
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useSelector((state) => state.auth); // Removed error as it wasn't used
    
    
    const { register, handleSubmit, formState: { errors }, } = useForm({resolver: zodResolver(SignUpSchema)});

    useEffect(() => {
        if (isAuthenticated) {
         navigate('/');
        }
     }, [isAuthenticated, navigate]);

    const submittedData = (data)=>{
        dispatch(registerUser(data));
        // console.log(data);
    }

     return (
            <div className="min-h-screen flex items-center justify-center p-4"> {/* Centering container */}
                <div className="card w-96 bg-base-100 shadow-xl"> {/* Existing card styling */}
                    <div className="card-body">
                        <h2 className="card-title justify-center text-3xl">GTech-Code</h2> {/* Centered title */}
                     <form onSubmit={handleSubmit(submittedData)}>
                            {/* Existing form fields */}
                            <div className="form-control">
                                <label className="label mb-1">
                                    <span className="label-text">First Name</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your First Name here"
                                    className={`input input-bordered ${errors.firstname && 'input-error'}`}
                                    {...register('firstname')}
                                />
                                {errors.firstname && (
                                    <span className="text-error">{errors.firstname.message}</span>
                                )}
                            </div>
    
                            <div className="form-control  mt-4">
                                <label className="label mb-1">
                                    <span className="label-text">Email</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter Your Email here"
                                    className={`input input-bordered ${errors.email && 'input-error'}`}
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <span className="text-error">{errors.email.message}</span>
                                )}
                            </div>
    

                         {/* Password Field with Toggle */}
                         <div className="form-control mt-4">
                             <label className="label">
                                 <span className="label-text">Password</span>
                             </label>
                             <div className="relative">
                                 <input
                                     type={showPassword ? "text" : "password"}
                                     placeholder="••••••••"
                                     // Added pr-10 (padding-right) to make space for the button
                                     className={`input input-bordered w-full pr-10 ${errors.password ? 'input-error' : ''}`}
                                     {...register('password')}
                                 />
                                 <button
                                     type="button"
                                     className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" // Added transform for better centering, styling
                                     onClick={() => setShowPassword(!showPassword)}
                                     aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility
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

                         {/* Password Field with Toggle */}
                         <div className="form-control mt-4">
                             <label className="label">
                                 <span className="label-text">Confirm Password</span>
                             </label>
                             <div className="relative">
                                 <input
                                     type={showPassword ? "text" : "password"}
                                     placeholder="••••••••"
                                     // Added pr-10 (padding-right) to make space for the button
                                     className={`input input-bordered w-full pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                                     {...register('confirmPassword')}
                                 />
                                 <button
                                     type="button"
                                     className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" // Added transform for better centering, styling
                                     onClick={() => setShowPassword(!showPassword)}
                                     aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility
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
                             {errors.confirmPassword && (
                                 <span className="text-error text-sm mt-1">{errors.confirmPassword.message}</span>
                             )}
                         </div>
                         {/* Submit Button */}
                         <div className="form-control mt-8 flex justify-center">
                             <button
                                 type="submit"
                                 className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                 disabled={loading}
                             >
                                 {loading ? 'Signing Up...' : 'Sign Up'}
                             </button>
                         </div>
                        </form>
                     {/* Login Redirect */}
                     <div className="text-center mt-6"> {/* Increased mt for spacing */}
                         <span className="text-sm">
                             Already have an account?{' '}
                             <NavLink to="/login" className="link link-primary">
                                 Login
                             </NavLink>
                         </span>
                     </div>
                    </div>
                </div>
            </div>
        );
    }
   


export default signup


// function Signup() {
//     const [name, setName] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [confirmpassword, setConfirmPassword] = useState('');

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         // console.log(name, email, password);
//         // Validation
//         // Validating Form Data for Submission
//         // Submission to Backend

//     }

//     return (
//         <div>
//             <form onSubmit={handleSubmit} className=" min-h-screen flex flex-col justify-center items-center gap-y-2 ">
//                 <input type="text" value={name} placeholder="Enter Your First Name" onChange={(e) => setName(e.target.value)}></input>
//                 <input type="email" value={email} placeholder="Enter Your Email" onChange={(e) => setEmail(e.target.value)}></input>
//                 <input type="password" value={password} placeholder="Enter Your Password" onChange={(e) => setPassword(e.target.value)}></input>
//                 <input type="password" value={confirmpassword} placeholder="Enter Your Password Again!!" onChange={(e) => setConfirmPassword(e.target.value)}></input>


//                 <button type="submit">Sign Up</button>
//             </form>
//         </div>
//     )
// }