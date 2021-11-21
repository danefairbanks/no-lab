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

function animate(css) {
	let textElement = document.getElementsByClassName(css)[0];
	if (textElement) {
		var text = textElement.innerHTML;
		var len = text.length
		var wrapped = "";
		for (var i in text) {
			if (text.charAt(i) == ' ')
				wrapped += '<span class="space">' + text.charAt(i) + '</span>';
			else
				wrapped += '<span>' + text.charAt(i) + '</span>';
		}
		textElement.innerHTML = wrapped
		var delay = 0
		for (var i = 0; i < len; i++) {
			var childQuery = `.${css} span:nth-child(${(i + 1)})`
			document.querySelector(childQuery).style.animationDelay = delay + "s";
			delay += 0.1;
		}
	}
}