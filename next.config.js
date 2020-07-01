// const withPWA = require('next-pwa');

// module.exports = withPWA({
module.exports = {
    // pwa: {
    //     dest: 'public',
    // },
    env: {
        JWT_SECRET: process.env.JWT_SECRET || 'aed8e0786376a2abe15f5c8f8e2ee74565d0915897b33296594bb1b549098ba7',
        API_URL: process.env.API_URL || 'https://api.stage.mpdx.org/graphql',
        VERCEL_URL: process.env.VERCEL_URL || 'http://localhost:3000',
        CLIENT_ID: process.env.CLIENT_ID || '4027334344069527005',
        CLIENT_SECRET: process.env.CLIENT_SECRET || 'V3WBTfLMgXBuL6XNTPm13CIK7Cwvtb0VnQpeQH-Oojx6kuzaD7durA',
        BEACON_TOKEN: process.env.BEACON_TOKEN || '01b4f5f0-7fff-492a-b5ec-d536f3657d10',
    },
};
// });
