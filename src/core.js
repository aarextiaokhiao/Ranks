function showElement(elementID,style) {
	document.getElementById(elementID).style.display=style
}
	
function hideElement(elementID) {
	document.getElementById(elementID).style.display='none'
}
	
function moveElement(elementID,moveTo) {
	document.getElementById(moveTo).appendChild(document.getElementById(elementID))
}
	
function updateClass(elementID,value) {
	document.getElementById(elementID).className=value
}
	
function updateStyle(elementID,styleID,value) {
	document.getElementById(elementID).style[styleID]=value
}

function updateElement(elementID,value) {
	document.getElementById(elementID).innerHTML=value
}

function switchTab(id) {
	currentTab=id
}

function format(value) {
	if (value == Number.POSITIVE_INFINITY) return '&#x221e;'
	if (Number.isNaN(value)) return '?'
	if (value<999.5) {
		return value.toFixed(0)
	}
	if (player.options.notation!=3) {
		var exponent=Math.floor(Math.log10(value))
		var mantissa=value/Math.pow(10,exponent)
		if (mantissa>9.995) {
			mantissa=1
			exponent++
		}
		if (player.options.notation!=0) {
			var difference=exponent%3
			var group=(exponent-difference)/3
			mantissa=mantissa*Math.pow(10,difference)
		}
	}
	if (player.options.notation==0) {
		//Scientific
		return mantissa.toFixed(2)+'e'+exponent
	} else if (player.options.notation==1) {
		//Engineering
		return mantissa.toFixed(2-difference)+'e'+group*3
	} else if (player.options.notation==2) {
		//Standard
		return mantissa.toFixed(2-difference)+standardAbbs[group-1]
	} else if (player.options.notation==3) {
		//Logarithm
		return 'e'+Math.log10(value).toFixed(2)
	} else if (player.options.notation==4) {
		//Letters
		return mantissa.toFixed(2-difference)+lettersAbbs[group-1]
	} else if (player.options.notation==5) {
		//v1
		return mantissa.toFixed(2-difference)+v1Abbs[group-1]
	}
	return '?'
}

function formatCash(value) {
	if (value == Number.POSITIVE_INFINITY) return '&#x221e;'
	if (Number.isNaN(value)) return '?'
	if (value<0.995) {
		return (value*100).toFixed(0)+'&#x00a2;'
	} else if (value<1) {
		return '$1.00'
	} else if (value<999.995) {
		return '$'+value.toFixed(2)
	}
	if (player.options.notation!=3) {
		var exponent=Math.floor(Math.log10(value))
		var mantissa=value/Math.pow(10,exponent)
		if (mantissa>9.995) {
			mantissa=1
			exponent++
		}
		if (player.options.notation!=0) {
			var difference=exponent%3
			var group=(exponent-difference)/3
			mantissa=mantissa*Math.pow(10,difference)
		}
	}
	if (player.options.notation==0) {
		//Scientific
		return '$'+mantissa.toFixed(2)+'e'+exponent
	} else if (player.options.notation==1) {
		//Engineering
		return '$'+mantissa.toFixed(2-difference)+'e'+group*3
	} else if (player.options.notation==2) {
		//Standard
		return '$'+ mantissa.toFixed(2-difference)+standardAbbs[group-1]
	} else if (player.options.notation==3) {
		//Logarithm
		return '$e'+Math.log10(value).toFixed(2)
	} else if (player.options.notation==4) {
		//Letters
		return '$'+mantissa.toFixed(2-difference)+lettersAbbs[group-1]
	} else if (player.options.notation==5) {
		//v1
		return '$'+mantissa.toFixed(2-difference)+v1Abbs[group-1]
	}
	return '?'
}

function formatTime(s) {
	if (s < 1) {
		if (s < 0.002) return '1 millisecond'
		return Math.floor(s*1000)+' milliseconds'
	} else if (s < 59.5) {
		if (s < 1.005) return '1 second'
		return s.toPrecision(2)+' seconds'
	} else if (s < Number.POSITIVE_INFINITY) {
		var timeFormat=''
		var lastTimePart=''
		var needAnd=false
		var needComma=false
		for (id in timeframes) {
			if (id=='second') {
				s=Math.floor(s)
				if (s>0) {
					if (lastTimePart!='') {
						if (timeFormat=='') {
							timeFormat=lastTimePart
							needAnd=true
						} else {
							timeFormat=timeFormat+', '+lastTimePart
							needComma=true
						}
					}
					lastTimePart=s+(s==1?' second':' seconds')
				}
			} else if (id=='year') {
				var amount=Math.floor(s/31556952)
				if (amount>0) {
					s-=amount*31556952
					lastTimePart=format(amount,2,1)+(amount==1?' year':' years')
				}
			} else {
				var amount=Math.floor(s/timeframes[id])
				if (amount>0) {
					s-=amount*timeframes[id]
					if (lastTimePart!='') {
						if (timeFormat=='') {
							timeFormat=lastTimePart
							needAnd=true
						} else {
							timeFormat=timeFormat+', '+lastTimePart
							needComma=true
						}
					}
					lastTimePart=amount+' '+id+(amount==1?'':'s')
				}
			}
		}
		return timeFormat+(needComma?',':'')+(needAnd?' and ':'')+lastTimePart
	} else {
		return 'eternity'
	}
}

function loadGame() {
	var undecodedSave=localStorage.getItem("MTUyNjUxMTk4NTUxMw==")
	if (undecodedSave==null) gameLoopInterval=setInterval(gameLoop,50)
	else loadSave(undecodedSave)
	updateStyle('loading','top','-100%')
	showElement('mainGame','block')
	setTimeout(function(){hideElement('loading')},2000)
	gameLoop()
}

function saveGame() {
	try {
		localStorage.setItem("MTUyNjUxMTk4NTUxMw==",btoa(JSON.stringify(player)))
		lastSave=new Date().getTime()
	} catch (e) {
		console.log('A error has been occurred while saving:')
		console.error(e)
	}
}

function loadSave(savefile) {
	clearInterval(gameLoopInterval)
		
	try {
		savefile=JSON.parse(atob(savefile))
		
		if (savefile.build==undefined && savefile.beta==undefined) {
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
		}
		if (savefile.version<2) {
			savefile.beta=0
			delete savefile.build
			
			savefile.lastTick=savefile.time
			savefile.number=savefile.num
			savefile.factors=savefile.multBought
			for (factor=1;factor<4;factor++) {
				savefile.factors[factor-1]++
			}
			savefile.factorMultipliers=savefile.mults
			savefile.generators=savefile.gens
			savefile.statistics={playtime:savefile.timePlayed,
				playtimeThisRank:savefile.rankTime,
				totalNumber:savefile.totalNum,
				fuelWasted:savefile.fuelwasted}
			savefile.options={notation:(savefile.notation==0?5:0),
				updateRate:20}
			savefile.upgrades={}
			if (savefile.genpower>2) savefile.upgrades[1]=savefile.genpower-2
			if (savefile.fuelefficent>1) savefile.upgrades[1]=savefile.fuelefficent*2-1
				
			delete savefile.timePlayed
			delete savefile.num
			delete savefile.totalNum
			delete savefile.notation
			delete savefile.multBought
			delete savefile.mults
			delete savefile.rankTime
			delete savefile.totalnum
			delete savefile.gens
			delete savefile.fuelwasted
			delete savefile.genpower
			delete savefile.fuelefficent
			delete savefile.time
		}
		
		if (savefile.version>player.version) throw 'This savefile, which has version '+savefile.version+' saved, was incompatible to version '+player.version+'.'
		else if (savefile.version==player.version) {
			if (savefile.beta>player.beta) throw 'This savefile, which has beta '+savefile.beta+' saved, was incompatible to beta '+player.beta+'.'			
		}
		savefile.version=player.version
		savefile.beta=player.beta
		
		player=savefile
		
		hideElement('exportSave')
		updateRankText()
		recalculateTotalMultiplier()
		for (id=1;id<4;id++) {
			costs.factors[id-1]=firstCosts.factors[id-1]*Math.pow(1.1,player.factors[id-1]-1)
			costs.generators[id-1]=Math.pow(1.2,player.generators[id-1])*firstCosts.generators[id-1]
		}
		for (id in player.upgrades) {
			id=parseInt(id)-1
			costs.upgrades[id]=firstCosts.upgrades[id]*Math.pow(upgradeCostFactors[id-1],player.upgrades[id]-1)
		}
		recalculateFuelPower()
		maxMillisPerTick=1000/player.options.updateRate
		
		tickAfterSimulated=new Date().getTime()
		simulated=true
		simulatedTickLength=(tickAfterSimulated-player.lastTick)/1e6
		simulatedTicksLeft=1000
		while (simulatedTicksLeft>0) {
			gameTick()
			simulatedTicksLeft--
		}
		simulated=false
		player.lastTick=tickAfterSimulated
		saveGame()
	} catch (e) {
		console.log('A error has been occurred while loading:')
		console.error(e)
	}
	
	gameLoopInterval=setInterval(gameLoop,maxMillisPerTick)
}

function exportSave() {
	var savefile=btoa(JSON.stringify(player))
	showElement('exportSave','block')
	document.getElementById("exportText").value=btoa(JSON.stringify(player))
}

function importSave() {
	var savefile=prompt('Copy and paste in your exported file and press enter.')
	if (savefile!='') loadSave(savefile)
}

function resetGame() {
	if (confirm("Are you sure to reset the game? Everything would be lost!")) {
		clearInterval(gameLoopInterval)
				
		player.rank=1
		player.number=0
		player.factors=[1,1,1]
		player.factorMultipliers=[1,1,1]
		player.money=0
		player.generators=[0,0,0]
		player.coal=0
		player.fuel=0
		player.upgrades={}
		player.statistics.playtime=0
		player.statistics.playtimeThisRank=0
		player.statistics.totalNumber=0
		player.statistics.fuelWasted=0
		player.options.notation=0
		player.options.updateRate=20
		
		localStorage.clear("MTUyNjUxMTk4NTUxMw==")
		hideElement('exportSave')
		updateElement('rank','<b>Rank</b>: 1 (Next requires 10)')
		costs={factors:[10,2e3,5e5],generators:[0.1,1,10],upgrades:[10,20]}
		totalFactorMultiplier=1
		totalGeneratorProduction=0
		totalMultiplier=1
		genPower=2
		fuelEfficiency=2
		wastedFuelPerSecond=2
		lastSave=new Date().getTime()
		maxMillisPerTick=50
		
		gameLoopInterval=setInterval(gameLoop,maxMillisPerTick)
	}
}

function changeUpdateRate() {
	clearInterval(gameLoopInterval)
	
	player.options.updateRate+=5
	if (player.options.updateRate==Number.MAX_VALUE) player.options.updateRate=5
	if (player.options.updateRate==65) player.options.updateRate=Number.MAX_VALUE
	
	maxMillisPerTick=1000/player.options.updateRate
	gameLoopInterval=setInterval(gameLoop,maxMillisPerTick)
}

function gameLoop() {
	if (tickDone) {
		tickDone=false
		setTimeout(function(){
			var startTime=new Date().getTime()
			try {
				gameTick()
			} catch (e) {
				console.log('A game error has occured:')
				console.error(e)
			}
			tickSpeed=Math.max((new Date().getTime()-startTime)*0.2+tickSpeed*0.8,maxMillisPerTick)
			startTime=new Date().getTime()
			tickDone=true
		},tickSpeed-maxMillisPerTick)
	}
}