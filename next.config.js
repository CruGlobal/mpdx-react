const withPWA = require('next-pwa');

module.exports = withPWA({
    pwa: {
        dest: 'public',
    },
    env: {
        API_URL: process.env.API_URL || 'https://api.stage.mpdx.org/graphql',
        AUTH_URL: process.env.AUTH_URL || 'https://thekey.me/cas/',
        AUTH_LOGIN_PATH:
            process.env.AUTH_LOGIN_PATH ||
            'login?client_id=4027334344069527005&scope=fullticket&response_type=token&redirect_uri=http://localhost:3000/auth',
        AUTH_SIGNUP_PATH:
            process.env.AUTH_SIGNUP_PATH ||
            'login?action=signup&client_id=4027334344069527005&scope=fullticket&response_type=token&redirect_uri=http://localhost:3000/auth',
        AUTH_LOGOUT_PATH: process.env.AUTH_LOGOUT_PATH || 'logout?service=http://localhost:3000/login',
        OAUTH_URL: process.env.OAUTH_URL || 'https://auth.stage.mpdx.org/auth/user/',
        BEACON_TOKEN: process.env.BEACON_TOKEN || '01b4f5f0-7fff-492a-b5ec-d536f3657d10',
    },
});
