abbs=['','k','M','B','T']

function setup() {
	letters='abcdefghijklmnopqrstuvwxyz'

	for (var a=0;a<4;a++) {
		for (var b=0;b<26;b++) {
			abbs.push(letters.slice(a,a+1)+letters.slice(b,b+1))
		}
	}
	gameInit()
}