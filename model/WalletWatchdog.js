/**
 *     Copyright (c) 2018-2020, ExploShot
 *     Copyright (c) 2018-2020, The Qwertycoin Project
 *     Copyright (c) 2018-2020, The Karbo
 *
 *     All rights reserved.
 *     Redistribution and use in source and binary forms, with or without modification,
 *     are permitted provided that the following conditions are met:
 *
 *     ==> Redistributions of source code must retain the above copyright notice,
 *         this list of conditions and the following disclaimer.
 *     ==> Redistributions in binary form must reproduce the above copyright notice,
 *         this list of conditions and the following disclaimer in the documentation
 *         and/or other materials provided with the distribution.
 *     ==> Neither the name of Qwertycoin nor the names of its contributors
 *         may be used to endorse or promote products derived from this software
 *          without specific prior written permission.
 *
 *     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *     "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *     LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *     A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *     CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *     EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *     PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *     PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *     LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *     SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
define(["require", "exports", "./Transaction", "./TransactionsExplorer"], function (require, exports, Transaction_1, TransactionsExplorer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WalletWatchdog = void 0;
    var WalletWatchdog = /** @class */ (function () {
        function WalletWatchdog(wallet, explorer) {
            var _this = this;
            this.defaultNodeUrl = null;
            this.intervalMempool = 0;
            this.stopped = false;
            this.transactionsToProcess = [];
            this.intervalTransactionsProcess = 0;
            this.workerProcessingReady = false;
            this.workerProcessingWorking = false;
            this.workerCurrentProcessing = [];
            this.workerCountProcessed = 0;
            this.lastBlockLoading = -1;
            this.lastMaximumHeight = 0;
            this.start = function () {
                // init the mempool
                _this.initMempool();
                // set the interval for checking the new transactions
                _this.intervalTransactionsProcess = setInterval(function () {
                    _this.checkTransactionsInterval();
                }, _this.wallet.options.readSpeed);
                // run main loop
                _this.stopped = false;
                _this.lastBlockLoading = -1;
                _this.lastMaximumHeight = 0;
                _this.loadHistory();
            };
            this.wallet = wallet;
            this.explorer = explorer;
            this.initWorker();
            this.initMempool();
        }
        WalletWatchdog.prototype.applyNodeUrl = function () {
            if (this.wallet.options.customNode && this.wallet.options.nodeUrl !== '') {
                config.nodeUrl = this.wallet.options.nodeUrl;
                return;
            }
            if (this.defaultNodeUrl === null || config.nodeList.indexOf(this.defaultNodeUrl) === -1) {
                var randNodeInt = Math.floor(Math.random() * Math.floor(config.nodeList.length));
                this.defaultNodeUrl = config.nodeList[randNodeInt];
            }
            config.nodeUrl = this.defaultNodeUrl;
        };
        WalletWatchdog.prototype.getSyncRetryDelayMs = function () {
            if (this.wallet.lastHeight < this.lastMaximumHeight) {
                return 5 * 1000;
            }
            return 30 * 1000;
        };
        WalletWatchdog.prototype.initWorker = function () {
            var self = this;
            this.applyNodeUrl();
            this.workerProcessing = new Worker('./workers/TransferProcessingEntrypoint.js');
            this.workerProcessing.onmessage = function (data) {
                var message = data.data;
                logDebugMsg("InitWorker message", message);
                if (message === 'ready') {
                    logDebugMsg('worker ready');
                    self.signalWalletUpdate();
                }
                else if (message === 'readyWallet') {
                    self.workerProcessingReady = true;
                }
                else if (message.type) {
                    if (self.stopped)
                        return;
                    if (message.type === 'processed') {
                        var transactions = message.transactions;
                        var txPrivateKeys = typeof message.txPrivateKeys === 'object' && message.txPrivateKeys !== null ? message.txPrivateKeys : {};
                        var hasUpdates = transactions.length > 0;
                        for (var hash in txPrivateKeys) {
                            if (Object.prototype.hasOwnProperty.call(txPrivateKeys, hash) && self.wallet.findTxPrivateKeyWithHash(hash) === null) {
                                self.wallet.addTxPrivateKeyWithTxHash(hash, txPrivateKeys[hash]);
                                hasUpdates = true;
                            }
                        }
                        if (transactions.length > 0) {
                            for (var _i = 0, transactions_1 = transactions; _i < transactions_1.length; _i++) {
                                var tx = transactions_1[_i];
                                self.wallet.addNew(Transaction_1.Transaction.fromRaw(tx));
                            }
                        }
                        if (hasUpdates) {
                            self.signalWalletUpdate();
                        }
                        //if (self.workerCurrentProcessing.length > 0) {
                        //    let transactionHeight = self.workerCurrentProcessing[self.workerCurrentProcessing.length - 1].height;
                        //    if (typeof transactionHeight !== 'undefined')
                        //        self.wallet.lastHeight = transactionHeight;
                        //}
                        // we are done processing now
                        self.workerProcessingWorking = false;
                    }
                }
            };
        };
        WalletWatchdog.prototype.signalWalletUpdate = function () {
            if (this.stopped)
                return;
            var self = this;
            logDebugMsg('wallet update');
            this.lastBlockLoading = -1; //reset scanning
            this.applyNodeUrl();
            this.workerProcessing.postMessage({
                type: 'initWallet',
                wallet: this.wallet.exportToRaw()
            });
            clearInterval(this.intervalTransactionsProcess);
            this.intervalTransactionsProcess = setInterval(function () {
                self.checkTransactionsInterval();
            }, this.wallet.options.readSpeed);
            //force mempool update after a wallet update (new tx, ...)
            self.checkMempool();
        };
        WalletWatchdog.prototype.initMempool = function (force) {
            if (force === void 0) { force = false; }
            var self = this;
            if (this.intervalMempool === 0 || force) {
                if (force && this.intervalMempool !== 0) {
                    clearInterval(this.intervalMempool);
                }
                this.intervalMempool = setInterval(function () {
                    self.checkMempool();
                }, 30 * 1000);
            }
            self.checkMempool();
        };
        WalletWatchdog.prototype.stop = function () {
            clearInterval(this.intervalTransactionsProcess);
            this.intervalTransactionsProcess = 0;
            this.transactionsToProcess = [];
            clearInterval(this.intervalMempool);
            this.intervalMempool = 0;
            this.stopped = true;
            if (typeof this.workerProcessing !== 'undefined')
                this.terminateWorker();
        };
        WalletWatchdog.prototype.checkMempool = function (force) {
            if (force === void 0) { force = false; }
            var self = this;
            if (!force && this.lastMaximumHeight - this.lastBlockLoading > 1) { //only check memory pool if the user is up to date to ensure outs & ins will be found in the wallet
                return false;
            }
            this.explorer.getTransactionPool().then(function (pool) {
                if (self.stopped)
                    return;
                var txsMem = [];
                if (typeof pool !== 'undefined')
                    for (var _i = 0, pool_1 = pool; _i < pool_1.length; _i++) {
                        var rawTx = pool_1[_i];
                        var tx = TransactionsExplorer_1.TransactionsExplorer.parse(rawTx, self.wallet);
                        if (tx !== null) {
                            txsMem.push(tx);
                        }
                    }
                self.wallet.txsMem = txsMem;
            }).catch(function () {
            });
            return true;
        };
        WalletWatchdog.prototype.terminateWorker = function () {
            this.workerProcessing.terminate();
            this.workerProcessingReady = false;
            this.workerCurrentProcessing = [];
            this.workerProcessingWorking = false;
            this.workerCountProcessed = 0;
        };
        WalletWatchdog.prototype.checkTransactionsInterval = function () {
            logDebugMsg("checkTransactionsInterval called...");
            if (this.stopped) {
                clearInterval(this.intervalTransactionsProcess);
                this.intervalTransactionsProcess = 0;
                return;
            }
            //somehow we're repeating and regressing back to re-process Tx's
            //loadHistory getting into a stack overflow ?
            //need to work out timings and ensure process does not reload when it's already running...
            if (this.workerProcessingWorking || !this.workerProcessingReady) {
                logDebugMsg("checkTransactionsInterval exiting...", this.workerProcessingWorking, this.workerProcessingReady);
                return;
            }
            //we destroy the worker in charge of decoding the transactions every 5k transactions to ensure the memory is not corrupted
            //cnUtil bug, see https://github.com/mymonero/mymonero-core-js/issues/8
            if (this.workerCountProcessed >= 5 * 1000) {
                logDebugMsg('Recreate worker..');
                this.terminateWorker();
                this.initWorker();
                return;
            }
            // define the transactions we need to process
            var transactionsToProcess = [];
            if (this.transactionsToProcess.length > 0) {
                transactionsToProcess = this.transactionsToProcess.shift();
            }
            // check if we have anything to process and log it if in debug more
            logDebugMsg('checkTransactionsInterval', 'Transactions to be processed', transactionsToProcess);
            if (transactionsToProcess.length > 0) {
                this.workerCurrentProcessing = transactionsToProcess;
                this.workerProcessingWorking = true;
                this.workerProcessing.postMessage({
                    type: 'process',
                    transactions: transactionsToProcess
                });
                ++this.workerCountProcessed;
            }
            else {
                clearInterval(this.intervalTransactionsProcess);
                this.intervalTransactionsProcess = 0;
            }
        };
        WalletWatchdog.prototype.processTransactions = function (transactions, callback) {
            logDebugMsg("processTransactions called...", transactions);
            if (this.stopped) {
                callback();
                return;
            }
            var transactionsToAdd = transactions;
            // add the raw transaction to the processing FIFO list
            this.transactionsToProcess.push(transactionsToAdd);
            if (this.intervalTransactionsProcess === 0) {
                var self_1 = this;
                this.intervalTransactionsProcess = setInterval(function () {
                    self_1.checkTransactionsInterval();
                }, this.wallet.options.readSpeed);
            }
            // signal we are finished
            callback();
        };
        WalletWatchdog.prototype.loadHistory = function () {
            if (this.stopped)
                return;
            var self = this;
            if (this.lastBlockLoading === -1)
                this.lastBlockLoading = this.wallet.lastHeight;
            //don't reload until it's finished processing the last batch of transactions
            if (this.workerProcessingWorking || !this.workerProcessingReady) {
                logDebugMsg("Cannot process, need to wait...", this.workerProcessingWorking, this.workerProcessingReady);
                setTimeout(function () {
                    self.loadHistory();
                }, 250);
                return;
            }
            if (this.transactionsToProcess.length > 500) {
                logDebugMsg("Having more then 500 TX packets in FIFO queue", this.transactionsToProcess.length);
                //to ensure no pile explosion
                setTimeout(function () {
                    self.loadHistory();
                }, 2 * 1000);
                return;
            }
            this.explorer.getHeight().then(function (height) {
                if (self.stopped)
                    return;
                logDebugMsg("Checking on height", height);
                if (height > self.lastMaximumHeight) {
                    self.lastMaximumHeight = height;
                }
                else {
                    if (self.wallet.lastHeight >= self.lastMaximumHeight) {
                        setTimeout(function () {
                            self.loadHistory();
                        }, 1000);
                        return;
                    }
                }
                // we are only here if the block is actually increased from last processing
                if (self.lastBlockLoading === -1)
                    self.lastBlockLoading = self.wallet.lastHeight;
                if (self.lastBlockLoading !== height) {
                    var previousStartBlock_1 = Number(self.lastBlockLoading);
                    var endBlock_1 = previousStartBlock_1 + config.syncBlockCount;
                    if (previousStartBlock_1 > self.lastMaximumHeight)
                        previousStartBlock_1 = self.lastMaximumHeight;
                    if (endBlock_1 > self.lastMaximumHeight)
                        endBlock_1 = self.lastMaximumHeight;
                    self.explorer.getTransactionsForBlocks(previousStartBlock_1, endBlock_1, self.wallet.options.checkMinerTx).then(function (transactions) {
                        if (self.stopped)
                            return;
                        logDebugMsg("getTransactionsForBlocks", previousStartBlock_1, endBlock_1, transactions);
                        //to ensure no pile explosion
                        if (transactions === 'OK') {
                            self.lastBlockLoading = endBlock_1;
                            self.wallet.lastHeight = endBlock_1;
                            setTimeout(function () {
                                self.loadHistory();
                            }, 25);
                        }
                        else if (transactions.length > 0) {
                            var lastTx = transactions[transactions.length - 1];
                            if (typeof lastTx.height !== 'undefined') {
                                self.lastBlockLoading = lastTx.height + 1;
                            }
                            self.processTransactions(transactions, function () {
                                self.wallet.lastHeight = endBlock_1;
                                setTimeout(function () {
                                    self.loadHistory();
                                }, 25);
                            });
                        }
                        else {
                            self.lastBlockLoading = endBlock_1;
                            self.wallet.lastHeight = endBlock_1;
                            var delay = endBlock_1 < self.lastMaximumHeight ? 25 : 30 * 1000;
                            setTimeout(function () {
                                self.loadHistory();
                            }, delay);
                        }
                    }).catch(function () {
                        if (self.stopped)
                            return;
                        logDebugMsg("Error occured in loadHistory[1]...");
                        setTimeout(function () {
                            self.loadHistory();
                        }, self.getSyncRetryDelayMs()); //retry later if an error occurred
                    });
                }
                else {
                    setTimeout(function () {
                        self.loadHistory();
                    }, 30 * 1000);
                }
            }).catch(function () {
                if (self.stopped)
                    return;
                logDebugMsg("Error occured in loadHistory[2]...");
                setTimeout(function () {
                    self.loadHistory();
                }, self.getSyncRetryDelayMs()); //retry later if an error occurred
            });
        };
        return WalletWatchdog;
    }());
    exports.WalletWatchdog = WalletWatchdog;
});
