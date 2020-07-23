module.exports = () => {
    process.env.NODE_ICU_DATA = 'node_modules/full-icu';

    return {
        autoDetect: true,
    };
};
