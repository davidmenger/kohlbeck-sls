/*
 * @author David Menger
 */
'use strict';

const jsYaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, '..', 'locales');
const files = fs.readdirSync(directory);

const translations = {};

files.forEach((file) => {
    const match = file.match(/(.+)\.yml$/);
    if (match) {
        const contents = fs.readFileSync(path.join(directory, file), 'utf8');
        const data = jsYaml.safeLoad(contents);
        const [, lang] = match;
        Object.assign(translations, {
            [lang]: data
        });
    }
});

module.exports = translations;

