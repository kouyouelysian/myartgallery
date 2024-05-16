//==========================================================================//
//================ SPECIFIC STUFF FOR GROUPVIEW PAGE =======================//
//==========================================================================//

/*
pre-import requirements:
	bmco_general.js
	bmco_xml.js
	myag_main.js
	myag_panel.js
*/

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

GLOBAL_group_groupname = undefined;

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/*
sets the group description paragraph to the description of the group 'groupname' from the xml file
inputs: g <Group instance> 
return: none
*/
function myag_gr_setTextElements(g)
{
	var title = document.getElementById('groupName');
	title.innerHTML = bmco_HTMLEntitiesDecode(g.name);

	var about = document.getElementById('groupAbout');
	if (g.about == "")
		about.remove();
	else
		about.innerHTML = bmco_HTMLEntitiesDecode(g.about);
}

/*
group view page startup function
inputs: none
return: none
*/
function myag_gr_startup()
{
	myag_getGroupById(bmco_getParamRead('g')).then(function(group) {
		if (group === null)
			window.location = "./index.html"; // go to index if no g param
		myag_gr_setTextElements(group);
		bmco_setTitle(SETTING_title + " / " + group.name);
		myag_getArtworksInGroup(group.gid).then(function(artworks) {
			GLOBAL_loadedArtworks = artworks;
			myag_ip_initArtworks(artworks, type=SETTING_pagingGroup);
		});
	});
}


/*
group button press handler
inputs: gid (string) - group id of the group to be viewed
outputs: none
*/
function myag_ind_visitGroup(gid)
{
	window.location = "./group.html?g="+encodeURI(gid);
}


//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

myag_gr_startup();