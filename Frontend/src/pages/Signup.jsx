import {useState,useEffect} from "react";


function Signup(){
    const [name,setName]= useState('');
    const [email,setEmail] = usestate('');
    const [password, setPassword] = usestate('');

    const handleSubmit = (e)=>{
        e.preventDefault();
        // Validation
        // Submission to Backend
        
    }

    return(
       <form onSubmit={handleSubmit}>

       </form>
    )
}

export default Signup