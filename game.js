player={timePlayed:0,
num:0,
totalNum:0,
rank:1,
rankTime:0,
mults:[1,1,1],
multBought:[0,0,0],
time:0,
version:1,
build:2}
rankReqs=[{num:10},{num:150},{num:2000},{num:5e5},{num:1e10},{num:1e11}]
costs=[10,2000,5e5]
tab='main'
oldTab=tab

function gameInit() {
	var tickspeed=0
	load(localStorage.getItem('saveRanks'))
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
	if (player.time>0) {
		var newTime=new Date().getTime()
		var diff=(newTime-player.time)/1000
		player.num+=diff*player.mults[0]*player.mults[1]*player.mults[2]
		player.totalNum+=diff*player.mults[0]*player.mults[1]*player.mults[2]
		player.timePlayed+=diff
		player.rankTime+=diff
		rankUp()
	}
	player.time=newTime
	
	if (player.rank>2) {
		showElement('tabs','block')
		if (player.rank>6) {
			showElement('tabstatsbutton','inline')
		} else {
			hideElement('tabstatsbutton')
		}
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
	if (tab=='stats') {
		updateElement('timePlayed','You have played for '+formatTime(player.timePlayed)+'.')
		updateElement('totalNumber','You increased the number by '+format(player.totalNum)+' in total.')
		updateElement('timeRank','You ranked up '+formatTime(player.rankTime)+' ago.')
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

function format(num,decimalPoints=2,offset=0) {
	if (isNaN(num)) {
		return '?'
	} else if (num==1/0) {
		return 'Infinite'
	} else {
		var abbid=Math.max(Math.floor(Math.log10(Math.abs(num))/3)-offset,0)
		var mantissa=num/Math.pow(1000,abbid)
		var log=Math.floor(Math.log10(mantissa))
		mantissa=(abbid==0)?Math.round(mantissa):Math.round(mantissa*Math.pow(10,3*offset+decimalPoints-log))/Math.pow(10,3*offset+decimalPoints-log)
		if (mantissa==Math.pow(1000,1+offset)) {
			mantissa=mantissa/1000
			abbid+=1
		}
		return mantissa+abbs[abbid]
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
	if (ableToRankUp) {player.rank+=1;player.rankTime=0;updateRankText()}
}

function updateCosts() {
	var firstCosts=[10,2e3,5e5]
	for (i=0;i<3;i++) {
		costs[i]=firstCosts[i]*Math.pow(1.1,player.multBought[i])
	}
}

function buyMult(tier) {
	if (player.num>=costs[tier-1]) {
		player.num-=costs[tier-1]
		player.multBought[tier-1]+=1
		player.mults[tier-1]*=100/99
		player.mults[tier-1]=Math.ceil(player.mults[tier-1])
		
		updateCosts()
	}
}
	
function switchTab(tabName) {
	tab=tabName
}

function save() {
	try {
		localStorage.setItem('saveRanks',btoa(JSON.stringify(player)))
		console.log('Game saved!')
	} catch (e) {
		console.log('Well, we tried.')
	}
}

function load(savefile) {
	try {
		savefile=JSON.parse(atob(savefile))
		if (savefile.build==undefined) {
			savefile.version=1
			savefile.build=1
		}
		if (savefile.version<2) {
			if (savefile.build<2) {
				savefile.time=new Date().getTime()
				savefile.timePlayed=0
				savefile,totalNum=0
				savefile.rankTime=0
			}
		}
		savefile.version=player.version
		savefile.build=player.build
		
		player=savefile
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

function reset() {
	if (confirm('Are you sure to reset your save? You can\'t undo your action!')) {
		player.num=0
		player.rank=1
		player.mults=[1,1,1]
		player.multBought=[0,0,0]
		localStorage.clear('saveRanks')
		
		updateRankText()
		updateCosts()
		tab='main'
	}
}