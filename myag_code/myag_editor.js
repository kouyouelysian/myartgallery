//==========================================================================//
//========================== MYAG EDITOR PAGE CODE =========================//
//==========================================================================//

/*
pre-import requirements:
	bmco.general.js
	bmco.xml.js
	myag.main.js
	myag.index.js
	myag.panel.js
*/

myag.ed = {

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

settings: {
	maxLengthName: 64,
	maxLengthFilename: 64,
},
filterGroup: undefined,
isMoving: "none", // "none", "group" or "artwork"
uploads: [],
deletes: [],
pickedEntityId: undefined,

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

//==========================================================================//
//=============================== GUI STUFF ================================//
//==========================================================================//

getItemType(id) {
	if (id.substr(0,3) == "aw_")
		return "artwork";
	else if (id.substr(0,2) == "g_")
		return "group";
	return null;
},

getItemList(arg) {
	if (arg.substr(0,3) == "aw_" || arg == "artwork")
		return myag.data.artworks;
	else if (arg.substr(0,2) == "g_" || arg == "group")
		return myag.data.groups;
},

new: function(type) {
	var ic = myag.ed.getItemList(type).itemClass;
	var i = new ic();
	i.name = `New ${type}`;
	i.filloutWrite();
	if (type == "artwork" && myag.ed.filterGroup)
		document.getElementById(`chb_${myag.ed.filterGroup}`).checked = true;
	myag.ed.guiFormMenuSetMode("new", type);
	bmco.gui.filloutShow(myag.ed.getItemList(type).gui.fillout);
},

add: function(type) {
	myag.ed.getItemList(type).addNew();
	bmco.gui.filloutHide();
},

edit: function(id) {
	bmco.gui.actionMenuDelete();
	myag.ed.getItemList(id).itemById(id).filloutWrite();
	myag.ed.guiFormMenuSetMode("edit", myag.ed.getItemType(id));
	bmco.gui.filloutShow(myag.ed.getItemList(id).gui.fillout);
},

update: function(type) {
	myag.ed.getItemList(type).updateExisting();
	bmco.gui.filloutHide();
},

cancel: function() {
	bmco.gui.filloutHide();
},

pick: function(id) {
	bmco.gui.actionMenuDelete();
	myag.ed.guiBottomMenuSetMode("move");
	var il = myag.ed.getItemList(id);
	il.htmlItemsActive(false);
	bmco.ofClassRemoveClass("marker", "invisible");
	il.htmlItemVisible(id, false, {affectMarker:true, affectPreviousMarker:true, visibilityClass:["translucent", "invisible"]});
	myag.ed.pickedEntityId = id;
},

place: function(targetId=null) {
	event.stopPropagation();
	if (!myag.ed.pickedEntityId)
		return false;
	myag.ed.guiBottomMenuSetMode("default");
	var il = myag.ed.getItemList(myag.ed.pickedEntityId);
	il.htmlItemsActive(true);
	il.htmlItemVisible(myag.ed.pickedEntityId, true, {visibilityClass:["translucent", "invisible"]});
	bmco.ofClassAddClass("marker", "invisible");
	
	if (!targetId) // no id provided = "cancel moving". just restore the moved entity to be visible
		return myag.ed.pickedEntityId = null;	
	il.moveById(myag.ed.pickedEntityId, targetId);
	myag.ed.pickedEntityId = null;	
},

delete: function(id) {
	bmco.gui.actionMenuDelete();
	var name = myag.ed.getItemList(id).itemById(id).name;
	name? name = `'${name}'` : name = "this artwork";
	bmco.gui.popupConfirm(
		`Really delete ${name}?`, 
		`myag.ed.getItemList('${id}').removeById('${id}');`
		);
},

idToCLipboard: function(id) {

	bmco.gui.actionMenuDelete();
	myag.ed.textToClipboard(id, 'ID copied to clipboard');
},

/* This function is put to every artwork and group's onclick and it calls the action menu
to the mouse pointer location.
inputs: arg <string> [artwork id or group name],
		event <event> [js event object passed down from the onclick thing]
return: none
*/
showItemMenu: function(id, event)
{
	if (myag.ed.pickedEntityId)
		return;

	var buttons = {
		"Edit":     `myag.ed.edit('${id}')`,
		"Move":     `myag.ed.pick('${id}')`,
		"Delete": `myag.ed.delete('${id}')`,
		"Copy ID": `myag.ed.idToCLipboard('${id}')`
	};
	bmco.gui.actionMenuAppend(buttons, event);	
},

/* This clusterfuck switches the layout between move group, more artwork and
not move anything modes. I did it so it works purely with CSS, so that any artworks
that suddenly got scrolled into view need no event listeners or whatever. In return,
there's this bunch of crap down there. :) It's used when you choose "move" in the menu.
it probably can be done more neatly, but... it works.
inputs: mode <string = "none", "artwork" or "group"> [operation mode selection] 
returns: none
*/
guiSetMovingMode: function(mode="none")
{
	if (!bmco.arrayHas(["none", "artwork", "group"], mode))
		return;

	if (mode == "none")
	{
		bmco.ofClassRemoveClass("locatorWrapperArtwork", "locatorActive");
		bmco.ofClassRemoveClass("locatorWrapperGroup", "locatorActive");
	}
	else
	{
		if (mode == "artwork")
			bmco.ofClassAddClass("locatorWrapperArtwork", "locatorActive");
		else if (mode == "group")
			bmco.ofClassAddClass("locatorWrapperGroup", "locatorActive");
	} 
},

/* Creates a checkbox + label thing. Only used in group selection section
in the artwork edit menu.
inputs: g <Group instance> [checkbox represents this group],
		checked <bool> [initial checkbox state]
return: <html element> [div with checkbox input and label p inside]
*/
groupCheckboxCreate: function(g, checked=false)
{
	var i = document.createElement("input");
	i.setAttribute("name", g.id);
	i.id = `chb_${g.id}`;
	i.setAttribute("type", "checkbox");
	i.checked = checked;
	var l = document.createElement("label");
	l.setAttribute("for", g.id);
	l.innerHTML = g.name
	var d = document.createElement("div");
	d.appendChild(i);
	d.appendChild(l);
	d.setAttribute("onclick", `myag.ed.groupCheckboxToggle('${g.id}')`);
	d.classList.add("labelledCheckbox");

	return d;
},

groupCheckboxToggle: function(gid)
{
	var chb = document.getElementById(`chb_${gid}`);
	if (!chb)
		return;
	chb.checked = !chb.checked;
},

guiFormMenuSetMode: function(mode, type)
{
	var nameFnTuples = [];
	if (mode == "new")
		nameFnTuples.push(["Create", `myag.ed.add('${type}')`]);	
	else if (mode == "edit")
		nameFnTuples.push(["Update", `myag.ed.update('${type}')`]);
	nameFnTuples.push(["Cancel", "myag.ed.cancel()"]);
	var targetId = type=="artwork"? "filloutArtworkBottomBar" : "filloutGroupBottomBar";
	bmco.gui.bottomBarPopulate(nameFnTuples, targetId);
},

/* Sets up the bottom buttons menu with necessary buttons.
inputs: mode <string = "default" or "move"> [defines which situation the menu has to be set up for]
return: none
*/
guiBottomMenuSetMode: function(mode)
{
	var nameFnTuples = [];
	if (mode == "default")
	{	
		if (document.body.getAttribute("isOffline") == "isOffline")
			nameFnTuples.push(["Update channel", "myag.ed.neomanagerUpdate()"]);	
		else
		{
			nameFnTuples.push(["Update XML", "myag.ed.openWebXmlEditor()"]);	
			nameFnTuples.push(["Upload Files", "myag.ed.openWebFileUpload()"]);	
			nameFnTuples.push(["Copy Raw XML", "myag.ed.copyXml()"]);
		}
				
	}
	else if (mode == "move")
		nameFnTuples.push(["Cancel Moving", "myag.ed.place()"]);
	else
		return;
	bmco.gui.bottomBarPopulate(nameFnTuples, "bottomButtonWrapper");
},

groupFilterReset: function()
{
	myag.ed.groupFilterRun(true);
},

groupFilterRun: function(reset=false)
{
	var option = document.getElementById("groupFilterSelect").value;
	var target = document.getElementsByClassName("artworksWrapper")[0];
	if (reset || option == "any")
	{
		myag.ed.filterGroup = undefined;
		target.removeAttribute("group");
	}
	else
	{
		for (var g of myag.data.groups.items)
		{
			if (g.id == option)
			{
				myag.ed.filterGroup = g.id;
				target.setAttribute("group", option);
			}
		} 
				
	}

	target.innerHTML = "";
	myag.data.artworks.putItemsToHtml(target, true);
	window.dispatchEvent(myag.events.artworksLoaded);
	
},


/* Loads a menu of macro tools to the tools tab.
inputs: none
return: none
*/
loadTools: function()
{
	var tools = [
		{
			name: "Reverse artworks",
			about: "Completely inverts the order of the artworks",
			function: "myag.data.artworks.reverse()"
		},
		{
			name: "Reverse groups",
			about: "Completely inverts the order of the groups",
			function: "myag.data.groups.reverse()"
		}
	];
	if (bmco.bodyAttributeExists("isOffline"))
	{
		tools.push({
			name: "Build thumbnails",
			about: "If this is a pre-neomanager instance, this builds thumbnails for each artwork so the gallery loads faster. May take some time!",
			function: "bmco.runRoutineSectionForm(\"thumbs_rebuild\")"
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
		var fn = "bmco.gui.popupConfirm('Run "+tool['name']+"?', '"+tool['function']+"')";
		tdiv.appendChild(bmco.gui.buttonCreate(tool['name'], fn));
		tdiv.appendChild(about);
		target.appendChild(tdiv);
	}
},

/* update function called from the offline neomanager version
inputs: none
return: none
*/
neomanagerUpdate: function()
{
	dataFiles = [
			{
				remote_name: "myag.files/data.xml",
				type: "xml",
				contents: myag.ed.prepareXml()
			}
		];	
	bmco.gui.loadingSpinnerCreate();
	bmco.runUpdateForm(datafiles=dataFiles, uploads=myag.ed.uploads, deletes=myag.ed.deletes);
},

/* Make a pretty, tabbed XML out of a minified string.
inputs: xmlText <string> [source XML document text without the xml metadata tag]
return: <string> [prettified XML text]
*/
prepareXml: function()
{
	bmco.infra.metaTagUpdate(myag.data.xml);
	var text = bmco.xml.xmldocToString(myag.data.xml);
	return bmco.xml.beautify(text);
},

/* Opens up the neocities editor to the XML file, puts the XML text to user's clipboard, so they
can paste it to the XML file and save it.
inputs: none
return: none
*/
openWebXmlEditor: function()
{
	myag.ed.copyXml(false);
    window.open(myag.settings.neocitiesXmlFileEditLink, target="_blank");
},

/* Opens up the neocities file browser to the image files location so that the user can
quickly dump their new artworks there.
inputs: none
return: none
*/
openWebFileUpload: function()
{
	window.open(myag.settings.neocitiesArtworksFolderLink, target="_blank");
},

/* Puts the current XML text to user's text clipboard.
inputs: none
outputs: none
*/
copyXml: function(doGui=true)
{
	return myag.ed.textToClipboard(
		myag.ed.prepareXml(),
		doGui? 'raw XML copied' : undefined
	);
},

textToClipboard: function(text, message=undefined)
{
	navigator.clipboard.writeText(text).then(() => {
		if (message) bmco.gui.popupAlert(message);
	})
	.catch(err => {
		if (message) bmco.gui.popupAlert('Could not copy to clipboard, tell <a href="https://auberylis.moe>">Aubery</a> about this ASAP: ' + err);
	});
},

/* Page startup function. Adds "add new.." buttons, set title, etc.
inputs: none
return: none
*/
startup: function()
{
	myag.ed.guiBottomMenuSetMode("default");

	window.addEventListener("artworksLoaded", (event) => {
		var t = document.getElementsByClassName("artwork")[0];
		t.id = "createNewArtwork";
		t.removeAttribute("style");
		t.setAttribute("onclick", "myag.ed.new('artwork')");
	});

	window.addEventListener("groupsLoaded", (event) => {
		t = document.getElementsByClassName("groupButton")[0];
		t.id = "createNewGroup";
		t.setAttribute("onclick", "myag.ed.new('group')");
		var checkboxesWrapper = document.getElementById("inputArtworkIngroups");
		var groupFilterSelect = document.getElementById("groupFilterSelect");
		for (var g of myag.data.groups.items)
		{
			if (g.id != "start")
			{
				checkboxesWrapper.appendChild(myag.ed.groupCheckboxCreate(g));
				var groupOption = document.createElement("option");
				groupOption.name = g.name;
				groupOption.value = g.id; 
				groupOption.innerHTML = g.name;
				groupFilterSelect.appendChild(groupOption);
			
			}
		}
	});

	myag.ed.loadTools();
	
	if (bmco.bodyAttributeExists("isoffline"))
	{
		var target = document.getElementById("inputFilename");
		target.previousElementSibling.remove();
		target.setAttribute("type", "hidden");
		
	}
	else
	{
		var target = document.getElementById("inputFileUpload");
		target.previousElementSibling.remove();
		target.remove();
	}

}

//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//
};

window.addEventListener("xmlLoaded", (event) => {
	if (!bmco.bodyAttributeExists('isOffline'))
		myag.ed.startup();
});
