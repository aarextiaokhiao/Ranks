function getStartingPlayer() {
	return {
		rank: 1,

		num: 0,
		multBought: [0,0,0],
		sacTime: 0,

		money: 0,
		gens: [0,0,0],
		coal: 0,
		fuel: 0,
		fuelwasted: 0,
		genpower: 2,
		fuelefficent: 1,

		/* OPTION */
		notation: 0,

		/* STATS */
		time: new Date().getTime(),
		timePlayed: 0,
		totalNum: 0,
		rankTime: 0,

		/* VERSIONING */
		version: 1.02,
		build: 2
	}
}
player = getStartingPlayer()

rankReqs=[
	{ num: 5 },
	{ num: 100 },
	{ num: 1e3 },
	{ num: 5e4 },
	{ num: 1/0, money: 50 },
	{ num: 1e14, money: 500, coal: 100, fuel: 5 }
]

function gameInit() {
	load(localStorage.getItem('saveRanks'))
	updated=true

	setInterval(() => {
		var newTime = new Date().getTime()
		var diff = (newTime - player.time) / 1000
		player.time = newTime

		try {
			gameTick(diff)
		} catch (e) {
			console.error('A game error has been occured.', e)
		}
	}, 1e3 / 20)

	setInterval(save, 30000)
}

function gameTick(diff) {
	// Temp
	updateTemp()

	// Gameplay
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

	// Displays
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
		for (var i = 1; i <= 3; i++) {
			if (player.rank > i) {
				showElement('mult' + i)
				updateElement('mult' + i, `
					<h3>Increase multiplier</h3>
					${temp.mults[i-1]}x<br>
					Cost: ${format(temp.costs.mults[i - 1])}
				`)
			} else {
				hideElement('mult' + i)
			}
		}

		if (player.rank >= 4) {
			showElement("sacsection")
			updateElement('sacTime', `${formatTime(player.sacTime)} stored`)
			updateElement('sacBtn', `
				<h3>Sacrifice for +60s</h3>
				Cost: ${format(temp.costs.sac)}
			`)
		} else {
			hideElement("sacsection")
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
		updateElement('exchange1',format(1e4)+' -> 1 cent')
		updateElement('exchange2','1 cent -> '+format(1e4))
		updateElement('moneyMult',`${format(temp.mults.money, 2)}x Number production`)
		for (var i = 1; i <= 3; i++) {
			updateElement('gen' + i,`
				<h3>+.5x Multiplier</h3>
				${formatMoney(temp.costs.money[i-1])}
			`)
		}

		if (player.rank>5) {
			showElement('coalsection','inline-block')
			updateElement('coal','You have '+format(player.coal)+' coal.')
			updateElement('genpower','Generator power: '+format(player.genpower,2,0,false)+'x')
			updateElement('fuel','Fuel: '+format(player.fuel,1,0,false))

			if (player.rank>6) {
				showElement('upgsection','inline-block')
				updateElement('genpowerUpg','Upgrade gen power<br>'+player.genpower+'x<br>Cost: '+formatMoney(temp.costs.money[3]))
				updateElement('fuelUpg','Increase fuel efficient<br>'+player.fuelefficent+'x<br>Cost: '+formatMoney(temp.costs.money[4]))
			} else {
				hideElement('upgsection')
			}
		} else {
			hideElement('coalsection')
		}
	}
}

function getNPS() {
	return temp.mults.total * temp.mults.money //*(player.fuel>0?player.genpower:1)
}

function updateRankText() {
	var value='Rank '+player.rank
	if (rankReqs[player.rank-1]) {
		value=value+' | Next rank at '
		nextRank=''
		for (var req in rankReqs[player.rank-1]) {
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
	if (rankReqs[player.rank-1] == undefined) return
	for (var req in rankReqs[player.rank-1]) {
		if (player[req] < rankReqs[player.rank-1][req]) return
	}

	player.rank++
	player.rankTime=0
	updateRankText()
}

function updateValues() {
	player.money=Math.round(player.money*100)/100
}

function buyMult(tier) {
	if (player.num>=temp.costs.mults[tier-1]) {
		player.num-=temp.costs.mults[tier-1]
		player.multBought[tier-1]+=1
		player.mults[tier-1]*=100/99
		player.mults[tier-1]=Math.ceil(player.mults[tier-1])
	}
	updateCosts()
}

function sacrifice() {
	if (player.num < temp.costs.sac) return
	player.num = 0
	player.sacTime += 60
}

function timewarp() {
	if (player.sacTime < 60) return
	player.sacTime -= 60
	gameTick(60)
}

function exchange(id) {
	switch (id) {
		case 1: if (player.num>=1e4) {player.num-=1e4;player.money++} break
		case 2: if (player.money>=0.01) {player.money--;player.num+=1e4} break
		case 3: var gain=Math.floor(player.num/2e4);player.num-=gain*1e4;player.money+=gain; break
		case 4: var gain=Math.floor(player.money/2);player.money-=gain;player.num+=gain*1e4; break
		case 5: if (player.money>=5) {player.money-=5;player.coal+=1} break
		case 6: if (player.coal>0) {player.coal-=1;player.money+=4} break
		case 7: if (player.coal>4) {player.coal-=5;player.fuel+=5} break
	}
	updateValues()
}

function buyMoney(id) {
	if (player.money>=temp.costs.money[id]) {
		player.money-=temp.costs.money[id]
		switch (id) {
			case 0: case 1: case 2: player.gens[id]+=1; break
			case 3: player.genpower+=1; break
			case 4: player.fuelefficent+=0.5; break
		}
	}
	updateValues()
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
			if (savefile.build<3) {
				if (player.rank>2) player.rank-=1
				if (player.rank>5) player.rank-=1
			}
			savefile.build=1
		}
		if (savefile.version < 1.02) {
			savefile.num = Math.min(savefile.num, 1e5)
			savefile.gens = [0, 0, 0]
			savefile.money = 0
			savefile.multBought = [0, 0, 0]
			savefile.build = 1
			savefile.rank = Math.min(savefile.rank, 5)
		}

		savefile = deepUndefinedAndDecimal(savefile, getStartingPlayer())
		savefile.version = player.version
		savefile.build = player.build
		
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
	if (confirm(`Are you sure to reset your save? You can't undo your action!`)) {
		player = getStartingPlayer()
		localStorage.removeItem('saveRanks')

		updateRankText()
		updateValues()
		tab='main'
	}
}

//Credit to MrRedShark77.
function deepUndefinedAndDecimal(obj, data) {
    if (obj == null) return data
    for (let k in data) {
        if (obj[k] === null) continue
        if (obj[k] === undefined) obj[k] = data[k]
        else {
            if (typeof obj[k] == 'object') deepUndefinedAndDecimal(obj[k], data[k])
        }
    }
    return obj
}