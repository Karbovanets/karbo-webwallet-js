define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var config = {
        appId: 'org.karbo.wallet',
        appName: 'Karbo Wallet',
        webDir: 'src',
        android: {
            allowMixedContent: true,
            backgroundColor: '#111827'
        },
        server: {
            androidScheme: 'https'
        },
        plugins: {
            StatusBar: {
                style: 'DARK',
                backgroundColor: '#111827'
            }
        }
    };
    exports.default = config;
});
