//==========================================================================//
//=============== BRIGHT MOON CO. GUI DRIVING FUNCTIONS ====================//
//==========================================================================//

/*
pre-import requirements:
	bmco_general.js

style requirements:
	bmco_gui.css

only to be used as an ez buttons+popups addon for existing projects

available functions:
	bmco_gui_hideAny()
	bmco_gui_backdropCreate(onclick="bmco_gui_hideAny()", backdropId="guiBackdrop")
	bmco_gui_backdropRemove(backdropId="guiBackdrop")
	bmco_gui_buttonCreate(text, fn)
	bmco_gui_popupAddButton(popup, text, fn)
	bmco_gui_popupClose()
	bmco_gui_popupCreatePopupBody(text, id=undefined)
	bmco_gui_popupAlert(message, fn="bmco_gui_popupClose()", text="OK")
	bmco_gui_popupConfirm(message, fn1, text1="YES", fn2="bmco_gui_popupClose()", text2="NO")
	bmco_gui_bottomBarClear(id)
	bmco_gui_bottomBarPopulate(buttonTuples, id)
	bmco_gui_filloutShow(id)
	bmco_gui_filloutHide(id)
*/

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/*  Hides any opened interactive windows, like popups or fillouts.
inputs: none
return: none 
*/
function bmco_gui_hideAny()
{
	popups = document.getElementsByClassName("popup");
	fillouts = document.getElementsByClassName("fillout");

	for (var t = 0; t < popups.length; t++)
		popups[t].remove();

	for (var t = 0; t < fillouts.length; t++)
		fillouts[t].removeAttribute("style");

	bmco_gui_actionMenuDelete();
	bmco_gui_backdropRemove();
}

/*  creates a sticky <div> to cover everything behind popups etc, appens to body.
	does not create anything if a backdrop of ID already exists.
inputs: none
return: created HTML element
*/
function bmco_gui_backdropCreate(onclick="bmco_gui_hideAny()", backdropId="guiBackdrop", opacity=null)
{
	if (document.getElementById(backdropId) != undefined)
		return;
	var backdrop = document.createElement("div");
	backdrop.id = backdropId;
	backdrop.classList.add("backdrop");
	backdrop.setAttribute("onclick", onclick);
	if (opacity != null)
		backdrop.setAttribute("style", "opacity: "+String(opacity));
	document.body.appendChild(backdrop);
	return backdrop;
}

/*  removes the backdrop
inputs: none
return: none
*/
function bmco_gui_backdropRemove(backdropId="guiBackdrop")
{
	bmco_removeIfExists(backdropId);
}

/*-------------------------------- button --------------------------------*/

/*  Creates HTML for a standard clickable button
inputs: text <string> [text to be displayed in the button, e.g. "OK"],
		fn <string> [function to be put into button's onclick event, e.g. "alert(1)"]
return: <HTML element> [ready-to-append button]
*/
function bmco_gui_buttonCreate(text, fn)
{
	var button = document.createElement("div");
	button.innerHTML = text;
	if (fn != undefined)
		button.setAttribute("onclick", fn);
	button.classList.add("button");
	return button;
}

/*-------------------------------- popup --------------------------------*/

/*  Adds a button to popup's button zone
inputs: text <string> [text to be put into the paragraph],
		fn <string> [function to be executed upon clicking the button]
return: none
*/
function bmco_gui_popupAddButton(popup, text, fn)
{
	target = null;
	for (var i = 0; i < popup.childNodes.length; i++)
	{
		if (popup.childNodes[i].className == "popupButtonZone") 
		{
			target = popup.childNodes[i];
			break;
		}
	}
	if (target == null)
		return;

	target.appendChild(bmco_gui_buttonCreate(text, fn));
}

/*  closes any generated popup, if there is one
inputs: none
return: none
*/
function bmco_gui_popupClose()
{
	bmco_gui_backdropRemove();
	bmco_removeIfExists("popupAlert");
	bmco_removeIfExists("popupSelect");
}

/*  creates the default popup body to which buttons have to be appended
inputs: text <string> [popup message text],
		id <string, optional> [if set - the popup window id]
return: <html element>
*/
function bmco_gui_popupCreatePopupBody(text, id=undefined)
{
	var popup = document.createElement("div");
	if (id != undefined)
		popup.id = id;
	popup.classList.add("popup");
	var textMessage = document.createElement("p");
	textMessage.innerHTML = text;
	textMessage.classList.add("popupTextMessage");
	popup.appendChild(textMessage);
	var buttonZone = document.createElement("div");
	buttonZone.classList.add("popupButtonZone");
	popup.appendChild(buttonZone);
	return popup;
}

/*  Throws an alert message on-screen that can be closed by pressing
"OK" - a fancy substitute for the built-in "alert(arg)" method
inputs: message <string> [alert message text]
		text <string, optional> [text to be displayed on the button],
		fn <string, optional> [function to be executed on button press, closes the popup by default]
return: <html element> [created popup div]
*/
function bmco_gui_popupAlert(message, fn="bmco_gui_popupClose()", text="OK")
{
	bmco_gui_backdropCreate("bmco_gui_popupClose()");
	var alertDiv = bmco_gui_popupCreatePopupBody(message, "popupAlert");
	bmco_gui_popupAddButton(alertDiv, text, fn);
	document.body.appendChild(alertDiv);
	return alertDiv;
}

/*  Throws a select prompt message on-screen that can disappears when
the user chooses one of the two options.
inputs: message <string> [select prompt text],
		fn1 <string> [onclick to be executed by the left button],
		text1 <string> [text on the left button],
		fn2 <string> [onclick to be executed by the right button],
		text2 <string> [text on the right button],
		addAutoClose <bool=True> [add a popup close function to the yes button onclick
								  so that the menu closes on its own]
return: <html element> [created popup div]
*/
function bmco_gui_popupConfirm(message, fn1, text1="YES", fn2="bmco_gui_popupClose()", text2="NO", addAutoClose=true)
{
	bmco_gui_backdropCreate("bmco_gui_popupClose()");
	if (addAutoClose)
		fn1 += "; bmco_gui_popupClose()";
	console.log(fn1);
	var selectDiv = bmco_gui_popupCreatePopupBody(message, "popupSelect");
	bmco_gui_popupAddButton(selectDiv, text1, fn1);
	bmco_gui_popupAddButton(selectDiv, text2, fn2);
	document.body.appendChild(selectDiv);
	return selectDiv;
}

/*-------------------------------- bottombar --------------------------------*/

/*  Clears all buttons from a .bottombar div
inputs: id <string> [element ID of .bottombar div to be cleaned up]
return: <bool> [success or not]
*/
function bmco_gui_bottomBarClear(id)
{
	var target = document.getElementById(id);
	if (!target)
		return false;
	target.innerHTML = "";
	return true;
}

/*  Is used to populate a .bottombar <div> with buttons
inputs: buttonTuples <Array[ ["name", "function()"], ...> [Information on
		the buttons that should be created. Array of arrays. Each child array
		should contain 2 strings: text displayed on the button (e.g. "OK"), and
		text to be put to the onclick attribute, usually a JS function (e.g.
		"alert(1)") ],
		id <string> [element ID of .bottombar div to be cleaned up]
return: none
*/
function bmco_gui_bottomBarPopulate(buttonTuples, id)
{
	if (!(bmco_gui_bottomBarClear(id)))
		return;

	var target = document.getElementById(id);
	if (!target)
		return;

	for (var t = 0; t < buttonTuples.length; t++)
	{
		var bt = buttonTuples[t];
		var b = bmco_gui_buttonCreate(bt[0], bt[1]);
		target.appendChild(b);
	}
}

/*-------------------------------- fillout --------------------------------*/

/*  Show a fill-out form by its id. Comes with a backdrop and everything
inputs: id <string> [id of a .fillout class div]
return: none
*/
function bmco_gui_filloutShow(id)
{
	console.log("painis");
	var target = document.getElementById(id);
	if (target == undefined)
		return;
	bmco_gui_backdropCreate();
	target.style.display = "block";
}

/*  Hide a fill-out form by its id. Deletes the backdrop
inputs: id <string> [id of a .fillout class div]
return: none
*/
function bmco_gui_filloutHide(id)
{
	var target = document.getElementById(id);
	if (target == undefined)
		return;
	bmco_gui_backdropRemove();
	target.removeAttribute("style");
}

/*-------------------------------- action menu --------------------------------*/

/* Creates and appends an action selection menu to the screen. Is called when the artwork or group
has been pressed to present options like edit, delete and move. Also creates the invisible backdrop
that allows to close the menu by clicking elsewhere.
inputs: arg <string> [a group name or an artwork id of a present group/artwork],
		mouseX <int> [X position of the mouse at the moment of call],
		mouseY <int> [Y position of the mouse at the moment of call]
return: none
*/
function bmco_gui_actionMenuAppend(arg, mouseX, mouseY)
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
		ce.push(bmco_gui_buttonCreate(buttonNames[x], buttonFunctions[x]));

	var menu = bmco_gui_arrayOfElementsToDiv(ce, "actionMenu");
	var offset = 40;
	menu.style.left = Math.min(mouseX - offset, (window.innerWidth - 300))+"px";
	menu.style.top = (mouseY+window.scrollY - offset)+"px";
	document.body.prepend(menu);

	bmco_gui_backdropCreate("bmco_gui_actionMenuDelete()", "guiBackdrop", opacity = 0);
	/*
	var bd = document.createElement("div");
	bd.id = "actionMenuBackdrop";
	bd.setAttribute("onclick", "myag_ed_guiActionMenuDelete()");
	document.body.prepend(bd);
	*/
}

/* Removes the action selection menu and its backdrop from the screen.
inputs: none
return: none
*/
function bmco_gui_actionMenuDelete()
{
	bmco_gui_backdropRemove();
	bmco_removeIfExists("actionMenu");
}

/* Creates a div and appends all the html elements from the elements array into it
inputs: elements <html element array> [an array of html elements to be appended into one div],
		id <string, optional> [if set - the resulting div's id will be set to this]
return: <html element> [resulting div]
*/
function bmco_gui_arrayOfElementsToDiv(elements, id=undefined)
{
	var outDiv = document.createElement("div");
	if (id != undefined)
		outDiv.id = id;
	for (var x = 0; x < elements.length; x++)
		outDiv.appendChild(elements[x]);
	return outDiv;
}
