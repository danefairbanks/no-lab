class NoLabClient {
	constructor(opt) {
		this._pubsub = null;
		this._handlers = {};
		this._channel_id;
		this._login;
		this._testdata = [
			// gift
			(count, tier) => {
				return {
					"type": "MESSAGE",
					"data": {
						"topic": `channel-subscribe-events-v1.${this._channel_id}`,
						"message": {
							"benefit_end_month": 0,
							"user_name": "casuallydane",
							"display_name": "casuallydane",
							"channel_name": this._login,
							"user_id": "1337",
							"channel_id": `${this._channel_id}`,
							"recipient_id": "1337",
							"recipient_user_name": "casuallydane",
							"recipient_display_name": "casuallydane",
							"time": new Date().toISOString(),
							"sub_message": {
								"message": "",
								"emotes": null
							},
							"sub_plan": `${tier * 1000}`,
							"sub_plan_name": "Egg",
							"months": count,
							"context": "subgift"
						}
					}
				}
			},
			// bit
			(count) => {
				return {
					"type": "MESSAGE",
					"data": {
						"topic": `channel-bits-events-v2.${this._channel_id}`,
						"message": {
							"data": {
								"user_name": "casuallydane",
								"channel_name": this._login,
								"user_id": "1337",
								"channel_id": `${this._channel_id}`,
								"time": new Date().toISOString(),
								"chat_message": "Cheer1 Hello here are some bits",
								"bits_used": count,
								"total_bits_used": 0,
								"is_anonymous": false,
								"context": "cheer",
								"badge_entitlement": {
									"new_version": 0,
									"previous_version": 0
								}
							},
							"version": "1.0",
							"message_type": "bits_event",
							"message_id": "1af7ad56-b205-5a71-8512-289799097917"
						}
					}
				};
			},
			// sub
			(count, tier, streak) => {
				return {
					"type": "MESSAGE",
					"data": {
						"topic": `channel-subscribe-events-v1.${this._channel_id}`,
						"message": {
							"user_name": "casuallydane",
							"display_name": "casuallydane",
							"channel_name": this._login,
							"user_id": "1337",
							"channel_id": `${this._channel_id}`,
							"time": new Date().toISOString(),
							"sub_plan": `${tier * 1000}`,
							"sub_plan_name": "Test",
							"cumulative_months": count,
							"streak_months": streak,
							"context": "resub",
							"is_gift": false,
							"sub_message": {
								"message": "A Twitch baby is born! KappaHD",
								"emotes": [
									{
										"start": 23,
										"end": 7,
										"id": 2867
									}
								]
							}
						}
					}
				};
			}
		]
		this._testfunc = {
			"gift": (count, tier) => {
				let model = this._testdata[0].call(this, 1, tier);
				model.data.message = JSON.stringify(model.data.message);
				for (var i = 0; i < count; i++) {
					this._pubsub.ws.onmessage({ data: JSON.stringify(model) });
				}
			},
			"bit": (count) => {
				let model = this._testdata[1].call(this, count);
				model.data.message = JSON.stringify(model.data.message);
				this._pubsub.ws.onmessage({ data: JSON.stringify(model) });
			},
			"sub": (count, tier, streak) => {
				let model = this._testdata[2].call(this, count, tier, streak);
				model.data.message = JSON.stringify(model.data.message);
				this._pubsub.ws.onmessage({ data: JSON.stringify(model) });
			},
        }
	}
	connect() {
		return new Promise((resolve, reject) => {
			ajax({
				method: "GET",
				url: "https://api.twitch.tv/helix/users",
				headers: {
					"Authorization": `Bearer ${auth_token}`,
					"Client-Id": `${clientId}`
				}
			}).then((response) => {
				let r = JSON.parse(response);
				if (r.data.length > 0) {
					//setup connections to twitch
					this._channel_id = r.data[0].id;
					this._login = r.data[0].login;

					this._pubsub = new PubSubClient({
						channel_id: this._channel_id
					});

					let client = new tmi.Client({
						options: { debug: true, messagesLogLevel: "info" },
						connection: {
							reconnect: true,
							secure: true
						},
						channels: [this._login]
					});

					this._pubsub.connect();
					client.connect().catch(console.error);

					//setup emitters
					this._pubsub.on('channelPoints', (message) => {
						this.emit('channelPoints', {
							message: `${message.user.display_name} has redemeed ${message.reward.title} for ${message.reward.cost}`,
							count: message.reward.cost,
							value: message.reward.cost
						});
					});
					this._pubsub.on('bits', (message) => {
						this.emit('bits', {
							user: message.user_name,
							count: message.bits_used,
							message: message.chat_message,
							value: message.bits_used
						});
					});
					this._pubsub.on('subscribe', (message) => {
						let model = {
							user: message.display_name,
							count: message.cumulative_months,
							value: message.sub_plan
						};
						if (message.sub_message.message) {
							model.message = message.sub_message.message;
						}
						this.emit('subscribe', model);
					});

					let gifts = {};
					this._pubsub.on('gift', (message) => {
						if (gifts[message.user_id] === undefined) {
							gifts[message.user_id] = {
								display_name: message.display_name,
								count: 1
							};
							setTimeout(() => {
								let name = gifts[message.user_id].display_name;
								let count = gifts[message.user_id].count;

								this.emit('gift', {
									user: name,
									count: count,
									value: count
								});

								delete gifts[message.user_id];
							}, 2000);
						}
						else {
							gifts[message.user_id].count += 1;
						}
					});

					client.on('raided', (channel, username, viewers) => {
						this.emit('raid', {
							user: username,
							count: 0 + viewers,
							value: 0 + viewers
						});
					});
				}
			});
		});
	}
	test(type, ...args) {
		this._testfunc[type](...args);
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
}