notationArray = ['Default', 'Scientific']

function format(num, decimalPoints=2, offset=0, rounded=true) {
	var abs=Math.abs(num)
	var exponent=Math.floor(Math.max(Math.log10(abs),0))
	var precision=3*offset+decimalPoints-exponent
	if (isNaN(num)||isNaN(exponent)) {
		return '?'
	} else if (abs==1/0) {
		return 'Infinite'
	} else if (abs<Math.pow(1000,1+offset)-0.5) {
		if (rounded) return Math.round(num)
		return Math.round(num*Math.pow(10,precision))/Math.pow(10,precision)
	} else if (player.notation==0) {
		var abbid=Math.max(Math.floor(exponent/3-offset),0)
		precision+=3*abbid
		var mantissa=Math.round(num*Math.pow(10,precision-3*abbid))/Math.pow(10,precision)
		if (Math.abs(mantissa)==Math.pow(1000,1+offset)) {
			mantissa=mantissa/1000
			abbid+=1
		}
		return mantissa+abbs[abbid]
	} else {
		precision=3*offset+decimalPoints
		var mantissa=Math.round(num*Math.pow(10,precision-exponent))/Math.pow(10,precision)
		if (Math.abs(mantissa)==Math.pow(10,3*offset+1)) {
			mantissa=mantissa/10
			exponent+=1
		}
		return mantissa+(exponent==0?'':'e'+exponent)
	}
}

function formatMoney(m) {
	if (m < 100) {
		return Math.round(m)+' cent'+(m==1?'':'s')
	} else {
		return '$'+format(m/100,2,0,false)
	}
}

function formatTime(s) {
	if (s < 1) {
		return Math.floor(s*1000)+' milliseconds'
	} else if (s < 60) {
		return Math.floor(s*100)/100+' seconds'
	} else if (s < 3600) {
		return Math.floor(s/60)+' minutes and '+Math.floor(s%60)+' seconds'
	} else if (s < 86400) {
		return Math.floor(s/3600)+' hours, '+Math.floor(s/60%60)+' minutes, and '+Math.floor(s%60)+' seconds'
	} else if (s < 2629746) {
		return Math.floor(s/86400)+' days, '+Math.floor(s/3600%24)+' hours, '+Math.floor(s/60%60)+' minutes, and '+Math.floor(s%60)+' seconds'
	} else if (s < 31556952) {
		return Math.floor(s/2629746)+' months, '+Math.floor(s%2629746/86400)+' days, '+Math.floor(s%2629746/3600%24)+' hours, '+Math.floor(s%2629746/60%60)+' minutes, and '+Math.floor(s%2629746%60)+' seconds'
	} else if (s < Infinity) {
		return format(Math.floor(s/31556952))+' years, '+Math.floor(s/2629746%12)+' months, '+Math.floor(s%2629746/86400)+' days, '+Math.floor(s%2629746/3600%24)+' hours, '+Math.floor(s%2629746/60%60)+' minutes, and '+Math.floor(s%2629746%60)+' seconds'
	} else {
		return 'Infinite'
	}
}

function switchNotation() {
	player.notation=(player.notation+1)%notationArray.length
	updateRankText()
}