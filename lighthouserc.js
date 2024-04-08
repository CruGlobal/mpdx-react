const serverUrl = process.env.PREVIEW_URL ?? 'http://localhost:3000';

module.exports = {
  ci: {
    collect: {
      url: [
        `${serverUrl}/accountLists`,
        `${serverUrl}/accountLists/08bb09d1-3b62-4690-9596-b625b8af4750`,
        `${serverUrl}/accountLists/08bb09d1-3b62-4690-9596-b625b8af4750/contacts`,
        `${serverUrl}/accountLists/08bb09d1-3b62-4690-9596-b625b8af4750/contacts/ef599ebf-4bb0-4c07-bd7d-6b1117340c29`,
        `${serverUrl}/accountLists/08bb09d1-3b62-4690-9596-b625b8af4750/tasks`,
        `${serverUrl}/accountLists/5721eaaf-4596-4412-ae68-ccdd291b804d/reports/donations`,
        `${serverUrl}/accountLists/5721eaaf-4596-4412-ae68-ccdd291b804d/reports/partnerCurrency`,
        `${serverUrl}/accountLists/5721eaaf-4596-4412-ae68-ccdd291b804d/reports/salaryCurrency`,
        `${serverUrl}/accountLists/5721eaaf-4596-4412-ae68-ccdd291b804d/reports/designationAccounts`,
        `${serverUrl}/accountLists/5721eaaf-4596-4412-ae68-ccdd291b804d/reports/partnerGivingAnalysis`,
        `${serverUrl}/accountLists/5721eaaf-4596-4412-ae68-ccdd291b804d/reports/coaching`,
      ],
      numberOfRuns: 3,
      startServerCommand: process.env.PREVIEW_URL ? '' : 'yarn serve',
      puppeteerScript: './lighthouse-auth.js',
      puppeteerLaunchOptions: { defaultViewport: null },
      headful: false,
      settings: {
        disableStorageReset: true,
        preset: 'desktop',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
