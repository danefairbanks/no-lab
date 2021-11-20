const heartbeatInterval = 1000 * 60; //ms between PING's 
const baseReconnectInterval = 1000 * 3; //ms to wait before reconnect
const maxReconnectInterval = 1000 * 60 * 2; //ms maximum reconnect;
const jitter = 500; //ms jitter as specified by docs

class PubSubClient {
	constructor(opt) {
		this.ws = null;

		this.reconnectTimeout = null;
		this.heartbeatHandle = null;

		this.reconnectInterval = baseReconnectInterval; // reconnectinterval

		this.channel_id = opt.channel_id;

		this._handlers = {};
	}
	connect() {
		return new Promise((resolve, reject) => {
			console.log(`Connect to channel#${this.channel_id}`);
			this.ws = new WebSocket('wss://pubsub-edge.twitch.tv');

			this.ws.onopen = (event) => {
				this._onOpen.call(this, event);
			}

			this.ws.onerror = (error) => {
				this._onError.call(this, error);
			};

			this.ws.onmessage = (event) => {
				this._onMessage.call(this, event);
			};

			this.ws.onclose = () => {
				this._onClose.call(this);
			};
		});
	}
	on(event, f) {
		if (!Array.isArray(this._handlers[event])) {
			this._handlers[event] = [];
		}
		this._handlers[event].push(f);
	}
	emit(event, arg) {
		if (Array.isArray(this._handlers[event])) {
			for (let e of this._handlers[event]) {
				e(arg);
            }
		}
    }
	_heartbeat() {
		this.ws.send(JSON.stringify({
			type: 'PING'
		}));
	}
	_listen(topic) {
		this.ws.send(JSON.stringify({
			type: 'LISTEN',
			nonce: nonce(15),
			data: {
				topics: topic,
				auth_token: auth_token
			}
		}));
	}
	_onOpen(event) {
		this._heartbeat();
		this._heartbeatHandle = setInterval(() => {
			this._heartbeat.call(this);
		}, heartbeatInterval + Math.floor(Math.random() * jitter));
		this.reconnectInterval = baseReconnectInterval;

		this._listen([`channel-bits-events-v2.${this.channel_id}`, `channel-points-channel-v1.${this.channel_id}`, `channel-subscribe-events-v1.${this.channel_id}`]);
	}
	_onError(error) {
		console.log(error);
	}
	_onClose() {
		clearInterval(this._heartbeatHandle);
		this._reconnect();
    }
	_onMessage(event) {
		let message = JSON.parse(event.data);
		console.log(event);
		switch (message.type) {
			case 'RECONNECT':
				this._reconnect();
				break;
			case 'MESSAGE':
				let twitchdata = JSON.parse(message.data.message);
				if (twitchdata.type == 'reward-redeemed') {
					this.emit('channelPoints', twitchdata.data.redemption);
				}
				else if (message.data.topic == `channel-bits-events-v2.${this.channel_id}`) {
					this.emit('bits', twitchdata.data);
				}
				else if (message.data.topic == `channel-subscribe-events-v1.${this.channel_id}`) {
					let twitchmessage = twitchdata;
					if (twitchmessage.context == "sub" || twitchmessage.context == "resub") {
						this.emit('subscribe', twitchdata);
					}
					else if (twitchmessage.context == "subgift") {
						this.emit('gift', twitchdata);
					}
				}
				break;
		}
    }
	_reconnect() {
		this.reconnectTimeout = setTimeout(() => {
			this.connect.call(this);
		}, this.reconnectInterval + Math.floor(Math.random() * jitter), this.channel_id);
		if (this.reconnectInterval < maxReconnectInterval) {
			this.reconnectInterval = Math.min(this.reconnectInterval * 2, maxReconnectInterval);
		}
    }
}