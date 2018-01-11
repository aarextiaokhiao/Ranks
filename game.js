player={num:0,
rank:1,
mult1:1,
mult2:1,
mult3:1}
time=new Date().getTime()
rankReqs=[{num:10},{num:2000},{num:1e5}]
costs=[10,2000,1e5]

function gameInit() {
	updated=true
	setInterval(function(){if(updated){updated=false;gameTick();updated=true}})
}

function gameTick() {
	var newTime=new Date().getTime()
	var diff=(newTime-time)/1000
	time=newTime
	
	player.num+=diff*player.mult1*player.mult2*player.mult3
	rankUp()
	
	updateElement('number',format(player.num))
	if (player.rank>1) {
		showElement('mult1','table-cell')
		updateElement('mult1','Increase multiplier<br>'+player.mult1+'x<br>Cost: '+format(costs[0]))
	} else {
		hideElement('mult1')
	}
	if (player.rank>2) {
		showElement('mult2','table-cell')
		updateElement('mult2','Increase multiplier<br>'+player.mult2+'x<br>Cost: '+format(costs[1]))
	} else {
		hideElement('mult2')
	}
	if (player.rank>3) {
		showElement('mult3','table-cell')
		updateElement('mult3','Increase multiplier<br>'+player.mult3+'x<br>Cost: '+format(costs[2]))
	} else {
		hideElement('mult3')
	}
}

function updateElement(elem,id) {
	document.getElementById(elem).innerHTML=id
}

function showElement(elem,id='block') {
	document.getElementById(elem).style.display=id
}

function hideElement(elem) {
	document.getElementById(elem).style.display='none'
}

function format(num,decimalPoints=0,offset=0) {
	if (isNaN(num)) {
		return '?'
	} else if (num==1/0) {
		return 'Infinite'
	} else {
		var abbid=Math.max(Math.floor(Math.log10(Math.abs(num))/3)-offset,0)
		var mantissa=Math.round(num/Math.pow(1000,abbid)*Math.pow(10,(abbid>0&&decimalPoints<2)?2:decimalPoints))/Math.pow(10,(abbid>0&&decimalPoints<2)?2:decimalPoints)
		if (mantissa==Math.pow(1000,1+offset)) {
			mantissa=mantissa/1000
			abbid+=1
		}
		return mantissa+abbs[abbid]
	}
}

function updateRankText() {
	var value='Rank '+player.rank
	if (rankReqs[player.rank-1]) {
		value=value+' | Next rank at '
		for (req in rankReqs[player.rank-1]) {
			if (req=='num') {
				value=value+format(rankReqs[player.rank-1][req])
			}
		}
	}
	updateElement('rank',value)
}

function rankUp() {
	var ableToRankUp=false
	if (rankReqs[player.rank-1]) {
		ableToRankUp=true
		for (req in rankReqs[player.rank-1]) {
			if (player[req]<rankReqs[player.rank-1][req]) ableToRankUp=false
		}
	}
	if (ableToRankUp) {player.rank+=1;updateRankText()}
}

function buyMult(tier) {
	if (player.num>=costs[tier-1]) {
		player.num-=costs[tier-1]
		player['mult'+tier]+=1
		costs[tier-1]*=1.2
	}
}