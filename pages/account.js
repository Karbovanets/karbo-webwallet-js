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
define(["require", "exports", "../lib/numbersLab/VueAnnotate", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../lib/numbersLab/DestructableView", "../model/Constants", "../model/AppState", "../model/Cn"], function (require, exports, VueAnnotate_1, DependencyInjector_1, Wallet_1, DestructableView_1, Constants_1, AppState_1, Cn_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
    var blockchainExplorer = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Constants_1.Constants.BLOCKCHAIN_EXPLORER);
    var AccountView = /** @class */ (function (_super) {
        __extends(AccountView, _super);
        function AccountView(container) {
            var _this = _super.call(this, container) || this;
            _this.intervalRefresh = 0;
            var self = _this;
            _this.ticker = config.coinSymbol;
            _this.address = wallet.getPublicAddress();
            AppState_1.AppState.enableLeftMenu();
            _this.intervalRefresh = setInterval(function () {
                self.refresh();
            }, 1 * 1000);
            _this.refresh();
            return _this;
        }
        AccountView.prototype.destruct = function () {
            clearInterval(this.intervalRefresh);
            return _super.prototype.destruct.call(this);
        };
        AccountView.prototype.refresh = function () {
            var self = this;
            blockchainExplorer.getHeight().then(function (height) {
                self.blockchainHeight = height;
            });
            this.refreshWallet();
        };
        AccountView.prototype.formatBalanceAmount = function (value) {
            return Cn_1.Cn.formatMoney(value);
        };
        AccountView.prototype.formatNativeBalance = function (value) {
            return this.formatBalanceAmount(value);
        };
        AccountView.prototype.getBalanceWholePart = function (value) {
            var formattedAmount = this.formatBalanceAmount(value);
            var fractionMatch = formattedAmount.match(/(\.\d+)$/);
            if (fractionMatch !== null)
                return formattedAmount.substr(0, formattedAmount.length - fractionMatch[1].length);
            return formattedAmount;
        };
        AccountView.prototype.getBalanceFractionPart = function (value) {
            var formattedAmount = this.formatBalanceAmount(value);
            var fractionMatch = formattedAmount.match(/(\.\d+)$/);
            return fractionMatch !== null ? fractionMatch[1] : '';
        };
        AccountView.prototype.displayUnlockedWalletAmount = function () {
            return Math.max(0, Math.min(this.walletAmount, this.unlockedWalletAmount));
        };
        AccountView.prototype.displayPendingWalletAmount = function () {
            return Math.max(0, this.walletAmount - this.displayUnlockedWalletAmount());
        };
        AccountView.prototype.hasBalanceDetails = function () {
            return this.displayPendingWalletAmount() > 0;
        };
        AccountView.prototype.copyAddress = function () {
            var el = document.createElement('textarea');
            el.value = this.address;
            el.setAttribute('readonly', '');
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            swal({
                type: 'success',
                title: i18n.t('receivePage.copyNotice'),
                timer: 1500,
                showConfirmButton: false,
            });
        };
        AccountView.prototype.txBlockDetailsHtml = function (transaction, explorerUrlBlock) {
            if (transaction.blockHash !== '')
                return "<a href=\"" + explorerUrlBlock.replace('{ID}', transaction.blockHash) + "\" target=\"_blank\">" + transaction.blockHeight + "</a>";
            return '' + transaction.blockHeight;
        };
        AccountView.prototype.moreInfoOnTx = function (transaction) {
            var explorerUrlHash = config.testnet ? config.testnetExplorerUrlHash : config.mainnetExplorerUrlHash;
            var explorerUrlBlock = config.testnet ? config.testnetExplorerUrlBlock : config.mainnetExplorerUrlBlock;
            var feesHtml = '';
            if (transaction.getAmount() < 0)
                feesHtml = "<div>" + i18n.t('accountPage.txDetails.feesOnTx') + ": " + (transaction.fee / Math.pow(10, config.coinUnitPlaces)) + "</div>";
            var paymentId = '';
            if (transaction.paymentId !== '') {
                paymentId = "<div>" + i18n.t('accountPage.txDetails.paymentId') + ": " + transaction.paymentId + "</div>";
            }
            var txPrivKeyMessage = '';
            var txPrivKey = wallet.findTxPrivateKeyWithHash(transaction.hash);
            if (txPrivKey !== null) {
                txPrivKeyMessage = "<div>" + i18n.t('accountPage.txDetails.txPrivKey') + ": " + txPrivKey + "</div>";
            }
            swal({
                title: i18n.t('accountPage.txDetails.title'),
                confirmButtonText: i18n.t('global.invalidPasswordModal.confirmText'),
                html: "\n<div class=\"tl\" >\n\t<div>" + i18n.t('accountPage.txDetails.txHash') + ": <a href=\"" + explorerUrlHash.replace('{ID}', transaction.hash) + "\" target=\"_blank\">" + transaction.hash + "</a></div>\n\t" + paymentId + "\n\t" + feesHtml + "\n\t" + txPrivKeyMessage + "\n\t<div>" + i18n.t('accountPage.txDetails.blockHeight') + ": " + this.txBlockDetailsHtml(transaction, explorerUrlBlock) + "</div>\n</div>"
            });
        };
        AccountView.prototype.refreshWallet = function () {
            this.currentScanBlock = wallet.lastHeight;
            this.walletAmount = wallet.totalAmount();
            this.unlockedWalletAmount = wallet.unlockedAmount(this.currentScanBlock);
            this.transactions = wallet.txsMem.concat(wallet.getTransactionsCopy().reverse());
            // Show only the 5 most recent transactions on dashboard
            this.recentTransactions = this.transactions.slice(0, 5);
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)([])
        ], AccountView.prototype, "transactions", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)([])
        ], AccountView.prototype, "recentTransactions", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "walletAmount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "unlockedWalletAmount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "ticker", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], AccountView.prototype, "address", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "currentScanBlock", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "blockchainHeight", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(Math.pow(10, config.coinUnitPlaces))
        ], AccountView.prototype, "currencyDivider", void 0);
        return AccountView;
    }(DestructableView_1.DestructableView));
    if (wallet !== null && blockchainExplorer !== null)
        new AccountView('#app');
    else
        window.location.href = '#index';
});
