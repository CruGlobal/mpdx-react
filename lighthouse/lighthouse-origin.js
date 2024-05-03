module.exports = {
  getOrigin: () => {
    let origin = 'http://localhost:3000';
    if (process.env.GITHUB_HEAD_REF) {
      // This is a pull request workflow
      if (process.env.PREVIEW_URL) {
        origin = process.env.PREVIEW_URL;
      }
    } else {
      // This workflow was triggered by a push
      getPushOrigin();
    }
    return origin;
  },
};

function getPushOrigin() {
  if (process.env.GITHUB_REF_NAME === 'staging') {
    return 'https://next-stage.mpdx.org';
  } else if (process.env.GITHUB_REF_NAME === 'main') {
    return 'https://next.mpdx.org';
  }
}
