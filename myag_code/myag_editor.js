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

actionData: {

	artwork: { // very redundant, yes. might change some of these later tho!
		htmlClass:       "artwork",
		htmlIdAttribute: "awid",
		xmlTagName:      "artwork",
		xmlIdTagName:    "awid",
		objIdProperty:   "awid",
		objArray:        undefined,
		object:          myag.Artwork,
		filloutShow:     "filloutShowArtwork",
		guiGenerator:    myag.generateArtworkDiv,
		guiWrapperClass: "myag_artworksWrapper"
	},

	group: {
		htmlClass:       "groupButton",
		htmlIdAttribute: "gid",
		xmlTagName:      "group",
		xmlIdTagName:    "gid",
		objIdProperty:   "gid",
		objArray:        undefined,
		object:          myag.Group,
		filloutShow:     "filloutShowGroup",
		guiGenerator:    myag.generateGroupDiv,
		guiWrapperClass: "myag_groupsWrapper"
	}

},

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

//==========================================================================//
//=============================== GUI STUFF ================================//
//==========================================================================//

paramsGenerate(arg) {
	a = arg;
	if (typeof(a) != "boolean")
		a = myag.isAwid(arg);
	return (a? myag.ed.actionData.artwork : myag.ed.actionData.group);
},

filloutFieldsToXmlTag(id) {

	console.log("doing", id);

	params = myag.ed.paramsGenerate(id);
	if (myag.isAwid(id))
	{
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
	} 
	else if (myag.isGid(id))
	{
		fieldData = {
			"name": document.getElementById("inputGroupName").value,
			"about": document.getElementById("inputGroupAbout").value,
			"gid": id
		};
	}
	else return;


	var xmlTag = myag.ed.xmlById(myag.data.xml, id);
	console.log("initial xml", xmlTag);

	for (var fieldName in fieldData)
	{
		if (typeof(fieldData[fieldName]) == "string")
			bmco.xml.childTagWrite(myag.data.xml, xmlTag, fieldName, fieldData[fieldName]);
		else
			xmlTag.appendChild(fieldData[fieldName]);
	}

	return xmlTag;
},

new(type) {
	params = (type=="artwork"? myag.ed.paramsGenerate(true) : myag.ed.paramsGenerate(false));
	myag.ed[params.filloutShow]();
},

add(id, update=false) {
	params = myag.ed.paramsGenerate(id);
	var xmlTag = myag.ed.filloutFieldsToXmlTag(id);
	console.log(xmlTag);
	var newObj = new params.object();
	newObj.fromXmlTag(xmlTag);
	if (update)
	{
		var index = bmco.firstInArrayWithProperty(params.objArray, params.objIdProperty, id, true)
			params.objArray[index] = newObj;
			bmco.gui.filloutHide();
			if (myag.isGid(id))
		bmco.firstElementOfClassByAttribute("groupButton", "gid", id).innerHTML = `<p>${newObj.name}</p>`;
	}
	else
	{
		params.objArray.unshift(newObj);
		bmco.gui.filloutHide();
		target = document.getElementsByClassName(params.guiWrapperClass)[0];
		target.insertBefore(params.guiGenerator(newObj, undefined, newObj.name), target.firstElementChild.nextElementSibling);
		if (myag.isAwid(id))
			target.firstElementChild.nextElementSibling.style.backgroundColor = bmco.randomColor();

	}
},

edit(id) {
	bmco.gui.actionMenuDelete();
	params = myag.ed.paramsGenerate(id);
	obj = bmco.firstInArrayWithProperty(params.objArray, params.objIdProperty, id)
	myag.ed[params.filloutShow](obj);
},

update(id) {
	return myag.ed.add(id, true);
},

pick(id) {
	pickedEntityId = id;
},

place(id) {

},

delete(id) {
	params = myag.ed.paramsGenerate(id); 
	console.log(params.htmlClass, params.htmlIdAttribute, id);
	bmco.firstElementOfClassByAttribute(params.htmlClass, params.htmlIdAttribute, id).remove();
	bmco.xml.nodeGetByChildTagValue(myag.data.xml, params.xmlTagName, params.xmlIdTagName, id).remove();
	params.objArray.splice(bmco.firstInArrayWithProperty(params.objArray, params.objIdProperty, id, true), 1);
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
		"Move":     `myag.ed.move('${id}')`,
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





filloutShowGroup: function(g = null)
{

	var makeNew = false;
	if (g === null)
	{
		g = new myag.Group();
		g.name = "New Group";
		makeNew = true;
	}
	bmco.gui.actionMenuDelete();	
	bmco.inputValueSet("inputGroupName", g.name);
	bmco.inputValueSet("inputGroupAbout", g.about);
	bmco.inputValueSet("inputGroupNameOld", g.name);
	bmco.inputValueSet("inputGid", g.gid);
	
	document.getElementById("filloutGroupTitle").innerHTML = makeNew? "Add a new group" : "Edit group details";

	var buttonDescriptionTuples = [["Cancel", "bmco.gui.filloutHide('filloutGroup')"]];
	makeNew? buttonDescriptionTuples.push(["Add", `myag.ed.add('${g.gid}')`]) : buttonDescriptionTuples.push(["Update", `myag.ed.update('${g.gid}')`]);
	bmco.gui.bottomBarPopulate(buttonDescriptionTuples, "filloutGroupBottomBar");

	bmco.gui.filloutShow("filloutGroup");

},

filloutShowArtwork: function(aw = null)
{
	var makeNew = false;
	if (aw === null)
	{
		aw = new myag.Artwork();
		aw.name = "New Artwork";
		makeNew = true;
	}

	bmco.inputValueSet("inputName", aw.name);
	bmco.inputValueSet("inputAbout", aw.about);
	bmco.inputValueSet("inputFilename", aw.filename);
	bmco.inputValueSet("inputAwid",aw.awid);

	document.getElementById("filloutArtworkTitle").innerHTML = makeNew? "Add a new artwork" : "Edit artwork details";

	// generate checkboxes - probably should generate once and only check them here, but ehhh

	filloutCheckboxesWrapper = document.getElementById("filloutArtworkGroupCheckboxes");
	var groupXmlArray = myag.data.xml.getElementsByTagName('group');
	if (groupXmlArray.length == 0)
		filloutCheckboxesWrapper.style.display = "none";
	else
	{
		filloutCheckboxesWrapper.innerHTML = "<p>In groups:</p>"; // reset the cbox div to just the titletext
		for (var gXml of groupXmlArray) // create checkbox over group xml tag, unchecked if new artwork, else see if artwork is in group
		{
			var chb = myag.ed.guiGroupCheckboxCreate(gXml, (makeNew ? false : bmco.arrayHas(aw.groups, bmco.xml.childTagRead(gXml, "gid"))));
			filloutCheckboxesWrapper.appendChild(chb);
		}
	}
	
	var buttonDescriptionTuples = [["Cancel", "bmco.gui.filloutHide('filloutArtwork')"]];
	makeNew? buttonDescriptionTuples.push(["Add", `myag.ed.add('${aw.awid}')`]) : buttonDescriptionTuples.push(["Update", `myag.ed.update('${aw.awid}')`]);
	bmco.gui.bottomBarPopulate(buttonDescriptionTuples, "filloutArtworkBottomBar");

	bmco.gui.filloutShow("filloutArtwork");
},

/* Creates a checkbox + label thing. Only used in group selection section
in the artwork edit menu.
inputs: g <Group instance> [checkbox represents this group],
		checked <bool> [initial checkbox state]
return: <html element> [div with checkbox input and label p inside]
*/
guiGroupCheckboxCreate: function(groupXmlTag, checked=false)
{
	var gid = bmco.xml.childTagRead(groupXmlTag, "gid");

	var i = document.createElement("input");
	i.setAttribute("name", gid);
	i.setAttribute("type", "checkbox");
	i.id = "checkbox_"+gid;
	i.checked = checked;

	var l = document.createElement("label");
	l.setAttribute("for", gid);
	l.innerHTML = bmco.xml.childTagRead(groupXmlTag, "name");
	
	var d = document.createElement("div");
	d.appendChild(i);
	d.appendChild(l);
	d.classList.add("labelledCheckbox");
	d.setAttribute("onclick", "bmco.gui.filloutCheckboxToggle('checkbox_"+gid+"')");

	return d;
},

/* Takes an artwork div and puts it after some other artwork div instead of its current position.
inputs: movedAwid <string> [valid artwork id used by the artwork div being moved]
		targetAwid <string> [valid artwork id used by the artwork div after which the moved artwork has to be placed]
return: none
*/
guiArtworkDivPutAfter: function(movedAwid, targetAwid)
{
	var moved = bmco.firstElementOfClassByAttribute("artwork", "awid", movedAwid);
	if ((targetAwid == undefined) || (targetAwid == "start"))
		var target = document.getElementById("buttonCreateNewArtwork");
	else
		var target = bmco.firstElementOfClassByAttribute("artwork", "awid", targetAwid);

	target.parentNode.insertBefore(moved, target.nextSibling.nextSibling);
	target = moved;
	moved = bmco.firstElementOfClassByAttribute("locatorWrapperArtwork", "awid", movedAwid);

	target.parentNode.insertBefore(moved, target.nextSibling);
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
		nameFnTuples.push(["Cancel Moving", "myag.ed.stopMoving()"]);
	else
		return;
	bmco.gui.bottomBarPopulate(nameFnTuples, "bottomButtonWrapper");
},

//==========================================================================//
//================== XML FILE AUTO CHECK AND FIX FUNCTIONS =================//
//==========================================================================//

xmlById: function(xmldoc, id)
{
	if (myag.isAwid(id))
	{
		var xml = bmco.xml.nodeGetByChildTagValue(xmldoc, "artwork", "awid", id);
		if (xml != null) return xml;
		return myag.ed.xmlArtworkBlank(id);
	}
	if (myag.isGid(id))
	{
		var xml = bmco.xml.nodeGetByChildTagValue(xmldoc, "group", "gid", id);
		if (xml != null) return xml;
		return myag.ed.xmlGroupBlank(id);
	}
	return null;
},

xmlArtworkBlank: function(id) {
	var tag = myag.data.xml.createElement("artwork");
	tag.appendChild(myag.data.xml.createElement("name"));
	tag.appendChild(myag.data.xml.createElement("filename"));
	tag.appendChild(myag.data.xml.createElement("about"));
	tag.appendChild(myag.data.xml.createElement("ingroups"));
	tag.appendChild(bmco.xml.nodeTextCreate(myag.data.xml, "awid", id));
	tag.appendChild(bmco.xml.nodeTextCreate(myag.data.xml, "thumbnail", undefined));
	return tag;
},

xmlGroupBlank: function(id) {
	var tag = myag.data.xml.createElement("group");
	tag.appendChild(myag.data.xml.createElement("name"));
	tag.appendChild(myag.data.xml.createElement("about"));
	tag.appendChild(bmco.xml.nodeTextCreate(myag.data.xml, "gid", id));
	return tag;
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
			name: "Reverse myag.Groups",
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


/* Force-load all artworks as per the available xml data
inputs: none
return: none
*/
loadAllArtworks: function()
{
	if (myag.ed.loadedArtworks.length == myag.ed.currentlyLoadedArtworks.length)
		return;
	myag.ed.usedPaginationType = "none";
	document.removeEventListener('scroll', myag.pages.loadMore);
	bmco.removeIfExists("paginationMoreTrigger")
	myag.appendArworksRange(myag.ed.loadedArtworks, myag.ed.currentlyLoadedArtworks.length, myag.ed.loadedArtworks.length, false);
},

groupButtonNameRead: function(elem)
{
	return elem.childNodes[0].innerHTML;
},

/* Reverse the order of all existing groups.
inputs: none
return: none
*/
reverseGroups: function()
{
	var target = 'start';
	var xmldoc = myag.data.xml;
	var groupsNum = document.getElementsByClassName('groupButton').length-1;
	for (var x = 0; x < groupsNum; x++)
	{
		var gid = document.getElementsByClassName("groupButton")[groupsNum].getAttribute("groupid");
		myag.ed.guiGroupButtonPutAfter(gid, target);
		myag.ed.xmlGroupPutAfter(xmldoc, gid, target);
		target = gid;
	}
	myag.ed.xmlUpdateLoadedData(xmldoc);
},

/* Reverse the order of all existing artworks.
inputs: none
return: none
*/
reverseArtworks: function()
{
	myag.ed.loadAllArtworks();
	var target = 'start';
	var xmldoc = myag.data.xml;
	var artworksNum = document.getElementsByClassName('artwork').length-1;
	for (var x = 0; x < artworksNum; x++)
	{	
		// it's not artworksNum-1 because the "add new..." button also counts
		var awid = document.getElementsByClassName("artwork")[artworksNum].getAttribute("awid");
		myag.ed.guiArtworkDivPutAfter(awid, target);
		myag.ed.xmlArtworkPutAfter(xmldoc, awid, target);
		target = awid;
	}
	myag.ed.xmlUpdateLoadedData(xmldoc);
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
		if (myag.navigation.mode != "none")
			newArtworkButton.classList.add("invisible");
		document.getElementsByClassName("myag_artworksWrapper")[0].prepend(newArtworkButton);	
		myag.ed.actionData.artwork.objArray = myag.data.artworks;
	});
	
	window.addEventListener("groupsLoaded", (event) => {
		var newGroupButton = myag.generateGroupDiv(new myag.Group("start", "Add new...", ""), "myag.ed.new('group')");
		newGroupButton.id = "buttonCreateNewGroup";
		document.getElementsByClassName("myag_groupsWrapper")[0].prepend(newGroupButton);
		myag.ed.actionData.group.objArray = myag.data.groups;
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
