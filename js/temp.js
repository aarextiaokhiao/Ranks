let temp = {
	costs: {
		mults: [],
		gens: []
	},
	mults: {
		total: 1
	},
	research: {
		lvl: [],
		eff: []
	}
}

function updateCosts() {
	var firstCosts = [10, 50, 500, 2e8]
	for (var i = 0; i < 4; i++) {
		temp.costs.mults[i] = firstCosts[i] * Math.pow(1.5, player.mults[i])
	}
	temp.costs.sac = getNPS() * 45

	for (var i = 0; i < 3; i++) {
		temp.costs.gens[i] = Math.ceil(Math.pow(1.7, player.gens[i]) * Math.pow(5, i))
	}
}

function updateMults() {
	var total = 1
	for (var i = 0; i < 4; i++) {
		var mult = 1 + player.mults[i] / 2
		temp.mults[i] = mult
		total *= mult
	}
	temp.mults.total = total

	var total = 1
	for (var i = 0; i < 3; i++) {
		var mult = player.gens[i] / 2
		total += mult
	}
	temp.mults.money = total
}

function updateTemp() {
	RESEARCH.temp()
	updateMults()
	updateCosts()
}