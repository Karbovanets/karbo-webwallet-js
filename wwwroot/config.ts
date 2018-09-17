let global : any = typeof window !== 'undefined' ? window : self;
global.config = {
    apiUrl: typeof window !== 'undefined' && window.location ? window.location.href.substr(0, window.location.href.lastIndexOf('/') + 1) + 'api/' : 'https://wallet.plenteum.com/api/',
    mainnetExplorerUrl: "https://explorer.karbo.io/",
    testnetExplorerUrl: "https://explorer.karbo.io/",
    testnet: false,
    coinUnitPlaces: 12,
    txMinConfirms: 10,         // corresponds to CRYPTONOTE_DEFAULT_TX_SPENDABLE_AGE in Monero
    txCoinbaseMinConfirms: 10, // corresponds to CRYPTONOTE_MINED_MONEY_UNLOCK_WINDOW in Monero
    addressPrefix: 111,
    integratedAddressPrefix: 0,
    addressPrefixTestnet: 0,
    integratedAddressPrefixTestnet: 0,
    subAddressPrefix: 0,
    subAddressPrefixTestnet: 0,
    feePerKB: new JSBigInt('100'),//20^10 - for testnet its not used, as fee is dynamic.
    dustThreshold: new JSBigInt('1'),//10^10 used for choosing outputs/change - we decompose all the way down if the receiver wants now regardless of threshold
    defaultMixin: 7, // default value mixin
    idleTimeout: 30,
    idleWarningDuration: 20,

    coinSymbol: 'KRB',
    openAliasPrefix: "krb1",
    coinName: 'karbowanec',
    coinUriPrefix: 'karbowanec:',
    avgBlockTime: 30,
    maxBlockNumber: 500000000,
};