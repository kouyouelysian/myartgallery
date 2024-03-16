//==========================================================================//
//========================== MYAG EDITOR PAGE CODE =========================//
//==========================================================================//

/*
pre-import requirements:
	bmco_general.js
	bmco_xml.js
	myag_main.js
	myag_index.js
	myag_panel.js
*/

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

GLOBAL_newArtworksSpawned = 0;
GLOBAL_maxLengthName = 64;
GLOBAL_maxLengthFilename = 64;
GLOBAL_isMoving = "none"; // "none", "group" or "artwork"
GLOBAL_uploads = [];
GLOBAL_deletes = [];

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

//==========================================================================//
//=============================== GUI STUFF ================================//
//==========================================================================//

/* myag_ed_changeCss wrapper targeting style/editor.css
inputs: typeAndClass <string> [valid name of a selector, e.g. ".myAss p"],
		newRule <string> [name of a rule line, e.g. "margin-left"],
		newValue <string> [a valid parameter for the rule, e.g. "20px"]
return: none 
*/
function myag_ed_changeEditorCss(typeAndClass, newRule, newValue)
{
	bmco_forceCssToSheet(typeAndClass, 1, newRule, newValue);
}

/* myag_ed_changeCss wrapper targeting style/main.css
inputs: typeAndClass <string> [valid name of a selector, e.g. ".myAss p"],
		newRule <string> [name of a rule line, e.g. "margin-left"],
		newValue <string> [a valid parameter for the rule, e.g. "20px"]
return: none 
*/
function myag_ed_changeMainCss(typeAndClass, newRule, newValue)
{
	bmco_forceCssToSheet(typeAndClass, 0, newRule, newValue)
}

/* This clusterfuck switches the layout between move group, more artwork and
not move anything modes. I did it so it works purely with CSS, so that any artworks
that suddenly got scrolled into view need no event listeners or whatever. In return,
there's this bunch of crap down there. :) It's used when you choose "move" in the menu.
it probably can be done more neatly, but... it works.
inputs: mode <string = "none", "artwork" or "group"> [operation mode selection] 
returns: none
*/
function myag_ed_guiSetMovingMode(mode="none")
{
	if (!bmco_arrayHas(["none", "artwork", "group"], mode))
		return;
	
	GLOBAL_isMoving = mode;
	if (mode == "none")
	{
		bmco_ofClassRemoveClass("locatorWrapperArtwork", "locatorActive");
		bmco_ofClassRemoveClass("locatorWrapperGroup", "locatorActive");
		/*
		myag_ed_changeEditorCss(".locatorWrapperGroup", "display", "none");
		myag_ed_changeEditorCss(".locatorWrapperArtwork", "display", "none");
		myag_ed_changeEditorCss(".artwork", "margin-left", "var(--page-spacing)");
		myag_ed_changeEditorCss(".groupButton", "margin-left", "var(--page-spacing)");
		myag_ed_changeEditorCss(".locatorWrapperGroup", "display", "none");
		myag_ed_changeEditorCss(".locatorWrapperArtwork", "display", "none");
		myag_ed_changeMainCss(".groupButton:hover", "pointer-events", "auto");
		myag_ed_changeMainCss(".artwork:hover", "pointer-events", "auto");
		document.getElementById("buttonCreateNewGroup").removeAttribute("style");
		document.getElementById("buttonCreateNewArtwork").removeAttribute("style");
		*/
	}
	else
	{
		if (mode == "artwork")
		{
			bmco_ofClassAddClass("locatorWrapperArtwork", "locatorActive");
			/*
			myag_ed_changeEditorCss(".locatorWrapperArtwork", "display", "inline-block");
			myag_ed_changeEditorCss(".artwork", "margin-left", "0");
			myag_ed_changeEditorCss(".groupButton", "margin-left", "var(--page-spacing)");
			*/
		}
		else if (mode == "group")
		{	
			bmco_ofClassAddClass("locatorWrapperGroup", "locatorActive");
			/*	
			myag_ed_changeEditorCss(".locatorWrapperGroup", "display", "inline-block");
			myag_ed_changeEditorCss(".groupButton", "margin-left", "0");
			myag_ed_changeEditorCss(".artwork", "margin-left", "var(--page-spacing)");	
			*/
		}
		/*
		myag_ed_changeMainCss(".groupButton:hover", "pointer-events", "none");
		myag_ed_changeMainCss(".artwork:hover", "pointer-events", "none");
		document.getElementById("buttonCreateNewGroup").style.backgroundColor = "#ccc";
		document.getElementById("buttonCreateNewGroup").style.borderColor = "#ccc";
		document.getElementById("buttonCreateNewArtwork").style.backgroundColor = "#ccc";
		*/
	} 
}

/* Displays the group editor menu fillout. Used in conjunction with other stuff when running the group editor.
inputs: g <Group instance, optional> [group the info of which gets autoloaded to the editor],
		makeNew <bool, optional> [marks if the menu is opened to create a new group and not edit an existing one]
return: none
*/
function myag_ed_guiEditorLoadGroup(g=Group("new group", ""), makeNew=false)
{
	bmco_gui_actionMenuDelete();

	var gname = makeNew? "" : g.name;
	var gabout = makeNew? "" : g.about;
	var nameFnTuples = [["Cancel", "bmco_gui_filloutHide('filloutGroup')"]];
	if (makeNew)
		nameFnTuples.push(["Create", "myag_ed_actionGroup('create')"]);
	else
		nameFnTuples.push(["Update", "myag_ed_actionGroup('update')"]);

	bmco_inputValueSet("inputGroupName",gname);
	bmco_inputValueSet("inputGroupNameOld",gname);
	bmco_inputValueSet("inputGroupAbout",gabout);
	bmco_inputValueSet("inputGid", g.gid);
	document.getElementById("filloutGroupTitle").innerHTML = makeNew? "Add a new group" : "Edit group details";
	
	bmco_gui_filloutShow("filloutGroup");
	bmco_gui_bottomBarPopulate(nameFnTuples, "filloutGroupBottomBar");

}

/* Displays the artwork editor menu fillout. Used in conjunction with other stuff when running the artwork editor.
inputs: aw <Artwork instance, optional> [artwork the info of which gets autoloaded to the editor],
		makeNew <bool, optional> [marks if the menu is opened to create a new artwork and not edit an existing one]
return: none
*/
function myag_ed_guiEditorLoadArtwork(aw, makeNew=false)
{
	if (aw.awid == undefined)
			aw.awid = myag_makeAwid();
	var nameFnTuples = [["Cancel", "bmco_gui_filloutHide('filloutArtwork')"]];
	var name  =    makeNew? "" : aw.name;
	var about =    makeNew? "" : aw.about;
	var filename = makeNew? "" : aw.filename;
	document.getElementById("filloutArtworkTitle").innerHTML = makeNew? "Add a new artwork" : "Edit artwork details";

	if (makeNew)
		nameFnTuples.push(["Add", "myag_ed_actionArtwork('create');"]);	
	else
		nameFnTuples.push(["Update", "myag_ed_actionArtwork('update')"]);

	bmco_inputValueSet("inputName", name);
	bmco_inputValueSet("inputAbout", about);
	bmco_inputValueSet("inputFilename", filename);
	bmco_inputValueSet("inputAwid", aw.awid);

	// generate checkboxes - probably should generate once and only check them here, but ehhh
	var groups = myag_ed_xmldoc().getElementsByTagName('group');
	groupCheckboxes = document.getElementById("filloutArtworkGroupCheckboxes");
	groupCheckboxes.innerHTML = "<p>In groups:</p>"; // reset the cbox div to just the titletext
	for (var t = 0; t < groups.length; t++)
	{
		var checked = makeNew ? "" : bmco_arrayHas(aw.groups, bmco_xml_childTagRead(groups[t], "gid"));
		groupCheckboxes.appendChild(myag_ed_guiGroupCheckboxCreate(myag_groupXmlToObject(groups[t]), checked));
	}
	if (groups.length == 0)
		groupCheckboxes.style.display = "none";

	bmco_gui_bottomBarPopulate(nameFnTuples, "filloutArtworkBottomBar");
	bmco_gui_filloutShow("filloutArtwork");
}

/* Creates a checkbox + label thing. Only used in group selection section
in the artwork edit menu.
inputs: g <Group instance> [checkbox represents this group],
		checked <bool> [initial checkbox state]
return: <html element> [div with checkbox input and label p inside]
*/
function myag_ed_guiGroupCheckboxCreate(g, checked=false)
{
	var i = document.createElement("input");
	i.setAttribute("name", g.gid);
	i.setAttribute("type", "checkbox");
	i.id = "checkbox_"+g.gid;
	if (checked)
		i.checked = true;

	var l = document.createElement("label");
	l.setAttribute("for", g.gid);
	l.innerHTML = g.name;
	
	var d = document.createElement("div");
	d.appendChild(i);
	d.appendChild(l);
	d.classList.add("labelledCheckbox");
	d.setAttribute("onclick", "myag_ed_guiCheckboxToggle('checkbox_"+g.gid+"')");

	return d;
}

/* Creates a new group button and appends it after the "add new group" button in the grid
inputs: g <Group instance> [group to be used on the button. not really optional lol]
return: none
*/
function myag_ed_guiGroupButtonCreate(g)
{
	var target = document.getElementById("buttonCreateNewGroup").nextSibling;
	myag_appendSingleGroupButton(g, target, 'insertAfter');
}

/* Updates a group button with some name on it to display and operate with a newName instead.
inputs: gid <string> [id of the group currently used on the button]
		name <string> [new name of the group to be used on the button]
return: none
*/
function myag_ed_guiGroupButtonUpdate(gid, name)
{
	var target = bmco_firstElementOfClassByAttribute("groupButton", "groupId", gid);
	target.setAttribute("groupName", name);
	target.innerHTML = "<p>"+name+"</p>";
}

/* Deletes a group button of some name (and its move locator)
inputs: gid <string> [id used by the group button being deleted]
return: none 
*/
function myag_ed_guiGroupButtonDelete(gid)
{
	bmco_firstElementOfClassByAttribute("groupButton", "groupId", gid).remove();
	bmco_firstElementOfClassByAttribute("locatorWrapperGroup", "groupId", gid).remove();
}

/* Takes a group button and puts it after some other group button instead of its current position.
inputs: movedGid <string> [id used by the group button being moved]
		targetGid <string> [id used by the group after which the moved button has to be placed]
return: none
*/
function myag_ed_guiGroupButtonPutAfter(movedGid, targetGid)
{
	var moved = bmco_firstElementOfClassByAttribute("groupButton", "groupId", movedGid);
	if ((targetGid == undefined) || (targetGid == "start"))
		var target = document.getElementById("buttonCreateNewGroup");
	else
		var target = bmco_firstElementOfClassByAttribute("groupButton", "groupId", targetGid);
	target.parentNode.insertBefore(moved, target.nextSibling.nextSibling);
	target = moved;
	moved = bmco_firstElementOfClassByAttribute("locatorWrapperGroup", "groupId", movedGid);
	target.parentNode.insertBefore(moved, target.nextSibling);
}

/* Creates and appends a new artwork div after the "add new artwork" button.
inputs: aw <Artwork instance>
return: none
*/
function myag_ed_guiArtworkDivCreate(aw)
{
	GLOBAL_newArtworksSpawned += 1;
	var text = "New Artwork "+GLOBAL_newArtworksSpawned.toString();
	colors = ["f9c", "fc9", "cf9", "c9f", "9fc", "9cf"];
	var color = colors[Math.floor(Math.random()*colors.length)];
	var target = document.getElementById("buttonCreateNewArtwork").nextSibling;
	var newArtworkDiv = myag_ip_appendSingleArtwork(aw, target, 'insertAfter', undefined, text);
	newArtworkDiv.style.backgroundColor = "#"+color;
	newArtworkDiv.classList.add("newArtwork");
}

/* Deletes an artwork div by its artwork ID string.
inputs: awid <string> [a valid artwork ID string of the artwork div being deleted]
return: none
*/
function myag_ed_guiArtworkDivDelete(awid)
{
	bmco_firstElementOfClassByAttribute("artwork", "artworkId", awid).remove();
	bmco_firstElementOfClassByAttribute("locatorWrapperArtwork", "artworkId", awid).remove();
}

/* Takes an artwork div and puts it after some other artwork div instead of its current position.
inputs: movedAwid <string> [valid artwork id used by the artwork div being moved]
		targetAwid <string> [valid artwork id used by the artwork div after which the moved artwork has to be placed]
return: none
*/
function myag_ed_guiArtworkDivPutAfter(movedAwid, targetAwid)
{
	var moved = bmco_firstElementOfClassByAttribute("artwork", "artworkId", movedAwid);
	if ((targetAwid == undefined) || (targetAwid == "start"))
		var target = document.getElementById("buttonCreateNewArtwork");
	else
		var target = bmco_firstElementOfClassByAttribute("artwork", "artworkId", targetAwid);

	target.parentNode.insertBefore(moved, target.nextSibling.nextSibling);
	target = moved;
	moved = bmco_firstElementOfClassByAttribute("locatorWrapperArtwork", "artworkId", movedAwid);

	target.parentNode.insertBefore(moved, target.nextSibling);
}



/* Sets up the bottom buttons menu with necessary buttons.
inputs: mode <string = "default" or "move"> [defines which situation the menu has to be set up for]
return: none
*/
function myag_ed_guiBottomMenuSetMode(mode)
{
	nameFnTuples = [];
	if (mode == "default")
	{	
		if (document.body.getAttribute("isOffline") == "isOffline")
		{
			nameFnTuples.push(["Update channel", "myag_ed_neomanagerUpdate()"]);	

		}
		else
		{
			nameFnTuples.push(["Update XML", "myag_ed_openWebXmlEditor()"]);	
			nameFnTuples.push(["Upload Files", "myag_ed_openWebFileUpload()"]);	
			nameFnTuples.push(["Copy Raw XML", "myag_ed_copyXml()"]);
		}
				
	}
	else if (mode == "move")
		nameFnTuples.push(["Cancel Moving", "myag_ed_stopMoving()"]);
	else
		return;
	bmco_gui_bottomBarPopulate(nameFnTuples, "bottomButtonWrapper");
}

//==========================================================================//
//=============================== XML STUFF ================================//
//==========================================================================//

/* the data is held in text format in a JS variable called GLOBAL_loadedData.
to manipulate it, one must use this function to load it to an xml document object.
don't forget to save it after altering using myag_ed_xmlUpdateLoadedData.
inputs: none
return: <xml document object>
 */
function myag_ed_xmldoc()
{
	return bmco_xml_xmldocFromString(GLOBAL_loadedData);
}

/* Stores. the contents of an xml document object to GLOBAL_loadedData
inputs: xmldoc <xml document object> [source xml]
return: none;
*/
function myag_ed_xmlUpdateLoadedData(xmldoc)
{
	xmlText = new XMLSerializer().serializeToString(xmldoc.documentElement);
	GLOBAL_loadedData = xmlText;
}

/* Fetches an <artwork> node with a required awid from xmldoc
inputs: xmldoc <xml document object> [operational xml object],
		awid <string> [target valid artwork id]
return: <xml element> or null if not found
*/
function myag_ed_xmlArtworkByAwid(xmldoc, awid)
{
	return bmco_xml_nodeGetByChildTagValue(xmldoc, "artwork", "awid", awid);
}

/* Fetches a <group> node with a required name from xmldoc
inputs: xmldoc <xml document object> [operational xml object],
		gname <string> [target group name]
return: <xml element> or null if not found
*/
function myag_ed_xmlGroupByName(xmldoc, gname)
{
	return bmco_xml_nodeGetByChildTagValue(xmldoc, "group", "name", gname);
}

/* Fetches a <group> node with a required gid from xmldoc
inputs: xmldoc <xml document object> [operational xml object],
		gid <string> [target group id]
return: <xml element> or null if not found
*/
function myag_ed_xmlGroupById(xmldoc, gid)
{
	return bmco_xml_nodeGetByChildTagValue(xmldoc, "group", "gid", gid);
}

/* Fetches group id by group name from xmldoc
inputs: xmldoc <xml document object> [operational xml object],
		gname <string> [target group name]
return: <string> gid, or null if not found
*/
function myag_ed_xmlGroupIdByName(xmldoc, gname)
{
	var group = myag_ed_xmlGroupByName(xmldoc, gname);
	if (group == null)
		return null;
	return bmco_xml_childTagRead(group, "gid");
}

/* Fetches group name by group id from xmldoc
inputs: xmldoc <xml document object> [operational xml object],
		gid <string> [target group id]
return: <string> gid, or null if not found
*/
function myag_ed_xmlGroupNameById(xmldoc, gid)
{
	var group = myag_ed_xmlGroupById(xmldoc, gid);
	if (group == null)
		return null;
	return bmco_xml_childTagRead(group, "name");
}

/* Checks if a <group> with a particular name exists in xmldoc
inputs: xmldoc <xml document object> [operational xml object],
		gname <string> [target group name]
return: <bool>
*/
function myag_ed_xmlGroupCheckDupes(xmldoc, gname)
{
	if (myag_ed_xmlGroupByName(xmldoc, gname) == null)
		return false;
	return true;
}

/* Creates a new group node with needed child nodes in xmldoc.
inputs: xmldoc <xml document object> [operational xml object],
		gname <string, optional> [new group's name],
		g <Group instance> [new group]
return: none
*/
function myag_ed_xmlGroupCreate(xmldoc, g)
{
	children = [
		new bmco_TagValuePair("name", g.name),
		new bmco_TagValuePair("about", g.about),
		new bmco_TagValuePair("gid", g.gid)
	];
	xmldoc.getElementsByTagName('groups')[0].prepend(bmco_xml_nodeAndChildrenWithTextConstruct(xmldoc, "group", children));
}

/* Updates a group node of some name with new info.
inputs: xmldoc <xml document object> [operational xml object],
		gid <string> [updated group's id],
		newName <string, optional> [updated group's new name],
		newAbout <string, optional> [updated group's about stirng]
return: none
*/
function myag_ed_xmlGroupUpdate(xmldoc, gid, name, about)
{
	var targetGroup = myag_ed_xmlGroupById(xmldoc, gid);
	bmco_xml_ChildTagWrite(xmldoc, targetGroup, "name", name);
	bmco_xml_ChildTagWrite(xmldoc, targetGroup, "about", about);
}

/* Deletes a group node of some name from xmldoc
inputs: xmldoc <xml document object> [operational xml object],
		gid <string> [deleted group's id]
returns: none
*/
function myag_ed_xmlGroupDelete(xmldoc, gid)
{
	bmco_xml_nodeDeleteByChildTagText(xmldoc, "group", "gid", gid);
	var xmlArtworks = xmldoc.getElementsByTagName('artwork');
	for (var t = 0; t < xmlArtworks.length; t++)
		myag_ed_xmlArtworkIngroupRemove(xmldoc, xmlArtworks[t], gid);
}

/* Picks a group of some name and puts it after another group in xmldoc (used for reordering)
inputs: xmldoc <xml document object> [operational xml object],
		movedGid <string> [moved group's gid]
		targetGid <string> [gid of the group to put after]
return: none
*/
function myag_ed_xmlGroupPutAfter(xmldoc, movedGid, targetGid)
{
	bmco_xml_nodePutAfter(xmldoc, "group", "gid", movedGid, targetGid);
}

/* Creates a new artwork node with needed child nodes in xmldoc.
inputs: xmldoc <xml document object> [operational xml object],
		awid <string> [new artwork's valid artwork id],
		name <string> [new artwork's name (title)],
		filename <string> [new artwork's file name, with extension],
		about <string> [new artwork's about stirng],
		ingroups <array of string> [new artwork's picked groups]
return: none
*/
function myag_ed_xmlArtworkCreate(xmldoc, awid, name, filename, about, ingroups)
{
	var aw = xmldoc.createElement("artwork");
	aw.appendChild(bmco_xml_nodeTextCreate(xmldoc, "name", name));
	aw.appendChild(bmco_xml_nodeTextCreate(xmldoc, "filename", filename));
	aw.appendChild(bmco_xml_nodeTextCreate(xmldoc, "about", about));
	g = xmldoc.createElement("ingroups");
	for (var k = 0; k < ingroups.length; k++)
	{
		g.appendChild(bmco_xml_nodeTextCreate(xmldoc, "ingroup", ingroups[k]));
	}
	aw.appendChild(g);
	aw.appendChild(bmco_xml_nodeTextCreate(xmldoc, "awid", awid));
	xmldoc.getElementsByTagName("artworks")[0].prepend(aw);
}

/* In an artwork group, remove its ingroup by group name. Used in conjunction with groupDelete
to delete a group across entire xmldoc. Does nothing if ingroup is not picked for this artwork.
inputs: xmldoc <xml document object> [operational xml object],
		awNode <xml node> [the edited artwork node, must belong to xmldoc],
		name <string> [current ingroup name to search and delete]
return: none;
*/
function myag_ed_xmlArtworkIngroupRemove(xmldoc, awNode, gid)
{
	var ingroups = awNode.childNodes[3];
	for (var k = 0; k < ingroups.childNodes.length; k++)
	{
		if (bmco_xml_nodeTextRead(ingroups.childNodes[k]) == gid)
		{
			ingroups.removeChild(ingroups.childNodes[k]);
			break;
		}
	}
}

/* Updates a artwork node of a particular awid with new information
inputs: xmldoc <xml document object> [operational xml object],
		awid <string> [updated artwork's valid artwork id],
		newName <string> [updated artwork's name (title)],
		newFilename <string> [updated artwork's file name, with extension],
		newAbout <string> [updated artwork's about stirng],
		newIngroups <array of string> [updated artwork's picked groups]
return: none
*/
function myag_ed_xmlArtworkUpdate(xmldoc, awid, newName, newFilename, newAbout, newIngroups)
{
	var targetArtwork = myag_ed_xmlArtworkByAwid(xmldoc, awid);
	bmco_xml_ChildTagWrite(xmldoc, targetArtwork, "name", newName);
	bmco_xml_ChildTagWrite(xmldoc, targetArtwork, "filename", newFilename);
	bmco_xml_ChildTagWrite(xmldoc, targetArtwork, "about", newAbout);

	targetArtwork.childNodes[3].replaceChildren();
	for (var k = 0; k < newIngroups.length; k++)
	{
		targetArtwork.childNodes[3].appendChild(bmco_xml_nodeTextCreate(xmldoc, "ingroup", newIngroups[k]));
	}
}

/* Deletes an artwork node of some awid from xmldoc
inputs: xmldoc <xml document object> [operational xml object],
		awid <string> [deleted artworks's artwork id]
returns: none
*/
function myag_ed_xmlArtworkDelete(xmldoc, awid)
{
	bmco_xml_nodeDeleteByChildTagText(xmldoc, "artwork", "awid", awid);
}

/* Picks an artwork of some name and puts it after another artwork in xmldoc (used for reordering)
inputs: xmldoc <xml document object> [operational xml object],
		movedAwid <string> [moved artwork's artwork id]
		targetAwid <string> [name of the group artwork put artwork id]
return: none
*/
function myag_ed_xmlArtworkPutAfter(xmldoc, movedAwid, targetAwid)
{
	bmco_xml_nodePutAfter(xmldoc, "artwork", "awid", movedAwid, targetAwid);
}

//==========================================================================//
//================== XML FILE AUTO CHECK AND FIX FUNCTIONS =================//
//==========================================================================//

function myag_ed_xmlCheckAndFixTextFields(xmldoc, node, fields)
{
	ok = true;
	for (var f = 0; f < fields.length; f++)
	{
		var fieldText = bmco_xml_childTagRead(node, fields[f]);
		if (fieldText == null)
		{
			ok = false;

			var text = "";
			if (fields[f] == "awid")
				text = myag_makeAwid();
			else if (fields[f] == "gid")
				text = myag_makeGid();

			node.appendChild(bmco_xml_nodeTextCreate(xmldoc, fields[f], text));
		}
		else
		{
			if ((fields[f] == "awid") && (myag_isIdBase(fieldText)))
			{
				bmco_xml_ChildTagWrite(xmldoc, node, "awid", "aw_"+fieldText);
				ok = false;
			}
		}
	}
	return ok;
}
function myag_ed_xmlCheckAndFixArtworkIngroups(xmldoc, ingroups)
{
	ok = true;
	for (var c = 0; c < ingroups.length; c++)
	{
		var text = bmco_xml_nodeTextRead(ingroups[c]);
		if (!(myag_isGid(text)))
		{
			ok = false;
			bmco_xml_nodeTextWrite(xmldoc, ingroups[c], myag_ed_xmlGroupIdByName(xmldoc, text))
		}	
	}
	return ok;
}
function myag_ed_xmlCheckAndFixMultiFields(xmldoc, node, fields)
{
	ok = true;

	for (var f = 0; f < fields.length; f++)
	{
		if (bmco_xml_childTagExists(node, fields[f]))
		{
			if (fields[f] == "ingroups")
			{
				children = bmco_xml_childTagGetChildren(node, fields[f]);
				ok = ok & myag_ed_xmlCheckAndFixArtworkIngroups(xmldoc, children);
			}
		}
		else
		{
			ok = false;
			node.appendChild(xmldoc.createElement(fields[f]));
		}
	}
	return ok;
}
function myag_ed_xmlCheckAndFix(xmldoc)
{
	groups = xmldoc.getElementsByTagName('group');
	artworks = xmldoc.getElementsByTagName('artwork');
	meta = xmldoc.getElementsByTagName('meta')[0];

	ok = true;

	for (var x = 0; x < groups.length; x++)
		ok = ok & myag_ed_xmlCheckAndFixTextFields(xmldoc, groups[x], ["gid", "name", "about"]);
	for (var x = 0; x < artworks.length; x++)
	{
		ok = ok & myag_ed_xmlCheckAndFixTextFields(xmldoc, artworks[x], ["awid", "name", "about", "filename"]);
		ok = ok & myag_ed_xmlCheckAndFixMultiFields(xmldoc, artworks[x], ["ingroups"]);
	}
	if (meta == undefined)
	{
		ok = false;
		var children = [];
		children.push(new bmco_TagValuePair("updateCount", "1"));
		children.push(new bmco_TagValuePair("updateTimestamp", bmco_timestamp()));
		xmldoc.getElementsByTagName('data')[0].appendChild(bmco_xml_nodeConstruct(xmldoc, "meta", children));
	}

	if (ok)
		return "ok";
	else
	{
		myag_ed_xmlUpdateLoadedData(xmldoc);
		return GLOBAL_loadedData;
	}
}

//==========================================================================//
//================== BUTTON ACTIONS, MASTER FUNCTIONS, ETC =================//
//==========================================================================//

/* Triggered when a new group is being created or an existing one is being updated.
Takes care of validating the edit menu input fields.
inputs: action <string = "update" or "create"> [action mode selection]
return: none
*/
function myag_ed_actionGroup(action)
{
	var xmldoc = myag_ed_xmldoc();
	var gid = bmco_inputValueGet('inputGid');
	var oldName = bmco_inputValueGet('inputGroupNameOld');
	var name = bmco_inputValueGet('inputGroupName');
	var about = bmco_inputValueGet('inputGroupAbout');
	var groupBadchars = ["<", ">"];

	if (name.length > GLOBAL_maxLengthName)
		return bmco_gui_popupAlert("Group name is too long. Please, keep it 32 symbols or less.");
	else if (name.trim() == "")
		return bmco_gui_popupAlert("Group name must not be an empty string. Input some name!");
	else if (bmco_badcharsPresent(name, groupBadchars))
		return bmco_gui_popupAlert("Please, do not use the following characters in the group name field:<br>"+bmco_badcharsAsString(groupBadchars));
	else if (((name != oldName) || action=="create") && (myag_ed_xmlGroupCheckDupes(xmldoc, name)))
		return bmco_gui_popupAlert("Group name already taken - please, select a different one!");
	   	
	if (action == ("update"))
	{
		if ((about != null) || (name != null))
		{		
			myag_ed_xmlGroupUpdate(xmldoc, gid, name, about);
			myag_ed_xmlUpdateLoadedData(xmldoc);
			if (name != null)
				myag_ed_guiGroupButtonUpdate(gid, name);
			
		}
	}
	else if (action = ("create"))
	{
		var g = new Group(myag_makeGid(), name, about);
		myag_ed_xmlGroupCreate(xmldoc, g);
		myag_ed_xmlUpdateLoadedData(xmldoc);
		myag_ed_guiGroupButtonCreate(g);
	}
	
	bmco_gui_filloutHide("filloutGroup");
}

/* Triggered when a new artwork is being created or an existing one is being updated.
Takes care of validating the edit menu input fields.
inputs: action <string = "update" or "create"> [action mode selection]
return: none
*/
function myag_ed_actionArtwork(action)
{
	var xmldoc = myag_ed_xmldoc();
	var awid = bmco_inputValueGet("inputAwid");
	var name = bmco_inputValueGet("inputName");
	var about = bmco_inputValueGet("inputAbout");
	var filename = bmco_inputValueGet("inputFilename");
	var fnameBadchars = ["<", ">", "/", "\\"];

	var isOffline = bmco_bodyAttributeExists("isoffline");

	if (name.length > GLOBAL_maxLengthName)
		return bmco_gui_popupAlert("Artwork name should be not longer than 64 characters!");
	else if (filename.length > GLOBAL_maxLengthFilename)
		return bmco_gui_popupAlert("File name should be not longer than 64 characters!");
	else if (!isOffline && ((filename.length == 0) || (filename == "")))
		return bmco_gui_popupAlert("Please, provide a filename!");
	else if (isOffline && action=="create" && !document.getElementById("inputFileUpload").value.length)
		return bmco_gui_popupAlert("Please, select a file!");
	else if (bmco_badcharsPresent(filename, fnameBadchars))
		return bmco_gui_popupAlert("Please, do not use the following characters in the filename field:<br>"+bmco_badcharsAsString(fnameBadchars));
		
	ingroups = [];
	groups = xmldoc.getElementsByTagName('group');
	for (var t = 0; t < groups.length; t++)
	{
		var gid = bmco_xml_childTagRead(groups[t], "gid");
		var cbxId = "checkbox_"+gid;
		if (document.getElementById(cbxId).checked)
			ingroups.push(gid);
	}

	if (bmco_bodyAttributeExists("isoffline"))
	{
		var uploadTag = document.getElementById("inputFileUpload");

		if (action == "create")
			filename = awid+"."+uploadTag.value.split(".").at(-1);

		if (!(action=="update" && !uploadTag.value.length))
		{
			var file = {
				tag: uploadTag.cloneNode(true),
				remote_name: GLOBAL_artworksFolder+filename
			} 
			GLOBAL_uploads.push(file);
		}
	}

	if (action == "update")
	{
		artworks = xmldoc.getElementsByTagName('artwork');
		myag_ed_xmlArtworkUpdate(xmldoc, awid, name, filename, about, ingroups);
		myag_ed_xmlUpdateLoadedData(xmldoc);
	}
	else if (action == "create")
	{
		myag_ed_xmlArtworkCreate(xmldoc, awid, name, filename, about, ingroups);
		myag_ed_xmlUpdateLoadedData(xmldoc);
		myag_ed_guiArtworkDivCreate(new Artwork(awid, name, undefined, about, ingroups));

	}	
	bmco_gui_filloutHide('filloutArtwork');
}

/* Triggers a menu for creating a new group.
Does nothing if the GUI is currently set up to move stuff around.
inputs: none
return: none
*/
function myag_ed_createGroup()
{
	if (GLOBAL_isMoving != "none")
		return;
	g = new Group("new group", "");
	myag_ed_guiEditorLoadGroup(g, true);
}

/* Triggers a menu for editing an existing group.
Does nothing if the GUI is currently set up to move stuff around.
inputs: gname <string> [name of a present group]
return: none
*/
function myag_ed_editGroup(gid)
{
	var groupXml = myag_ed_xmlGroupById(myag_ed_xmldoc(), gid);
	if (groupXml == null)
		return;
	myag_ed_guiEditorLoadGroup(myag_groupXmlToObject(groupXml));
	
}

/* Asks the user if they really want to delete this group, then deletes it
inputs: gid <string> [id of a present group],
		confirmed <bool, optional> [if the user has confirmed their wish. is set automatically, never provided manually]
return: none
*/
function myag_ed_deleteGroup(gid, confirmed=false)
{
	if (confirmed)
	{
		var xmldoc = myag_ed_xmldoc();
		myag_ed_xmlGroupDelete(xmldoc, gid);
		myag_ed_xmlUpdateLoadedData(xmldoc);
		myag_ed_guiGroupButtonDelete(gid);
		//myag_ed_guiPopupClose();
	}
	else
	{
		bmco_gui_actionMenuDelete();
		var text = "Do you really want to delete this group? This action can only be undone by refreshing the page, losing all work.";
		bmco_gui_popupConfirm(text, "myag_ed_deleteGroup('"+gid+"', true)");
	}
}

/* Triggers the process of moving the group around.
inputs: gid <string> [id of a present group that should be moved]
return: none
*/
function myag_ed_moveGroup(gid)
{
	bmco_firstElementOfClassByAttribute('groupButton', 'groupId', gid).id = "currentlyMoved";
	bmco_firstElementOfClassByAttribute('locatorWrapperGroup', 'groupId', gid).id = "currentlyMovedLocator";
	myag_ed_guiSetMovingMode("group");
	bmco_gui_actionMenuDelete();
	myag_ed_guiBottomMenuSetMode("move");
}

/* Moves a group to a particular position. Is used by group locators to enable moving stuff around.
Figures out which group is being moved on its own using id - only needs the destination.
inputs: gid <string> [group id of the group to put the moved group after]
return: none
*/
function myag_ed_putGroupAfter(gid)
{
	var movedGroupButton = document.getElementById("currentlyMoved");
	if (movedGroupButton == undefined)
		return;
	myag_ed_guiGroupButtonPutAfter(movedGroupButton.getAttribute("groupId"), gid);
	var xmldoc = myag_ed_xmldoc();
	myag_ed_xmlGroupPutAfter(xmldoc, movedGroupButton.getAttribute("groupId"), gid);
	myag_ed_xmlUpdateLoadedData(xmldoc);
	myag_ed_stopMoving();
}

/* Triggers a menu for creating a new artwork.
Does nothing if the GUI is currently set up to move stuff around.
inputs: none
return: none
*/
function myag_ed_createArtwork(awid)
{
	if (GLOBAL_isMoving != "none")
		return;
	var aw = new Artwork(myag_makeAwid(), "", "", "", []);
	myag_ed_guiEditorLoadArtwork(aw, true);
}

/* Triggers a menu for editing an existing artwork.
Does nothing if the GUI is currently set up to move stuff around.
inputs: awid <string> [artwork id of a present artwork]
return: none
*/
function myag_ed_editArtwork(awid)
{
	myag_getArtworkById(awid).then(function(aw) {
		if (aw == null)
			return;
		myag_ed_guiEditorLoadArtwork(aw);	
	});
	bmco_gui_actionMenuDelete();
	
}

/* Asks the user if they really want to delete this artwork, then deletes it
inputs: awid <string> [artwork id of a present artwork],
		confirmed <bool, optional> [if the user has confirmed their wish. is set automatically, never provided manually]
return: none
*/
function myag_ed_deleteArtwork(awid, confirmed=false)
{
	if (confirmed)
	{
		var xmldoc = myag_ed_xmldoc();	
			GLOBAL_deletes.push(GLOBAL_artworksFolder+bmco_xml_childTagRead(myag_ed_xmlArtworkByAwid(xmldoc, awid), "filename"));

		myag_ed_xmlArtworkDelete(xmldoc, awid);
		myag_ed_xmlUpdateLoadedData(xmldoc);
		myag_ed_guiArtworkDivDelete(awid);
		if (bmco_bodyAttributeExists("isoffline"))
		
		return;
	}
	bmco_gui_actionMenuDelete();
	var text = "Do you really want to delete this artwork? This action can only be undone by refreshing the page, losing all work."
	bmco_gui_popupConfirm(text, "myag_ed_deleteArtwork('"+awid+"', true)");
	
}

/* Triggers the process of moving the artwork around.
inputs: awid <string> [awid of a present artwork that should be moved]
return: none
*/
function myag_ed_moveArtwork(awid)
{
	bmco_firstElementOfClassByAttribute('artwork', 'artworkId', awid).id = "currentlyMoved";
	bmco_firstElementOfClassByAttribute('locatorWrapperArtwork', 'artworkId', awid).id = "currentlyMovedLocator";
	myag_ed_guiSetMovingMode("artwork");
	bmco_gui_actionMenuDelete();
	myag_ed_guiBottomMenuSetMode("move");
}

/* Moves an artwork to a particular position. Is used by artwork locators to enable moving stuff around.
Figures out which group is being moved on its own using id - only needs the destination.
inputs: afterAwid <string> [awid of the artwork to put the moved artwork after]
return: none
*/
function myag_ed_putArtworkAfter(afterAwid)
{

	movedArtworkDiv = document.getElementById("currentlyMoved");
	if (movedArtworkDiv == undefined)
		return;
	myag_ed_guiArtworkDivPutAfter(movedArtworkDiv.getAttribute("artworkId"), afterAwid);
	var xmldoc = myag_ed_xmldoc();
	myag_ed_xmlArtworkPutAfter(xmldoc, movedArtworkDiv.getAttribute("artworkId"), afterAwid);
	myag_ed_xmlUpdateLoadedData(xmldoc);
	myag_ed_stopMoving();

}

/* Turn off all the facilities for moving either artworks or groups, reverts the UI to default state
inputs: none
return: none
*/
function myag_ed_stopMoving()
{
	myag_ed_guiSetMovingMode("none");
	myag_ed_guiBottomMenuSetMode("default");
	document.getElementById("currentlyMoved").removeAttribute("id");
	document.getElementById("currentlyMovedLocator").removeAttribute("id");
}

/* This function is put to every artwork and group's onclick and it calls the action menu
to the mouse pointer location.
inputs: arg <string> [artwork id or group name],
		event <event> [js event object passed down from the onclick thing]
return: none
*/
function myag_ed_showItemMenu(arg, event)
{
	if (GLOBAL_isMoving == "none")
		bmco_gui_actionMenuAppend(arg, event.clientX, event.clientY);	
}


/* Loads a menu of macro tools to the tools tab.
inputs: none
return: none
*/
function myag_ed_loadTools()
{
	var tools = [
		{
			name: "Reverse artworks",
			about: "Completely inverts the order of the artworks",
			function: "myag_ed_reverseArtworks()"
		},
		{
			name: "Reverse Groups",
			about: "Completely inverts the order of the groups",
			function: "myag_ed_reverseGroups()"
		}
	];
	if (bmco_bodyAttributeExists("isOffline"))
	{
		tools.push({
			name: "Build thumbnails",
			about: "If this is a pre-neomanager instance, this builds thumbnails for each artwork so the gallery loads faster. May take some time!",
			function: "myag_ed_neomanagerUpdate()"
		})
	}

	var target = document.getElementById("toolsWrapper");
	for (var x = 0; x < tools.length; x++)
	{
		var tool = tools[x];
		var tdiv = document.createElement("div");
		tdiv.classList.add("toolDiv");
		var about = document.createElement("p");
		about.innerHTML = tool['about'];
		var fn = "bmco_gui_popupConfirm('Run "+tool['name']+"?', '"+tool['function']+"')";
		tdiv.appendChild(bmco_gui_buttonCreate(tool['name'], fn));
		tdiv.appendChild(about);
		target.appendChild(tdiv);
	}
}


/* Force-load all artworks as per the available xml data
inputs: none
return: none
*/
function myag_ed_loadAllArtworks()
{
	if (GLOBAL_loadedArtworks.length == GLOBAL_currentlyLoadedArtworks.length)
		return;
	GLOBAL_usedPaginationType = "none";
	document.removeEventListener('scroll', myag_ip_loadMore);
	bmco_removeIfExists("paginationMoreTrigger")
	myag_ip_appendArworksRange(GLOBAL_loadedArtworks, GLOBAL_currentlyLoadedArtworks.length, GLOBAL_loadedArtworks.length, false);
}

function myag_ed_groupButtonNameRead(elem)
{
	return elem.childNodes[0].innerHTML;
}

/* Reverse the order of all existing groups.
inputs: none
return: none
*/
function myag_ed_reverseGroups()
{
	var target = 'start';
	var xmldoc = myag_ed_xmldoc();
	var groupsNum = document.getElementsByClassName('groupButton').length-1;
	for (var x = 0; x < groupsNum; x++)
	{
		var gid = document.getElementsByClassName("groupButton")[groupsNum].getAttribute("groupid");
		myag_ed_guiGroupButtonPutAfter(gid, target);
		myag_ed_xmlGroupPutAfter(xmldoc, gid, target);
		target = gid;
	}
	myag_ed_xmlUpdateLoadedData(xmldoc);
}

/* Reverse the order of all existing artworks.
inputs: none
return: none
*/
function myag_ed_reverseArtworks()
{
	myag_ed_loadAllArtworks();
	var target = 'start';
	var xmldoc = myag_ed_xmldoc();
	var artworksNum = document.getElementsByClassName('artwork').length-1;
	for (var x = 0; x < artworksNum; x++)
	{	
		// it's not artworksNum-1 because the "add new..." button also counts
		var awid = document.getElementsByClassName("artwork")[artworksNum].getAttribute("artworkId");
		myag_ed_guiArtworkDivPutAfter(awid, target);
		myag_ed_xmlArtworkPutAfter(xmldoc, awid, target);
		target = awid;
	}
	myag_ed_xmlUpdateLoadedData(xmldoc);
}

/* update function called from the offline neomanager version
inputs: none
return: none
*/
function myag_ed_neomanagerUpdate()
{
	dataFiles = [
			{
				remote_name: "myag_files/data.xml",
				type: "xml",
				contents: myag_ed_prepareXml()
			}
		];	
	bmco_gui_loadingSpinnerCreate();
	bmco_runUpdateForm(datafiles=dataFiles, uploads=GLOBAL_uploads, deletes=GLOBAL_deletes);
}

/* Make a pretty, tabbed XML out of a minified string.
inputs: xmlText <string> [source XML document text without the xml metadata tag]
return: <string> [prettified XML text]
*/
function myag_ed_prepareXml()
{
	var x = myag_ed_xmldoc();

	var v = bmco_xml_childTagRead(x.getElementsByTagName("meta")[0], "updateCount");
	if (isNaN(v))
	{
		myag_ed_guiPopupThrowAlert("Could not read the update counter as a number. Tell this\
			to <a href='astrossoundhell.neocities.org/data/links/'>Aubery</a> please.");
		return;
	}
	v = parseInt(v) + 1;
	bmco_xml_ChildTagWrite(x, x.getElementsByTagName("meta")[0], "updateCount", String(v));
	bmco_xml_ChildTagWrite(x, x.getElementsByTagName("meta")[0], "updateTimestamp", bmco_timestamp());
	myag_ed_xmlUpdateLoadedData(x);

	var xmlText = GLOBAL_loadedData;
	return vkbeautify.xml(xmlText, 5);
}

/* Opens up the neocities editor to the XML file, puts the XML text to user's clipboard, so they
can paste it to the XML file and save it.
inputs: none
return: none
*/
function myag_ed_openWebXmlEditor()
{
	var xml = myag_ed_prepareXml();

	navigator.clipboard.writeText(xml).then(() => {
    	window.open(SETTING_neocitiesXmlFileEditLink, target="_blank");
	})
	.catch(err => {
		myag_ed_guiPopupThrowAlert('Could not copy, tell Aubery about this ASAP: ' + err);
	});
}

/* Opens up the neocities file browser to the image files location so that the user can
quickly dump their new artworks there.
inputs: none
return: none
*/
function myag_ed_openWebFileUpload()
{
	window.open(SETTING_neocitiesArtworksFolderLink, target="_blank");
}

/* Puts the current XML text to user's text clipboard.
inputs: none
outputs: none
*/
function myag_ed_copyXml()
{
	var xml = myag_ed_prepareXml();
	navigator.clipboard.writeText(xml).then(() => {
    	myag_ed_guiPopupThrowAlert('raw XML copied');
	})
	.catch(err => {
		myag_ed_guiPopupThrowAlert('Could not copy, tell Aubery about this ASAP: ' + err);
	});
}

/* Page startup function. Adds "add new.." buttons, set title, etc.
inputs: none
return: none
*/
function myag_ed_startup()
{
	bmco_setTitle(SETTING_title + " / editor");
	myag_ed_guiBottomMenuSetMode("default");

	window.addEventListener("initialArtworksLoaded", (event) => {
		var target = document.getElementById("artworksWrapper");
		var dummyAw = new Artwork(undefined, undefined, undefined, undefined, undefined);
		var artwork = myag_ip_appendSingleArtwork(dummyAw, target, "prepend", "myag_ed_createArtwork()", "Add new...");
		artwork.id = "buttonCreateNewArtwork";
	});
	window.addEventListener("initialGroupsLoaded", (event) => {
		var dummyG = new Group("start", "Add new...", "");
		var target = document.getElementById("groupsWrapper");
		var button = myag_appendSingleGroupButton(dummyG, target, "prepend", "myag_ed_createGroup()");
		button.id = "buttonCreateNewGroup";
	});
	window.addEventListener("xmlFileLoaded", (event) => {
		check = myag_ed_xmlCheckAndFix(myag_ed_xmldoc());
		if (check != "ok")
		{
			var text = "Looks like your XML file is out of date or damaged. The automatic repair/update routine prepared a \
			fixed version for you - please, update your XML contents, then force-refresh this page.";
			myag_ed_guiPopupThrowAlert(text, "Update", "myag_ed_openWebXmlEditor()")
		}
	});

	myag_ed_loadTools();

	if (bmco_bodyAttributeExists("isoffline"))
	{
		var target = document.getElementById("inputFilename");
		target.previousElementSibling.remove();
		target.setAttribute("type", "hidden");
		
	}
	else
		document.getElementById("inputFileUpload").remove();
	

	myag_startup();
}

//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

if (!bmco_bodyAttributeExists('isOffline'))
	myag_ed_startup();

