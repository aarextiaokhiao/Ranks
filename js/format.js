notationArray = ['Default', 'Scientific']

function format(num, decimalPoints = 2, precise) {
	if (num < 0) return	"-" + format(-num, decimalPoints)
	if (num == 1/0) return "Infinite"

	var exponent = Math.floor(Math.log10(Math.max(num, 1)))
	if (exponent < 3) return num.toFixed(precise ? decimalPoints : Math.max(decimalPoints - exponent, 0))

	var mantissa = num / Math.pow(10, exponent)
	if (exponent < 15) {
		var mod3 = exponent % 3
		var mantissa = num / Math.pow(10, exponent - mod3)
		return mantissa.toFixed(decimalPoints - mod3) + abbs[(exponent - mod3) / 3]
	}

	var mantissa = num / Math.pow(10, exponent)
	return mantissa.toFixed(decimalPoints) + "e" + exponent
}

function formatMoney(m) {
	if (m < 100) {
		return m + ' cent'+(m==1?'':'s')
	} else {
		return '$' + format(m / 100)
	}
}

function formatTime(s) {
	return formatTimeShort(s)
}

function formatTimeShort(s) {
	let r = ""

	let m = Math.floor(s / 60)
	s -= m * 60
	r = s.toFixed(1)
	if (m == 0) return r + "s"

	let h = Math.floor(m / 60)
	m -= h * 60
	r = m + (s < 10 ? ":0" : ":") + r
	if (h == 0) return r

	let d = Math.floor(h / 24)
	h -= d * 24
	r = h + (m < 10 ? ":0" : ":") + r
	if (d == 0) return r

	r = d + "d, " + r
	return r
}

function switchNotation() {
	player.notation=(player.notation+1)%notationArray.length
	updateRankText()
}