let global : any = typeof window !== 'undefined' ? window : self;
global.config = {
    apiUrl: typeof window !== 'undefined' && window.location ? window.location.href.substr(0, window.location.href.lastIndexOf('/') + 1) + 'api/' : 'https://wallet.plenteum.com/api/',
	mainnetExplorerUrl: "https://explorer.karbo.io/",
    testnetExplorerUrl: "https://explorer.karbo.io/",
	testnet: false,
    coinUnitPlaces: 12,
    coinDisplayUnitPlaces: 2,
	txMinConfirms: 10,         
	txCoinbaseMinConfirms: 10, 
	addressPrefix: 111,
	integratedAddressPrefix: 0,
	addressPrefixTestnet: 0,
	integratedAddressPrefixTestnet: 0,
	subAddressPrefix: 0,
	subAddressPrefixTestnet: 0,
	feePerKB: new JSBigInt('1000000'), //for testnet its not used, as fee is dynamic.
	dustThreshold: new JSBigInt('100000000'),//used for choosing outputs/change - we decompose all the way down if the receiver wants now regardless of threshold
	defaultMixin: 3, // default value mixins
	idleTimeout: 30,
	idleWarningDuration: 20,
	coinSymbol: 'KRB',
	coinName: 'Karbo',
	coinUriPrefix: 'karbowanec:',
	avgBlockTime: 240,
	maxBlockNumber: 500000000,
};