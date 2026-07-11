// SubmitBatch.js

const axios = require('axios');
require('dotenv').config();

const SubmitBatch = async (submissions) => {

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
            throw new Error(` Error submitting batch: ${error.message}`);
        }
    }

    return await fetchData();
}



const SubmitToken = async (tokens) => {

    const options = {
        method: 'GET',
        url: process.env.JUDGE0_URL,
        params: {
            // FIX: "resultToken" wala variable yahan exist hi nahi karta tha (wo caller ka local variable tha)
            // function ka apna parameter "tokens" use karna tha
            tokens: tokens.join(","),
            base64_encoded: 'false',
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_API_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching submission results: ${error.message}`);
        }
    };

    while (true) {
        const result = await fetchData();
        // FIX: response me status nested object hai, isliye "r.status.id" use kiya, "r.status_id" galat tha
        const IsResultObtained = result.submissions.every((r) => r.status.id > 2);

        if (IsResultObtained) {
            return result.submissions;
            // NOTE: return ke baad break kabhi chalta hi nahi, isliye hata diya (dead code tha)
        }
        await waiting(2000);
    }

}

const waiting = (timer) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timer);
    });
}

module.exports = { SubmitBatch, SubmitToken };