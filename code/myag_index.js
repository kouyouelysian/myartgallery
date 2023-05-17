//==========================================================================//
//================== SPECIFIC STUFF FOR INDEX PAGE =========================//
//==========================================================================//

//        HOOK UP MYAG_MAIN.JS AND MYAG_IMGPANEL.JS BEFORE USING THIS!!!!!

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/*
group button press handler
inputs: groupname (string) - name of the group to be viewed
outputs: none
*/
function myag_ind_visitGroup(groupname)
{
	window.location = "./group.html?g="+groupname;
}

/*
opens editor in new tab
*/
function myag_ind_newtabEditor()
{
	window.open("./editor.html", target="_blank");
}

/*
Looks up what groups exist and adds them as buttons
inputs: id string of the target div to append buttons to
outputs: none
*/
function myag_ind_makeGroupButtons(target="groupsWrapper")
{
	myag_getGroupNames().then(function(groupnames) {
		for (var c = 0; c < groupnames.length; c++)
		{

			var p = document.createElement('p');
			p.innerHTML = groupnames[c];
			var b = document.createElement('div');
			b.classList.add('groupButton');
			b.setAttribute('onclick', 'myag_ind_visitGroup("'+groupnames[c]+'")');
			b.appendChild(p);
			t = document.getElementById(target);
			t.appendChild(b);
		
		}
	});
}

/*
index page startup function
inputs: none
outputs: none
*/
function myag_ind_startup(pagename)
{
	myag_ind_makeGroupButtons();

	myag_getArtworkAll().then(function(artworks) {
		GLOBAL_loadedArtworks = artworks;
		myag_ip_initArtworks(artworks, type=SETTING_pagingIndex);	
	});

}

//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

myag_ind_startup();
