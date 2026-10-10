rankReqs=[
	// Number: Ranks 1 - 4
	{ num: 5 },
	{ num: 100 },
	{ num: 1e3 },
	{ num: 5e4 },

	// Cash: Ranks 5 - 6
	{ num: 5e6, money: 500 },
	{ num: 75e6, money: 7500 },

	// Research: Ranks 7 - 10
	{ num: 1e8, money: 1e4 },
	{ money: 75e3, research: 15 },
	{ num: 2e9, money: 2e5 },
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
			console.error('A game error has been occurred.', e)
		}
	}, 1e3 / 20)

	setInterval(() => {
		updateElement("title", "Ranks - " + format(player.num))
	}, 1000)

	//setInterval(save, 30000)
}

function gameTick(diff) {
	// Temp
	updateTemp()

	// Gameplay
	player.num+=diff*getNPS()
	player.totalNum+=FUEL.calcRelativeTick(diff, 0)*getNPS()
	RESEARCH.tick(diff)
	rankUp()

	FUEL.tick(diff)

	player.timePlayed+=diff
	player.rankTime+=diff
	delete player.offline

	// Displays
	if (player.rank>4) {
		showElement('tabmoneybutton','table-cell')
	} else {
		hideElement('tabmoneybutton')
	}
	if (player.rank>6) {
		showElement('tabresearchbutton','table-cell')
	} else {
		hideElement('tabresearchbutton')
	}
	if (tab!=oldTab) {
		showElement('tab'+tab,'block')
		hideElement('tab'+oldTab)
		oldTab=tab
	}
	if (tab=='main') {
		hideElement('numberSmall')
		updateElement('number',format(player.num))
		for (var i = 0; i < 4; i++) {
			if (player.rank >= [1, 2, 3, 8][i]) {
				showElement('mult' + i)
				updateElement('mult' + i, `
					<h3>Increase multiplier</h3>
					${format(temp.mults[i], 1, true)}x<br>
					Cost: ${format(temp.costs.mults[i])}
				`)
			} else {
				hideElement('mult' + i)
			}
		}

		if (player.rank >= 4) {
			showElement("sacsection")
			updateElement('sacTime', `${formatTime(player.sacTime)} stored`)
			updateElement('sacBtn', `
				<h3>Sacrifice for +${formatTimeShort(getSacrificeGain())}</h3>
				Cost: ${format(temp.costs.sac)}
			`)
			updateElement('sacBtn2', `Use +${formatTimeShort(getSacrificeGain())}`)
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
	}
	if (tab=='money') {
		updateElement('money', formatMoney(player.money))
		updateElement('exchange1', format(1e4)+' -> 1 cent')
		updateElement('exchange2', '1 cent -> '+format(1e4))
		updateElement('moneyMult', `<b class='effect'>${format(temp.mults.money, 1, true)}x</b> Number production`)
		for (var i = 0; i < 3; i++) {
			updateElement('fuelMode', `Toggle: ` + ["Paused", "Online", "On"][player.fuels.on])
			updateElement('gen' + i,`
				<h3>+.5x Multiplier</h3>
				${formatMoney(temp.costs.gens[i])}
			`)
		}
		FUEL.html()
	}
	if (tab=='research') {
		RESEARCH.html()
	}
}

function getNPS(visual) {
	let r = temp.mults.total * temp.mults.money
	if (FUEL.isActivated(0)) r *= FUEL.boosts[0].mult
	if (visual) r *= RESEARCH.boost(0)

	return r
}

function updateRankText() {
	var value='Rank '+player.rank
	var req = rankReqs[player.rank-1]
	if (req !== undefined) {
		value = value + ' | <b>Next</b>: '
		nextRank = ''
		for (var [id, amt] of Object.entries(req)) {
			if (nextRank != '') nextRank += ', '
			nextRank += CURRENCIES[id].display(amt)
		}
		value = value + nextRank
	}
	updateElement('rank',value)
}

function rankUp() {
	var req = rankReqs[player.rank-1]
	if (req == undefined) return

	for (var id in req) {
		if (CURRENCIES[id].value < req[id]) return
	}

	player.rank++
	player.rankTime=0
	updateRankText()
}

function updateValues() {
	player.money = Math.round(player.money * 100) / 100
}

function buyUpgrade(type, tier) {
	let cost = temp.costs[type][tier]
	let curr = CURRENCIES[type == "gens" ? "money" : "num"]

	if (curr.value < cost) return
	curr.value -= cost

	player[type][tier] += 1

	updateValues()
	updateCosts()
}

function getSacrificeGain() {
	let r = 60 * RESEARCH.boost(1)
	if (FUEL.isActivated(3)) r *= FUEL.boosts[3].mult

	return r
}

function sacrifice() {
	if (player.num < temp.costs.sac) return
	player.num = 0
	player.sacTime += getSacrificeGain()
}

function timewarp(id) {
	let amt = getSacrificeGain()
	if (player.sacTime < amt) return

	player.num += amt*getNPS()
	player.totalNum += amt*getNPS()
	player.sacTime -= amt
}

function exchange(id) {
	switch (id) {
		case 1: if (player.num>=1e4) {player.num-=1e4;player.money++} break
		case 2: if (player.money>=0.01) {player.money--;player.num+=1e4} break
		case 3: var gain=Math.floor(player.num/2e4);player.num-=gain*1e4;player.money+=gain; break
		case 4: var gain=Math.floor(player.money/2);player.money-=gain;player.num+=gain*1e4; break
	}
	updateValues()
}

let CURRENCIES = {
	num: {
		get value() {
			return player.num
		},
		set value(x) {
			player.num = x
		},
		display: (x) => format(x)
	},
	money: {
		get value() {
			return player.money
		},
		set value(x) {
			player.money = x
		},
		display: (x) => formatMoney(x)
	},
	research: {
		get value() {
			return player.research.amt
		},
		set value(x) {
			player.research.amt = x
		},
		display: (x) => format(x, 0) + " research"
	}
}

let FUEL = {
	//Data
	boosts: [
		{
			title: "3x Number",
			rank_req: 6,
			mult: 3,
			cost_amt: 500,
			cost_res: "money"
		}, {
			title: "5x Research",
			rank_req: 8,
			mult: 5,
			cost_amt: 2e7,
			cost_res: "num"
		}, {
			title: "2x Research XP",
			rank_req: 9,
			mult: 2,
			cost_amt: 1e4,
			cost_res: "money"
		}, {
			title: "1.5x Stored Time",
			rank_req: 10,
			mult: 1.5,
			cost_amt: 1,
			cost_res: "research"
		}
	],

	//Gameplay
	calcRelativeTick(dt, i) {
		if (FUEL.isActivated(i)) dt += Math.min(dt, player.fuels.time[i]) * (FUEL.boosts[i].mult - 1)
		return dt
	},
	tick(dt) {
		if (player.rank < 6) return

		let times = player.fuels.time
		for (var i in times) if (this.isActivated(i)) times[i] = Math.max(times[i] - dt, 0)
	},
	fill(i) {
		let boost = FUEL.boosts[i]
		if (CURRENCIES[boost.cost_res].value < boost.cost_amt) return

		CURRENCIES[boost.cost_res].value -= boost.cost_amt
		player.fuels.time[i] = Math.min(player.fuels.time[i] + 60, this.fuelCap())
	},
	isActivated(i) {
		if (player.fuels.on == 0) return
		if (player.fuels.on == 1 && player.offline) return
		return player.fuels.time[i] > 0
	},
	fuelCap() {
		let r = 300
		r *= RESEARCH.boost(2)

		return r
	},

	//HTML
	setup() {
		let h = ``
		for (var [i, boost] of Object.entries(this.boosts)) {
			h += `<div class="fuel" id="fuel_${i}">
				<h3>${boost.title}</h3>
				<div id="fuel_${i}_amt"></div>
				<button class='bigButton' id="fuel_${i}_btn" onclick="FUEL.fill(${i})">
					<h3>Fill 1m</h3>
					Cost: ???
				</button>
			</div>`
		}
		updateElement("fuel_boosts", h)		
	},
	html() {
		if (player.rank < 6) {
			hideElement("fuel_div")
			return
		}
		showElement("fuel_div")

		let fuel_cap = this.fuelCap()
		for (var [i, boost] of Object.entries(this.boosts)) {
			if (player.rank >= boost.rank_req) {
				showElement("fuel_" + i)
				updateElement("fuel_" + i + "_amt", `
					<b>Fuel</b>: ${formatTimeShort(player.fuels.time[i])} / ${formatTimeShort(fuel_cap)}
				`)
				updateElement("fuel_" + i + "_btn", `
					<h3>Fill 1m</h3>
					Cost: ${CURRENCIES[boost.cost_res].display(boost.cost_amt)}
				`)
			} else {
				hideElement("fuel_" + i)
			}
		}
	},
}