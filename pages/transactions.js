/*
 * Copyright (c) 2018, Gnock
 * Copyright (c) 2018, The Masari Project
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
define(["require", "exports", "../lib/numbersLab/VueAnnotate", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../lib/numbersLab/DestructableView", "../model/Constants", "../model/AppState"], function (require, exports, VueAnnotate_1, DependencyInjector_1, Wallet_1, DestructableView_1, Constants_1, AppState_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
    var blockchainExplorer = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Constants_1.Constants.BLOCKCHAIN_EXPLORER);
    var TransactionsView = /** @class */ (function (_super) {
        __extends(TransactionsView, _super);
        function TransactionsView(container) {
            var _this = _super.call(this, container) || this;
            _this.intervalRefresh = 0;
            var self = _this;
            _this.ticker = config.coinSymbol;
            AppState_1.AppState.enableLeftMenu();
            _this.intervalRefresh = setInterval(function () {
                self.refresh();
            }, 1 * 1000);
            _this.refresh();
            return _this;
        }
        TransactionsView.prototype.destruct = function () {
            clearInterval(this.intervalRefresh);
            return _super.prototype.destruct.call(this);
        };
        TransactionsView.prototype.refresh = function () {
            var self = this;
            blockchainExplorer.getHeight().then(function (height) {
                self.blockchainHeight = height;
            });
            this.refreshWallet();
        };
        TransactionsView.prototype.txBlockDetailsHtml = function (transaction, explorerUrlBlock) {
            if (transaction.blockHash !== '')
                return "<a href=\"" + explorerUrlBlock.replace('{ID}', transaction.blockHash) + "\" target=\"_blank\">" + transaction.blockHeight + "</a>";
            return '' + transaction.blockHeight;
        };
        TransactionsView.prototype.moreInfoOnTx = function (transaction) {
            var explorerUrlHash = config.testnet ? config.testnetExplorerUrlHash : config.mainnetExplorerUrlHash;
            var explorerUrlBlock = config.testnet ? config.testnetExplorerUrlBlock : config.mainnetExplorerUrlBlock;
            var amount = transaction.getAmount();
            var amountAbs = Math.abs(amount) / Math.pow(10, config.coinUnitPlaces);
            var isOut = amount < 0;
            var rows = '';
            // Amount
            rows += "<div class=\"tx-detail-row\">\n\t\t\t<span class=\"tx-detail-label\">" + i18n.t('accountPage.txDetails.amount') + "</span>\n\t\t\t<span class=\"tx-detail-value\" style=\"color:var(".concat(isOut ? '--color-danger' : '--color-success', ");font-weight:600;\">").concat(isOut ? '-' : '+').concat(amountAbs, " ").concat(config.coinSymbol, "</span>\n\t\t</div>");
            // Fees
            if (isOut)
                rows += "<div class=\"tx-detail-row\">\n\t\t\t\t<span class=\"tx-detail-label\">" + i18n.t('accountPage.txDetails.feesOnTx') + "</span>\n\t\t\t\t<span class=\"tx-detail-value\">" + (transaction.fee / Math.pow(10, config.coinUnitPlaces)) + " " + config.coinSymbol + "</span>\n\t\t\t</div>";
            // Block height
            rows += "<div class=\"tx-detail-row\">\n\t\t\t<span class=\"tx-detail-label\">" + i18n.t('accountPage.txDetails.blockHeight') + "</span>\n\t\t\t<span class=\"tx-detail-value\">" + this.txBlockDetailsHtml(transaction, explorerUrlBlock) + "</span>\n\t\t</div>";
            // Payment ID
            if (transaction.paymentId !== '') {
                rows += "<div class=\"tx-detail-row\">\n\t\t\t\t<span class=\"tx-detail-label\">" + i18n.t('accountPage.txDetails.paymentId') + "</span>\n\t\t\t\t<span class=\"tx-detail-value tx-detail-mono\">" + transaction.paymentId + "</span>\n\t\t\t</div>";
            }
            // Tx hash
            rows += "<div class=\"tx-detail-row tx-detail-row-stack\">\n\t\t\t<span class=\"tx-detail-label\">" + i18n.t('accountPage.txDetails.txHash') + "</span>\n\t\t\t<a href=\"" + explorerUrlHash.replace('{ID}', transaction.hash) + "\" target=\"_blank\" class=\"tx-detail-hash\">" + transaction.hash + "</a>\n\t\t</div>";
            // Tx private key
            var txPrivKey = wallet.findTxPrivateKeyWithHash(transaction.hash);
            if (txPrivKey !== null) {
                rows += "<div class=\"tx-detail-row tx-detail-row-stack\">\n\t\t\t\t<span class=\"tx-detail-label\">" + i18n.t('accountPage.txDetails.txPrivKey') + "</span>\n\t\t\t\t<span class=\"tx-detail-hash\">" + txPrivKey + "</span>\n\t\t\t</div>";
            }
            swal({
                title: i18n.t('accountPage.txDetails.title'),
                confirmButtonText: i18n.t('global.invalidPasswordModal.confirmText'),
                html: "<div class=\"tx-detail-grid\">" + rows + "</div>"
            });
        };
        TransactionsView.prototype.refreshWallet = function () {
            this.currentScanBlock = wallet.lastHeight;
            this.walletAmount = wallet.totalAmount();
            this.unlockedWalletAmount = wallet.unlockedAmount(this.currentScanBlock);
            this.transactions = wallet.txsMem.concat(wallet.getTransactionsCopy().reverse());
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)([])
        ], TransactionsView.prototype, "transactions", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], TransactionsView.prototype, "walletAmount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], TransactionsView.prototype, "unlockedWalletAmount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], TransactionsView.prototype, "ticker", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], TransactionsView.prototype, "currentScanBlock", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], TransactionsView.prototype, "blockchainHeight", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(Math.pow(10, config.coinUnitPlaces))
        ], TransactionsView.prototype, "currencyDivider", void 0);
        return TransactionsView;
    }(DestructableView_1.DestructableView));
    if (wallet !== null && blockchainExplorer !== null)
        new TransactionsView('#app');
    else
        window.location.href = '#index';
});
