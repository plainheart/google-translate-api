# google-translate-api
[![Actions Status](https://github.com/plainheart/google-translate-api/actions/workflows/autotests.yml/badge.svg)](https://github.com/plainheart/google-translate-api/actions/workflows/autotests.yml)
[![NPM version](https://img.shields.io/npm/v/@plainheart/google-translate-api.svg)](https://www.npmjs.com/package/@plainheart/google-translate-api)
[![NPM Downloads](https://img.shields.io/npm/dm/@plainheart/google-translate-api.svg)](https://npmcharts.com/compare/@plainheart/google-translate-api?minimal=true)
[![License](https://img.shields.io/npm/l/@plainheart/google-translate-api.svg)](https://www.npmjs.com/package/@plainheart/google-translate-api)

A **free** API for Google Translate with multiple endpoints for Node.js.

## Features 

- Auto language detection
- Fast and reliable – it uses the same servers that [translate.google.com](https://translate.google.com) uses
- Multiple endpoints

## Why this fork?
This fork of original [vitalets/google-translate-api](https://github.com/vitalets/google-translate-api) contains several improvements:

- Added support for specifying the endpoints to be used.
- Added support for random endpoint and endpoint fallback.  
- Provided multiple endpoints: `chrome`, `api`, `dictExt`, `website`.

## Install 

```
npm install @plainheart/google-translate-api
```

## Usage

From automatic language detection to English:

```js
const translate = require('@plainheart/google-translate-api');

translate('Ik spreek Engels', { to: 'en' }).then(res => {
    console.log(res.text);
    //=> I speak English
    console.log(res.from);
    //=> nl
}).catch(err => {
    console.error(err);
});
```

> Please note that different endpoints may have a limit to the maximum text length for a single translation call. 
> In case of longer text you should split it on chunks, see [#20](https://github.com/vitalets/google-translate-api/issues/20).

You can also add languages in the code and use them in the translation:

``` js
translate = require('google-translate-api');
translate.languages['sr-Latn'] = 'Serbian Latin';

translate('translator', { to: 'sr-Latn' }).then(res => ...);
```

## Proxy
Google Translate has request limits. If too many requests are made, you can either end up with a 429 or a 503 error.
You can use **proxy** to bypass them:
```js
const tunnel = require('tunnel');

translate('Ik spreek Engels', { to: 'en' }, {
    agent: tunnel.httpsOverHttp({
        proxy: { 
            host: 'whateverhost',
            proxyAuth: 'user:pass',
            port: '8080',
            headers: {
                'User-Agent': 'Node'
            }
        }
    }
)}).then(res => {
    // do something
}).catch(err => {
    console.error(err);
});
```

## Does it work from web page context?
No. `https://translate.google.com` does not provide [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) http headers allowing access from other domains.

## API

### translate(text, [options], [gotOptions])

#### text

Type: `string`

The text to be translated

#### options

Type: `object`

##### from
Type: `string` Default: `auto`

The `text` language. Must be `auto` or one of the codes/names (not case sensitive) contained in [languages.js](https://github.com/plainheart/google-translate-api/blob/master/languages.js)

##### to
Type: `string` Default: `en`

The language in which the text should be translated. Must be one of the codes/names (case sensitive!) contained in [languages.js](https://github.com/plainheart/google-translate-api/blob/master/languages.js).

##### raw
Type: `boolean` Default: `false`

If `true`, the returned object will have a `raw` property with the raw response (`string`) from Google Translate.

##### tld
Type: `string` Default: `"com"`

TLD for Google translate host to be used in API calls: `https://translate.google.{tld}`.

Note that this option only works for `website` endpoint.

##### endpoints
Type: `Array<string>` Default: `['chrome' | 'api' | 'dictExt' | 'website']`

The translation endpoints. Can be `'chrome' | 'api' | 'dictExt' | 'website'`.

##### randomEndpoint
Type: `boolean` Default: `false`

Whether to use a random endpoint.

##### endpointFallback
Type: `boolean` Default: `true`

If `true`, will try the next endpoint automatically when current endpoint failed.

#### gotOptions
Type: `object`

The got options: https://github.com/sindresorhus/got/tree/v11.8.6#options

### Returns an `object`:
- `text` *(string)* - The translated text.
- `from` *(string)* - The detected language code.
- `raw` *(string|object)* - If `options.raw` is true, the raw response from Google Translate servers.
- `endpoint` *(string)* - The used service endpoint.

## License
MIT © [Vitaliy Potapov](https://github.com/vitalets), forked and maintained by [plainheart](https://github.com/plainheart).
