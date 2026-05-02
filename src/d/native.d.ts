//https://github.com/chariotsolutions/phonegap-nfc/blob/master/www/phonegap-nfc.js

interface Window {
	native:boolean;
	karboStorage?: {
		listWallets(): Promise<any>;
		loadWallet(walletId: string): Promise<string|null>;
		saveWallet(walletId: string, encryptedBlob: string, metadata: any, activeWalletId: string|null): Promise<void>;
		deleteWallet(walletId: string): Promise<void>;
		renameWallet(walletId: string, name: string): Promise<void>;
		setActiveWalletId(walletId: string|null): Promise<void>;
		saveVault(vault: any): Promise<void>;
		exportWallet(walletId: string): Promise<string|null>;
	};
}
