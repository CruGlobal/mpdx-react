const fs = require('fs');
const path = require('path');

const localesDir = path.resolve(__dirname, '../public/locales');

fs.readdirSync(localesDir).forEach((langCode) => {
  const filePath = path.join(localesDir, langCode, 'translation.json');

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const sortedContent = Object.fromEntries(
      Object.entries(JSON.parse(content)).sort(([a], [b]) =>
        a.localeCompare(b),
      ),
    );

    fs.writeFileSync(filePath, JSON.stringify(sortedContent, null, 4) + '\n');
    // eslint-disable-next-line no-console
    console.log(`✔ Sorted translation.json for locale: ${langCode}`);
  }
});
