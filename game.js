player={timePlayed:0,
notation:0,
num:0,
totalNum:0,
rank:1,
rankTime:0,
mults:[1,1,1],
multBought:[0,0,0],
money:0,
gens:[0,0,0],
coal:0,
fuel:0,
fuelwasted:0,
genpower:2,
fuelefficent:1,
time:0,
version:1.01,
build:1}
rankReqs=[{num:10},{num:2000},{num:5e5},{num:1e10},{num:1e12,money:5},{num:1e14,money:500,coal:100,fuel:5}]
notationArray=['Mixed','Scientific']
costs={mults:[],money:[0,0,0,100,200]}
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
	setInterval(save,30000)
}

function gameTick() {
	var newTime=new Date().getTime()
	if (player.time>0) {
		var diff=(newTime-player.time)/1000
		player.num+=diff*getNPS()
		player.totalNum+=diff*getNPS()
		var wastedfuel=diff*player.genpower/(2*player.fuelefficent)
		if (wastedfuel>player.fuel) {
			player.fuelwasted+=player.fuel
			player.fuel=0
		} else {
			player.fuel-=wastedfuel
			player.fuelwasted+=wastedfuel
		}
		player.timePlayed+=diff
		player.rankTime+=diff
		rankUp()
	}
	player.time=newTime
	
	if (player.rank>4) {
		showElement('tabmoneybutton','table-cell')
	} else {
		hideElement('tabmoneybutton')
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
			updateElement('mult1','Increase multiplier<br>'+player.mults[0]+'x<br>Cost: '+format(costs.mults[0]))
		} else {
			hideElement('mult1')
		}
		if (player.rank>2) {
			showElement('mult2','table-cell')
			updateElement('mult2','Increase multiplier<br>'+player.mults[1]+'x<br>Cost: '+format(costs.mults[1]))
		} else {
			hideElement('mult2')
		}
		if (player.rank>3) {
			showElement('mult3','table-cell')
			updateElement('mult3','Increase multiplier<br>'+player.mults[2]+'x<br>Cost: '+format(costs.mults[2]))
		} else {
			hideElement('mult3')
		}
	} else {
		showElement('numberSmall')
		updateElement('numberSmall',format(player.num))
	}
	if (tab=='options') {
		updateElement('notation','Notation:<br>'+notationArray[player.notation])
	}
	if (tab=='stats') {
		updateElement('timePlayed','You have played for '+formatTime(player.timePlayed)+'.')
		updateElement('totalNumber','You increased the number by '+format(player.totalNum)+' in total.')
		updateElement('timeRank','You ranked up '+formatTime(player.rankTime)+' ago.')
		if (player.fuelwasted>0) {
			showElement('fuelWasted')
			updateElement('fuelWasted','You wasted '+format(player.fuelwasted,1,0,false)+' fuel.')
		} else {
			hideElement('fuelWasted')
		}
	}
	if (tab=='money') {
		updateElement('money','You have '+formatMoney(player.money)+'.')
		updateElement('exchange1','Exchange '+format(1e9)+' to 1 cent')
		updateElement('exchange2','Exchange 1 cent to '+format(1e9))
		updateElement('gen1','Generate '+format(1e7)+'/s<br>'+player.gens[0]+'x<br>'+formatMoney(costs.money[0]))
		updateElement('gen2','Generate '+format(1e8)+'/s<br>'+player.gens[1]+'x<br>'+formatMoney(costs.money[1]))
		updateElement('gen3','Generate '+format(1e9)+'/s<br>'+player.gens[2]+'x<br>'+formatMoney(costs.money[2]))
		if (player.rank>5) {
			showElement('coalsection','inline-block')
			updateElement('coal','You have '+format(player.coal)+' coal.')
			updateElement('genpower','Generator power: '+format(player.genpower,2,0,false)+'x')
			updateElement('fuel','Fuel: '+format(player.fuel,1,0,false))
			if (player.rank>6) {
				showElement('upgsection','inline-block')
				updateElement('genpowerUpg','Upgrade gen power<br>'+player.genpower+'x<br>Cost: '+formatMoney(costs.money[3]))
				updateElement('fuelUpg','Increase fuel efficient<br>'+player.fuelefficent+'x<br>Cost: '+formatMoney(costs.money[4]))
			} else {
				hideElement('upgsection')
			}
		} else {
			hideElement('coalsection')
		}
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

function format(num,decimalPoints=2,offset=0,rounded=true) {
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
	if (m < 1) {
		return Math.round(m*100)+' cent'+(m==0.01?'':'s')
	} else {
		return '$'+format(m,2,0,false)
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

function getNPS() {
	return player.mults[0]*player.mults[1]*player.mults[2]+(player.gens[0]*1e7+player.gens[1]*1e8+player.gens[2]*1e9)*(player.fuel>0?player.genpower:1)
}

function updateRankText() {
	var value='Rank '+player.rank
	if (rankReqs[player.rank-1]) {
		value=value+' | Next rank at '
		nextRank=''
		for (req in rankReqs[player.rank-1]) {
			if (nextRank!='') nextRank=nextRank+' & '
			if (req=='num') {
				nextRank=nextRank+format(rankReqs[player.rank-1][req])
			} else if (req=='money') {
				nextRank=nextRank+formatMoney(rankReqs[player.rank-1][req])
			} else {
				nextRank=nextRank+format(rankReqs[player.rank-1][req])+' '+req
			}
		}
		value=value+nextRank
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

function updateValues() {
	player.money=Math.round(player.money*100)/100
}

function updateCosts() {
	var firstCosts=[10,2e3,5e5]
	for (i=0;i<3;i++) {
		costs.mults[i]=firstCosts[i]*Math.pow(1.1,player.multBought[i])
	}
	for (i=0;i<3;i++) {
		costs.money[i]=Math.pow(10,i-1+player.gens[i]*0.01)
	}
	costs.money[3]=Math.pow(player.genpower/2,2)*100
	costs.money[4]=Math.pow(player.fuelefficent,2)*200
}

function buyMult(tier) {
	if (player.num>=costs.mults[tier-1]) {
		player.num-=costs.mults[tier-1]
		player.multBought[tier-1]+=1
		player.mults[tier-1]*=100/99
		player.mults[tier-1]=Math.ceil(player.mults[tier-1])
		
		updateCosts()
	}
}

function exchange(id) {
	switch (id) {
		case 1: if (player.num>=1e9) {player.num-=1e9;player.money+=0.01} break
		case 2: if (player.money>=0.01) {player.money-=0.01;player.num+=1e9} break
		case 3: var gain=Math.floor(player.num/2e9);player.num-=gain*1e9;player.money+=gain/100; break
		case 4: var gain=Math.floor(player.money*50);player.money-=gain/100;player.num+=gain*1e9; break
		case 5: if (player.money>=5) {player.money-=5;player.coal+=1} break
		case 6: if (player.coal>0) {player.coal-=1;player.money+=4} break
		case 7: if (player.coal>4) {player.coal-=5;player.fuel+=5} break
	}
	updateValues()
}

function buyMoney(id) {
	if (player.money>=costs.money[id]) {
		player.money-=costs.money[id]
		switch (id) {
			case 0: case 1: case 2: player.gens[id]+=1; break
			case 3: player.genpower+=1; break
			case 4: player.fuelefficent+=0.5; break
		}
	}
	updateCosts()
	updateValues()
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
		if (savefile.version<1.01) {
			if (savefile.build<2) {
				savefile.time=new Date().getTime()
				savefile.timePlayed=0
				savefile,totalNum=0
				savefile.rankTime=0
			}
			if (savefile.build<3) {
				if (player.rank>2) player.rank-=1
				if (player.rank>5) player.rank-=1
				savefile.notation=0
				savefile.money=0
				savefile.gens=[0,0,0]
				savefile.coal=0
			}
			if (savefile.build<6) {
				savefile.fuel=0
				savefile.fuelwasted=0
				savefile.genpower=2
				savefile.fuelefficent=1
			}
			savefile.build=1
		}
		savefile.version=player.version
		savefile.build=player.build
		
		player=savefile
		console.log('Game loaded!')
	} catch (e) {
		console.log('Your save failed to load: '+e)
	}
	updateRankText()
	updateValues()
	updateCosts()
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
		player.notation=0
		player.num=0
		player.totalNum=0
		player.rank=1
		player.mults=[1,1,1]
		player.multBought=[0,0,0]
		player.money=0
		player.gens=[0,0,0]
		player.coal=0
		player.fuel=0
		player.fuelwasted=0
		player.genpower=2
		player.fuelefficent=1
		player.time=0
		localStorage.clear('saveRanks')
		
		updateRankText()
		updateValues()
		updateCosts()
		tab='main'
	}
}