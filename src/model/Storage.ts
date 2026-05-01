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

interface StorageInterface {
	setItem(key: string, value: string): Promise<void>;
	getItem(key: string, defaultValue: any): Promise<any>;
	keys(): Promise<string[]>;
	remove(key: string): Promise<void>;
	clear(): Promise<void>;
}

class IndexedDBStorage implements StorageInterface {
	private db: any;
	private readonly dbName = 'mydb';
	private readonly storeName = 'storage';
	private ready: Promise<void>;

	constructor() {
		this.ready = new Promise<void>((resolve, reject) => {
			const request = indexedDB.open(this.dbName, 1);
			request.onupgradeneeded = (event) => {
				this.db = (event.target as IDBOpenDBRequest).result;
				this.db.createObjectStore(this.storeName, { keyPath: 'key' });
			};
			request.onsuccess = (event) => {
				this.db = (event.target as IDBOpenDBRequest).result;
				resolve();
			};
			request.onerror = (event) => {
				reject((event.target as IDBOpenDBRequest).error);
			};
		});
	}

	async setItem(key: string, value: string): Promise<void> {
		await this.ready;
		return new Promise<void>((resolve, reject) => {
			const transaction = this.db.transaction(this.storeName, 'readwrite');
			const store = transaction.objectStore(this.storeName);
			const request = store.put({ key, value });
			request.onsuccess = () => resolve();
			request.onerror = (event:any) => reject((event.target as IDBRequest).error);
		});
	}

	async getItem(key: string, defaultValue: any = null): Promise<string | any> {
		await this.ready;
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction(this.storeName, 'readonly');
			const store = transaction.objectStore(this.storeName);
			const request = store.get(key);

			request.onsuccess = () => {
				const result = request.result ? request.result.value : defaultValue;
				resolve(result);
			};
			request.onerror = (event:any) => {
				reject((event.target as IDBRequest).error);
			};
		});
	}

	async keys(): Promise<string[]> {
		await this.ready;
		return new Promise<string[]>((resolve, reject) => {
			const transaction = this.db.transaction(this.storeName, 'readonly');
			const store = transaction.objectStore(this.storeName);
			const request = store.getAllKeys();
			request.onsuccess = () => resolve(<string[]>request.result);
			request.onerror = (event:any) => reject((event.target as IDBRequest).error);
		});
	}

	async remove(key: string): Promise<void> {
		await this.ready;
		return new Promise<void>((resolve, reject) => {
			const transaction = this.db.transaction(this.storeName, 'readwrite');
			const store = transaction.objectStore(this.storeName);
			const request = store.delete(key);
			request.onsuccess = () => resolve();
			request.onerror = (event:any) => reject((event.target as IDBRequest).error);
		});
	}

	async clear(): Promise<void> {
		await this.ready;
		return new Promise<void>((resolve, reject) => {
			const transaction = this.db.transaction(this.storeName, 'readwrite');
			const store = transaction.objectStore(this.storeName);
			const request = store.clear();
			request.onsuccess = () => resolve();
			request.onerror = (event:any) => reject((event.target as IDBRequest).error);
		});
	}
}

class NativeStorage implements StorageInterface {
	private get nativeStorage(): any {
		return (<any>window).NativeStorage;
	}

	isAvailable(): boolean {
		return typeof window !== 'undefined' && typeof (<any>window).NativeStorage !== 'undefined';
	}

	setItem(key: string, value: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.nativeStorage.setItem(key, value, function () {
				resolve();
			}, function (error: any) {
				reject(error);
			});
		});
	}

	getItem(key: string, defaultValue: any = null): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			this.nativeStorage.getItem(key, function (value: any) {
				resolve(value);
			}, function (error: any) {
				if (error && (error.code === 2 || error.code === 'ITEM_NOT_FOUND')) {
					resolve(defaultValue);
				} else {
					reject(error);
				}
			});
		});
	}

	keys(): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			this.nativeStorage.keys(function (keys: string[]) {
				resolve(keys);
			}, function (error: any) {
				reject(error);
			});
		});
	}

	remove(key: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.nativeStorage.remove(key, function () {
				resolve();
			}, function (error: any) {
				reject(error);
			});
		});
	}

	clear(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.nativeStorage.clear(function () {
				resolve();
			}, function (error: any) {
				reject(error);
			});
		});
	}
}

class HybridStorage implements StorageInterface {
	private indexedDbStorage: IndexedDBStorage = new IndexedDBStorage();
	private nativeStorage: NativeStorage = new NativeStorage();

	private get activeStorage(): StorageInterface {
		if (this.nativeStorage.isAvailable())
			return this.nativeStorage;
		return this.indexedDbStorage;
	}

	setItem(key: string, value: string): Promise<void> {
		return this.activeStorage.setItem(key, value);
	}

	getItem(key: string, defaultValue: any = null): Promise<any> {
		if (!this.nativeStorage.isAvailable())
			return this.indexedDbStorage.getItem(key, defaultValue);

		let missingValue = '__karbo_storage_missing__' + key;
		return this.nativeStorage.getItem(key, missingValue).then((value: any) => {
			if (value !== missingValue)
				return value;
			return this.indexedDbStorage.getItem(key, defaultValue);
		});
	}

	keys(): Promise<string[]> {
		if (!this.nativeStorage.isAvailable())
			return this.indexedDbStorage.keys();

		return Promise.all([
			this.nativeStorage.keys(),
			this.indexedDbStorage.keys()
		]).then(function (keyLists: string[][]) {
			let keysObj: {[key: string]: boolean} = {};
			for (let keyList of keyLists) {
				for (let key of keyList)
					keysObj[key] = true;
			}
			return Object.keys(keysObj);
		});
	}

	remove(key: string): Promise<void> {
		if (!this.nativeStorage.isAvailable())
			return this.indexedDbStorage.remove(key);

		return Promise.all([
			this.nativeStorage.remove(key).catch(function () {}),
			this.indexedDbStorage.remove(key).catch(function () {})
		]).then(function () {});
	}

	clear(): Promise<void> {
		if (!this.nativeStorage.isAvailable())
			return this.indexedDbStorage.clear();

		return Promise.all([
			this.nativeStorage.clear(),
			this.indexedDbStorage.clear()
		]).then(function () {});
	}
}

export type StorageProtectionStatus = 'enabled'|'not_available'|'not_granted';

export class Storage {
	static _storage: StorageInterface = new HybridStorage();

	static clear(): Promise<void> {
		return Storage._storage.clear();
	}

	static getItem(key: string, defaultValue: any = null): Promise<any> {
		return Storage._storage.getItem(key, defaultValue);
	}

	static keys(): Promise<string[]> {
		return Storage._storage.keys();
	}

	static remove(key: string): Promise<void> {
		return Storage._storage.remove(key);
	}

	static removeItem(key: string): Promise<void> {
		return Storage._storage.remove(key);
	}

	static setItem(key: string, value: any): Promise<void> {
		return Storage._storage.setItem(key, value);
	}

	static requestPersistentStorage(): Promise<StorageProtectionStatus> {
		if (typeof navigator === 'undefined' || typeof (<any>navigator).storage === 'undefined')
			return Promise.resolve('not_available');

		let storageManager = (<any>navigator).storage;
		if (typeof storageManager.persisted !== 'function' || typeof storageManager.persist !== 'function')
			return Promise.resolve('not_available');

		return storageManager.persisted().then(function (persisted: boolean) {
			if (persisted)
				return 'enabled';
			return storageManager.persist().then(function (granted: boolean) {
				return granted ? 'enabled' : 'not_granted';
			});
		}).catch(function () {
			return 'not_granted';
		});
	}
}
