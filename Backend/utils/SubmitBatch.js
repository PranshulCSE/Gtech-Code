// SubmitBatch.js

const axios = require('axios');
require('dotenv').config();

const SubmitBatch = async (submissions) => {

    const options = {
        method: 'POST',
        url: process.env.JUDGE0_URL + '/submissions/batch?base64_encoded=true',
        params: {
            base64_encoded: 'false'
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



const SubmitToken = async (tokens, options = {}) => {
    const { maxAttempts = 15, delayMs = 2000 } = options;

    const requestOptions = {
        method: 'GET',
        url: process.env.JUDGE0_URL + '/submissions/batch',
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
            const response = await axios.request(requestOptions);
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching submission results: ${error.message}`);
        }
    };

    // FIX: cap polling so a slow Judge0 queue does not hang forever.
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const result = await fetchData();
        // FIX: response me status nested object hai, isliye "r.status.id" use kiya, "r.status_id" galat tha
        const IsResultObtained = result.submissions.every((r) => r.status.id > 2);

        if (IsResultObtained) {
            return result.submissions;
        }
        await waiting(delayMs);
    }

    throw new Error('Judge0 did not return a result in time. Please try again.');
}

const waiting = (timer) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timer);
    });
}

module.exports = { SubmitBatch, SubmitToken };