/*
 * @author David Menger
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { SafeString } = require('handlebars');

const webalizeChunks = a => a;
const webalize = a => a;

function _ensureTrailingSlash (uri) {
    return uri.replace(/\/?$/, '/');
}

function urlHelper (uri) {
    return `${uri}`.replace(/^\//, _ensureTrailingSlash('/'));
}

function pageUrl (pageId, opts) {
    if (typeof pageId === 'object') {
        return pageId.data.root.pageUrl || '';
    } else if (!pageId) {
        return opts.data.root.pageUrl || '';
    }

    let useUrl = opts.data.root.statics[pageId];

    if (useUrl) {
        if (useUrl.view === 'index') {
            useUrl = '/';
        } else {
            useUrl = `/${useUrl.view}`.replace(/^\/\//, '/');
        }

        useUrl = _ensureTrailingSlash(useUrl);
    }

    return useUrl ? urlHelper(webalizeChunks(useUrl), opts) : '#';
}

function asset (assetPath, embed, opts) {
    let options = opts;
    let isEmbed = embed;

    if (typeof embed === 'object') {
        options = embed;
        isEmbed = false;
    }

    const file = path.join(process.cwd(), 'dist', assetPath);

    if (isEmbed) {
        const data = fs.readFileSync(file);
        if (isEmbed === 'amp') {
            return data.toString('utf8').replace(/!important/g, '');
        } else if (typeof isEmbed === 'string') {
            return `data:${isEmbed};base64,${data.toString('base64')}`;
        }
        return data.toString('utf8');
    }

    let version;
    try {
        version = fs.statSync(file).mtime.getTime();
    } catch (e) {
        version = 1;
    }
    return urlHelper(`/${assetPath}?v=${version}`, options);
}

function toClassName (string) {
    return webalize(string);
}

function translate (string, opts) {
    const { translations, lang } = opts.data.root;

    if (typeof translations[lang] === 'object'
        && typeof translations[lang][string] === 'string') {

        return translations[lang][string];
    }

    return string;
}

function alternates (opts) {
    const {
        statics, view, pageUrl: url, lang
    } = opts.data.root;

    const langs = [];

    Object.keys(statics)
        .forEach((key) => {
            const pageDef = statics[key];

            if (pageDef.view !== view) {
                return;
            }

            let href = pageDef.path || pageDef.view;

            if (href === 'index') {
                href = '';
            } else {
                href += '/';
            }

            langs.push({ href, hreflang: pageDef.lang || lang });
        });

    const ret = langs
        .map(({ hreflang, href }) =>
            `<link rel="alternate" hreflang="${hreflang}" href="${url}/${href}" />`)
        .join('\n');

    return new SafeString(ret);
}

module.exports = {
    url: urlHelper,
    pageUrl,
    asset,
    toClassName,
    _: translate,
    alternates
};
