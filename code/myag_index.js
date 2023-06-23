//==========================================================================//
//================== SPECIFIC STUFF FOR INDEX PAGE =========================//
//==========================================================================//

//        HOOK UP MYAG_MAIN.JS AND MYAG_IMGPANEL.JS BEFORE USING THIS!!!!!



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
inputs: groupname (string) - name of the group to be viewed
outputs: none
*/
function myag_ind_visitGroup(groupname)
{
	window.location = "./group.html?g="+encodeURI(groupname);
}

/*
opens editor in new tab
*/
function myag_ind_newtabEditor()
{
	window.open("./editor.html", target="_blank");
}

/* creates an html element for one group button.
inputs: gname <string> - group name
return: "div" html group button element 
*/
function myag_ind_generateGroupButton(gname, action=undefined)
{
	var button = document.createElement('div');
	button.classList.add('groupButton');
	button.setAttribute("groupName", gname);

	var onclick = action;
	if (onclick==undefined)
	{
		onclick = "myag_ind_visitGroup('"+gname+"')";
		if (myag_isEditor())
			onclick = "myag_ed_showItemMenu('"+gname+"', event)";
	}
	
	button.setAttribute('onclick', onclick);

	var name = document.createElement('p');
	name.innerHTML = gname;
	button.appendChild(name);


	return button;
}

/* Creates an appendable locator div based on an Group instance. Is needed
for the XML editor page, unused in the main page itself.
inputs: g <string> [valid group name string]
returns: <DOM element>
*/
function myag_ind_generateGroupLocatorDiv(gname=undefined)
{
	var locatorWrapper = document.createElement("div");
	locatorWrapper.classList.add("locatorWrapper", "locatorWrapperGroup");
	locatorWrapper.setAttribute("groupName", gname);

	var locator = document.createElement("div");
	locator.classList.add("locator");
	locator.setAttribute("title", "Move group here")
	if (gname == "Add new...")
		locator.setAttribute("onclick", "myag_ed_putGroupAfter('start')");
	else
		locator.setAttribute("onclick", "myag_ed_putGroupAfter('"+gname+"')");

	locatorWrapper.appendChild(locator);

	return locatorWrapper;
}



/* generates and appends a single group button to a target.
inputs: gname <string> [group name], target <html element> [append target element],
		mode <string> [append mode. 'appendChild' or 'insertAfter']
return: freshly appended button <html element>
*/
function myag_ind_appendSingleGroupButton(gname, target, mode="appendChild", action=undefined)
{
	var button = myag_ind_generateGroupButton(gname, action);
	var locator = myag_ind_generateGroupLocatorDiv(gname);
	myag_appendToGridMode(button, locator, target, mode);
	return button;
}

/*
Looks up what groups exist and adds them as buttons
inputs: id string of the target div to append buttons to
outputs: none
*/
function myag_ind_makeGroupButtons(id="groupsWrapper")
{
	myag_getGroupNames().then(function(groupnames) {
		var target = document.getElementById(id);
		for (var c = 0; c < groupnames.length; c++)
			myag_ind_appendSingleGroupButton(groupnames[c], target);
		window.dispatchEvent(myag_ip_gLoaded);
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

	myag_setTitle(SETTING_title);

}

//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

myag_ind_startup();
