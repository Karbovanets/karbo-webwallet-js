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

import {VueClass, VueRequireFilter, VueVar} from "../lib/numbersLab/VueAnnotate";
import {DependencyInjectorInstance} from "../lib/numbersLab/DependencyInjector";
import {Wallet} from "../model/Wallet";
import {DestructableView} from "../lib/numbersLab/DestructableView";
import {Constants} from "../model/Constants";
import {AppState} from "../model/AppState";
import {Transaction} from "../model/Transaction";
import {Cn} from "../model/Cn";

let wallet : Wallet = DependencyInjectorInstance().getInstance(Wallet.name,'default', false);
let blockchainExplorer = DependencyInjectorInstance().getInstance(Constants.BLOCKCHAIN_EXPLORER);

class AccountView extends DestructableView{
	@VueVar([]) transactions !: Transaction[];
	@VueVar([]) recentTransactions !: Transaction[];
	@VueVar(0) walletAmount !: number;
	@VueVar(0) unlockedWalletAmount !: number;
	@VueVar(0) ticker !: string;
	@VueVar('') address !: string;

	@VueVar(0) currentScanBlock !: number;
	@VueVar(0) blockchainHeight !: number;
	@VueVar(Math.pow(10, config.coinUnitPlaces)) currencyDivider !: number;

	intervalRefresh : number = 0;

	constructor(container : string){
		super(container);
		let self = this;

		this.ticker = config.coinSymbol;
		this.address = wallet.getPublicAddress();

		AppState.enableLeftMenu();
		this.intervalRefresh = <any>setInterval(function(){
			self.refresh();
		}, 1*1000);
		this.refresh();
	}

	destruct(): Promise<void> {
		clearInterval(this.intervalRefresh);
		return super.destruct();
	}

	refresh(){
		let self = this;
		blockchainExplorer.getHeight().then(function(height : number){
			self.blockchainHeight = height;
		});

		this.refreshWallet();
	}

	private formatBalanceAmount(value:number): string{
		return Cn.formatMoney(value);
	}

	formatNativeBalance(value:number): string{
		return this.formatBalanceAmount(value);
	}

	getBalanceWholePart(value:number): string{
		let formattedAmount = this.formatBalanceAmount(value);
		let fractionMatch = formattedAmount.match(/(\.\d+)$/);
		if(fractionMatch !== null)
			return formattedAmount.substr(0, formattedAmount.length - fractionMatch[1].length);
		return formattedAmount;
	}

	getBalanceFractionPart(value:number): string{
		let formattedAmount = this.formatBalanceAmount(value);
		let fractionMatch = formattedAmount.match(/(\.\d+)$/);
		return fractionMatch !== null ? fractionMatch[1] : '';
	}

	displayUnlockedWalletAmount(): number{
		return Math.max(0, Math.min(this.walletAmount, this.unlockedWalletAmount));
	}

	displayPendingWalletAmount(): number{
		return Math.max(0, this.walletAmount - this.displayUnlockedWalletAmount());
	}

	hasBalanceDetails(): boolean{
		return this.displayPendingWalletAmount() > 0;
	}

	copyAddress(){
		let el = document.createElement('textarea');
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
	}

	private txBlockDetailsHtml(transaction : Transaction, explorerUrlBlock : string): string{
		if(transaction.blockHash !== '')
			return `<a href="`+explorerUrlBlock.replace('{ID}', transaction.blockHash)+`" target="_blank">`+transaction.blockHeight+`</a>`;
		return ''+transaction.blockHeight;
	}

	moreInfoOnTx(transaction : Transaction){
		let explorerUrlHash = config.testnet ? config.testnetExplorerUrlHash : config.mainnetExplorerUrlHash;
		let explorerUrlBlock = config.testnet ? config.testnetExplorerUrlBlock : config.mainnetExplorerUrlBlock;
		let feesHtml = '';
		if(transaction.getAmount() < 0)
			feesHtml = `<div>`+i18n.t('accountPage.txDetails.feesOnTx')+`: `+(transaction.fees / Math.pow(10, config.coinUnitPlaces))+`</div>`;
		let paymentId = '';
		if(transaction.paymentId !== ''){
			paymentId = `<div>`+i18n.t('accountPage.txDetails.paymentId')+`: `+transaction.paymentId+`</div>`;
		}

		let txPrivKeyMessage = '';
		let txPrivKey = wallet.findTxPrivateKeyWithHash(transaction.hash);
		if(txPrivKey !== null){
			txPrivKeyMessage = `<div>`+i18n.t('accountPage.txDetails.txPrivKey')+`: `+txPrivKey+`</div>`;
		}

		swal({
			title:i18n.t('accountPage.txDetails.title'),
			confirmButtonText: i18n.t('global.invalidPasswordModal.confirmText'),
			html:`
<div class="tl" >
	<div>`+i18n.t('accountPage.txDetails.txHash')+`: <a href="`+explorerUrlHash.replace('{ID}', transaction.hash)+`" target="_blank">`+transaction.hash+`</a></div>
	`+paymentId+`
	`+feesHtml+`
	`+txPrivKeyMessage+`
	<div>`+i18n.t('accountPage.txDetails.blockHeight')+`: `+this.txBlockDetailsHtml(transaction, explorerUrlBlock)+`</div>
</div>`
		});
	}

	refreshWallet(){
		this.currentScanBlock = wallet.lastHeight;
		this.walletAmount = wallet.totalAmount();
		this.unlockedWalletAmount = wallet.unlockedAmount(this.currentScanBlock);
		this.transactions = wallet.txsMem.concat(wallet.getTransactionsCopy().reverse());
		// Show only the 5 most recent transactions on dashboard
		this.recentTransactions = this.transactions.slice(0, 5);
	}
}

if(wallet !== null && blockchainExplorer !== null)
	new AccountView('#app');
else
	window.location.href = '#index';

