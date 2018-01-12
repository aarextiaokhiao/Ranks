player={num:0,
rank:1,
mults:[1,1,1],
multBought:[0,0,0],
version:1}
time=new Date().getTime()
rankReqs=[{num:10},{num:150},{num:2000},{num:1e5},{num:2e6}]
costs=[10,2000,1e5]
tab='main'
oldTab=tab

function gameInit() {
	var tickspeed=0
	load(localStorage.getItem('save'))
	updated=true
	setInterval(function(){
		if (updated) {
			updated=false
			setTimeout(function(){
				var startTime=new Date().getTime()
				try {
					gameTick()
				} catch (e) {
					console.log('A game error has been occured: '+e)
				}
				tickspeed=(new Date().getTime()-startTime)*0.2+tickspeed*0.8
				updated=true
			},tickspeed)
		}
	},0)
}

function gameTick() {
	var newTime=new Date().getTime()
	var diff=(newTime-time)/1000
	time=newTime
	
	player.num+=diff*player.mults[0]*player.mults[1]*player.mults[2]
	rankUp()
	
	if (player.rank>2) {
		showElement('tabs','block')
	} else {
		hideElement('tabs')
	}
	if (tab!=oldTab) {
		showElement('tab'+tab,'block')
		hideElement('tab'+oldTab)
		oldTab=tab
	}
	if (tab=='main') {
		hideElement('numberSmall')
		updateElement('number',format(player.num))
		if (player.rank>1) {
			showElement('mult1','table-cell')
			updateElement('mult1','Increase multiplier<br>'+player.mults[0]+'x<br>Cost: '+format(costs[0]))
		} else {
			hideElement('mult1')
		}
		if (player.rank>3) {
			showElement('mult2','table-cell')
			updateElement('mult2','Increase multiplier<br>'+player.mults[1]+'x<br>Cost: '+format(costs[1]))
		} else {
			hideElement('mult2')
		}
		if (player.rank>4) {
			showElement('mult3','table-cell')
			updateElement('mult3','Increase multiplier<br>'+player.mults[2]+'x<br>Cost: '+format(costs[2]))
		} else {
			hideElement('mult3')
		}
	} else {
		showElement('numberSmall')
		updateElement('numberSmall',format(player.num))
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

function updateCosts() {
	var firstCosts=[10,2e3,1e5]
	for (i=0;i<3;i++) {
		costs[i]=firstCosts[i]*Math.pow(1.1,player.multBought[i])
	}
}

function buyMult(tier) {
	if (player.num>=costs[tier-1]) {
		player.num-=costs[tier-1]
		player.multBought[tier-1]+=1
		player.mults[tier-1]*=60/59
		player.mults[tier-1]=Math.ceil(player.mults[tier-1])
		
		updateCosts()
	}
}
	
function switchTab(tabName) {
	tab=tabName
}

function save() {
	try {
		localStorage.setItem('save',btoa(JSON.stringify(player)))
		console.log('Game saved!')
	} catch (e) {
		console.log('Well, we tried.')
	}
}

function load(savefile) {
	try {
		player=JSON.parse(atob(savefile))
		updateRankText()
		updateCosts()
		console.log('Game loaded!')
	} catch (e) {
		console.log('Your save failed to load: '+e)
	}
}

function exportSave() {
	var savefile=btoa(JSON.stringify(player))
	showElement('exportSave','block')
	document.getElementById("exportText").value=btoa(JSON.stringify(player))
}

function importSave() {
	var input=prompt('Copy and paste in your exported file and press enter.')
	if (load(input)) {
		if (input!=null) {
			alert('Your save was invalid or caused a game-breaking bug. :(')
		}
	}
}
