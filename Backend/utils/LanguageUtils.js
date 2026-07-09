
const  getLanguageById  = (Language)=>{
    if (!Language || typeof Language !== 'string') {
        throw new Error('Invalid language');
    }
    const languageMap = {
        'c': 50,
        'cpp': 54,
        'java': 62,
        'javascript': 63,
        'python': 71,
    }

    return languageMap[Language.toLowerCase()];
}

module.exports =  getLanguageById ;