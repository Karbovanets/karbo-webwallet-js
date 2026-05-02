/*
 * Copyright (c) 2018, Gnock
 * Copyright (c) 2018, The Masari Project
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
define(["require", "exports", "./Wallet", "./CoinUri", "./Storage"], function (require, exports, Wallet_1, CoinUri_1, Storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WalletRepository = void 0;
    var WalletRepository = /** @class */ (function () {
        function WalletRepository() {
        }
        WalletRepository.hasOneStored = function () {
            return WalletRepository.getWallets().then(function (wallets) {
                return wallets.length > 0;
            });
        };
        WalletRepository.createWalletId = function () {
            var bytes;
            if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
                bytes = new Uint8Array(16);
                crypto.getRandomValues(bytes);
            }
            else {
                bytes = nacl.randomBytes(16);
            }
            var hex = '';
            for (var i = 0; i < bytes.length; ++i) {
                var part = bytes[i].toString(16);
                if (part.length === 1)
                    part = '0' + part;
                hex += part;
            }
            return 'wallet_' + hex;
        };
        WalletRepository.getCurrentWalletId = function () {
            return WalletRepository.currentWalletId;
        };
        WalletRepository.setCurrentWalletId = function (walletId) {
            WalletRepository.currentWalletId = walletId;
        };
        WalletRepository.emptyVault = function () {
            return {
                version: 2,
                activeWalletId: null,
                wallets: []
            };
        };
        WalletRepository.hasElectronStorage = function () {
            return typeof window !== 'undefined' && typeof window.karboStorage !== 'undefined';
        };
        WalletRepository.normalizeWalletRecord = function (rawRecord) {
            if (rawRecord === null || typeof rawRecord !== 'object' || typeof rawRecord.id !== 'string')
                return null;
            var now = new Date().toISOString();
            return {
                id: rawRecord.id,
                name: typeof rawRecord.name === 'string' && rawRecord.name.trim() !== '' ? rawRecord.name : 'Wallet',
                address: typeof rawRecord.address === 'string' ? rawRecord.address : '',
                encryptedWalletData: typeof rawRecord.encryptedWalletData === 'string' ? rawRecord.encryptedWalletData : undefined,
                createdAt: typeof rawRecord.createdAt === 'string' ? rawRecord.createdAt : now,
                updatedAt: typeof rawRecord.updatedAt === 'string' ? rawRecord.updatedAt : now,
                lastOpenedAt: typeof rawRecord.lastOpenedAt === 'string' ? rawRecord.lastOpenedAt : null,
                backupConfirmed: rawRecord.backupConfirmed === true
            };
        };
        WalletRepository.normalizeVault = function (rawVault) {
            if (rawVault === null || typeof rawVault === 'undefined')
                return null;
            if (typeof rawVault === 'string') {
                try {
                    rawVault = JSON.parse(rawVault);
                }
                catch (e) {
                    return null;
                }
            }
            if (typeof rawVault !== 'object' || !Array.isArray(rawVault.wallets))
                return null;
            var vault = WalletRepository.emptyVault();
            vault.activeWalletId = typeof rawVault.activeWalletId === 'string' ? rawVault.activeWalletId : null;
            for (var _i = 0, _a = rawVault.wallets; _i < _a.length; _i++) {
                var rawRecord = _a[_i];
                var record = WalletRepository.normalizeWalletRecord(rawRecord);
                if (record !== null)
                    vault.wallets.push(record);
            }
            if (vault.activeWalletId !== null && WalletRepository.findRecord(vault, vault.activeWalletId) === null)
                vault.activeWalletId = vault.wallets.length > 0 ? vault.wallets[0].id : null;
            return vault;
        };
        WalletRepository.loadVault = function () {
            if (WalletRepository.hasElectronStorage() && window.karboStorage) {
                return window.karboStorage.listWallets().then(function (rawVault) {
                    return WalletRepository.normalizeVault(rawVault);
                });
            }
            return Storage_1.Storage.getItem(WalletRepository.VAULT_STORAGE_KEY, null).then(function (rawVault) {
                return WalletRepository.normalizeVault(rawVault);
            });
        };
        WalletRepository.writeVault = function (vault) {
            if (WalletRepository.hasElectronStorage() && window.karboStorage) {
                return window.karboStorage.saveVault(vault);
            }
            return Storage_1.Storage.setItem(WalletRepository.VAULT_STORAGE_KEY, JSON.stringify(vault));
        };
        WalletRepository.ensureVault = function () {
            return WalletRepository.loadVault().then(function (existingVault) {
                if (existingVault !== null)
                    return existingVault;
                return Storage_1.Storage.getItem(WalletRepository.LEGACY_WALLET_STORAGE_KEY, null).then(function (legacyWallet) {
                    if (legacyWallet !== null) {
                        var now = new Date().toISOString();
                        var walletId = WalletRepository.createWalletId();
                        var migratedVault_1 = {
                            version: 2,
                            activeWalletId: walletId,
                            wallets: [{
                                    id: walletId,
                                    name: 'Wallet 1',
                                    address: '',
                                    encryptedWalletData: legacyWallet,
                                    createdAt: now,
                                    updatedAt: now,
                                    lastOpenedAt: null,
                                    backupConfirmed: true
                                }]
                        };
                        return WalletRepository.writeVault(migratedVault_1).then(function () {
                            return Storage_1.Storage.setItem(WalletRepository.MIGRATION_NOTICE_KEY, 'walletVault.migrationNoticeContent').then(function () {
                                return migratedVault_1;
                            });
                        });
                    }
                    var emptyVault = WalletRepository.emptyVault();
                    return WalletRepository.writeVault(emptyVault).then(function () {
                        return emptyVault;
                    });
                });
            });
        };
        WalletRepository.consumeMigrationNotice = function () {
            return Storage_1.Storage.getItem(WalletRepository.MIGRATION_NOTICE_KEY, null).then(function (message) {
                if (message === null)
                    return null;
                return Storage_1.Storage.remove(WalletRepository.MIGRATION_NOTICE_KEY).then(function () {
                    return message;
                });
            });
        };
        WalletRepository.getWallets = function () {
            return WalletRepository.ensureVault().then(function (vault) {
                return vault.wallets.slice();
            });
        };
        WalletRepository.getActiveWalletId = function () {
            return WalletRepository.ensureVault().then(function (vault) {
                return vault.activeWalletId;
            });
        };
        WalletRepository.setActiveWalletId = function (walletId) {
            return WalletRepository.ensureVault().then(function (vault) {
                if (walletId !== null && WalletRepository.findRecord(vault, walletId) === null)
                    throw 'missing_wallet';
                vault.activeWalletId = walletId;
                WalletRepository.currentWalletId = walletId;
                if (WalletRepository.hasElectronStorage() && window.karboStorage)
                    return window.karboStorage.setActiveWalletId(walletId);
                return WalletRepository.writeVault(vault);
            });
        };
        WalletRepository.findRecord = function (vault, walletId) {
            for (var _i = 0, _a = vault.wallets; _i < _a.length; _i++) {
                var wallet = _a[_i];
                if (wallet.id === walletId)
                    return wallet;
            }
            return null;
        };
        WalletRepository.getNextWalletName = function (vault) {
            return 'Wallet ' + (vault.wallets.length + 1);
        };
        WalletRepository.resolveWalletId = function (vault, walletId) {
            if (typeof walletId === 'string' && WalletRepository.findRecord(vault, walletId) !== null)
                return walletId;
            if (WalletRepository.currentWalletId !== null && WalletRepository.findRecord(vault, WalletRepository.currentWalletId) !== null)
                return WalletRepository.currentWalletId;
            if (vault.activeWalletId !== null && WalletRepository.findRecord(vault, vault.activeWalletId) !== null)
                return vault.activeWalletId;
            if (vault.wallets.length > 0)
                return vault.wallets[0].id;
            return null;
        };
        WalletRepository.getEncryptedWalletData = function (record) {
            if (typeof record.encryptedWalletData === 'string')
                return Promise.resolve(record.encryptedWalletData);
            if (WalletRepository.hasElectronStorage() && window.karboStorage)
                return window.karboStorage.loadWallet(record.id);
            return Promise.resolve(null);
        };
        WalletRepository.decodeWithPassword = function (rawWallet, password) {
            if (password.length > 32)
                password = password.substr(0, 32);
            if (password.length < 32) {
                password = ('00000000000000000000000000000000' + password).slice(-32);
            }
            var privKey = new TextEncoder("utf8").encode(password);
            // Fix cyrillic (non-latin) passwords
            if (privKey.length > 32) {
                privKey = privKey.slice(-32);
            }
            //console.log('open wallet with nonce', rawWallet.nonce);
            var nonce = new TextEncoder("utf8").encode(rawWallet.nonce);
            var decodedRawWallet = null;
            //detect if old type or new type of wallet
            if (typeof rawWallet.data !== 'undefined') { //RawFullyEncryptedWallet
                //console.log('new wallet format');
                var rawFullyEncrypted = rawWallet;
                var encrypted = new Uint8Array(rawFullyEncrypted.data);
                var decrypted = nacl.secretbox.open(encrypted, nonce, privKey);
                if (decrypted === null)
                    return null;
                try {
                    decodedRawWallet = JSON.parse(new TextDecoder("utf8").decode(decrypted));
                }
                catch (e) {
                    decodedRawWallet = null;
                }
            }
            else { //RawWallet
                //console.log('old wallet format');
                var oldRawWallet = rawWallet;
                var encrypted = new Uint8Array(oldRawWallet.encryptedKeys);
                var decrypted = nacl.secretbox.open(encrypted, nonce, privKey);
                if (decrypted === null)
                    return null;
                oldRawWallet.encryptedKeys = new TextDecoder("utf8").decode(decrypted);
                decodedRawWallet = oldRawWallet;
            }
            if (decodedRawWallet !== null) {
                var wallet = Wallet_1.Wallet.loadFromRaw(decodedRawWallet);
                if (wallet.coinAddressPrefix !== config.addressPrefix)
                    return null;
                return wallet;
            }
            return null;
        };
        WalletRepository.getLocalWalletWithPassword = function (password, walletId, markOpened) {
            var _this = this;
            if (markOpened === void 0) { markOpened = true; }
            return WalletRepository.ensureVault().then(function (vault) {
                var resolvedWalletId = WalletRepository.resolveWalletId(vault, walletId);
                if (resolvedWalletId === null)
                    return null;
                var record = WalletRepository.findRecord(vault, resolvedWalletId);
                if (record === null)
                    return null;
                return WalletRepository.getEncryptedWalletData(record).then(function (encryptedWalletData) {
                    if (encryptedWalletData === null)
                        return null;
                    var wallet = _this.decodeWithPassword(JSON.parse(encryptedWalletData), password);
                    if (wallet !== null) {
                        if (!markOpened)
                            return wallet;
                        var now = new Date().toISOString();
                        record.address = wallet.getPublicAddress();
                        record.lastOpenedAt = now;
                        record.updatedAt = now;
                        vault.activeWalletId = resolvedWalletId;
                        WalletRepository.currentWalletId = resolvedWalletId;
                        return WalletRepository.writeVault(vault).then(function () {
                            return wallet;
                        });
                    }
                    return null;
                });
            });
        };
        WalletRepository.save = function (wallet, password, walletId, walletName, backupConfirmed, makeActive) {
            var _this = this;
            if (backupConfirmed === void 0) { backupConfirmed = true; }
            if (makeActive === void 0) { makeActive = true; }
            return WalletRepository.ensureVault().then(function (vault) {
                var resolvedWalletId = WalletRepository.resolveWalletId(vault, walletId);
                if (resolvedWalletId === null || (typeof walletId === 'string' && WalletRepository.findRecord(vault, walletId) === null))
                    resolvedWalletId = typeof walletId === 'string' ? walletId : WalletRepository.createWalletId();
                var existingRecord = WalletRepository.findRecord(vault, resolvedWalletId);
                var now = new Date().toISOString();
                var encryptedWalletData = JSON.stringify(_this.getEncrypted(wallet, password));
                var address = wallet.getPublicAddress();
                if (existingRecord === null) {
                    existingRecord = {
                        id: resolvedWalletId,
                        name: walletName !== null && typeof walletName === 'string' && walletName.trim() !== '' ? walletName.trim() : WalletRepository.getNextWalletName(vault),
                        address: address,
                        encryptedWalletData: encryptedWalletData,
                        createdAt: now,
                        updatedAt: now,
                        lastOpenedAt: now,
                        backupConfirmed: backupConfirmed
                    };
                    vault.wallets.push(existingRecord);
                }
                else {
                    existingRecord.address = address;
                    existingRecord.encryptedWalletData = encryptedWalletData;
                    existingRecord.updatedAt = now;
                    existingRecord.backupConfirmed = existingRecord.backupConfirmed || backupConfirmed;
                    if (typeof walletName === 'string' && walletName.trim() !== '')
                        existingRecord.name = walletName.trim();
                }
                if (makeActive && (WalletRepository.currentWalletId === null || WalletRepository.currentWalletId === resolvedWalletId)) {
                    vault.activeWalletId = resolvedWalletId;
                    WalletRepository.currentWalletId = resolvedWalletId;
                }
                return WalletRepository.writeVault(vault);
            });
        };
        WalletRepository.getEncrypted = function (wallet, password) {
            if (password.length > 32)
                password = password.substr(0, 32);
            if (password.length < 32) {
                password = ('00000000000000000000000000000000' + password).slice(-32);
            }
            var privKey = new TextEncoder("utf8").encode(password);
            // Fix cyrillic (non-latin) passwords
            if (privKey.length > 32) {
                privKey = privKey.slice(-32);
            }
            var rawNonce = nacl.util.encodeBase64(nacl.randomBytes(16));
            var nonce = new TextEncoder("utf8").encode(rawNonce);
            var rawWallet = wallet.exportToRaw();
            var uint8EncryptedContent = new TextEncoder("utf8").encode(JSON.stringify(rawWallet));
            var encrypted = nacl.secretbox(uint8EncryptedContent, nonce, privKey);
            var tabEncrypted = [];
            for (var i = 0; i < encrypted.length; ++i) {
                tabEncrypted.push(encrypted[i]);
            }
            var fullEncryptedWallet = {
                data: tabEncrypted,
                nonce: rawNonce
            };
            return fullEncryptedWallet;
        };
        WalletRepository.renameWallet = function (walletId, name) {
            var cleanName = name.trim();
            if (cleanName === '')
                cleanName = 'Wallet';
            return WalletRepository.ensureVault().then(function (vault) {
                var record = WalletRepository.findRecord(vault, walletId);
                if (record === null)
                    throw 'missing_wallet';
                record.name = cleanName;
                record.updatedAt = new Date().toISOString();
                if (WalletRepository.hasElectronStorage() && window.karboStorage)
                    return window.karboStorage.renameWallet(walletId, cleanName);
                return WalletRepository.writeVault(vault);
            });
        };
        WalletRepository.getEncryptedWalletBackup = function (walletId) {
            return WalletRepository.ensureVault().then(function (vault) {
                var record = WalletRepository.findRecord(vault, walletId);
                if (record === null)
                    return null;
                return WalletRepository.getEncryptedWalletData(record);
            });
        };
        WalletRepository.deleteLocalCopy = function (walletId) {
            return WalletRepository.ensureVault().then(function (vault) {
                var resolvedWalletId = WalletRepository.resolveWalletId(vault, walletId);
                if (resolvedWalletId === null)
                    return Promise.resolve();
                var filteredWallets = [];
                for (var _i = 0, _a = vault.wallets; _i < _a.length; _i++) {
                    var record = _a[_i];
                    if (record.id !== resolvedWalletId)
                        filteredWallets.push(record);
                }
                vault.wallets = filteredWallets;
                if (vault.activeWalletId === resolvedWalletId)
                    vault.activeWalletId = vault.wallets.length > 0 ? vault.wallets[0].id : null;
                if (WalletRepository.currentWalletId === resolvedWalletId)
                    WalletRepository.currentWalletId = null;
                if (WalletRepository.hasElectronStorage() && window.karboStorage)
                    return window.karboStorage.deleteWallet(resolvedWalletId);
                return WalletRepository.writeVault(vault);
            });
        };
        WalletRepository.downloadEncryptedPdf = function (wallet) {
            if (wallet.keys.priv.spend === '')
                throw 'missing_spend';
            var coinWalletUri = CoinUri_1.CoinUri.encodeWalletKeys(wallet.getPublicAddress(), wallet.keys.priv.spend, wallet.keys.priv.view, wallet.creationHeight);
            var publicQrCode = kjua({
                render: 'canvas',
                text: wallet.getPublicAddress(),
                size: 300,
            });
            var privateSpendQrCode = kjua({
                render: 'canvas',
                text: coinWalletUri,
                size: 300,
            });
            var doc = new jsPDF('landscape');
            //creating background
            doc.setFillColor(48, 70, 108);
            doc.rect(0, 0, 297, 210, 'F');
            //white blocks
            doc.setFillColor(255, 255, 255);
            doc.rect(108, 10, 80, 80, 'F');
            doc.rect(10, 115, 80, 80, 'F');
            //blue blocks
            doc.setFillColor(0, 160, 227);
            doc.rect(108, 115, 80, 80, 'F');
            //blue background for texts
            doc.setFillColor(0, 160, 227);
            doc.rect(108, 15, 80, 20, 'F');
            doc.rect(10, 120, 80, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(30);
            doc.text(15, 135, "Public address");
            doc.text(123, 30, "Private key");
            //lines
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(1);
            doc.line(99, 0, 99, 210);
            doc.line(198, 0, 198, 210);
            doc.line(0, 105, 297, 105);
            //adding qr codes
            doc.addImage(publicQrCode.toDataURL(), 'JPEG', 28, 145, 45, 45);
            doc.addImage(privateSpendQrCode.toDataURL(), 'JPEG', 126, 40, 45, 45);
            //wallet help
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text(110, 120, "To deposit funds to this paper wallet, send ");
            doc.text(110, 125, "Karbo to the public address");
            doc.text(110, 135, "DO NOT REVEAL THE PRIVATE KEY");
            //adding karbo logo
            var c = document.getElementById('canvasExport');
            if (c !== null) {
                var ctx = c.getContext("2d");
                var img = document.getElementById("verticalLogo");
                if (ctx !== null && img !== null) {
                    c.width = img.width;
                    c.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    var ratio = img.width / 45;
                    var smallHeight = img.height / ratio;
                    doc.addImage(c.toDataURL(), 'JPEG', 224, 106 + (100 - smallHeight) / 2, 45, smallHeight);
                }
            }
            try {
                doc.save('keys.pdf');
            }
            catch (e) {
                alert('Error ' + e);
            }
        };
        WalletRepository.VAULT_STORAGE_KEY = 'wallet-vault';
        WalletRepository.LEGACY_WALLET_STORAGE_KEY = 'wallet';
        WalletRepository.MIGRATION_NOTICE_KEY = 'wallet-vault-migration-notice';
        WalletRepository.currentWalletId = null;
        return WalletRepository;
    }());
    exports.WalletRepository = WalletRepository;
});
