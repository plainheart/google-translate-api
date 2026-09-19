import {type Options as GotOptions} from 'got';

export = googleTranslateApi;

declare function googleTranslateApi(
  text: string,
  options?: googleTranslateApi.IOptions,
  gotOptions?: GotOptions
): Promise<googleTranslateApi.ITranslateResponse>;

declare namespace googleTranslateApi {
  export type ENDPOINT = 'chrome' | 'api' | 'dictExt' | 'website';

  export interface IOptions {
    from?: string;
    to?: string;
    raw?: boolean;
    tld?: string;
    endpoints?: ENDPOINT[];
    randomEndpoint?: boolean;
    endpointFallback?: boolean;
  }

  export interface ITranslateResponse {
    text: string;
    from?: keyof typeof languages;
    raw?: string | object;
    endpoint: ENDPOINT;
  }

  export enum languages {
    auto = "Automatic",
    af = "Afrikaans",  
    sq = "Albanian",   
    am = "Amharic",    
    ar = "Arabic",     
    hy = "Armenian",   
    az = "Azerbaijani",
    eu = "Basque",     
    be = "Belarusian", 
    bn = "Bengali",    
    bs = "Bosnian",
    bg = "Bulgarian",
    ca = "Catalan",
    ceb = "Cebuano",
    ny = "Chichewa",
    "zh-CN" = "Chinese (Simplified)",
    "zh-TW" = "Chinese (Traditional)",
    co = "Corsican",
    hr = "Croatian",
    cs = "Czech",
    da = "Danish",
    nl = "Dutch",
    en = "English",
    eo = "Esperanto",
    et = "Estonian",
    tl = "Filipino",
    fi = "Finnish",
    fr = "French",
    fy = "Frisian",
    gl = "Galician",
    ka = "Georgian",
    de = "German",
    el = "Greek",
    gu = "Gujarati",
    ht = "Haitian Creole",
    ha = "Hausa",
    haw = "Hawaiian",
    he = "Hebrew",
    iw = "Hebrew",
    hi = "Hindi",
    hmn = "Hmong",
    hu = "Hungarian",
    is = "Icelandic",
    ig = "Igbo",
    id = "Indonesian",
    ga = "Irish",
    it = "Italian",
    ja = "Japanese",
    jw = "Javanese",
    kn = "Kannada",
    kk = "Kazakh",
    km = "Khmer",
    rw = "Kinyarwanda",
    ko = "Korean",
    ku = "Kurdish (Kurmanji)",
    ckb = "Kurdish (Sorani)",
    ky = "Kyrgyz",
    lo = "Lao",
    la = "Latin",
    lv = "Latvian",
    lt = "Lithuanian",
    lb = "Luxembourgish",
    mk = "Macedonian",
    mg = "Malagasy",
    ms = "Malay",
    ml = "Malayalam",
    mt = "Maltese",
    mi = "Maori",
    mr = "Marathi",
    mn = "Mongolian",
    my = "Myanmar (Burmese)",
    ne = "Nepali",
    no = "Norwegian",
    or = "Odia (Oriya)",
    ps = "Pashto",
    fa = "Persian",
    pl = "Polish",
    pt = "Portuguese",
    pa = "Punjabi",
    ro = "Romanian",
    ru = "Russian",
    sm = "Samoan",
    gd = "Scots Gaelic",
    sr = "Serbian",
    st = "Sesotho",
    sn = "Shona",
    sd = "Sindhi",
    si = "Sinhala",
    sk = "Slovak",
    sl = "Slovenian",
    so = "Somali",
    es = "Spanish",
    su = "Sundanese",
    sw = "Swahili",
    sv = "Swedish",
    tg = "Tajik",
    ta = "Tamil",
    tt = "Tatar",
    te = "Telugu",
    th = "Thai",
    tr = "Turkish",
    tk = "Turkmen",
    uk = "Ukrainian",
    ur = "Urdu",
    ug = "Uyghur",
    uz = "Uzbek",
    vi = "Vietnamese",
    cy = "Welsh",
    xh = "Xhosa",
    yi = "Yiddish",
    yo = "Yoruba",
    zu = "Zulu"
  }

  namespace languages {
    /**
     * Returns the ISO 639-1 code of the desiredLang – if it is supported by Google Translate
     * @param desiredLang – the name or the code(case sensitive) of the desired language
     * @returns The ISO 639-1 code of the language or false if the language is not supported
     */
    function getCode(desiredLang: string): string | boolean;

    /**
     * Returns true if the desiredLang is supported by Google Translate and false otherwise
     * @param desiredLang – the ISO 639-1 code or the name of the desired language
     */
    function isSupported(desiredLang: string): boolean;
  }
}
