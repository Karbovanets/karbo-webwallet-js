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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "../model/WalletRepository", "../lib/numbersLab/DependencyInjector", "../lib/numbersLab/VueAnnotate", "../lib/numbersLab/DestructableView", "../model/Wallet", "../model/AppState", "../model/Storage"], function (require, exports, WalletRepository_1, DependencyInjector_1, VueAnnotate_1, DestructableView_1, Wallet_1, AppState_1, Storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IndexView = /** @class */ (function (_super) {
        __extends(IndexView, _super);
        function IndexView(container) {
            var _this = _super.call(this, container) || this;
            _this.isWalletLoaded = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false) !== null;
            _this.refreshWallets();
            _this.refreshStorageProtection();
            WalletRepository_1.WalletRepository.consumeMigrationNotice().then(function (message) {
                if (message !== null) {
                    swal({
                        type: 'info',
                        title: i18n.t('walletVault.migrationNoticeTitle'),
                        text: _this.translateMigrationNotice(message),
                        confirmButtonText: i18n.t('global.invalidPasswordModal.confirmText')
                    });
                }
            });
            if (_this.isWalletLoaded)
                AppState_1.AppState.enableLeftMenu();
            else
                AppState_1.AppState.disableLeftMenu();
            return _this;
        }
        IndexView.prototype.destruct = function () {
            return _super.prototype.destruct.call(this);
        };
        IndexView.prototype.refreshWallets = function () {
            var _this = this;
            WalletRepository_1.WalletRepository.getWallets().then(function (wallets) {
                _this.wallets = wallets;
                _this.hasLocalWallet = wallets.length > 0;
                var currentWalletId = WalletRepository_1.WalletRepository.getCurrentWalletId();
                _this.activeWalletId = currentWalletId === null ? '' : currentWalletId;
            });
        };
        IndexView.prototype.refreshStorageProtection = function () {
            var _this = this;
            Storage_1.Storage.requestPersistentStorage().then(function (status) {
                _this.storageProtectionStatus = status;
                if (status === 'enabled')
                    _this.storageProtectionKey = 'walletVault.storageStatus.enabled';
                else if (status === 'not_available')
                    _this.storageProtectionKey = 'walletVault.storageStatus.notAvailable';
                else
                    _this.storageProtectionKey = 'walletVault.storageStatus.notGranted';
            });
        };
        IndexView.prototype.loadWallet = function (walletId) {
            AppState_1.AppState.askUserOpenWallet(true, walletId);
        };
        IndexView.prototype.renameWallet = function (wallet) {
            var _this = this;
            var options = {
                title: i18n.t('walletVault.renameModal.title'),
                input: 'text',
                inputValue: wallet.name,
                showCancelButton: true,
                confirmButtonText: i18n.t('walletVault.renameModal.confirmText'),
                cancelButtonText: i18n.t('global.openWalletModal.cancelText')
            };
            swal(options).then(function (result) {
                if (result.value) {
                    WalletRepository_1.WalletRepository.renameWallet(wallet.id, result.value).then(function () {
                        _this.refreshWallets();
                    });
                }
            });
        };
        IndexView.prototype.exportWallet = function (wallet) {
            var _this = this;
            swal({
                title: i18n.t('global.openWalletModal.title'),
                input: 'password',
                showCancelButton: true,
                confirmButtonText: i18n.t('walletVault.actions.exportBackup'),
                cancelButtonText: i18n.t('global.openWalletModal.cancelText')
            }).then(function (result) {
                if (!result.value)
                    return;
                var password = result.value;
                WalletRepository_1.WalletRepository.getLocalWalletWithPassword(password, wallet.id, false).then(function (openedWallet) {
                    if (openedWallet === null) {
                        swal({
                            type: 'error',
                            title: i18n.t('global.invalidPasswordModal.title'),
                            text: i18n.t('global.invalidPasswordModal.content'),
                            confirmButtonText: i18n.t('global.invalidPasswordModal.confirmText')
                        });
                        return;
                    }
                    WalletRepository_1.WalletRepository.getEncryptedWalletBackup(wallet.id).then(function (encryptedWallet) {
                        if (encryptedWallet === null)
                            return;
                        var blob = new Blob([encryptedWallet], { type: "application/json" });
                        saveAs(blob, _this.walletBackupFileName(wallet));
                    });
                });
            });
        };
        IndexView.prototype.removeWallet = function (wallet) {
            var _this = this;
            swal({
                title: i18n.t('walletVault.actions.remove'),
                html: i18n.t('walletVault.removeModal.content'),
                showCancelButton: true,
                confirmButtonText: i18n.t('walletVault.actions.remove'),
                cancelButtonText: i18n.t('global.openWalletModal.cancelText'),
                type: 'warning'
            }).then(function (result) {
                if (result.value) {
                    if (WalletRepository_1.WalletRepository.getCurrentWalletId() === wallet.id)
                        AppState_1.AppState.disconnect();
                    WalletRepository_1.WalletRepository.deleteLocalCopy(wallet.id).then(function () {
                        _this.refreshWallets();
                    });
                }
            });
        };
        IndexView.prototype.formatWalletDate = function (value) {
            if (value === null || value === '')
                return i18n.t('walletVault.neverOpened');
            return new Date(value).toLocaleString();
        };
        IndexView.prototype.translateMigrationNotice = function (message) {
            if (message.indexOf('walletVault.') === 0)
                return i18n.t(message);
            return message;
        };
        IndexView.prototype.walletBackupFileName = function (wallet) {
            var name = wallet.name.replace(/[^a-z0-9_\-]+/gi, '_').replace(/^_+|_+$/g, '');
            if (name === '')
                name = 'wallet';
            return name + '.karbowallet';
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], IndexView.prototype, "hasLocalWallet", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], IndexView.prototype, "isWalletLoaded", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)([])
        ], IndexView.prototype, "wallets", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], IndexView.prototype, "activeWalletId", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('walletVault.storageStatus.notAvailable')
        ], IndexView.prototype, "storageProtectionKey", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('not_available')
        ], IndexView.prototype, "storageProtectionStatus", void 0);
        return IndexView;
    }(DestructableView_1.DestructableView));
    var newIndexView = new IndexView('#app');
});
/*
function readFile(fileEnty:any){
    //console.log(fileEnty);
}

function writeFile(fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            //console.log("Successful file write...");
            readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
            //console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['some file data'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);
    });
}

function onErrorCreateFile(error){
    alert('onErrorCreateFile:'+JSON.stringify(error));
}
function onErrorLoadFs(error){
    alert('onErrorLoadFs:'+JSON.stringify(error));
}


window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs : any) {

    //console.log('file system open: ' + fs.name);
    fs.root.getFile(cordova.file.documentsDirectory+"newPersistentFile.txt", { create: true, exclusive: false }, function (fileEntry : any) {

        //console.log("fileEntry is file?" + fileEntry.isFile.toString());
        // fileEntry.name == 'someFile.txt'
        // fileEntry.fullPath == '/someFile.txt'
        writeFile(fileEntry, null);

    }, onErrorCreateFile);

}, onErrorLoadFs);

*/
