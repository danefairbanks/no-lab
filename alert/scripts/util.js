function ajax(options) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open(options.method, options.url);
		if (options.headers) {
			for (const name in options.headers) {
				xhr.setRequestHeader(name, options.headers[name]);
			}
		}

		xhr.addEventListener("load", (e) => {
			resolve(xhr.response);
		});
		xhr.addEventListener("error", (e) => {
			reject(xhr.statusText);
		});
		xhr.addEventListener("abort", (e) => {
			reject(xhr.statusText);
		});
		xhr.send();
	});
}

function nonce(length) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}