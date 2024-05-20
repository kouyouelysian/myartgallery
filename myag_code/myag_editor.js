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
newArtworksSpawned: 0,
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

getItemList(arg) {
	if (myag.isAwid(arg) || arg == "artwork")
		return myag.data.artworks;
	else if (myag.isGid(arg) || arg == "group")
		return myag.data.groups;
},

filloutGroupRead: function() {
	fieldData = {
		"name": document.getElementById("inputName").value,
		"filename": document.getElementById("inputFilename").value,
		"about": document.getElementById("inputAbout").value,
		"ingroups": myag.data.xml.createElement("ingroups"),
		"awid": id
	};
	for (var chb in document.getElementById("filloutArtworkGroupCheckboxes").getElementsByTagName("input"))
	{
		if (!chb.checked)
			continue;
		var ig = myag.data.xml.createElement("ingroup");
		bmco.xml.childTagWrite(myag.data.xml, ig, chb.getAttribute("name"));
		fieldData.ingroups.appendChild(ig);
	}
},

filloutArtworkRead: function() {
	fieldData = {
		"name": document.getElementById("inputName").value,
		"filename": document.getElementById("inputFilename").value,
		"about": document.getElementById("inputAbout").value,
		"ingroups": myag.data.xml.createElement("ingroups"),
		"awid": id
	};
	for (var chb in document.getElementById("filloutArtworkGroupCheckboxes").getElementsByTagName("input"))
	{
		if (!chb.checked)
			continue;
		var ig = myag.data.xml.createElement("ingroup");
		bmco.xml.childTagWrite(myag.data.xml, ig, chb.getAttribute("name"));
		fieldData.ingroups.appendChild(ig);
	}
},

new: function(type) {
	var ic = myag.ed.getItemList(type).itemClass;
	var i = new ic();
	i.name = `New ${type}`;
	i.filloutWrite();
	bmco.gui.filloutShow(myag.ed.getItemList(type).gui.fillout);
},

add: function(id, update=false) {

	
},

edit: function(id) {
	bmco.gui.actionMenuDelete();
	myag.ed.getItemList(id).itemById(id).filloutWrite();
	bmco.gui.filloutShow(myag.ed.getItemList(id).gui.fillout);
},

update: function(id) {
	return myag.ed.add(id, true);
},

pick: function(id) {
	bmco.gui.actionMenuDelete();
	myag.ed.guiBottomMenuSetMode("move");
	myag.ed.getItemList(id).htmlItemsActive(false);
	bmco.ofClassRemoveClass("placeMarker", "invisible");
	myag.ed.pickedEntityId = id;	
},

place: function(targetId=null) {
	myag.ed.guiBottomMenuSetMode("default");
	myag.ed.getItemList(myag.ed.pickedEntityId).htmlItemsActive(true);
	bmco.ofClassAddClass("placeMarker", "invisible");
	myag.ed.getItemList(myag.ed.pickedEntityId).putAfter(myag.ed.pickedEntityId, targetId);
	myag.ed.pickedEntityId = null;	
	/*
	var params = myag.ed.paramsGenerate(myag.ed.pickedEntityId);
	bmco.ofClassAddClass("placeMarker", "invisible");
	bmco.ofClassRemoveClass(params.htmlClass, "inactive");
	myag.ed.guiElementById(myag.ed.pickedEntityId).removeAttribute("style");
	bmco.firstElementOfClassByAttribute("placeMarker", params.htmlIdAttribute, myag.ed.pickedEntityId).removeAttribute("style");
	if (!targetId) // no id provided = "cancel moving". just restore the moved entity to be visible
		return 
	
	var movedObjIndex = bmco.firstInArrayWithProperty(params.objArray, params.objIdProperty, myag.ed.pickedEntityId, true);
	var targetIndex = 0;
	if (targetId != "start")
		targetIndex = bmco.firstInArrayWithProperty(params.objArray, params.objIdProperty, targetId, true);

	bmco.arrayMoveValue(params.objArray, movedObjIndex, targetIndex);
	document.getElementsByClassName(params.guiWrapperClass)[0].insertBefore(
		bmco.firstElementOfClassByAttribute(params.htmlClass, params.htmlIdAttribute, myag.ed.pickedEntityId),
		bmco.firstElementOfClassByAttribute(params.htmlClass, params.htmlIdAttribute, targetId).nextElementSibling.nextElementSibling
	);
	document.getElementsByClassName(params.guiWrapperClass)[0].insertBefore(
		bmco.firstElementOfClassByAttribute("placeMarker", params.htmlIdAttribute, myag.ed.pickedEntityId),
		bmco.firstElementOfClassByAttribute(params.htmlClass, params.htmlIdAttribute, myag.ed.pickedEntityId).nextElementSibling
	);
	console.log(movedObjIndex, targetIndex);
	*/

},

delete: function(id) {
	myag.ed.getItemList(id).removeById(id);
	bmco.gui.actionMenuDelete();
},


/* This function is put to every artwork and group's onclick and it calls the action menu
to the mouse pointer location.
inputs: arg <string> [artwork id or group name],
		event <event> [js event object passed down from the onclick thing]
return: none
*/
showItemMenu: function(id, event)
{
	if (myag.ed.isMoving != "none")
		return;

	var buttons = {
		"Edit":     `myag.ed.edit('${id}')`,
		"Move":     `myag.ed.pick('${id}')`,
		"Delete": `myag.ed.delete('${id}')`
	};
	bmco.gui.actionMenuAppend(buttons, event.clientX, event.clientY);	
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
	
	myag.ed.isMoving = mode;
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
	i.setAttribute("type", "checkbox");
	i.checked = checked;

	console.log(g);

	var l = document.createElement("label");
	l.setAttribute("for", g.id);
	l.innerHTML = g.name
	
	var d = document.createElement("div");
	d.appendChild(i);
	d.appendChild(l);
	d.classList.add("labelledCheckbox");
	d.setAttribute("onclick", "bmco.gui.filloutCheckboxToggle('checkbox_"+g.id+"')");

	return d;
},

/* Sets up the bottom buttons menu with necessary buttons.
inputs: mode <string = "default" or "move"> [defines which situation the menu has to be set up for]
return: none
*/
guiBottomMenuSetMode: function(mode)
{
	nameFnTuples = [];
	if (mode == "default")
	{	
		if (document.body.getAttribute("isOffline") == "isOffline")
		{
			nameFnTuples.push(["Update channel", "myag.ed.neomanagerUpdate()"]);	

		}
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



//==========================================================================//
//================== BUTTON ACTIONS, MASTER FUNCTIONS, ETC =================//
//==========================================================================//

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
			function: "myag.ed.reverseArtworks()"
		},
		{
			name: "Reverse groups",
			about: "Completely inverts the order of the groups",
			function: "myag.ed.reverseGroups()"
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
	var x = myag.data.xml;

	var v = bmco.xml.childTagRead(x.getElementsByTagName("meta")[0], "updateCount");
	if (isNaN(v))
	{
		myag.ed.guiPopupThrowAlert("Could not read the update counter as a number. Tell this\
			to <a href='astrossoundhell.neocities.org/data/links/'>Aubery</a> please.");
		return;
	}
	v = parseInt(v) + 1;
	bmco.xml.childTagWrite(x, x.getElementsByTagName("meta")[0], "updateCount", String(v));
	bmco.xml.childTagWrite(x, x.getElementsByTagName("meta")[0], "updateTimestamp", bmco.timestamp());
	myag.ed.xmlUpdateLoadedData(x);

	var xmlText = myag.ed.loadedData;
	return vkbeautify.xml(xmlText, 5);
},

/* Opens up the neocities editor to the XML file, puts the XML text to user's clipboard, so they
can paste it to the XML file and save it.
inputs: none
return: none
*/
openWebXmlEditor: function()
{
	var xml = myag.ed.prepareXml();

	navigator.clipboard.writeText(xml).then(() => {
    	window.open(myag.settings.neocitiesXmlFileEditLink, target="_blank");
	})
	.catch(err => {
		myag.ed.guiPopupThrowAlert('Could not copy, tell Aubery about this ASAP: ' + err);
	});
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
copyXml: function()
{
	var xml = myag.ed.prepareXml();
	navigator.clipboard.writeText(xml).then(() => {
    	myag.ed.guiPopupThrowAlert('raw XML copied');
	})
	.catch(err => {
		myag.ed.guiPopupThrowAlert('Could not copy, tell Aubery about this ASAP: ' + err);
	});
},

/* Page startup function. Adds "add new.." buttons, set title, etc.
inputs: none
return: none
*/
startup: function()
{
	bmco.setTitle(myag.settings.title + " / editor");
	myag.ed.guiBottomMenuSetMode("default");

	
	window.addEventListener("artworksLoaded", (event) => {
		var newArtworkButton = myag.generateArtworkDiv(new myag.Artwork(), "myag.ed.new('artwork')", "Add new...");
		newArtworkButton.id = "buttonCreateNewArtwork";
		document.getElementsByClassName("myag_artworksWrapper")[0].prepend(myag.generateArtworkPlaceMarker());
		document.getElementsByClassName("myag_artworksWrapper")[0].prepend(newArtworkButton);	
		
	});

	window.addEventListener("groupsLoaded", (event) => {
		var newGroupButton = myag.generateGroupDiv(new myag.Group("start", "Add new...", ""), "myag.ed.new('group')", "Add new...");
		newGroupButton.id = "buttonCreateNewGroup";
		document.getElementsByClassName("myag_groupsWrapper")[0].prepend(newGroupButton);
		var checkboxesWrapper = document.getElementById("inputArtworkIngroups");
		for (var g of myag.data.groups.items)
			checkboxesWrapper.appendChild(myag.ed.groupCheckboxCreate(g));
	});
	/*
	window.addEventListener("xmlFileLoaded", (event) => {
		check = myag.ed.xmlCheckAndFix(myag.data.xml);
		if (check != "ok")
		{
			var text = "Looks like your XML file is out of date or damaged. The automatic repair/update routine prepared a \
			fixed version for you - please, update your XML contents, then force-refresh this page.";
			myag.ed.guiPopupThrowAlert(text, "Update", "myag.ed.openWebXmlEditor()")
		}
	});
	*/

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
