const auth_token = "<token>";
const clientId = "focevp8y70bsewstm4pg1nbc09rayn";
const config = {
    default: {
        target: 'alert-container',
        template: 'alert',
        duration: 5000,
        release: 1000,
        audio: 'audio-default',
        audioVolume: .5,
        show: 'fade-in',
        hide: 'fade-out',
        tts: true
    },
    pointOpts: {

    },
    bitOpts: [{
        template: 'alert-bit',
        max: 1000
    }, {
        template: 'alert-bitpremium',
        audio: 'audio-arp'
    }],
    subOpts: {
        template: 'alert-sub',
        audio: 'audio-oct',
    },
    giftOpts: {
        template: 'alert-gift'
    },
    raidOpts: {
        template: 'alert-raid'
    }
};