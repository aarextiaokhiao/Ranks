/* ELEMENTS */
function updateElement(elem,id) {
	document.getElementById(elem).innerHTML=id
}

function showElement(elem,id='block') {
	document.getElementById(elem).style.display=id
}

function hideElement(elem) {
	document.getElementById(elem).style.display='none'
}

/* TABS */
tab = oldTab = 'main'
function switchTab(tabName) {
	tab=tabName
}