import { useState, useEffect } from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";

// Schema Validation for Signup Form 

const SignUpSchema = z.object({
    firstName: z.string().min(3, "Name should contain atleast 3 Characters").max("Name is too much Long"),
    email: z.string().email(),
    password:z.string().min(8,"Password must contain atleast 8 Characters"),
    confirmPassword:z.string().min(8,"Password doesn't match")

})

const signup=()=>{
    const { register, handleSubmit, formState: { errors }, } = useForm({resolver: zodResolver(SignUpSchema)});

    const submittedData = (data)=>{

        // console.log(data);
    }

    return(
        <div>
            <form onSubmit={handleSubmit(submittedData)}className="flex flex-col min-h-screen justify-center item-center gap-y-2 max-w-xl ml-50">
                <input {...register('firstName')} 
                placeholder="Enter Your Name" />
                <input {...register('email')} 
                    placeholder="Enter Your Email"/>
                <input {...register('password')}
                    placeholder="Enter Your Password" type="password" />
                <input {...register('confirmPassword')}
                    placeholder=" Confirm Password" type="password" />
                <button type="submit" className="btn">Sign Up</button>
            </form>

        </div>

    )
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