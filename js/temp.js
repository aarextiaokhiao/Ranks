let temp = {
	costs: {
		mults: [],
		money: []
	},
	mults: {
		total: 1
	}
}

function updateCosts() {
	var firstCosts = [10, 50, 500]
	for (var i=0;i<3;i++) {
		temp.costs.mults[i] = firstCosts[i] * Math.pow(1.5, player.multBought[i])
	}
	temp.costs.sac = getNPS() * 45

	for (var i = 0; i < 3; i++) {
		temp.costs.money[i] = Math.ceil(Math.pow(1.5, player.gens[i]) * Math.pow(5, i))
	}
	temp.costs.money[3] = Math.pow(player.genpower / 2, 2) * 100
	temp.costs.money[4] = Math.pow(player.fuelefficent, 2) * 200
}

function updateMults() {
	var total = 1
	for (var i = 0; i < 3; i++) {
		var mult = 1 + player.multBought[i] / 2
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
	updateCosts()
	updateMults()
}