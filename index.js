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
define(["require", "exports", "./lib/numbersLab/Router", "./lib/numbersLab/DependencyInjector", "./model/Mnemonic", "./lib/numbersLab/VueAnnotate", "./model/Wallet", "./model/Storage", "./model/Translations", "./model/WalletWatchdog"], function (require, exports, Router_1, DependencyInjector_1, Mnemonic_1, VueAnnotate_1, Wallet_1, Storage_1, Translations_1, WalletWatchdog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //========================================================
    //bridge for cnUtil with the new mnemonic class
    //========================================================
    window.mn_random = Mnemonic_1.Mnemonic.mn_random;
    window.mn_encode = Mnemonic_1.Mnemonic.mn_encode;
    window.mn_decode = Mnemonic_1.Mnemonic.mn_decode;
    //========================================================
    //====================Translation code====================
    //========================================================
    var i18n = new VueI18n({
        locale: 'en',
        fallbackLocale: 'en',
    });
    window.i18n = i18n;
    var browserUserLang = '' + (navigator.language || navigator.userLanguage);
    browserUserLang = browserUserLang.toLowerCase().split('-')[0];
    Storage_1.Storage.getItem('user-lang', browserUserLang).then(function (userLang) {
        Translations_1.Translations.loadLangTranslation(userLang).catch(function () {
            Translations_1.Translations.loadLangTranslation('en');
        });
    });
    //========================================================
    //====================Theme loading=======================
    //========================================================
    Storage_1.Storage.getItem('user-theme', 'dark').then(function (userTheme) {
        document.documentElement.setAttribute('data-theme', userTheme);
        var metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', userTheme === 'light' ? '#eef4ff' : '#111827');
        }
    });
    //========================================================
    //===========Bottom Navigation active state===============
    //========================================================
    function updateActiveNav() {
        var hash = window.location.hash;
        var page = 'index';
        if (hash.indexOf('#!') !== -1) {
            page = hash.substr(2);
        }
        else if (hash.indexOf('#') !== -1) {
            page = hash.substr(1);
        }
        // Remove query params
        if (page.indexOf('?') !== -1) {
            page = page.substr(0, page.indexOf('?'));
        }
        var navItems = document.querySelectorAll('#bottomNav .nav-item');
        for (var i = 0; i < navItems.length; i++) {
            var item = navItems[i];
            var itemPage = item.getAttribute('data-page') || '';
            if (itemPage === page) {
                item.classList.add('active');
            }
            else {
                item.classList.remove('active');
            }
        }
    }
    //========================================================
    //=================Top Header Vue binding=================
    //========================================================
    var TopHeaderView = /** @class */ (function (_super) {
        __extends(TopHeaderView, _super);
        function TopHeaderView(containerName, vueData) {
            if (vueData === void 0) { vueData = null; }
            var _this = _super.call(this, vueData) || this;
            _this.intervalRefresh = 0;
            _this.refreshSyncStatus();
            _this.intervalRefresh = setInterval(function () {
                _this.refreshSyncStatus();
            }, 1000);
            return _this;
        }
        TopHeaderView.prototype.setSyncStatus = function (text, className, title) {
            this.syncStatusText = text;
            this.syncStatusClass = className;
            this.syncStatusTitle = title;
        };
        TopHeaderView.prototype.translateTopHeaderStatus = function (key, params) {
            if (params === void 0) { params = {}; }
            return '' + i18n.t('topHeader.syncStatus.' + key, params);
        };
        TopHeaderView.prototype.refreshSyncStatus = function () {
            var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
            var walletWatchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name, 'default', false);
            if (wallet === null || walletWatchdog === null || walletWatchdog.stopped) {
                this.setSyncStatus(this.translateTopHeaderStatus('disconnected'), 'status-disconnected', this.translateTopHeaderStatus('disconnectedTitle'));
                return;
            }
            var currentHeight = wallet.lastHeight;
            var maximumHeight = walletWatchdog.lastMaximumHeight;
            if (maximumHeight <= 0) {
                this.setSyncStatus(this.translateTopHeaderStatus('connecting'), 'status-syncing', this.translateTopHeaderStatus('connectingTitle'));
                return;
            }
            if (currentHeight > maximumHeight)
                currentHeight = maximumHeight;
            if (currentHeight + 2 < maximumHeight) {
                var progress = Math.floor(((currentHeight + 1) / maximumHeight) * 1000) / 10;
                if (progress < 0)
                    progress = 0;
                if (progress > 99.9)
                    progress = 99.9;
                var displayHeight = currentHeight + 1;
                this.setSyncStatus(this.translateTopHeaderStatus('syncing', { progress: progress }), 'status-syncing', this.translateTopHeaderStatus('syncingTitle', { current: displayHeight, total: maximumHeight }));
                return;
            }
            this.setSyncStatus(this.translateTopHeaderStatus('synced'), 'status-synced', this.translateTopHeaderStatus('syncedTitle'));
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)('Disconnected')
        ], TopHeaderView.prototype, "syncStatusText", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('status-disconnected')
        ], TopHeaderView.prototype, "syncStatusClass", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('Disconnected')
        ], TopHeaderView.prototype, "syncStatusTitle", void 0);
        TopHeaderView = __decorate([
            (0, VueAnnotate_1.VueClass)()
        ], TopHeaderView);
        return TopHeaderView;
    }(Vue));
    var topHeaderView = new TopHeaderView('#topHeader');
    //========================================================
    //=================Copyright / Language===================
    //========================================================
    var CopyrightView = /** @class */ (function (_super) {
        __extends(CopyrightView, _super);
        function CopyrightView(containerName, vueData) {
            if (vueData === void 0) { vueData = null; }
            var _this = _super.call(this, vueData) || this;
            Translations_1.Translations.getLang().then(function (userLang) {
                _this.language = userLang;
            });
            return _this;
        }
        CopyrightView.prototype.languageWatch = function () {
            Translations_1.Translations.setBrowserLang(this.language);
            Translations_1.Translations.loadLangTranslation(this.language);
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)('en')
        ], CopyrightView.prototype, "language", void 0);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], CopyrightView.prototype, "languageWatch", null);
        CopyrightView = __decorate([
            (0, VueAnnotate_1.VueClass)()
        ], CopyrightView);
        return CopyrightView;
    }(Vue));
    var copyrightView = new CopyrightView('#copyright');
    //========================================================
    //=================Bottom Nav Vue binding=================
    //========================================================
    var BottomNavView = /** @class */ (function (_super) {
        __extends(BottomNavView, _super);
        function BottomNavView(containerName, vueData) {
            if (vueData === void 0) { vueData = null; }
            return _super.call(this, vueData) || this;
        }
        BottomNavView = __decorate([
            (0, VueAnnotate_1.VueClass)()
        ], BottomNavView);
        return BottomNavView;
    }(Vue));
    var bottomNavView = new BottomNavView('#bottomNav');
    //========================================================
    //==================Loading the right page================
    //========================================================
    var isCordovaApp = document.URL.indexOf('http://') === -1
        && document.URL.indexOf('https://') === -1;
    var isCapacitorApp = !!window.Capacitor;
    var isNativeApp = isCordovaApp || isCapacitorApp;
    var promiseLoadingReady;
    window.native = false;
    if (isNativeApp) {
        window.native = true;
        $('body').addClass('native');
        if (isCordovaApp) {
            var promiseLoadingReadyResolve_1 = null;
            var promiseLoadingReadyReject_1 = null;
            promiseLoadingReady = new Promise(function (resolve, reject) {
                promiseLoadingReadyResolve_1 = resolve;
                promiseLoadingReadyReject_1 = reject;
            });
            var cordovaJs = document.createElement('script');
            cordovaJs.type = 'text/javascript';
            cordovaJs.src = 'cordova.js';
            document.body.appendChild(cordovaJs);
            var timeoutCordovaLoad_1 = setTimeout(function () {
                if (promiseLoadingReadyResolve_1)
                    promiseLoadingReadyResolve_1();
            }, 10 * 1000);
            document.addEventListener('deviceready', function () {
                if (promiseLoadingReadyResolve_1)
                    promiseLoadingReadyResolve_1();
                clearInterval(timeoutCordovaLoad_1);
            }, false);
        }
        else {
            promiseLoadingReady = Promise.resolve();
        }
    }
    else
        promiseLoadingReady = Promise.resolve();
    promiseLoadingReady.then(function () {
        var router = new Router_1.Router('./', '../../');
        window.onhashchange = function () {
            router.changePageFromHash();
            updateActiveNav();
        };
        updateActiveNav();
    });
    //========================================================
    //==================Service worker for web================
    //========================================================
    if (!isNativeApp && 'serviceWorker' in navigator) {
        var showRefreshUI_1 = function (registration) {
            swal({
                type: 'info',
                title: i18n.t('global.newVersionModal.title'),
                html: i18n.t('global.newVersionModal.content'),
                confirmButtonText: i18n.t('global.newVersionModal.confirmText'),
                showCancelButton: true,
                cancelButtonText: i18n.t('global.newVersionModal.cancelText'),
            }).then(function (value) {
                if (!value.dismiss) {
                    registration.waiting.postMessage('force-activate');
                }
            });
        };
        var onNewServiceWorker_1 = function (registration, callback) {
            if (registration.waiting) {
                return callback();
            }
            var listenInstalledStateChange = function () {
                registration.installing.addEventListener('statechange', function (event) {
                    if (event.target.state === 'installed') {
                        callback();
                    }
                });
            };
            if (registration.installing) {
                return listenInstalledStateChange();
            }
            registration.addEventListener('updatefound', listenInstalledStateChange);
        };
        navigator.serviceWorker.addEventListener('message', function (event) {
            if (!event.data) {
                return;
            }
            switch (event.data) {
                case 'reload-window-update':
                    window.location.reload();
                    break;
                default:
                    break;
            }
        });
        navigator.serviceWorker.register('/service-worker.js').then(function (registration) {
            if (!navigator.serviceWorker.controller) {
                return;
            }
            onNewServiceWorker_1(registration, function () {
                showRefreshUI_1(registration);
            });
        });
    }
});
