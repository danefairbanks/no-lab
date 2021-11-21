# Project NoLab

### Goals

Hello!
Project NoLab is aimed to give the streamer tools that didn't rely on third-party corporations just to provide functionality that didn't require a middle man.
The initial project is to add alerts to your stream based on events.  The only servers this project communicates with are the ones twitch provide themselves.

### Alerts

Alerts for now only support subs, gift subs, raids, bits, and point redemptions.
This project will work for power users or streamers who have programmer friends.
In the future, I will create tools to make it easier to use for those that aren't programmers.

#### Why no donation, follower, host support?

Unfortunately donations require some third party server to function.  I have plans to include a way to support donations through paypal's paypal.me link, but the feature is out of scope (for now).
As for followers, twitch does provide a way where we can get the follower list every minute and make an alert based off that but it definitely is not clean or scalable.
The other way twitch provides requires you to setup a server for notifications which is the same problem for donations.
As for hosts, currently no official documentation from twitch on how to achieve this. 
There can be ways to achieve followers and hosts through undocumented means, and I am currently in R&D mode for those options.

#### Instructions

The first step is to add your auth_token into the [config.js](https://github.com/danefairbanks/no-lab/blob/main/alert/config.js) file.
Use the [login.html] which you can open that will provide a way to get this token.
After logging in you will get a page not found.  The token will be in the url after the "#access_token=".

If you need help finding it, the token will be in the red space in the figure below:
![Login section](https://raw.githubusercontent.com/danefairbanks/no-lab/main/readme-res/login-token.png "login")

After this you can open the [openalert.html](https://github.com/danefairbanks/no-lab/blob/main/alert/openalert.html) to test it in a browser.
There are some test cases in there you can test through your browser console.  You can pull up this console with the key F12 in google chrome.

To send a test just type any of the following code and hit enter.
- **Gift Sub:**   nolab.test('gift', 1, 1)
- **Cheer Bit:**  nolab.test('bit', 1000, 1)
- **Sub:**        nolab.test('sub', 9, 3)

After testing, just add the openalert.html as a local file browser source in OBS.

#### Configuration

By default I've included alerts that trigger on gift subs, subs, bits under 1000 and bits over 1000.
You are able to create multiple configurations on an event based on values. 
- Gift subs value is based on how many gifts are given.
- Subs value is based on what tier they are subbed in.
- Bits value is based on how many bits were cheered.
- Raids value is based on how many viewers are joining the raid.

Below is the default configuration located in the [config.js](https://github.com/danefairbanks/no-lab/blob/main/alert/config.js)

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

There are several options that you can change for each event.
- __target__: The id of the container that will house alerts.  Most likely will never change.
- __template__: The id of the template that will be generated for the event.
- __duration__: The number of milliseconds the alert will show on screen.
- __release__:  The number of milliseconds the alert will take to be removed. (This is useful if you have a hiding animation)
- __audio__: The id of the audio file that will play when the event occurs.
- __audioVolume__: A value 0 to 1 indicating how loud the audio file should play.
- __show__: A class name that gets added to the container when an alert is generated.  You can use CSS to add animations
- __hide__: A class name that gets added after the duration has elapsed of an event triggering.
- __tts__: This will send a message value to a tts server. TTS functionality is included but needs to be built as an executable.

The included defaults do include animations to fade the alert in and out.  There are some text animations available as well.

### Widgets

Coming soon!
