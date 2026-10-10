function getStartingPlayer() {
	return {
		rank: 1,

		num: 0,
		mults: [0,0,0,0],
		sacTime: 0,

		/* CASH */
		money: 0,
		gens: [0,0,0],
		fuels: {
			//boosts: [0, 0, 0],
			on: 2,
			time: [0, 0, 0, 0]
		},

		/* RESEARCH */
		research: {
			amt: 1,
			0: {
				amt: 0,
				xp: 0
			},
			1: {
				amt: 0,
				xp: 0
			},
			2: {
				amt: 0,
				xp: 0
			}
		},

		/* OPTION */
		notation: 0,

		/* STATS */
		time: new Date().getTime(),
		timePlayed: 0,
		totalNum: 0,
		rankTime: 0,

		/* VERSIONING */
		version: 1.03,
		build: 1
	}
}
player = getStartingPlayer()

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
			savefile.rank = Math.min(savefile.rank, 5)
			savefile.build = 1
		}
		if (savefile.version < 1.03) {
			savefile.mults = save.multBought

			delete savefile.multBought
			delete savefile.coal
			delete savefile.fuel
			delete savefile.fuelwasted
			delete savefile.genpower
			delete savefile.fuelefficient
		}

		savefile = deepUndefinedAndDecimal(savefile, getStartingPlayer())
		savefile.version = player.version
		savefile.build = player.build
		//savefile.offline = true
		savefile.time = new Date().getTime()
		
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
	//Credit to MrRedShark77.
    let str = btoa(JSON.stringify(player))
    let copyText = document.getElementById('copy')

    copyText.value = str
    copyText.style.visibility = "visible"
    copyText.select();
    document.execCommand("copy");
    copyText.style.visibility = "hidden"

    alert("Copied to clipboard!")
}

function backupSave() {
	//Credit to MrRedShark77.
    let str = btoa(JSON.stringify(player))
    let file = new Blob([str], {type: "text/plain"})

    window.URL = window.URL || window.webkitURL;
    let a = document.createElement("a")
    a.href = window.URL.createObjectURL(file)
    a.download = `Ranks v${player.version} - ${new Date().toGMTString()}.txt`
    a.click()
}

function importSave() {
	var input=prompt('Copy and paste in your exported file and press enter.')
	if (input == null) return

	load(input)
}

function reset() {
	if (prompt(`Are you sure to reset your save? You can't undo your action! To reset, type "YES, I UNDERSTAND THE CONSEQUENCES."`) == "YES, I UNDERSTAND THE CONSEQUENCES.") {
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