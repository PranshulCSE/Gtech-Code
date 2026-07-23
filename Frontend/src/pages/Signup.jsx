import { useState, useEffect } from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";

// Schema Validation for Signup Form 

const SignUpSchema = z.object({
    firstName: z.string().min(3, "Name should contain atleast 3 Characters").max(30, "Name is too much Long"),
    emailId: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must contain atleast 8 Characters"),
    confirmPassword: z.string().min(8, "Password must contain atleast 8 Characters")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

const signup=()=>{
    
    const { register, handleSubmit, formState: { errors }, } = useForm({resolver: zodResolver(SignUpSchema)});

    const submittedData = (data)=>{

        console.log(data);
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
                                    className={`input input-bordered ${errors.firstName && 'input-error'}`}
                                    {...register('firstname')}
                                />
                                {errors.firstName && (
                                    <span className="text-error">{errors.firstName.message}</span>
                                )}
                            </div>
    
                            <div className="form-control  mt-4">
                                <label className="label mb-1">
                                    <span className="label-text">Email</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter Your Email here"
                                    className={`input input-bordered ${errors.emailId && 'input-error'}`}
                                    {...register('emailId')}
                                />
                                {errors.emailId && (
                                    <span className="text-error">{errors.emailId.message}</span>
                                )}
                            </div>
    
                            <div className="form-control mt-4">
                                <label className="label mb-1">
                                    <span className="label-text">Password</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className={`input input-bordered ${errors.password && 'input-error'}`}
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <span className="text-error">{errors.password.message}</span>
                                )}
                            </div>
                         <div className="form-control mt-4">
                             <label className="label mb-1">
                                 <span className="label-text">Confirm Password</span>
                             </label>
                             <input
                                 type="password"
                                 placeholder="••••••••"
                                 className={`input input-bordered ${errors.password && 'input-error'}`}
                                 {...register('confirmpassword')}
                             />
                             {errors.password && (
                                 <span className="text-error">{errors.password.message}</span>
                             )}
                         </div>

                            <div className="form-control mt-6 flex justify-center">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </form>
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