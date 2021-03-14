const querystring = require('querystring');

const got = require('got');

const deepClone = require('lodash.clonedeep');

const languages = require('./languages');

const ENDPOINT_MAP = {};

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36';

function extract(key, res) {
    const re = new RegExp(`"${key}":".*?"`);
    const result = re.exec(res.body);
    if (result !== null) {
        return result[0].replace(`"${key}":"`, '').slice(0, -1);
    }
    return '';
}

ENDPOINT_MAP.website = async function(text, opts, gotopts) {
    gotopts = deepClone(gotopts);

    let url = 'https://translate.google.' + opts.tld;
    let res = await got(url, gotopts);
    const data = {
        'rpcids': 'MkEWBc',
        'f.sid': extract('FdrFJe', res),
        'bl': extract('cfb2h', res),
        'hl': 'en-US',
        'soc-app': 1,
        'soc-platform': 1,
        'soc-device': 1,
        '_reqid': Math.floor(1000 + (Math.random() * 9000)),
        'rt': 'c'
    };

    url += '/_/TranslateWebserverUi/data/batchexecute?' + querystring.stringify(data);

    gotopts.body = 'f.req=' + encodeURIComponent(JSON.stringify([[['MkEWBc', JSON.stringify([[text, opts.from, opts.to, true], [null]]), null, 'generic']]])) + '&';
    gotopts.headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

    res = await got.post(url, gotopts);

    let json = res.body.slice(6);
    let length = '';

    const result = {
        text: '',
        pronunciation: void 0,
        from: {
            language: {
                didYouMean: false,
                iso: ''
            },
            text: {
                autoCorrected: false,
                value: '',
                didYouMean: false
            }
        },
        raw: void 0,
        endpoint: 'website'
    };

    try {
        length = /^\d+/.exec(json)[0];
        json = JSON.parse(json.slice(length.length, parseInt(length, 10) + length.length));
        json = JSON.parse(json[0][2]);
        opts.raw && (result.raw = json);
    } catch (e) {
        return result;
    }

    if (json[1][0][0][5] == null) {
        // translation not found, could be a hyperlink or gender-specific translation?
        result.text = json[1][0][0][0];
    } else {
        json[1][0][0][5].forEach(obj => {
            if (obj[0]) {
                result.text += obj[0];
            }
        });
    }
    result.pronunciation = json[1][0][0][1];

    // From language
    if (json[0] && json[0][1] && json[0][1][1]) {
        result.from.language.didYouMean = true;
        result.from.language.iso = json[0][1][1][0];
    } else if (json[1][3] === 'auto') {
        result.from.language.iso = json[2];
    } else {
        result.from.language.iso = json[1][3];
    }

    // Did you mean & autocorrect
    if (json[0] && json[0][1] && json[0][1][0]) {
        const str = json[0][1][0][0][1]
            .replace(/<b>(<i>)?/g, '[')
            .replace(/(<\/i>)?<\/b>/g, ']');

        result.from.text.value = str;

        if (json[0][1][0][2] === 1) {
            result.from.text.autoCorrected = true;
        } else {
            result.from.text.didYouMean = true;
        }
    }

    return result;
};

ENDPOINT_MAP.dictExt = async function(text, opts, gotopts) {
    gotopts = deepClone(gotopts);

    const query = {
        'client': 'dict-chrome-ex',
        'sl': opts.from,
        'tl': opts.to,
        'q': text
    };
    const url = 'https://clients' + (~~(Math.random() * 5) + 1) + '.google.com/translate_a/t?' + querystring.stringify(query);
    gotopts.json = true;
    const { body: res } = await got(url, gotopts);
    return {
        text: res.sentences.map(r => r.trans).join(''),
        pronunciation: res.sentences[res.sentences.length - 1].src_translit,
        from: {
            language: {
                didYouMean: false,
                iso: res.src
            },
            text: {
                autoCorrected: false,
                value: res.sentences.map(r => r.orig).join(''),
                didYouMean: false
            }
        },
        raw: opts.raw && res,
        endpoint: 'dictExt'
    };
};

ENDPOINT_MAP.api = async function(text, opts, gotopts) {
    gotopts = deepClone(gotopts);

    const query = {
        'client': 'gtx',
        'dt': 't',
        'sl': opts.from,
        'tl': opts.to,
        'q': text
    };
    const url = 'https://translate.googleapis.com/translate_a/single?' + querystring.stringify(query);
    gotopts.json = true;

    const { body: res } = await got(url, gotopts);
    return {
        text: res[0].map(r => r[0]).join(''),
        // not supported
        pronunciation: void 0,
        from: {
            language: {
                didYouMean: false,
                iso: res[2]
            },
            text: {
                autoCorrected: false,
                value: res[0].map(r => r[1]).join(''),
                didYouMean: false
            }
        },
        raw: opts.raw && res,
        endpoint: 'api'
    };
};

async function translate(text, opts, gotopts) {
    opts = opts || {};
    gotopts = gotopts || {};

    gotopts.headers = gotopts.headers || {};
    gotopts.headers['user-agent'] = gotopts.headers['User-Agent']
        || gotopts.headers['user-agent']
        || DEFAULT_USER_AGENT;
    delete gotopts.headers['User-Agent'];

    [opts.from, opts.to].forEach(lang => {
        if (lang && !languages.isSupported(lang)) {
            throw new Error('The language \'' + lang + '\' is not supported');
        }
    });

    opts.from = opts.from || 'auto';
    opts.to = opts.to || 'en';
    opts.tld = opts.tld || 'com';
    opts.endpointFallback = opts.endpointFallback == null ? true : !!opts.endpointFallback;

    opts.from = languages.getCode(opts.from);
    opts.to = languages.getCode(opts.to);

    const allEndpoints = Object.keys(ENDPOINT_MAP);
    let endpoints = opts.endpoints;
    if (!endpoints || !endpoints.length || !Array.isArray(endpoints)) {
        endpoints = allEndpoints;
    }
    let arr = [];
    let len = endpoints.length;
    endpoints.forEach(ep => {
        if (!ENDPOINT_MAP[ep]) {
            const err = `unknown endpoint: ${ep}`;
            if (len > 1) {
                console.warn(err);
            } else {
                throw new Error(err);
            }
        } else {
            arr.push(ep);
        }
    });
    len = (endpoints = arr).length;

    let err;

    if (opts.randomEndpoint && len > 1) {
        let idx = ~~(Math.random() * len);
        let endpoint = endpoints[idx];
        try {
            return await ENDPOINT_MAP[endpoint](text, opts, gotopts);
        } catch (e) {
            if (!opts.endpointFallback) {
                throw e;
            }
            err = e;

            let newIdx;
            do {
                newIdx = ~~(Math.random() * len);
            } while(newIdx === idx);

            for (let i = 0; i < len; i++) {
                if (i === idx) {
                    continue;
                }
                console.warn(`failed to translate with the random endpoint '${endpoint}'. Trying the next random endpoint '${endpoint = endpoints[idx = newIdx]}'.`);
                try {
                    return await ENDPOINT_MAP[endpoint](text, opts, gotopts);
                } catch (e) {
                    if (!opts.endpointFallback) {
                        throw e;
                    }
                    err = e;
                }
            }
        }
    } else {
        for (let i = 0, endpoint; i < len; i++) {
            endpoint = endpoints[i];
            try {
                return await ENDPOINT_MAP[endpoint](text, opts, gotopts);
            } catch (e) {
                if (!opts.endpointFallback) {
                    throw e;
                }
                err = e;
                console.warn(`failed to translate with the endpoint '${endpoint}'.${len > 1 ? ' Trying the next endpoint.' : ''}`);
            }
        }
    }

    throw err;
}

module.exports = translate;
module.exports.languages = languages;
