//==========================================================================//
//================== SPECIFIC STUFF FOR INDEX PAGE =========================//
//==========================================================================//

/*
pre-import requirements:
	bmco_general.js
	bmco_xml.js
	myag_main.js
	myag_panel.js
*/


//==========================================================================//
//================================ CONSTANTS ===============================//
//==========================================================================//

// used in other scripts like myag_editor.js to detect when the initial
// set of groups has been loaded
const myag_ip_gLoaded = new CustomEvent("initialGroupsLoaded");


//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/*
group button press handler
inputs: gid (string) - group id of the group to be viewed
outputs: none
*/
function myag_ind_visitGroup(gid)
{
	window.location = "./group.html?g="+encodeURI(gid);
}

/*
opens editor in new tab
*/
function myag_ind_newtabEditor()
{
	window.open("./editor.html", target="_blank");
}

//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

myag_startup();
