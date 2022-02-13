"use strict";
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
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');
workbox.precaching.precacheAndRoute([
  {
    "url": "api.html",
    "revision": "28475d0a445753d40b0fd7bd02f4ec3b"
  },
  {
    "url": "api.js",
    "revision": "9d76ce35b4a493232c5d76f2f86e1942"
  },
  {
    "url": "assets/css/font-awesome.css",
    "revision": "c495654869785bc3df60216616814ad1"
  },
  {
    "url": "assets/css/font-awesome.min.css",
    "revision": "269550530cc127b6aa5a35925a7de6ce"
  },
  {
    "url": "assets/css/main.css",
    "revision": "cf5ac476803613c45807657a4025107e"
  },
  {
    "url": "assets/img/coin_white.png",
    "revision": "c392292dd4fa339a13a254d154f29a5c"
  },
  {
    "url": "assets/img/favicon.ico",
    "revision": "b5d32b32cb438de0083fedb06ef60428"
  },
  {
    "url": "assets/img/icons/icon-128x128.png",
    "revision": "e8fc49dd4614ebb29b2a08364ae4cdfc"
  },
  {
    "url": "assets/img/icons/icon-144x144.png",
    "revision": "1bb9a3b0c2c969c3313f39718a800b61"
  },
  {
    "url": "assets/img/icons/icon-152x152.png",
    "revision": "636502da98ede8d58de006036e7c4e70"
  },
  {
    "url": "assets/img/icons/icon-192x192.png",
    "revision": "ed394964597b47bd4fb6ff9a8eb5f8c0"
  },
  {
    "url": "assets/img/icons/icon-256x256.png",
    "revision": "6b769e089eab3a93a561ff1c33a3eee4"
  },
  {
    "url": "assets/img/icons/icon-402x402.png",
    "revision": "ea00abb5b2502bf7de0aafc91c4b2941"
  },
  {
    "url": "assets/img/landing/75-usersthink-stock-image.jpg",
    "revision": "7a00bbf57aacc5303e846055b6dae1cb"
  },
  {
    "url": "assets/img/landing/balancing.jpg",
    "revision": "d460c7427f9adc5ba695d633e1d0aadc"
  },
  {
    "url": "assets/img/logo_vertical.png",
    "revision": "39c108ce84cd099e9964f2b1e5c206ec"
  },
  {
    "url": "assets/img/logo.png",
    "revision": "753d2388c8d054c8e151229f7da8617f"
  },
  {
    "url": "config.js",
    "revision": "2badfbb80c6bade7d2a14255745d3d2b"
  },
  {
    "url": "d/vue-i118n.js",
    "revision": "5e60d2e13017ae982538f352d04a961c"
  },
  {
    "url": "filters/Filters.js",
    "revision": "b8b234d18f7d8fb44c4f71044491ad29"
  },
  {
    "url": "index.html",
    "revision": "e111048fe0d8cf644989adf00676c934"
  },
  {
    "url": "index.js",
    "revision": "20c4e558df51036b9c5642a676d0f080"
  },
  {
    "url": "lib/base58.js",
    "revision": "3d523c0162d6911fd675c9ed1b7389a8"
  },
  {
    "url": "lib/biginteger.js",
    "revision": "f5a873c5716a9d3481501cad3f3e5ca7"
  },
  {
    "url": "lib/cn_utils_native.js",
    "revision": "94d65c88ed19007552b6593fa6fc68d1"
  },
  {
    "url": "lib/cn_utils.js",
    "revision": "931c90bcc1519d2476e75e2d6b42870a"
  },
  {
    "url": "lib/crypto.js",
    "revision": "d51c76b2e08308f8cca1f68c5c298a6f"
  },
  {
    "url": "lib/decoder.min.js",
    "revision": "67a582366edae346b7aa0fb14be03348"
  },
  {
    "url": "lib/FileSaver.min.js",
    "revision": "e8fdc5ad52084fa417f1fec6b6de3b29"
  },
  {
    "url": "lib/jquery-3.2.1.min.js",
    "revision": "c9f5aeeca3ad37bf2aa006139b935f0a"
  },
  {
    "url": "lib/jspdf.min.js",
    "revision": "27385efc6fa2eccc9dde7da0081b1a98"
  },
  {
    "url": "lib/kjua-0.1.1.min.js",
    "revision": "ca69d4f40f8c17ff592123dc35c1ea18"
  },
  {
    "url": "lib/mnemonic.js",
    "revision": "f30940176ec1e71b5a5f0c9b784a98b9"
  },
  {
    "url": "lib/nacl-fast-cn.js",
    "revision": "1fe1387eb865d9e843697a9d315d95b1"
  },
  {
    "url": "lib/nacl-fast.js",
    "revision": "a9c5b4bca7d2aa621a86d5085ce65d03"
  },
  {
    "url": "lib/nacl-fast.min.js",
    "revision": "72444801c9affc1654ef12860c67e976"
  },
  {
    "url": "lib/nacl-util.min.js",
    "revision": "c7b843b9e9b5aad102c855c600c7edc8"
  },
  {
    "url": "lib/nacl.js",
    "revision": "bf72b0a25fc3edf0c1a638aa43642714"
  },
  {
    "url": "lib/nacl.min.js",
    "revision": "d8eaf281c8890a60ebe82840456edc33"
  },
  {
    "url": "lib/numbersLab/Context.js",
    "revision": "884ca8e806f9d384611fb0ba25b398ef"
  },
  {
    "url": "lib/numbersLab/DependencyInjector.js",
    "revision": "84faea338105a5214c5148bb0f337c5c"
  },
  {
    "url": "lib/numbersLab/DestructableView.js",
    "revision": "bf06ac5b16fb1f754c5190c6e4a688a6"
  },
  {
    "url": "lib/numbersLab/Logger.js",
    "revision": "8a2dcc2a9c3af93c3d6c81d0f2e7681a"
  },
  {
    "url": "lib/numbersLab/Observable.js",
    "revision": "1e189f8ed916542f76b022cc2a248a47"
  },
  {
    "url": "lib/numbersLab/Router.js",
    "revision": "ab372d549e7e8a7b32da2b2b1996a206"
  },
  {
    "url": "lib/numbersLab/VueAnnotate.js",
    "revision": "373137597222838c73d5552e7552b08b"
  },
  {
    "url": "lib/polyfills/core.min.js",
    "revision": "6ff449122255e7a91fb884ea7016c601"
  },
  {
    "url": "lib/polyfills/crypto.js",
    "revision": "13647291f45a582eee64e000b09d9567"
  },
  {
    "url": "lib/polyfills/textEncoding/encoding-indexes.js",
    "revision": "50f27403be5972eae4831f5b69db1f80"
  },
  {
    "url": "lib/polyfills/textEncoding/encoding.js",
    "revision": "cfc731bd62baec239b2c4daf33b5e810"
  },
  {
    "url": "lib/require.js",
    "revision": "bebd45d1f406bbe61424136b03e50895"
  },
  {
    "url": "lib/sha3.js",
    "revision": "9f298ac7e4ee707645a8d711f3ed916b"
  },
  {
    "url": "lib/sweetalert2.js",
    "revision": "4b69bbd418e85d6efdac5630ed40d76e"
  },
  {
    "url": "lib/vue-i18n.js",
    "revision": "7d220253d58eb13939d24b1b7eb2d884"
  },
  {
    "url": "lib/vue.min.js",
    "revision": "5283b86cbf48a538ee3cbebac633ccd4"
  },
  {
    "url": "manifest.json",
    "revision": "8a7c17cb329614fcee4fbebc7319e762"
  },
  {
    "url": "model/AppState.js",
    "revision": "9e834f89e7006e2250f1b2c853419adb"
  },
  {
    "url": "model/blockchain/BlockchainExplorer.js",
    "revision": "f38ab86de3e385035147b61190c1e1ff"
  },
  {
    "url": "model/blockchain/BlockchainExplorerRPCDaemon.js",
    "revision": "f3e9c0d34d375eadf5494bba25346ac5"
  },
  {
    "url": "model/Cn.js",
    "revision": "e7457ac5daab7a3f1c1613e40aab8017"
  },
  {
    "url": "model/CoinUri.js",
    "revision": "660b7309d510c5b1a8431afc2410f2f5"
  },
  {
    "url": "model/Constants.js",
    "revision": "8acf6d5f8d2a68ea372d2d91d3c427ac"
  },
  {
    "url": "model/KeysRepository.js",
    "revision": "c9a201b23d69a0c9f0292a192a52da9d"
  },
  {
    "url": "model/MathUtil.js",
    "revision": "1dafc5a68cf404bfdc7846d634797282"
  },
  {
    "url": "model/Mnemonic.js",
    "revision": "066e2872e83418cf4109205c35c5185d"
  },
  {
    "url": "model/MnemonicLang.js",
    "revision": "1890f0331734c9849be70ac51f17aea9"
  },
  {
    "url": "model/Nfc.js",
    "revision": "ca17ec627c5d9601bd25739ec3cc8c34"
  },
  {
    "url": "model/Password.js",
    "revision": "7d20fa7546897358d43a821b0bc8adb1"
  },
  {
    "url": "model/QRReader.js",
    "revision": "d6398ec8645f6f0d1a56a7e83c3ef12e"
  },
  {
    "url": "model/Storage.js",
    "revision": "121f097e08b94d86f07c0f990a15f8e7"
  },
  {
    "url": "model/Transaction.js",
    "revision": "c1cf24325e30302692105ee3f5118425"
  },
  {
    "url": "model/TransactionsExplorer.js",
    "revision": "4baef633068640a490e6da730be1052e"
  },
  {
    "url": "model/Translations.js",
    "revision": "6cd6934dceadd3c97599bc093207fd06"
  },
  {
    "url": "model/Wallet.js",
    "revision": "e8c520f88773d3d55c1fc76f61b17730"
  },
  {
    "url": "model/WalletRepository.js",
    "revision": "3a6419f32b9fb13a74f754e6025aa844"
  },
  {
    "url": "model/WalletWatchdog.js",
    "revision": "396d0effbc68085c6576865f040cfbaf"
  },
  {
    "url": "pages/account.html",
    "revision": "b938152f372b839a3c55283c477546c7"
  },
  {
    "url": "pages/account.js",
    "revision": "43f1014e86cbe0cf0f6cdbb83fd17484"
  },
  {
    "url": "pages/changeWalletPassword.html",
    "revision": "cf44f48e8c60b3c2e19e22e825a89724"
  },
  {
    "url": "pages/changeWalletPassword.js",
    "revision": "209e1aee68c4cb853808ad3ef749655c"
  },
  {
    "url": "pages/createWallet.html",
    "revision": "413543ffbf94919ce6b5be51d309bc55"
  },
  {
    "url": "pages/createWallet.js",
    "revision": "6e676b0cec377d46ec6662a51e338a7b"
  },
  {
    "url": "pages/disconnect.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "pages/disconnect.js",
    "revision": "3594698740c48755bfb42a88ac737180"
  },
  {
    "url": "pages/donate.html",
    "revision": "fda62c03370cd2985abca5ec62e51f6a"
  },
  {
    "url": "pages/donate.js",
    "revision": "d65ed68add23b8d8fa95033bdb37467e"
  },
  {
    "url": "pages/export.html",
    "revision": "0829e8dcf1a904dbbe1be305abf85900"
  },
  {
    "url": "pages/export.js",
    "revision": "c98a20e14d0b544d7ab944f88ae1b84f"
  },
  {
    "url": "pages/import.html",
    "revision": "45f5c149574bd7cf2bc91794c4adee55"
  },
  {
    "url": "pages/import.js",
    "revision": "27d9140b3940e24c404c3662c80ba651"
  },
  {
    "url": "pages/importFromFile.html",
    "revision": "b824f9fc68ce358032faecd70b0e099b"
  },
  {
    "url": "pages/importFromFile.js",
    "revision": "b24a0750c6b96402dd85efe97452626e"
  },
  {
    "url": "pages/importFromKeys.html",
    "revision": "1388fc183805920f522c5cb26e3c2714"
  },
  {
    "url": "pages/importFromKeys.js",
    "revision": "c24c27a0e6be26f13f6de05884f0220c"
  },
  {
    "url": "pages/importFromMnemonic.html",
    "revision": "367f09264b3c3008ee0eda752d4a0ea7"
  },
  {
    "url": "pages/importFromMnemonic.js",
    "revision": "27aece65438671385c576a3ebdb1de95"
  },
  {
    "url": "pages/importFromQr.html",
    "revision": "172fc490fa9a97ed146895e0f35aeedc"
  },
  {
    "url": "pages/importFromQr.js",
    "revision": "705dfbea523bdf751443b54b5cd52ce4"
  },
  {
    "url": "pages/index.html",
    "revision": "c4658b9e594a90a5ae64a84978e567dd"
  },
  {
    "url": "pages/index.js",
    "revision": "de8be9509c880a31f151a32abf395288"
  },
  {
    "url": "pages/network.html",
    "revision": "1fdea30266d0779652847d8cc9c7fadf"
  },
  {
    "url": "pages/network.js",
    "revision": "732cbb58c6a0261110fd25d44840f8ab"
  },
  {
    "url": "pages/privacyPolicy.html",
    "revision": "0bdfeea940590b665b5764b4167c4de2"
  },
  {
    "url": "pages/privacyPolicy.js",
    "revision": "cd3c961feb5b983889b21edeaf20afbd"
  },
  {
    "url": "pages/receive.html",
    "revision": "d07b8b58743d889c25ceba08256b6804"
  },
  {
    "url": "pages/receive.js",
    "revision": "beff869c120ad2d3930d322f092411e7"
  },
  {
    "url": "pages/send.html",
    "revision": "29eedafbad4f42b53c8da549ad22aca8"
  },
  {
    "url": "pages/send.js",
    "revision": "3549ea93977c3d1be7d13d84b24fc20f"
  },
  {
    "url": "pages/settings.html",
    "revision": "295777f83c2f2cb501fc46aae51d5728"
  },
  {
    "url": "pages/settings.js",
    "revision": "67e5dbc17e74505eac34bf87c67236d2"
  },
  {
    "url": "pages/support.html",
    "revision": "e2bba0ba831f96888b59ffba3f8b75a3"
  },
  {
    "url": "pages/support.js",
    "revision": "4cb168e6fc83406bfb2a0adaf05259ad"
  },
  {
    "url": "pages/termsOfUse.html",
    "revision": "166cea85fdc9cb5429a2fbe06a94723b"
  },
  {
    "url": "pages/termsOfUse.js",
    "revision": "3e3524cae093fb1a0690ab73155cf729"
  },
  {
    "url": "providers/BlockchainExplorerProvider.js",
    "revision": "9f947d6474de6463752cb8022bfea26d"
  },
  {
    "url": "service-worker-raw.js",
    "revision": "3f7443e2724e74587330aff15f93149e"
  },
  {
    "url": "translations/de.json",
    "revision": "14df39cd48f3f8f038025700e1fb440b"
  },
  {
    "url": "translations/en.json",
    "revision": "eb53db2800e9af69ba30a94431f8e830"
  },
  {
    "url": "translations/es.json",
    "revision": "d3f3560495b1a836527b46f36695b7ca"
  },
  {
    "url": "translations/fa.json",
    "revision": "c999c3a0d6ee75bd54c214e4a69ecf47"
  },
  {
    "url": "translations/fr.json",
    "revision": "7593726c906e85820a78971038596a01"
  },
  {
    "url": "translations/gr.json",
    "revision": "343dadea2f363717af873cf53196ca70"
  },
  {
    "url": "translations/hu.json",
    "revision": "920e527f2e1afbac7c0f922a3b6d9c5e"
  },
  {
    "url": "translations/it.json",
    "revision": "d315378683be26d04b4c79c0b53b6a82"
  },
  {
    "url": "translations/ko.json",
    "revision": "67d55ecf28d04d27b258b5f45ea13ad2"
  },
  {
    "url": "translations/pl.json",
    "revision": "6a5ced840e944c200ba81cb28cdb3406"
  },
  {
    "url": "translations/ru.json",
    "revision": "441f871763136e404c61eb826e1acf5b"
  },
  {
    "url": "translations/sr.json",
    "revision": "64d48db52ea78829b10284df9e6163b6"
  },
  {
    "url": "translations/uk.json",
    "revision": "e3eeff95cb88002dcf9528c8f515553f"
  },
  {
    "url": "translations/zh.json",
    "revision": "853ffe445254d766a2fdfb1d42031b5a"
  },
  {
    "url": "utils/Url.js",
    "revision": "9e38cba47fd1a3b558d77a98ee51dccd"
  },
  {
    "url": "workers/TransferProcessing.js",
    "revision": "4d25ca3593a2a6bce67f392923e48a4d"
  },
  {
    "url": "workers/TransferProcessingEntrypoint.js",
    "revision": "a5245276b3005b7f1fc44b91b42d326e"
  }
]);
self.addEventListener('message', function (event) {
    if (!event.data) {
        return;
    }
    switch (event.data) {
        case 'force-activate':
            self.skipWaiting();
            self.clients.claim();
            self.clients.matchAll().then(function (clients) {
                clients.forEach(function (client) { return client.postMessage('reload-window-update'); });
            });
            break;
        default:
            // NOOP
            break;
    }
});
