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

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

//==========================================================================//
//=============================== GUI STUFF ================================//
//==========================================================================//

/* Changes a line for an existing rule in one of the loaded CSS sheets
inputs: typeAndClass <string> [valid name of a selector, e.g. ".myAss p"],
		sheetIndex <int> [index of the CSS file to refer to, as they appear in <head>],
		newRule <string> [name of a rule line, e.g. "margin-left"],
		newValue <string> [a valid parameter for the rule, e.g. "20px"]
return: none 
*/
function myag_ed_changeCss(typeAndClass, sheetIndex, newRule, newValue)
{
	// stolen from https://stackoverflow.com/questions/18421962/how-to-add-a-new-rule-to-an-existing-css-class
    var thisCSS=document.styleSheets[sheetIndex];
    var ruleSearch=thisCSS.cssRules? thisCSS.cssRules: thisCSS.rules;
    for (i=0; i<ruleSearch.length; i++)
    {
        if(ruleSearch[i].selectorText==typeAndClass)
        {
            var target=ruleSearch[i];
            break;
        }
    }
    target.style[newRule] = newValue;
}

/* myag_ed_changeCss wrapper targeting style/editor.css
inputs: typeAndClass <string> [valid name of a selector, e.g. ".myAss p"],
		newRule <string> [name of a rule line, e.g. "margin-left"],
		newValue <string> [a valid parameter for the rule, e.g. "20px"]
return: none 
*/
function myag_ed_changeEditorCss(typeAndClass, newRule, newValue)
{
	myag_ed_changeCss(typeAndClass, 2, newRule, newValue)
}

/* myag_ed_changeCss wrapper targeting style/main.css
inputs: typeAndClass <string> [valid name of a selector, e.g. ".myAss p"],
		newRule <string> [name of a rule line, e.g. "margin-left"],
		newValue <string> [a valid parameter for the rule, e.g. "20px"]
return: none 
*/
function myag_ed_changMainCss(typeAndClass, newRule, newValue)
{
	myag_ed_changeCss(typeAndClass, 0, newRule, newValue)
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
	if ((mode != "none") && (mode != "artwork") && (mode != "group"))
		return;
	GLOBAL_isMoving = mode;
	if (mode == "none")
	{
		myag_ed_changeEditorCss(".locatorWrapperGroup", "display", "none");
		myag_ed_changeEditorCss(".locatorWrapperArtwork", "display", "none");
		myag_ed_changeEditorCss(".artwork", "margin-left", "var(--page-spacing)");
		myag_ed_changeEditorCss(".groupButton", "margin-left", "var(--page-spacing)");
		myag_ed_changMainCss(".artwork:hover", "filter", "brightness(90%)");
		myag_ed_changMainCss(".groupButton:hover", "box-shadow", "0px 0px 6px RGBA(0,0,0,0.2)");
		myag_ed_changMainCss(".groupButton:hover", "background-color", "var(--col-highlight)");
		myag_ed_changMainCss(".groupButton:hover", "color", "var(--col-buttonbg)");
		document.getElementById("buttonCreateNewGroup").removeAttribute("style");
		document.getElementById("buttonCreateNewArtwork").removeAttribute("style");
	}
	else
	{
		if (mode == "artwork")
		{
			myag_ed_changeEditorCss(".locatorWrapperArtwork", "display", "inline-block");
			myag_ed_changeEditorCss(".locatorWrapperGroup", "display", "none");
			myag_ed_changeEditorCss(".artwork", "margin-left", "0");
			myag_ed_changeEditorCss(".groupButton", "margin-left", "var(--page-spacing)");
		}
		else
		{
			myag_ed_changeEditorCss(".locatorWrapperArtwork", "display", "none");
			myag_ed_changeEditorCss(".locatorWrapperGroup", "display", "inline-block");
			myag_ed_changeEditorCss(".groupButton", "margin-left", "0");
			myag_ed_changeEditorCss(".artwork", "margin-left", "var(--page-spacing)");	
		}

		myag_ed_changMainCss(".groupButton:hover", "box-shadow", "none");
		myag_ed_changMainCss(".groupButton:hover", "background-color", "var(--col-buttonbg)");
		myag_ed_changMainCss(".groupButton:hover", "color", "var(--col-highlight)");
		myag_ed_changMainCss(".artwork:hover", "filter", "none");
		document.getElementById("buttonCreateNewGroup").style.backgroundColor = "#ccc";
		document.getElementById("buttonCreateNewArtwork").style.backgroundColor = "#ccc";
	} 
}

/* Creates an input field of a type (or a textarea), fit with ID and name attributes
I really don't get why textarea is its own tag and not an input type.
inputs: type <string> [html <input> tag type, like "text" or "password"],
		name <string> [name of this element, to be used for name and id properties],
		value <string, optional> [if set, the field will have this for its pre-set value]
return: <html element> [resulting <input> thing prepared with all the goodies]

*/
function myag_ed_guiInputCreate(type, name, value=null)
{
	var input = undefined;
	if (type == "textarea")
		input = document.createElement("textarea");
	else
	{
		input = document.createElement("input");
		input.setAttribute("name", name);
		input.setAttribute("type", type);
	}	
	input.value = value;
	input.id = name;
	return input;
}

/* Creates a styled <p> to put before input fields with some explanation text
inputs: text <string> [displayed guide line text]
return: <html element>
*/
function myag_ed_guiInputGuideCreate(text)
{
	var p = document.createElement("p");
	p.innerHTML = text;
	p.classList.add("guide");
	return p;
}

/* Attempts reading a value from some input field by its ID. Returns "" if not found.
inputs: id <string> [target input element id]
return: <string> [element's value attribute or "" if element not found]
*/
function myag_ed_guiInputRead(id)
{
	var f = document.getElementById(id);
	if ((f == undefined) || (f == null))
		return "";
	return f.value.trim();
}

/* A rather dumb but useful function that returns an HTML div with a <p>aragraph inside of it.
Used by button constructors and such.
inputs: text <string> [text to be put into the paragraph],
		fn <string, optional> [if set, this will be put to the resulting div's onclick attribute]
return: <html element>
*/
function myag_ed_guiCreateDivWithP(text, fn=undefined)
{
	var div = document.createElement("div");
	div.innerHTML = "<p>"+text+"</p>";
	if (fn != undefined)
		div.setAttribute("onclick", fn);
	return div;
}

/* Wrapper for myag_ed_guiCreateDivWithP, special for ControlButton's
used in drop-down menus, editors, etc
inputs: text <string> [text to be put into the paragraph],
		fn <string> [function to be executed upon clicking the button]
return: <html element>
*/
function myag_ed_guiCreateControlButton(text, fn)
{
	var button = myag_ed_guiCreateDivWithP(text, fn);
	button.classList.add("controlButton");
	return button;
}

/* Wrapper for myag_ed_guiCreateDivWithP, special for BottomButton's
used in the sticky bottommost menu
inputs: text <string> [text to be put into the paragraph],
		fn <string> [function to be executed upon clicking the button]
return: <html element>
*/
function myag_ed_guiCreateBottomButton(text, fn)
{
	var button = myag_ed_guiCreateDivWithP(text, fn);
	button.classList.add("bottomButton");
	return button;
}

/* closes any generated popup, if there is one
inputs: none
return: none
*/
function myag_ed_guiPopupClose()
{
	bmco_removeIfExists("popupBackdrop");
	bmco_removeIfExists("popupAlert");
	bmco_removeIfExists("popupSelect");
}

/* creates a sticky <div> to cover everything behind the popup
inputs: none
return: <html element>
*/
function myag_ed_guiPopupCreateBackdrop()
{
	var backdrop = document.createElement("div");
	backdrop.id = "popupBackdrop";
	backdrop.setAttribute("onclick", "myag_doNothing()")
	return backdrop;
}

/* creates the default popup body to which buttons have to be appended
inputs: text <string> [popup message text],
		id <string, optional> [if set - the popup window id]
return: <html element>
*/
function myag_ed_guiPopupCreateBody(text, id=undefined)
{
	var popup = document.createElement("div");
	if (id != undefined)
		popup.id = id;
	popup.classList.add("popup");
	var textMessage = document.createElement("p");
	textMessage.innerHTML = text;
	textMessage.classList.add("popupTextMessage");
	popup.appendChild(textMessage);
	return popup;
}

/* Throws an alert message on-screen that can be closed by pressing
"OK" - a fancy substitute for the built-in "alert(arg)" method
inputs: message <string> [alert message text]
		text <string, optional> [text to be displayed on the button],
		fn <string, optional> [function to be executed on button press, closes the popup by default]
return: <html element> [created popup div]
*/
function myag_ed_guiPopupThrowAlert(message, text="OK", fn="myag_ed_guiPopupClose()")
{
	document.body.appendChild(myag_ed_guiPopupCreateBackdrop());
	var alertDiv = myag_ed_guiPopupCreateBody(message, "popupAlert");
	alertDiv.appendChild(myag_ed_guiCreateControlButton(text, fn));
	document.body.appendChild(alertDiv);
	return alertDiv;
}

/* Throws a select prompt message on-screen that can disappears when
the user chooses one of the two options.
inputs: message <string> [select prompt text],
		text1 <string> [text on the left button],
		fn1 <string> [onclick to be executed by the left button],
		text2 <string> [text on the right button],
		fn2 <string> [onclick to be executed by the right button]
return: <html element> [created popup div]
*/
function myag_ed_guiPopupThrowSelect(message, text1, fn1, text2, fn2)
{
	document.body.appendChild(myag_ed_guiPopupCreateBackdrop());
	var selectDiv = myag_ed_guiPopupCreateBody(message, "popupSelect");
	selectDiv.appendChild(myag_ed_guiCreateControlButton(text1, fn1));
	selectDiv.appendChild(myag_ed_guiCreateControlButton(text2, fn2));
	document.body.appendChild(selectDiv);
	return selectDiv;
}

/* Creates a checkbox + label thing. Only used in group selection section
in the artwork edit menu.
inputs: g <Group instance> [checkbox represents this group],
		checked <bool> [initial checkbox state]
return: <html element> [div with checkbox input and label p inside]
*/
function myag_ed_guiCheckboxCreate(g, checked=false)
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

/* Attempt to toggle a checkbox's state by its ID. returns if not found.
inputs: id <string> [target checkbox ID attribute]
return: none
*/
function myag_ed_guiCheckboxToggle(id)
{
	t = document.getElementById(id);
	if ((t == undefined) || (t == null))
		return;
	t.checked = !t.checked;
}

/* Creates a div and appends all the html elements from the elements array into it
inputs: elements <html element array> [an array of html elements to be appended into one div],
		id <string, optional> [if set - the resulting div's id will be set to this]
return: <html element> [resulting div]
*/
function myag_ed_guiArrayOfElementsToDiv(elements, id=undefined)
{
	var outDiv = document.createElement("div");
	if (id != undefined)
		outDiv.id = id;
	for (var x = 0; x < elements.length; x++)
		outDiv.appendChild(elements[x]);
	return outDiv;
}

/* Loads the group editor menu to formViewer. Used in conjunction with other stuff
when running the group editor.
inputs: g <Group instance, optional> [group the info of which gets autoloaded to the editor],
		makeNew <bool, optional> [marks if the menu is opened to create a new group and not edit an existing one]
return: none
*/
function myag_ed_guiEditorLoadGroup(g=Group("new group", ""), makeNew=false)
{
	target = document.getElementById("artworkViewer");
	target.innerHTML = "";		
	ce = [];
	ce.push(myag_ed_guiInputGuideCreate("Name"));
	ce.push(myag_ed_guiInputCreate("text", "inputName", g.name));
	ce.push(myag_ed_guiInputGuideCreate("Description (optional)"));
	ce.push(myag_ed_guiInputCreate("textarea", "inputAbout", g.about));
	ce.push(document.createElement("hr"));
	ce.push(myag_ed_guiCreateControlButton("Cancel", "myag_av_hideViewer()"));
	if (makeNew)
		ce.push(myag_ed_guiCreateControlButton("Create", "myag_ed_actionGroup('create')"));
	else
		ce.push(myag_ed_guiCreateControlButton("Update", "myag_ed_actionGroup('update')"));
	ce.push(myag_ed_guiInputCreate("hidden", "inputNameOld", g.name));
	ce.push(myag_ed_guiInputCreate("hidden", "inputGid", g.gid));
	target.appendChild(myag_ed_guiArrayOfElementsToDiv(ce, "formWrapper"));
}

/* Loads the artwork editor menu to formViewer. Used in conjunction with other stuff
when running the artwork editor.
inputs: aw <Artwork instance, optional> [artwork the info of which gets autoloaded to the editor],
		makeNew <bool, optional> [marks if the menu is opened to create a new artwork and not edit an existing one]
return: none
*/
function myag_ed_guiEditorLoadArtwork(aw, makeNew=false)
{
	target = document.getElementById("artworkViewer");
	target.innerHTML = "";		
	ce = [];
	ce.push(myag_ed_guiInputGuideCreate("File name with extension"));
	ce.push(myag_ed_guiInputCreate("text", "inputFilename", aw.filename));
	ce.push(myag_ed_guiInputGuideCreate("Title (optional)"));
	ce.push(myag_ed_guiInputCreate("text", "inputName", aw.name));
	ce.push(myag_ed_guiInputGuideCreate("Description (optional)"));
	ce.push(myag_ed_guiInputCreate("textarea", "inputAbout", aw.about));
	var xmldoc = myag_ed_xmldoc();
	var groups = xmldoc.getElementsByTagName('group');
	groupCheckboxes = document.createElement("div");
	groupCheckboxes.id = "formGroupCheckboxes";
	for (var t = 0; t < groups.length; t++)
	{
		var chb = myag_ed_guiCheckboxCreate(myag_groupXmlToObject(groups[t]), bmco_arrayHas(aw.groups, bmco_xml_childTagRead(groups[t], "gid")));
		groupCheckboxes.appendChild(chb);
	}
	if (groups.length == 0)
		groupCheckboxes.style.display = "none";
	else
		ce.push(myag_ed_guiInputGuideCreate("Groups selection"));
	ce.push(groupCheckboxes);
	ce.push(document.createElement("hr"));
	ce.push(myag_ed_guiCreateControlButton("Cancel", "myag_av_hideViewer()"));
	if (makeNew)
		ce.push(myag_ed_guiCreateControlButton("Create", "myag_ed_actionArtwork('create')"));
	else
		ce.push(myag_ed_guiCreateControlButton("Update", "myag_ed_actionArtwork('update')"));
	ce.push(myag_ed_guiInputCreate("hidden", "inputAwid", aw.awid));
	target.appendChild(myag_ed_guiArrayOfElementsToDiv(ce, "formWrapper"));
}

/* VERY IMPORTANT FUNCTION!!! Finds the first element of class 'classname'  which has
the 'attribute' set to 'value'. Used to locate buttons, artwork divs, etc... a lot.
inputs: classname <string> [elements of this class will get searched up]
		attribute <string> [attribute name to look for]
		value <string> [attribute value to match]
return: <html element> or <undefined> on fail
*/
function myag_ed_guiFindOfClassByAttribute(classname, attribute, value)
{
	var classItems = document.getElementsByClassName(classname);
	for (var x = 0; x < classItems.length; x++)
	{
		var target = classItems[x];
		if (target.getAttribute(attribute) == value)
		{
			return target;
			break;
		}
	}
	return undefined;
}

/* Creates a new group button and appends it after the "add new group" button in the grid
inputs: g <Group instance> [group to be used on the button. not really optional lol]
return: none
*/
function myag_ed_guiGroupButtonCreate(g)
{
	var target = document.getElementById("buttonCreateNewGroup").nextSibling;
	myag_ind_appendSingleGroupButton(g, target, 'insertAfter');
}

/* Updates a group button with some name on it to display and operate with a newName instead.
inputs: gid <string> [id of the group currently used on the button]
		name <string> [new name of the group to be used on the button]
return: none
*/
function myag_ed_guiGroupButtonUpdate(gid, name)
{

	var target = myag_ed_guiFindOfClassByAttribute("groupButton", "groupId", gid);
	target.setAttribute("groupName", name);
	target.innerHTML = "<p>"+name+"</p>";
}

/* Deletes a group button of some name (and its move locator)
inputs: gid <string> [id used by the group button being deleted]
return: none 
*/
function myag_ed_guiGroupButtonDelete(gid)
{
	myag_ed_guiFindOfClassByAttribute("groupButton", "groupId", gid).remove();
	myag_ed_guiFindOfClassByAttribute("locatorWrapperGroup", "groupId", gid).remove();
}

/* Takes a group button and puts it after some other group button instead of its current position.
inputs: movedGid <string> [id used by the group button being moved]
		targetGid <string> [id used by the group after which the moved button has to be placed]
return: none
*/
function myag_ed_guiGroupButtonPutAfter(movedGid, targetGid)
{
	var moved = myag_ed_guiFindOfClassByAttribute("groupButton", "groupId", movedGid);
	if ((targetGid == undefined) || (targetGid == "start"))
		var target = document.getElementById("buttonCreateNewGroup");
	else
		var target = myag_ed_guiFindOfClassByAttribute("groupButton", "groupId", targetGid);
	target.parentNode.insertBefore(moved, target.nextSibling.nextSibling);
	target = moved;
	moved = myag_ed_guiFindOfClassByAttribute("locatorWrapperGroup", "groupId", movedGid);
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
	myag_ed_guiFindOfClassByAttribute("artwork", "artworkId", awid).remove();
	myag_ed_guiFindOfClassByAttribute("locatorWrapperArtwork", "artworkId", awid).remove();
}

/* Takes an artwork div and puts it after some other artwork div instead of its current position.
inputs: movedAwid <string> [valid artwork id used by the artwork div being moved]
		targetAwid <string> [valid artwork id used by the artwork div after which the moved artwork has to be placed]
return: none
*/
function myag_ed_guiArtworkDivPutAfter(movedAwid, targetAwid)
{
	var moved = myag_ed_guiFindOfClassByAttribute("artwork", "artworkId", movedAwid);
	if ((targetAwid == undefined) || (targetAwid == "start"))
		var target = document.getElementById("buttonCreateNewArtwork");
	else
		var target = myag_ed_guiFindOfClassByAttribute("artwork", "artworkId", targetAwid);

	target.parentNode.insertBefore(moved, target.nextSibling.nextSibling);
	target = moved;
	moved = myag_ed_guiFindOfClassByAttribute("locatorWrapperArtwork", "artworkId", movedAwid);

	target.parentNode.insertBefore(moved, target.nextSibling);
}

/* Creates and appends an action selection menu to the screen. Is called when the artwork or group
has been pressed to present options like edit, delete and move. Also creates the invisible backdrop
that allows to close the menu by clicking elsewhere.
inputs: arg <string> [a group name or an artwork id of a present group/artwork],
		mouseX <int> [X position of the mouse at the moment of call],
		mouseY <int> [Y position of the mouse at the moment of call]
return: none
*/
function myag_ed_guiActionMenuAppend(arg, mouseX, mouseY)
{
	buttonNames = ["Edit", "Move", "Delete"];
	buttonFunctions = [];
	target = undefined;

	if (myag_isAwid(arg))
	{
		buttonFunctions = ["myag_ed_editArtwork('"+arg+"')", "myag_ed_moveArtwork('"+arg+"')", "myag_ed_deleteArtwork('"+arg+"')"];
		target = myag_ed_guiFindOfClassByAttribute("artwork", "artworkId", arg);
	}
	else if (myag_isGid(arg))
	{
		buttonFunctions = ["myag_ed_editGroup('"+arg+"')", "myag_ed_moveGroup('"+arg+"')", "myag_ed_deleteGroup('"+arg+"')"];
		target = myag_ed_guiFindOfClassByAttribute("groupButton", "groupId", arg);
	}
	if (target == undefined)
		return;

	ce = [];
	for (var x = 0; x < buttonNames.length; x++)
		ce.push(myag_ed_guiCreateControlButton(buttonNames[x], buttonFunctions[x]));

	var menu = myag_ed_guiArrayOfElementsToDiv(ce, "actionMenu");
	var offset = 40;
	menu.style.left = Math.min(mouseX - offset, (window.innerWidth - 300))+"px";
	menu.style.top = (mouseY+window.scrollY - offset)+"px";
	document.body.prepend(menu);

	var bd = document.createElement("div");
	bd.id = "actionMenuBackdrop";
	bd.setAttribute("onclick", "myag_ed_guiActionMenuDelete()");
	document.body.prepend(bd);
}

/* Removes the action selection menu and its backdrop from the screen.
inputs: none
return: none
*/
function myag_ed_guiActionMenuDelete()
{
	bmco_removeIfExists("actionMenuBackdrop");
	bmco_removeIfExists("actionMenu");
}

/* Sets up the bottom buttons menu with necessary buttons.
inputs: mode <string = "default" or "move"> [defines which situation the menu has to be set up for]
return: none
*/
function myag_ed_guiBottomMenuSetMode(mode)
{
	if ((mode != "default") && (mode != "move"))
		return;

	ce = [];
	if (mode == "default")
	{
		ce.push(myag_ed_guiCreateBottomButton("Macro tools", "myag_ed_showMacroToolsMenu()"));  
		ce.push(myag_ed_guiCreateBottomButton("Update XML", "myag_ed_openWebXmlEditor()"));  
		ce.push(myag_ed_guiCreateBottomButton("Upload Files", "myag_ed_openWebFileUpload()"));
		ce.push(myag_ed_guiCreateBottomButton("Copy Raw XML", "myag_ed_copyXml()"));
	}
	else
	{
		ce.push(myag_ed_guiCreateBottomButton("Cancel Moving", "myag_ed_stopMoving()"));
	}

	var target = document.getElementById("bottomButtonWrapper");
	target.innerHTML = "";
	for (var x = 0; x < ce.length; x++)
		target.appendChild(ce[x]);
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
	return bmco_xml_xmldoc(GLOBAL_loadedData);
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

/*
inputs: xmldoc
return: <string> ["ok" if all good, new XML text if mistakes found and fixed]
*/
function myag_ed_xmlCheckAndFix(xmldoc)
{
	groups = xmldoc.getElementsByTagName('group');
	artworks = xmldoc.getElementsByTagName('artwork');
	meta = xmldoc.getElementsByTagName('meta')[0];

	ok = true;

	for (var x = 0; x < groups.length; x++)
	{
		ok = ok & myag_ed_xmlCheckAndFixTextFields(xmldoc, groups[x], ["gid", "name", "about"]);
	}
	
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
		children.push(new bmco_TagValuePair("updateDate", bmco_timestamp()));
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
	children = [];
	children.push(new bmco_TagValuePair("name", g.name));
	children.push(new bmco_TagValuePair("about", g.about));
	children.push(new bmco_TagValuePair("gid", g.gid));
	xmldoc.getElementsByTagName('groups')[0].prepend(bmco_xml_nodeConstruct(xmldoc, "group", children));
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
	myag_ed_nodeDelete(xmldoc, "group", "gid", gid);
	var xmlArtworks = xmldoc.getElementsByTagName('artwork');
	for (var t = 0; t < xmlArtworks.length; t++)
		myag_ed_xmlArtworkIngroupRemove(xmldoc, xmlArtworks[t], gid);
}

/* Picks a group of some name and puts it after another group in xmldoc (used for reordering)
inputs: xmldoc <xml document object> [operational xml object],
		movedGname <string> [moved group's name]
		targetGname <string> [name of the group to put after]
return: none
*/
function myag_ed_xmlGroupPutAfter(xmldoc, movedGname, targetGname)
{
	bmco_xml_nodePutAfter(xmldoc, "group", "gid", movedGname, targetGname);
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
	myag_ed_nodeDelete(xmldoc, "artwork", "awid", awid);
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
	var gid = myag_ed_guiInputRead('inputGid');
	var oldName = myag_ed_guiInputRead('inputNameOld');
	var name = myag_ed_guiInputRead('inputName');
	var about = myag_ed_guiInputRead('inputAbout');
	var groupBadchars = ["<", ">"];

	if (name.length > GLOBAL_maxLengthName)
	{
		myag_ed_guiPopupThrowAlert("Group name is too long. Please, keep it 32 symbols or less.");
		return;
	}
	else if (name.trim() == "")
	{
		myag_ed_guiPopupThrowAlert("Group name must not be an empty string. Input some name!");
		return;
	}
	else if (bmco_badcharsPresent(name, groupBadchars))
	{
		myag_ed_guiPopupThrowAlert("Please, do not use the following characters in the group name field:<br>"+bmco_badcharsAsString(groupBadchars));
		return;
	}
	else if (((name != oldName) || action=="create") && (myag_ed_xmlGroupCheckDupes(xmldoc, name)))
	{
		myag_ed_guiPopupThrowAlert("Group name already taken - please, select a different one!");
	   	return;
	}

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
	myag_av_hideViewer();
}

/* Triggered when a new artwork is being created or an existing one is being updated.
Takes care of validating the edit menu input fields.
inputs: action <string = "update" or "create"> [action mode selection]
return: none
*/
function myag_ed_actionArtwork(action)
{
	var xmldoc = myag_ed_xmldoc();
	var awid = myag_ed_guiInputRead("inputAwid");
	var name = myag_ed_guiInputRead("inputName");
	var about = myag_ed_guiInputRead("inputAbout");
	var filename = myag_ed_guiInputRead("inputFilename");
	var fnameBadchars = ["<", ">", "/", "\\"];

	if (name.length > GLOBAL_maxLengthName)
	{
		myag_ed_guiPopupThrowAlert("Artwork name should be not longer than 64 characters!");
		return;
	}
	else if (filename.length > GLOBAL_maxLengthFilename)
	{
		myag_ed_guiPopupThrowAlert("File name should be not longer than 64 characters!");
		return;
	}
	else if ((filename.length == 0) || (filename == ""))
	{
		myag_ed_guiPopupThrowAlert("Please, provide a filename!")
		return;
	}
	else if (bmco_badcharsPresent(filename, fnameBadchars))
	{
		myag_ed_guiPopupThrowAlert("Please, do not use the following characters in the filename field:<br>"+bmco_badcharsAsString(fnameBadchars));
		return;
	}

	ingroups = [];
	groups = xmldoc.getElementsByTagName('group');
	for (var t = 0; t < groups.length; t++)
	{
		var gid = bmco_xml_childTagRead(groups[t], "gid");
		var cbxId = "checkbox_"+gid;
		if (document.getElementById(cbxId).checked)
			ingroups.push(gid);
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
	myag_av_hideViewer();
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
	myag_av_showViewer();
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
	myag_ed_guiActionMenuDelete();
	myag_av_showViewer();
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
		myag_ed_guiActionMenuDelete();
		myag_ed_guiPopupClose();
	}
	else
	{
		var text = "Do you really want to delete this group? This action can only be undone by refreshing the page, losing all work.";
		myag_ed_guiPopupThrowSelect(text, "No", "myag_ed_guiPopupClose()", "Yes", "myag_ed_deleteGroup('"+gid+"', true)");
	}
}

/* Triggers the process of moving the group around.
inputs: gid <string> [id of a present group that should be moved]
return: none
*/
function myag_ed_moveGroup(gid)
{
	myag_ed_guiFindOfClassByAttribute('groupButton', 'groupId', gid).id = "currentlyMoved";
	myag_ed_guiFindOfClassByAttribute('locatorWrapperGroup', 'groupId', gid).id = "currentlyMovedLocator";
	myag_ed_guiSetMovingMode("group");
	myag_ed_guiActionMenuDelete();
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
	myag_av_showViewer();
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
	myag_ed_guiActionMenuDelete();
	myag_av_showViewer();
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
		myag_ed_xmlArtworkDelete(xmldoc, awid);
		myag_ed_xmlUpdateLoadedData(xmldoc);
		myag_ed_guiArtworkDivDelete(awid);
		myag_ed_guiPopupClose();
		myag_ed_guiActionMenuDelete();
	}
	else
	{
		var text = "Do you really want to delete this artwork? This action can only be undone by refreshing the page, losing all work."
		myag_ed_guiPopupThrowSelect(text, "No", "myag_ed_guiPopupClose()", "Yes", "myag_ed_deleteArtwork('"+awid+"', true)");
	}
}

/* Triggers the process of moving the artwork around.
inputs: awid <string> [awid of a present artwork that should be moved]
return: none
*/
function myag_ed_moveArtwork(awid)
{
	myag_ed_guiFindOfClassByAttribute('artwork', 'artworkId', awid).id = "currentlyMoved";
	myag_ed_guiFindOfClassByAttribute('locatorWrapperArtwork', 'artworkId', awid).id = "currentlyMovedLocator";
	myag_ed_guiSetMovingMode("artwork");
	myag_ed_guiActionMenuDelete();
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
		myag_ed_guiActionMenuAppend(arg, event.clientX, event.clientY);	
}

/* Displays a menu of XML-specific tools.
inputs: none
return: none
*/
function myag_ed_showMacroToolsMenu()
{
	var text = "These macro commands allow you to do some tedious work rather quickly. Keep in mind that there's no undo button! More commands coming someday.";
	var popup = myag_ed_guiPopupThrowSelect(text, "Reverse groups", "myag_ed_reverseGroups()", "Reverse artworks", "myag_ed_reverseArtworks()");
	popup.childNodes[0].style.textAlign = "justify";
	popup.childNodes[0].style.borderBottom = "3px dotted var(--col-highlight)";
	popup.childNodes[0].style.paddingBottom = "calc(var(--page-spacing) / 2)";
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
		var gname = document.getElementsByClassName("groupButton")[groupsNum].getAttribute("groupName");
		myag_ed_guiGroupButtonPutAfter(gname, target);
		myag_ed_xmlGroupPutAfter(xmldoc, gname, target);
		target = gname;
	}
	myag_ed_xmlUpdateLoadedData(xmldoc);
	myag_ed_guiPopupClose();
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
	myag_ed_guiPopupClose();
}

/* Make a pretty, tabbed XML out of a minified string.
inputs: xmlText <string> [source XML document text without the xml metadata tag]
return: <string> [prettified XML text]
*/
function myag_ed_prettifyXml(xmlText)
{
	return vkbeautify.xml(xmlText, 5);
}

/* Opens up the neocities editor to the XML file, puts the XML text to user's clipboard, so they
can paste it to the XML file and save it.
inputs: none
return: none
*/
function myag_ed_openWebXmlEditor()
{
	var xml = myag_ed_prettifyXml(GLOBAL_loadedData);

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
	var xml = myag_ed_prettifyXml(GLOBAL_loadedData);
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
		var button = myag_ind_appendSingleGroupButton(dummyG, target, "prepend", "myag_ed_createGroup()");
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
}

//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

myag_ed_startup();
