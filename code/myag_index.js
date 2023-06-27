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

/* creates an html element for one group button.
inputs: group <Group object> - group object to make the group button after
return: "div" html group button element 
*/
function myag_ind_generateGroupButton(group, action=undefined)
{
	var button = document.createElement('div');
	button.classList.add('groupButton');
	button.setAttribute("groupId", group.gid);

	var onclick = action;
	if (onclick==undefined)
	{
		onclick = "myag_ind_visitGroup('"+group.gid+"')";
		if (myag_isEditor())
			onclick = "myag_ed_showItemMenu('"+group.gid+"', event)";
	}
	
	button.setAttribute('onclick', onclick);
	var name = document.createElement('p');
	name.innerHTML = group.name;
	button.appendChild(name);

	return button;
}

/* Creates an appendable locator div based on an Group instance. Is needed
for the XML editor page, unused in the main page itself.
inputs: group <Group object> - group object to make the group locator after
returns: <DOM element>
*/
function myag_ind_generateGroupLocatorDiv(group)
{
	var locatorWrapper = document.createElement("div");
	locatorWrapper.classList.add("locatorWrapper", "locatorWrapperGroup");
	locatorWrapper.setAttribute("groupId", group.gid);

	var locator = document.createElement("div");
	locator.classList.add("locator");
	locator.setAttribute("title", "Move group here")
	if (group.name == "Add new...")
		locator.setAttribute("onclick", "myag_ed_putGroupAfter('start')");
	else
		locator.setAttribute("onclick", "myag_ed_putGroupAfter('"+group.gid+"')");

	locatorWrapper.appendChild(locator);

	return locatorWrapper;
}



/* generates and appends a single group button to a target.
inputs: group <Group object> - [group object], target <html element> [append target element],
		mode <string> [append mode. 'appendChild' or 'insertAfter']
return: freshly appended button <html element>
*/
function myag_ind_appendSingleGroupButton(group, target, mode="appendChild", action=undefined)
{
	var button = myag_ind_generateGroupButton(group, action);
	var locator = myag_ind_generateGroupLocatorDiv(group);
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
	myag_getGroups().then(function(groups) {
		var target = document.getElementById(id);
		for (var c = 0; c < groups.length; c++)
			myag_ind_appendSingleGroupButton(groups[c], target);
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
	if (document.getElementById("groupsWrapper") != undefined)	
		myag_ind_makeGroupButtons();

	myag_getArtworkAll().then(function(artworks) {
		GLOBAL_loadedArtworks = artworks;
		myag_ip_initArtworks(artworks, type=SETTING_pagingIndex);	
	});
	bmco_setTitle(SETTING_title);
}

//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

myag_ind_startup();
