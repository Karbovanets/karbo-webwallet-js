"use strict";
//export {};
var myGlobal = typeof window !== 'undefined' ? window : self;
myGlobal.config = {
    debug: false,
    nodeList: [
        "https://karbo.club:32448/",
        "https://node.karbo.org:32448/",
        "https://node.karbo.io:32448/"
    ],
    apiUrl: [
        "https://node.karbo.io:32448/"
    ],
    nodeUrl: "https://node.karbo.org:32448/",
    mainnetExplorerUrl: "http://explorer.karbowanec.com/",
    mainnetExplorerUrlHash: "http://explorer.karbowanec.com/?hash={ID}#blockchain_transaction",
    mainnetExplorerUrlBlock: "http://explorer.karbowanec.com/?hash={ID}#blockchain_block",
    testnetExplorerUrl: "http://testnet.karbo.org/",
    testnetExplorerUrlHash: "http://testnet.karbo.org/?hash={ID}#blockchain_transaction",
    testnetExplorerUrlBlock: "http://testnet.karbo.org/?hash={ID}#blockchain_block",
    testnet: false,
    coinUnitPlaces: 12,
    coinDisplayUnitPlaces: 2,
    txMinConfirms: 5,
    txCoinbaseMinConfirms: 10,
    addressPrefix: 111,
    integratedAddressPrefix: 112,
    addressPrefixTestnet: 111,
    integratedAddressPrefixTestnet: 112,
    subAddressPrefix: 113,
    subAddressPrefixTestnet: 113,
    coinFee: new JSBigInt('10000000000'),
    dustThreshold: new JSBigInt('100000000'),
    defaultMixin: 3,
    syncBlockCount: 1000,
    coinSymbol: 'KRB',
    openAliasPrefix: "krb",
    coinName: 'Karbo',
    coinUriPrefix: 'karbowanec:',
    avgBlockTime: 240,
    maxBlockNumber: 500000000,
};
var randInt = Math.floor(Math.random() * Math.floor(config.nodeList.length));
config.nodeUrl = config.nodeList[randInt];
function logDebugMsg() {
    var data = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        data[_i] = arguments[_i];
    }
    if (config.debug) {
        if (data.length > 1) {
            console.log(data[0], data.slice(1));
        }
        else {
            console.log(data[0]);
        }
    }
}
// log debug messages if debug is set to true
myGlobal.logDebugMsg = logDebugMsg;
