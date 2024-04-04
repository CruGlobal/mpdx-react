module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/login'],
      startServerCommand: 'yarn serve',
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
