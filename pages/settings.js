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
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../model/Storage", "../model/Translations", "../providers/BlockchainExplorerProvider", "../model/WalletWatchdog", "../model/DeleteWallet"], function (require, exports, DestructableView_1, VueAnnotate_1, DependencyInjector_1, Wallet_1, Storage_1, Translations_1, BlockchainExplorerProvider_1, WalletWatchdog_1, DeleteWallet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    var walletWatchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name, 'default', false);
    var SettingsView = /** @class */ (function (_super) {
        __extends(SettingsView, _super);
        function SettingsView(container) {
            var _this = _super.call(this, container) || this;
            _this.initializing = true;
            var self = _this;
            _this.readSpeed = wallet.options.readSpeed;
            _this.checkMinerTx = wallet.options.checkMinerTx;
            _this.nodeUrl = wallet.options.nodeUrl;
            _this.customNode = wallet.options.customNode;
            _this.initializing = false;
            _this.creationHeight = wallet.creationHeight;
            _this.scanHeight = wallet.lastHeight;
            blockchainExplorer.getHeight().then(function (height) {
                self.maxHeight = height;
            });
            Translations_1.Translations.getLang().then(function (userLang) {
                _this.language = userLang;
            });
            Storage_1.Storage.getItem('user-theme', 'dark').then(function (userTheme) {
                _this.theme = userTheme;
            });
            _this.refreshStorageProtection();
            if (typeof window.cordova !== 'undefined' && typeof window.cordova.getAppVersion !== 'undefined') {
                window.cordova.getAppVersion.getVersionNumber().then(function (version) {
                    _this.nativeVersionNumber = version;
                });
                window.cordova.getAppVersion.getVersionCode().then(function (version) {
                    _this.nativeVersionCode = version;
                });
            }
            return _this;
        }
        SettingsView.prototype.refreshStorageProtection = function () {
            var _this = this;
            Storage_1.Storage.requestPersistentStorage().then(function (status) {
                if (status === 'enabled')
                    _this.storageProtectionKey = 'walletVault.storageStatus.enabled';
                else if (status === 'not_available')
                    _this.storageProtectionKey = 'walletVault.storageStatus.notAvailable';
                else
                    _this.storageProtectionKey = 'walletVault.storageStatus.notGranted';
            });
        };
        SettingsView.prototype.languageWatch = function () {
            Translations_1.Translations.setBrowserLang(this.language);
            Translations_1.Translations.loadLangTranslation(this.language);
        };
        SettingsView.prototype.themeWatch = function () {
            Storage_1.Storage.setItem('user-theme', this.theme);
            document.documentElement.setAttribute('data-theme', this.theme);
            var metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', this.theme === 'light' ? '#eef4ff' : '#111827');
            }
        };
        SettingsView.prototype.deleteWallet = function () {
            DeleteWallet_1.DeleteWallet.deleteWallet();
        };
        SettingsView.prototype.resetWallet = function () {
            swal({
                title: i18n.t('settingsPage.resetWalletModal.title'),
                html: i18n.t('settingsPage.resetWalletModal.content'),
                showCancelButton: true,
                confirmButtonText: i18n.t('settingsPage.resetWalletModal.confirmText'),
                cancelButtonText: i18n.t('settingsPage.resetWalletModal.cancelText'),
            }).then(function (result) {
                if (result.value) {
                    walletWatchdog.stop();
                    wallet.clearTransactions();
                    wallet.resetScanHeight();
                    walletWatchdog.start();
                    window.location.href = '#account';
                }
            });
        };
        SettingsView.prototype.readSpeedWatch = function () { this.updateWalletOptions(); };
        SettingsView.prototype.checkMinerTxWatch = function () { this.updateWalletOptions(); };
        SettingsView.prototype.customNodeWatch = function () {
            if (!this.initializing)
                this.applyConnectionSettings();
        };
        SettingsView.prototype.creationHeightWatch = function () {
            if (this.creationHeight < 0)
                this.creationHeight = 0;
            if (this.creationHeight > this.maxHeight && this.maxHeight !== -1)
                this.creationHeight = this.maxHeight;
        };
        SettingsView.prototype.scanHeightWatch = function () {
            if (this.scanHeight < 0)
                this.scanHeight = 0;
            if (this.scanHeight > this.maxHeight && this.maxHeight !== -1)
                this.scanHeight = this.maxHeight;
        };
        SettingsView.prototype.updateWalletOptions = function () {
            var options = wallet.options;
            options.readSpeed = this.readSpeed;
            options.checkMinerTx = this.checkMinerTx;
            options.customNode = this.customNode;
            options.nodeUrl = this.nodeUrl;
            wallet.options = options;
            walletWatchdog.signalWalletUpdate();
        };
        SettingsView.prototype.updateWalletSettings = function () {
            wallet.creationHeight = this.creationHeight;
            wallet.lastHeight = this.scanHeight;
            walletWatchdog.signalWalletUpdate();
        };
        SettingsView.prototype.applyConnectionSettings = function () {
            var options = wallet.options;
            options.customNode = this.customNode;
            options.nodeUrl = this.nodeUrl;
            wallet.options = options;
            if (this.customNode && this.nodeUrl !== '') {
                config.nodeUrl = this.nodeUrl;
            }
            else if (!this.customNode) {
                var randNodeInt = Math.floor(Math.random() * Math.floor(config.nodeList.length));
                config.nodeUrl = config.nodeList[randNodeInt];
            }
            walletWatchdog.signalWalletUpdate();
        };
        SettingsView.prototype.updateConnectionSettings = function () {
            this.applyConnectionSettings();
            swal({
                type: 'success',
                title: i18n.t('settingsPage.nodeUpdatedNotice'),
                html: config.nodeUrl,
                timer: 2000,
                showConfirmButton: false,
            });
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)(10)
        ], SettingsView.prototype, "readSpeed", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], SettingsView.prototype, "checkMinerTx", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], SettingsView.prototype, "customNode", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('https://node.karbo.org:32448/')
        ], SettingsView.prototype, "nodeUrl", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], SettingsView.prototype, "creationHeight", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], SettingsView.prototype, "scanHeight", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(-1)
        ], SettingsView.prototype, "maxHeight", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('en')
        ], SettingsView.prototype, "language", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('dark')
        ], SettingsView.prototype, "theme", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], SettingsView.prototype, "nativeVersionCode", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], SettingsView.prototype, "nativeVersionNumber", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('walletVault.storageStatus.notAvailable')
        ], SettingsView.prototype, "storageProtectionKey", void 0);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], SettingsView.prototype, "languageWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], SettingsView.prototype, "themeWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], SettingsView.prototype, "readSpeedWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], SettingsView.prototype, "checkMinerTxWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], SettingsView.prototype, "customNodeWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], SettingsView.prototype, "creationHeightWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], SettingsView.prototype, "scanHeightWatch", null);
        return SettingsView;
    }(DestructableView_1.DestructableView));
    if (wallet !== null && blockchainExplorer !== null)
        new SettingsView('#app');
    else
        window.location.href = '#index';
});
