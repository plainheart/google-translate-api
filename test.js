const test = require('ava');
const Configstore = require('configstore');
const translate = require('./index.js');
// const { HttpsProxyAgent } = require('hpagent');

const config = new Configstore('google-translate-api');

test.beforeEach(() => {
    config.clear();
});

['chrome', 'api', 'dictExt', 'website'].forEach(endpoint => {
    test(`translate via endpoint: ${endpoint}`, async t => {
        const res = await translate(
            `你好`,
            { to: 'en', endpointFallback: false, endpoints: [endpoint], randomEndpoint: false, raw: true },
            {
                // agent: {
                //     https: new HttpsProxyAgent({
                //         keepAlive: true,
                //         keepAliveMsecs: 1000,
                //         maxSockets: 256,
                //         maxFreeSockets: 256,
                //         scheduling: 'lifo',
                //         proxy: 'http://127.0.0.1:9633'
                //     })
                // }
            }
        )
        console.log('translate result of the endpoint:', endpoint);
        console.log(JSON.stringify(res, null, 2));
        t.truthy(res.text === 'Hello' || res.text === 'Hello there');
        t.is(res.from, 'zh-CN');
    });
});
