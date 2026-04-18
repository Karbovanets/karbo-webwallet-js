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
define(["require", "exports", "../lib/numbersLab/VueAnnotate", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../lib/numbersLab/DestructableView", "../model/AppState", "../model/Cn", "../providers/BlockchainExplorerProvider", "../model/TransactionsExplorer", "../model/WalletWatchdog"], function (require, exports, VueAnnotate_1, DependencyInjector_1, Wallet_1, DestructableView_1, AppState_1, Cn_1, BlockchainExplorerProvider_1, TransactionsExplorer_1, WalletWatchdog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
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
            if (typeof blockchainExplorer.getAccountNumber === 'function') {
                blockchainExplorer.getAccountNumber(wallet.getPublicAddress()).then(function (accountNumber) {
                    self.accountNumberLoading = false;
                    if (accountNumber !== null) {
                        self.accountNumber = accountNumber;
                    }
                }).catch(function () {
                    self.accountNumberLoading = false;
                });
            }
            else {
                self.accountNumberLoading = false;
            }
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
        AccountView.prototype.copyAccountNumber = function () {
            var el = document.createElement('textarea');
            el.value = this.accountNumber;
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
        AccountView.prototype.registerAccount = function () {
            var self = this;
            swal({
                title: i18n.t('accountPage.registerAccountModal.title'),
                html: i18n.t('accountPage.registerAccountModal.content'),
                showCancelButton: true,
                confirmButtonText: i18n.t('accountPage.registerAccountModal.confirmText'),
                cancelButtonText: i18n.t('accountPage.registerAccountModal.cancelText'),
            }).then(function (result) {
                if (result.dismiss)
                    return;
                blockchainExplorer.getHeight().then(function (blockchainHeight) {
                    var dustAmount = 1; // minimal amount for self-transfer
                    var destinationAddress = wallet.getPublicAddress();
                    swal({
                        title: i18n.t('sendPage.creatingTransferModal.title'),
                        html: i18n.t('sendPage.creatingTransferModal.content'),
                        onOpen: function () {
                            swal.showLoading();
                        }
                    });
                    var mixinToSendWith = config.defaultMixin;
                    TransactionsExplorer_1.TransactionsExplorer.createTx([{ address: destinationAddress, amount: dustAmount }], '', wallet, blockchainHeight, function (amounts, numberOuts) {
                        return blockchainExplorer.getRandomOuts(amounts, numberOuts);
                    }, function (amount, feesAmount) {
                        if (amount + feesAmount > wallet.unlockedAmount(blockchainHeight)) {
                            swal({
                                type: 'error',
                                title: i18n.t('sendPage.notEnoughMoneyModal.title'),
                                text: i18n.t('sendPage.notEnoughMoneyModal.content'),
                                confirmButtonText: i18n.t('sendPage.notEnoughMoneyModal.confirmText'),
                            });
                            throw '';
                        }
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                swal({
                                    title: i18n.t('accountPage.registerAccountModal.confirmingTitle'),
                                    html: i18n.t('accountPage.registerAccountModal.confirmingContent', {
                                        fees: feesAmount / Math.pow(10, config.coinUnitPlaces),
                                    }),
                                    showCancelButton: true,
                                    confirmButtonText: i18n.t('sendPage.confirmTransactionModal.confirmText'),
                                    cancelButtonText: i18n.t('sendPage.confirmTransactionModal.cancelText'),
                                }).then(function (result) {
                                    if (result.dismiss) {
                                        reject('');
                                    }
                                    else {
                                        swal({
                                            title: i18n.t('sendPage.finalizingTransferModal.title'),
                                            html: i18n.t('sendPage.finalizingTransferModal.content'),
                                            onOpen: function () {
                                                swal.showLoading();
                                            }
                                        });
                                        resolve();
                                    }
                                }).catch(reject);
                            }, 1);
                        });
                    }, mixinToSendWith, true // accountRegistration
                    ).then(function (rawTxData) {
                        blockchainExplorer.sendRawTx(rawTxData.raw.raw).then(function () {
                            wallet.addTxPrivateKeyWithTxHash(rawTxData.raw.hash, rawTxData.raw.prvkey);
                            var watchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name);
                            if (watchdog !== null) {
                                watchdog.checkMempool(true);
                            }
                            swal({
                                type: 'success',
                                title: i18n.t('accountPage.registerAccountModal.successTitle'),
                                html: i18n.t('accountPage.registerAccountModal.successContent'),
                                confirmButtonText: i18n.t('sendPage.transferSentModal.confirmText'),
                            });
                        }).catch(function (data) {
                            swal({
                                type: 'error',
                                title: i18n.t('sendPage.transferExceptionModal.title'),
                                html: i18n.t('sendPage.transferExceptionModal.content', { details: JSON.stringify(data) }),
                                confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
                            });
                        });
                    }).catch(function (error) {
                        if (error && error !== '') {
                            swal({
                                type: 'error',
                                title: i18n.t('sendPage.transferExceptionModal.title'),
                                html: i18n.t('sendPage.transferExceptionModal.content', { details: JSON.stringify(error) }),
                                confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
                            });
                        }
                    });
                });
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
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], AccountView.prototype, "accountNumber", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(true)
        ], AccountView.prototype, "accountNumberLoading", void 0);
        return AccountView;
    }(DestructableView_1.DestructableView));
    if (wallet !== null && blockchainExplorer !== null)
        new AccountView('#app');
    else
        window.location.href = '#index';
});
