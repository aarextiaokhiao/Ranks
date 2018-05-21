player={lastTick:0,
	rank:1,
	number:0,
	factors:[1,1,1],
	factorMultipliers:[1,1,1],
	money:0,
	generators:[0,0,0],
	coal:0,
	fuel:0,
	upgrades:{},
	statistics:{playtime:0,
		playtimeThisRank:0,
		totalNumber:0,
		totalFuel:0},
	options:{notation:0,
		updateRate:20},
	version:2,
	beta:0}
const timeframes={year:31556952,
	month:2629746,
	day:86400,
	hour:3600,
	minute:60,
	second:1}
const notationArray=['Scientific','Engineering','Standard','Logarithm','Letters','v1']
const standardAbbs=['k','M','B','T','Q','Qi','S','Sp','O','N',
	'D','UD','DD','TD','QD','QiD','SD','SpD','OD','ND',
	'Vg','UV','DV','TV','QV','QiV','SV','SpV','OV','NV',
	'Tg','UT','DT','TT','QT','QiT','ST','SpT','OT','NT',
	'Qg','UQ','DQ','TQ','QQ','QiQ','SQ','SpQ','OQ','NQ',
	'Qig','UQi','DQi','TQi','QQi','QiQi','SQi','SpQi','OQi','NQi',
	'Sg','US','DS','TS','QS','QiS','SS','SpS','OS','NS',
	'Spg','USp','DSp','TSp','QSp','QiSp','SSp','SpSp','OSp','NSp',
	'Og','UO','DO','TO','QO','QiO','SO','SpO','OO','NO',
	'Ng','UN','DN','TN','QN','QiN','SN','SpN','ON','NN',
	'C','UC']
const lettersAbbs=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
	'aa','ab','ac','ad','ae','af','ag','ah','ai','aj','ak','al','am','an','ao','ap','aq','ar','as','at','au','av','aw','ax','ay','az',
	'ba','bb','bc','bd','be','bf','bg','bh','bi','bj','bk','bl','bm','bn','bo','bp','bq','br','bs','bt','bu','bv','bw','bx','by','bz',
	'ca','cb','cc','cd','ce','cf','cg','ch','ci','cj','ck','cl','cm','cn','co','cp','cq','cr','cs','ct','cu','cv','cw','cx']
const v1Abbs=['k','M','B','T','aa','ab','ac','ad','ae','af','ag','ah','ai','aj','ak','al','am','an','ao','ap','aq','ar','as','at','au','av','aw','ax','ay','az',
	'ba','bb','bc','bd','be','bf','bg','bh','bi','bj','bk','bl','bm','bn','bo','bp','bq','br','bs','bt','bu','bv','bw','bx','by','bz',
	'ca','cb','cc','cd','ce','cf','cg','ch','ci','cj','ck','cl','cm','cn','co','cp','cq','cr','cs','ct','cu','cv','cw','cx','cy','cz',
	'da','db','dc','dd','de','df','dg','dh','di','dj','dk','dl','dm','dn','do','dp','dq','dr','ds','dt']

tickSpeed=0
tickDone=true
maxMillisPerTick=50
gameLoopInterval=null
simulated=false
simulatedTicksLeft=1000
simulatedTickLength=0
tickAfterSimulated=0
lastSave=0
sinceLastSave=0
currentTab='number'
oldTab='number'

const rankRequirements=[{number:10},{number:2000},{number:5e5},{number:5e9},{number:1e11,money:1},{number:1e12,coal:10}]
nextRankText='(Next requires 10)'
const firstCosts={factors:[10,2e3,5e5],generators:[0.1,1,10],upgrades:[20,50]}
const upgradeCostFactors=[1.25,1.5625]
costs={factors:[10,2e3,5e5],generators:[0.1,1,10],upgrades:[10,20]}
totalFactorMultiplier=1
totalGenerationMultplier=1
totalMultiplier=1
const exchangeRates=[['number',1e9,'money',0.01],['money',1,'coal',1]]
genPower=2
fuelEfficiency=1
wastedFuelPerSecond=1