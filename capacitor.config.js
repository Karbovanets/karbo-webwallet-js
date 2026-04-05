define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var config = {
        appId: 'org.karbo.wallet',
        appName: 'Karbo Wallet',
        webDir: 'src',
        android: {
            allowMixedContent: true
        },
        server: {
            androidScheme: 'https'
        }
    };
    exports.default = config;
});
