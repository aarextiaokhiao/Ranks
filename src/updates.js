function gameTick() {
	var tickTime=new Date().getTime()
	if (player.lastTick>0) {
		if (simulated) var delta=simulatedTickLength
		else {
			var delta=(tickTime-player.lastTick)/1000
			sinceLastSave=Math.floor((tickTime-lastSave)/1000)
		}
		if (sinceLastSave>59) {
			saveGame()
		}
		player.statistics.playtime+=delta
		player.statistics.playtimeThisRank+=delta
		
		ableToRankUp=true
		needToUpdate=false
		do {
			var rankReq=rankRequirements[player.rank-1]
			if (rankReq!=undefined) {
				ableToRankUp=true
				for (req in rankReq) {
					if (ableToRankUp) {
						if (player[req]<rankReq[req]) ableToRankUp=false
					}
				}
			} else {
				ableToRankUp=false
			}
			if (ableToRankUp) {
				player.rank++
				player.statistics.playtimeThisRank=0
				needToUpdate=true
			}
		} while (ableToRankUp)
		if (needToUpdate) updateRankText()
			
		if (player.fuel>0) {
			var addNumber=0
			var totalPower=wastedFuelPerSecond*delta
			if (totalPower>player.fuel) {
				addNumber=totalGeneratorProductionWithoutBoost*(genPower-1)*player.fuel/wastedFuelPerSecond
				player.statistics.fuelWasted+=player.fuel
				player.fuel=0
				recalculateTotalMultiplier()
			} else {
				player.fuel-=totalPower
				player.statistics.fuelWasted+=totalPower
			}
			addNumber+=totalMultiplier*delta
		} else var addNumber=totalMultiplier*delta
		player.number+=addNumber
		player.statistics.totalNumber+=addNumber
		if (simulated) {
			return
		}
	}
	player.lastTick=tickTime
	
	var variant=false
	if (player.rank>4) {
		showElement('tabButton_money','table-cell')
	} else {
		hideElement('tabButton_money')
	}
	if (player.rank>6) {
		showElement('tabButton_upgrades','table-cell')
	} else {
		hideElement('tabButton_upgrades')
	}
	if (currentTab!=oldTab) {
		hideElement('tab_'+oldTab)
		showElement('tab_'+currentTab,'block')
		oldTab=currentTab
	}
	if (currentTab=='number') {
		updateElement('number',format(player.number))
		if (player.rank>1) {
			updateElement('totalMultiplier',format(totalMultiplier))
			showElement('frame_factors','block')
			for (factor=1;factor<4;factor++) {
				var showFactor=true
				if (factor>1) {
					if (player.rank>factor) showElement('factorCell_'+factor,'table-cell')
					else {
						showFactor=false
						hideElement('factorCell_'+factor)
					}
				}
				if (showFactor) {
					updateElement('factor_'+factor,format(player.factorMultipliers[factor-1]))
					updateElement('upgradeFactor_'+factor,'Level: '+player.factors[factor-1]+'<br>Cost: '+format(costs.factors[factor-1]))
					if (player.number<costs.factors[factor-1]) updateClass('upgradeFactor_'+factor,'cantAfford')
					else updateClass('upgradeFactor_'+factor,'shopButton')
				}
			}
			if (totalFactorMultiplier==totalMultiplier) {
				hideElement('totalFactorMultiplier')
			} else {
				showElement('totalFactorMultiplier','block')
				updateElement('totalFactorMultiplier_value',format(totalFactorMultiplier))
			}
		} else hideElement('frame_factors')
	}
	if (currentTab=='money') {
		updateElement('tab_money_number',format(player.number))
		updateElement('money',formatCash(player.money))
		updateElement('addABillion','+'+format(1e9))
		updateElement('aBillion',format(1e9))
		updateElement('generatorName_1',format(1e6)+' generator')
		updateElement('generatorName_2',format(1e7)+' generator')
		updateElement('generatorName_3',format(1e8)+' generator')
		for (generator=1;generator<4;generator++) {
			updateElement('generator_'+generator,player.generators[generator-1])
			updateElement('buyGenerator_'+generator,'Buy<br>Cost: '+formatCash(costs.generators[generator-1]))
			if (player.money<costs.generators[generator-1]) updateClass('buyGenerator_'+generator,'cantAfford')
			else updateClass('buyGenerator_'+generator,'shopButton')
		}
		if (player.fuel>0) {
			updateElement('totalGeneratorProduction',format(totalGeneratorProductionWithoutBoost)+' x '+format(genPower)+' = '+format(totalGeneratorProduction))
		} else {
			updateElement('totalGeneratorProduction',format(totalGeneratorProduction))
		}
		if (player.rank>5) {
			showElement('frame_coal','block')
			updateElement('coal',format(player.coal))
			updateElement('fuel',format(player.fuel))
			updateElement('coalRatio',format(Math.ceil(player.fuel)+1))
			updateElement('fuelRate',format(wastedFuelPerSecond))
		} else hideElement('frame_coal')
	}
	if (currentTab=='upgrades') {
		for (upgrade=1;upgrade<3;upgrade++) {
			updateElement('upgrade_'+upgrade,'Level: '+(player.upgrades[upgrade-1]==undefined?0:player.upgrades[upgrade-1])+'<br>Cost: '+formatCash(costs.upgrades[upgrade-1]))
		}
		updateElement('genPower',format(genPower))
		updateElement('fuelEfficiency',format(fuelEfficiency*50))
	}
	if (currentTab=='statistics') {
		updateElement('statsPlaytimeValue',formatTime(player.statistics.playtime))
		updateElement('statsTotalNumberValue',format(player.statistics.totalNumber))
		if (player.rank>1) {
			showElement('statsPlaytimeThisRank','table-row')
			updateElement('statsPlaytimeThisRankValue',formatTime(player.statistics.playtimeThisRank))
		} else hideElement('statsPlaytimeThisRank')
		if (player.rank>5) {
			showElement('statsFuelWasted','table-row')
			updateElement('statsFuelWastedValue',format(player.statistics.fuelWasted))
		} else hideElement('statsFuelWasted')
	}
	if (currentTab=='options') {
		updateElement('saveGame','Save<br>('+sinceLastSave+'s ago)')
		updateElement('notationOption','Notation: <br>'+notationArray[player.options.notation])
		if (player.options.updateRate==Number.MAX_VALUE) {
			updateElement('updateRate','Update rate:<br>Unlimited')
		} else {
			updateElement('updateRate','Update rate:<br>'+player.options.updateRate+' TPS')
		}
	}
}

function updateRankText() {
	rankText='<b>Rank</b>: '+player.rank
	var rankReq=rankRequirements[player.rank-1]
	if (rankReq) {
		nextRankText=''
		for (req in rankRequirements[player.rank-1]) {
			var stored=''
			if (nextRankText!='') stored=nextRankText+' & '
			if (req=='number') nextRankText=stored+format(rankReq[req])
			else if (req=='money') nextRankText=stored+formatCash(rankReq[req])
			else nextRankText=stored+format(rankReq[req])+' '+req
		}
		rankText=rankText+' (Next requires '+nextRankText+')'
	}
	updateElement('rank',rankText)
}

function recalculateTotalMultiplier() {
	totalFactorMultiplier=player.factorMultipliers[0]*player.factorMultipliers[1]*player.factorMultipliers[2]
	totalGeneratorProductionWithoutBoost=player.generators[0]*1e6+player.generators[1]*1e7+player.generators[2]*1e8
	totalGeneratorProduction=totalGeneratorProductionWithoutBoost
	if (player.fuel>0) totalGeneratorProduction*=genPower
	totalMultiplier=totalFactorMultiplier+totalGeneratorProduction
}

function upgradeFactor(id) {
	if (player.number>=costs.factors[id-1]) {
		player.number-=costs.factors[id-1]
		player.factors[id-1]++
		player.factorMultipliers[id-1]=Math.ceil(player.factorMultipliers[id-1]*100/99)
		recalculateTotalMultiplier()
		costs.factors[id-1]=firstCosts.factors[id-1]*Math.pow(1.1,player.factors[id-1]-1)
	}
}

function exchange(id,reverse,half) {
	if (reverse) {
		if (player[exchangeRates[id-1][2]]>=exchangeRates[id-1][3]) {
			if (half) {
				var amount=Math.round(player[exchangeRates[id-1][2]]/exchangeRates[id-1][3]/2)
				player[exchangeRates[id-1][2]]-=exchangeRates[id-1][3]*amount
				player[exchangeRates[id-1][0]]+=exchangeRates[id-1][1]*amount
			} else {
				player[exchangeRates[id-1][2]]-=exchangeRates[id-1][3]
				player[exchangeRates[id-1][0]]+=exchangeRates[id-1][1]
			}
			if (id==1) fixMoneyAmount()
			if (id==2) fixMoneyAmount()
		}
	} else {
		if (player[exchangeRates[id-1][0]]>=exchangeRates[id-1][1]) {
			if (half) {
				var amount=Math.round(player[exchangeRates[id-1][0]]/exchangeRates[id-1][1]/2)
				player[exchangeRates[id-1][0]]-=exchangeRates[id-1][1]*amount
				player[exchangeRates[id-1][2]]+=exchangeRates[id-1][3]*amount
			} else {
				player[exchangeRates[id-1][0]]-=exchangeRates[id-1][1]
				player[exchangeRates[id-1][2]]+=exchangeRates[id-1][3]
			}
			if (id==1) fixMoneyAmount()
			if (id==2) fixMoneyAmount()
		}
	}
}

function fixMoneyAmount() {
	if (player.money<1e14) player.money=Math.round(player.money*100)/100
}

function buyGenerator(id) {
	if (player.money>=costs.generators[id-1]) {
		player.money-=costs.generators[id-1]
		player.generators[id-1]++
		costs.generators[id-1]=Math.pow(1.2,player.generators[id-1])*firstCosts.generators[id-1]
		recalculateTotalMultiplier()
		fixMoneyAmount()
	}
}

function getFuel(half) {
	var ratio=Math.ceil(player.fuel)+1
	if (player.coal>=ratio) {
		if (half) {
			var b=(1+2*ratio)/2
			var addAmount=Math.round((Math.sqrt(b*b+2*player.coal)-b)/2)
			player.coal-=1/2*addAmount*addAmount+b*addAmount
			player.fuel+=addAmount
		} else {
			player.coal-=ratio
			player.fuel++
		}
		recalculateTotalMultiplier()
	}
}

function recalculateFuelPower() {
	genPower=(player.upgrades[0]==undefined?2:2+player.upgrades[0])
	fuelEfficiency=(player.upgrades[1]==undefined?2:2+player.upgrades[1])
	wastedFuelPerSecond=genPower/fuelEfficiency
}

function buyUpgrade(id) {
	if (player.money>=costs.upgrades[id-1]) {
		player.money-=costs.upgrades[id-1]
		if (player.upgrades[id-1]==undefined) player.upgrades[id-1]=1
		else player.upgrades[id-1]++
		costs.upgrades[id-1]=Math.pow(upgradeCostFactors[id-1],player.upgrades[id-1])*firstCosts.upgrades[id-1]
		recalculateTotalMultiplier()
		if (id==1) recalculateFuelPower()
		if (id==2) recalculateFuelPower()
		fixMoneyAmount()
	}
}

function switchNotation() {
	player.options.notation++
	if (player.options.notation==notationArray.length) player.options.notation=0
	
	updateRankText()
}