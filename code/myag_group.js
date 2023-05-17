//==========================================================================//
//================ SPECIFIC STUFF FOR GROUPVIEW PAGE =======================//
//==========================================================================//

//        HOOK UP MYAG_MAIN.JS BEFORE USING THIS!!!!!

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

GLOBAL_group_groupname = undefined;

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//



/*
sets the group description paragraph to the description of the group 'groupname' from the xml file
inputs: groupname (string) - name of the target group 
output: none
*/
function myag_setTextElements(groupname)
{
	myag_getGroupByName(groupname).then(function(g) {
		if (g == null)
		{
			db("myag_setGroupDescription - group not located!!!")
			return null;
		}


		var ta = document.getElementById('groupAbout');
		if (g.about == "")
			ta.remove();
		else
			ta.innerHTML = g.about;

		var t = document.getElementById('groupName');
		t.innerHTML = g.name;
	});
}

/*
group view page startup function
inputs: none
outputs: none
*/
function myag_gr_startup()
{
	GLOBAL_group_groupname = myag_getGetParam('g');
	if (GLOBAL_group_groupname === null)
		window.location = "./index.html"; // go to index if no g param

	myag_getGroupNames().then(function(groupnames) {
		if (!myag_in(groupnames, GLOBAL_group_groupname))
			window.location = "./index.html"; // go to index if g param not valid
	});

	myag_getArtworkGroup(GLOBAL_group_groupname).then(function(artworks) {
		GLOBAL_loadedArtworks = artworks;
		myag_ip_initArtworks(artworks, type=SETTING_pagingGroup);
	});

	myag_setTextElements(GLOBAL_group_groupname);
}


myag_gr_startup();