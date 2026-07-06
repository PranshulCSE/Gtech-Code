const axios = require('axios');
require('dotenv').config();

const SubmitBatch=async (submissions)=>{

    const options = {
        method: 'POST',
        url: process.env.JUDGE0_URL,
        params: {
            base64_encoded: 'true'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_API_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            submissions
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            throw new Error(`Error submitting batch: ${error.message}`);
        }
    }

    return await fetchData();
}



const SubmitToken=async (tokens)=>{

    const options = {
        method: 'GET',
        url: process.env.JUDGE0_URL,
        params: {
            base64_encoded: 'true',
            tokens: tokens.join(',')
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_API_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }       
    };

    async function fetchData() {
        try{
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
           throw new Error(`Error fetching submission results: ${error.message}`);  
        }
};

while(true){
const result = await fetchData();
 const IsResultObtained = result.submissions.every((r)=>r.status_id > 2);

    if(IsResultObtained){
        return result.submissions;
        break;
    }
   await waiting(2000);
}
}

const waiting = async(ms)=>{
    return new Promise((resolve) => {
        setTimeout(()=>{
            resolve(1);
        },ms);
    });
}

module.exports = {SubmitBatch, SubmitToken};