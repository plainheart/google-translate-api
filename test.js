const test = require('ava');
const Configstore = require('configstore');
const languages = require('./languages.js');
const translate = require('./index.js');
// const { HttpsProxyAgent } = require('hpagent');

const config = new Configstore('google-translate-api');

test.beforeEach(() => {
    config.clear();
});

test('translate', async t => {
    const res = await translate(
        `你好`,
        { to: 'en', endpointFallback: true, endpoints: [], randomEndpoint: true, raw: true },
        // {
        //     agent: {
        //         https: new HttpsProxyAgent({
        //             keepAlive: true,
        //             keepAliveMsecs: 1000,
        //             maxSockets: 256,
        //             maxFreeSockets: 256,
        //             scheduling: 'lifo',
        //             proxy: 'http://127.0.0.1:9633'
        //         })
        //     }
        // }
    )
    t.is(res.text, 'Hello there');
    t.false(res.from.language.didYouMean);
    t.is(res.from.language.iso, 'zh-CN');
    t.false(res.from.text.autoCorrected);
    t.false(res.from.text.didYouMean);
})

test('test get zh code', t => {
    t.false(languages.getCode('zh'));
});

test('test get zh-CN code', t => {
    t.is(languages.getCode('zh-CN'), 'zh-CN');
});

test('test get zh-cn code', t => {
    t.false(languages.getCode('zh-cn'));
});

test('test get zh-TW code', t => {
    t.is(languages.getCode('zh-TW'), 'zh-TW');
});

test('test get zh-tw code', t => {
    t.false(languages.getCode('zh-tw'));
});

test('test zh unsupported', t => {
    t.false(languages.isSupported('zh'));
});

test('test zh-CN supported', t => {
    t.true(languages.isSupported('zh-CN'));
});

test('test zh-cn unsupported', t => {
    t.false(languages.isSupported('zh-cn'));
});

test('test zh-TW supported', t => {
    t.true(languages.isSupported('zh-TW'));
});

test('test zh-tw unsupported', t => {
    t.false(languages.isSupported('zh-tw'));
});

test('test zh-CN supported – by name', t => {
    t.true(languages.isSupported('chinese (simplified)'));
});
