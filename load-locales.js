// load-locales.js
const fs = require('fs');
const path = require('path');

function loadLocalePlugin() {
  return {
    name: 'load-locale',
    resolveId(source) {
      if (source === 'generated-locale') return source;
      return null;
    },
    load(id) {
      if (id === 'generated-locale') {
        // Load and process each language's messages.json file
        const enMessagesPath = path.resolve(__dirname, 'node_modules/mapml-extension/src/_locales/en/messages.json');
        const frMessagesPath = path.resolve(__dirname, 'node_modules/mapml-extension/src/_locales/fr/messages.json');

        const enMessages = JSON.parse(fs.readFileSync(enMessagesPath, 'utf-8'));
        const frMessages = JSON.parse(fs.readFileSync(frMessagesPath, 'utf-8'));

        // Function to transform messages.json content to the desired structure
        const transformMessages = (messages) => {
          return Object.keys(messages).reduce((acc, key) => {
            if (key !== 'extName' && key !== 'extDescription') {
              acc[key] = messages[key].message;
            }
            return acc;
          }, {});
        };

        // Generate locale objects
        const locale = transformMessages(enMessages);
        const localeFr = transformMessages(frMessages);

        // Export the transformed objects
        return `export const locale = ${JSON.stringify(locale)};
                export const localeFr = ${JSON.stringify(localeFr)};`;
      }
      return null;
      
    }
  };
}

module.exports = loadLocalePlugin;
