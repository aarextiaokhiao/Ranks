let RESEARCH = {
	//Data
	rps(visual) {
		let r = 1 / 600
		if (FUEL.isActivated(1) && visual) r *= FUEL.boosts[1].mult

		return r
	},
	boosts: [
		{
			title: "More Number",
			eff: xp => Math.cbrt(xp / 600 + 1),
			rank_req: 7,
		}, {
			title: "More Stored Time",
			eff: xp => Math.log10(xp / 600 + 1) + 1,
			rank_req: 7,
		}, {
			title: "More Fuel Cap",
			eff: xp => Math.log10(xp / 600 + 1) / 2 + 1,
			rank_req: 9
		}
	],

	//Boosts
	boost(id, def = 1) {
		return temp.research.eff[id] ?? def
	},

	//Gameplay
	assort(i, type) {
		let amt = 1
		if (player.research.mode) {
			amt = Math.ceil((type == "pos" ? player.research.amt : player.research[i].amt) / 2)
		}
		if (type == "pos" && player.research.amt >= amt) {
			player.research[i].amt += amt
			player.research.amt -= amt
		}
		if (type == "neg" && player.research[i].amt >= amt) {
			player.research[i].amt -= amt
			player.research.amt += amt
		}
	},

	tick(dt) {
		if (player.rank < 7) return
		player.research.amt += FUEL.calcRelativeTick(dt, 1) * this.rps()

		for (let id in this.boosts) player.research[id].xp += player.research[id].amt * dt
	},
	temp() {
		for (let [id, boosts] of Object.entries(this.boosts)) {
			temp.research.eff[id] = boosts.eff(player.research[id].xp)
		}
	},

	//HTML
	setup() {
		let h = ``
		for (var [i, boost] of Object.entries(this.boosts)) {
			h += `<div class="fuel" id="research_${i}">
				<h2>${boost.title}</h2>
				<b>Effect</b>:<span id="research_${i}_eff"></span>
				<hr>

				<button onclick="RESEARCH.assort(${i}, 'pos')">+</button>
				<button onclick="RESEARCH.assort(${i}, 'neg')">-</button>
				<div id="research_${i}_assort"></div>
				<div id="research_${i}_xp"></div>
			</div>`
		}
		updateElement("research_boosts", h)		
	},
	html() {
		updateElement("research", format(Math.floor(player.research.amt), 0) + " Research")
		updateElement("research_next", "Next: " + formatTime((1 - player.research.amt % 1) / this.rps(true)))

		for (var [i, boost] of Object.entries(this.boosts)) {
			if (player.rank >= boost.rank_req) {
				showElement("research_" + i)
				updateElement("research_" + i + "_eff", format(temp.research.eff[i]) + "x")
				updateElement("research_" + i + "_assort", format(player.research[i].amt, 0) + " assorted")
				updateElement("research_" + i + "_xp", `(XP: ${format(player.research[i].xp)})`)
			} else {
				hideElement("research_" + i)
			}
		}

		if (player.rank >= 9) {
			showElement("research_assort", "inline")
			updateElement('research_assort', "Assort 50%: " + (player.research.mode ? "ON" : "OFF"))
		} else {
			hideElement("research_assort")
		}
	},
}