//==========================================================================//
//================ MYARTGALLERY MAIN FUNCTIONS/CLASSES =====================//
//==========================================================================//

/*
pre-import requirements:
	bmco.js
	bmco_xml.js
*/

var myag = {

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

debug: true,
isEditor: bmco.bodyAttributeExists("isEditor"),
workingFile: "myag_files/data.xml",
artworksFolder: "myag_artworks/",
data: {
	xml: undefined,
	artworks: undefined,
	groups: undefined
},
navigation: {
	mode: "none",
	page: 0,
	counter: 0,
	pagesTotal: undefined,
},
events: {
	xmlLoaded: new Event("xmlLoaded"),
	groupsLoaded: new Event("groupsLoaded"),
	artworksLoaded: new Event("artworksLoaded"),
},

//==========================================================================//
//=============================== CLASSES ==================================//
//==========================================================================//


Group: class{
	constructor(gid=myag.makeGid(), name=undefined, about=undefined) {
		this.gid = gid;
		this.name = name;
		this.about = about;
	}

	fromXmlTag(tag) {
		this.gid = bmco.xml.childTagRead(tag, "gid");;
		this.name = bmco.xml.childTagRead(tag, "name");;
		this.about = bmco.xml.childTagRead(tag, "about");;

	}

	toXmlTag(xmldoc) {
		var gElement = xmldoc.createElement("artwork");
		gElement.appendChild(bmco.xml.nodeTextCreate(xmldoc, "gid", this.gid));
		gElement.appendChild(bmco.xml.nodeTextCreate(xmldoc, "name", this.name));
		gElement.appendChild(bmco.xml.nodeTextCreate(xmldoc, "about", this.about));
		return gElement;
	}
},

Artwork: class{
	constructor(awid=myag.makeAwid(), name=undefined, filename=undefined, about=undefined, groups=[], thumbnail=undefined) {
		this.awid = awid;
		this.name = name;
		this.filename = filename;
		this.about = about;
		this.groups = groups;
		this.thumbnail = thumbnail;
	}

	fromXmlTag(tag) {
		this.awid = bmco.xml.childTagRead(tag, "awid");
		this.name = bmco.xml.childTagRead(tag, "name");
		this.filename = bmco.xml.childTagRead(tag, "filename");
		this.about = bmco.xml.childTagRead(tag, "about");
		this.thumbnail = bmco.xml.childTagRead(tag, "thumbnail");
		var ingroups = bmco.xml.childTagGetChildren(tag, "ingroups");
		for (var g of ingroups)
			this.groups.push(bmco.xml.nodeTextRead(g));
	}

	toXmlTag(xmldoc) {
		var awElement = xmldoc.createElement("artwork");
		awElement.appendChild(bmco.xml.nodeTextCreate(xmldoc, "awid", this.awid));
		awElement.appendChild(bmco.xml.nodeTextCreate(xmldoc, "name", this.name));
		awElement.appendChild(bmco.xml.nodeTextCreate(xmldoc, "filename", this.filename));
		awElement.appendChild(bmco.xml.nodeTextCreate(xmldoc, "about", this.about));
		awElement.appendChild(bmco.xml.nodeTextCreate(xmldoc, "groups", this.groups));
		return awElement;
	}

	isInGroup(gid) {
		if (!this.groups)
			return false;
		for (var x = 0; x < this.groups.length; x++)
		{
			if (this.groups[x] == gid)
				return true;
		}
		return false;
	}
},


//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/* Literally what it says. Is used in some hover-blocking shenanigans.
*/
doNothing: function()
{
	return;
},




/* Appends a div to target, another one after it if the editor is open.
Is a base function for stuff in panel and index script files.
inputs: elem <html element> [element to add in all cases],
				elemIfEditor <html element> [element to add if page is editor.html],
				target <html element> [target element],
				mode <string = "appendChild", "insertAfter" or "prepend"> [function mode]
return: none
*/
appendToGridMode: function(elem, elemIfEditor, target, mode)
{
	if (mode == "appendChild")
	{
		target.appendChild(elem);
		if (myag.isEditor)
			target.appendChild(elemIfEditor);
	}
	else if (mode == "insertAfter")
	{
		target.parentNode.insertBefore(elem, target.nextSibling);
		if (myag.isEditor)
			target.parentNode.insertBefore(elemIfEditor, target.nextSibling.nextSibling);
	}
	else if (mode == "prepend")
	{
		
		if (myag.isEditor)
			target.prepend(elemIfEditor);
		target.prepend(elem);
	}
},


/*
debug logger function. set myag.debug to true if you want some console garbage.
handy for building stuff.
inputs: arg (anything) - to be displayed
outputs: none
*/
db: function(arg) {
	if (myag.debug)
		console.log(arg);
},

/* makes an id base string
inputs: none
outputs: id string base
*/
makeIdBase: function()
{
	return bmco.timestamp()+"_"+bmco.randString(5);
},

/*
makes an artwork id (awid) string
inputs: none
output: correct awid
*/
makeAwid: function()
{
	return "aw_"+String(Date.now())+"_"+bmco.randString(5);
},

/*
makes a group id string
inputs: none
output: correct gid 
*/
makeGid: function()
{
	return "g_"+String(Date.now())+"_"+bmco.randString(5);
},


/* tells if the provided string is a valid id string base
inputs: arg <string> [string to test]
output: <bool> [if it is a valid id base]
*/
isIdBase: function(arg)
{
	var timestamp = arg.substr(0,13);
	var underscore = arg.substr(13,1);
	var rands = arg.substr(14); 

	if (isNaN(timestamp))
		return false;
	if (underscore != "_")
		return false;
	if (rands.length != 5)
		return false;

	return true;
},

/* tells if the provided string is a valid awid
inputs: awid <string> [string to test]
output: <bool> [if it is a valid artwork id]
*/
isAwid: function(awid)
{
	var header = awid.substr(0,3);
	var base = awid.substr(3);
	if (header != "aw_")
		return false;
	if (!myag.isIdBase(base))
		return false;
	return true;
},

/* tells if the provided string is a valid gid
inputs: gid <string> [string to test]
output: <bool> [if it is a valid group id]
*/
isGid: function(gid)
{
	var header = gid.substr(0,2);
	var base = gid.substr(2);
	if (header != "g_")
		return false;
	if (!myag.isIdBase(base))
		return false;
	return true;
},

/*
fetches Group class instances as by the xml file. very async. :C
inputs: none
outputs: Groups (array of Group instances)
*/
xmlExtractObjects: function(tagName, classPointer)
{
	var xmlObjects = myag.data.xml.getElementsByTagName(tagName);
	var objects = [];
	for (var xmlTag of xmlObjects)  
	{
		var obj = new classPointer();
		obj.fromXmlTag(xmlTag);
		objects.push(obj);
	}
	return objects;
},
xmlExtractGroups: function()
{
	return myag.xmlExtractObjects("group", myag.Group);
},
xmlExtractArtworks: function()
{
	return myag.xmlExtractObjects("artwork", myag.Artwork);
},

/*
My super secret (and (forreal) absolutely harmless) function to check
if the user has gone through my scary javascript! delete if spotted.
inputs: none
output: none
*/
auberysSuperSecretBackdoor: function()
{
	alert("this user didn't go through the page's javascript!");
},



/*
fetches Artwork class instances based on the loaded Artwork instances
inputs: awid (string) - awid field value of artwork class instance
output: (Artwork class instance) the class instance searched for, or null if not found
*/
getArtworkById: function(awid)
{
	for (var aw of myag.data.artworks)
		if (aw.awid == awid) {return aw;}
	return null;
},

/*
fetches group id string by group name. if two groups are named the same, first match is used
inputs: name (string) - group name searched
output: (string) group id, or null if not found
*/
gidByName: function(name)
{
	for (var g of myag.data.groups)
		if (g.name == name) {return g.gid}
	return null;		
},

groupById: function(gid)
{
	for (var g of myag.data.groups)
		if (g.gid == gid) {return g}
	return null;	
},

/*
index page startup function
inputs: none
outputs: none
*/
startup: function(pagename)
{
	bmco.xml.awaitXmlFromFile(myag.workingFile).then((xmldoc) => {
		window.dispatchEvent(myag.events.xmlLoaded);
		myag.data.xml = xmldoc;
		myag.data.artworks = myag.xmlExtractArtworks();
		window.dispatchEvent(myag.events.artworksLoaded);
		myag.data.groups = myag.xmlExtractGroups();
		myag.navigation.pagesTotal = Math.ceil(myag.data.artworks.length / myag.settings.artworksPerPage);
		window.dispatchEvent(myag.events.groupsLoaded);
		myag.displayGroups();
		myag.displayArtworks();

	});
},

displayGroups: function(artworksWrapperClass="myag_groupsWrapper") {
	var groupsWrappers = document.getElementsByClassName(artworksWrapperClass);
	if (groupsWrappers.length == 0)
		return;
	myag.appendGroupButtons(groupsWrappers[0]);
},

displayArtworks: function(artworksWrapperClass="myag_artworksWrapper") {

	var artworksWrappers = document.getElementsByClassName(artworksWrapperClass);
	if (artworksWrappers.length == 0)
		return;
	for (var wrapper of artworksWrappers)
	{
		myag.appendArtworks(wrapper);
		myag.pages.addPagination(wrapper);
		myag.wrapperSerArtworksPerRow(wrapper);
		
	}
},

wrapperSerArtworksPerRow(wrapperElem) {
	var artworksPerRow = parseInt(wrapperElem.getAttribute("artworksPerRow"));
	if (isNaN(artworksPerRow))
		artworksPerRow = myag.settings.artworksPerRow;
	wrapperElem.setAttribute("style", `--artworks-per-row: ${artworksPerRow}`);
},

/*
Looks up what groups exist and adds them as buttons
inputs:  targetElem element to add buttons to
outputs: none
*/
appendGroupButtons: function(targetElem)
{
	for (var group of myag.data.groups)
	{
		targetElem.appendChild(myag.generateGroupDiv(group));
		if (myag.isEditor)
			targetElem.appendChild(myag.generateGroupLocatorDiv(group));
	}	
},


appendArtworks: function(targetElem)
{
	var groupFilterId = "any";
	if (bmco.elementAttributeExists(targetElem, "group"))
	{
		groupFilterId = targetElem.getAttribute("group");
		if (!myag.isGid(groupFilterId))
			groupFilterId = myag.gidByName(groupFilterId);
	}	

	for (var aw of myag.data.artworks)
	{
		if (groupFilterId == "any" || aw.isInGroup(groupFilterId))
			targetElem.appendChild(myag.generateArtworkDiv(aw))
	}
},

/* Creates an appendable locator div based on an Group instance. Is needed
for the XML editor page, unused in the main page itself.
inputs: group <Group object> - group object to make the group locator after
returns: <DOM element>
*/
generateGroupLocatorDiv: function(group)
{
	var locatorWrapper = document.createElement("div");
	locatorWrapper.classList.add("locatorWrapper", "locatorWrapperGroup");
	locatorWrapper.setAttribute("gid", group.gid);

	var locator = document.createElement("div");
	locator.classList.add("locator");
	locator.setAttribute("title", "Move group here")
	if (group.name == "Add new...")
		locator.setAttribute("onclick", "myag.ed.putGroupAfter('start')");
	else
		locator.setAttribute("onclick", "myag.ed.putGroupAfter('"+group.gid+"')");

	locatorWrapper.appendChild(locator);

	return locatorWrapper;
},

/* creates an html element for one group button.
inputs: group <Group object> - group object to make the group button after
return: "div" html group button element 
*/
generateGroupDiv: function(group, action=undefined, forcedText=undefined)
{
	var button = document.createElement('div');
	button.classList.add('groupButton');
	button.setAttribute("gid", group.gid);
	var onclick = action;
	if (onclick==undefined)
		myag.isEditor? onclick = `myag.ed.showItemMenu('${group.gid}', event)` : onclick = `myag.visitGroup('${group.gid}')`;
	button.setAttribute('onclick', onclick);
	var name = document.createElement('p');
	forcedText===undefined? name.innerHTML = group.name : name.innerHTML = forcedText;
	button.appendChild(name);

	return button;
},

/* Creates an appendable div based on an Artwork instance
inputs: aw <Artwork> [an Artwork class instance to be visualized]
returns: <DOM element>
*/
generateArtworkDiv: function(aw, action=undefined, overlayText=undefined)
{
	var div = document.createElement("div");
	div.classList.add("artwork");
	div.setAttribute("awid", aw.awid);

	var onclick = action;
	if (onclick == undefined)
		myag.isEditor? onclick = "myag.ed.showItemMenu('"+aw.awid+"', event)" : onclick = "myag.viewer.showViewer('"+aw.awid+"')";
	div.setAttribute("onclick", onclick);
	
	var displayFile = aw.thumbnail;
	if (displayFile == undefined)
		displayFile = aw.filename;
	if (displayFile != undefined && displayFile != "")
	{
		var img = document.createElement("img");
		if (myag.settings.remoteImageHost == null)
			img.setAttribute("src", myag.artworksFolder+displayFile);
		else
			img.setAttribute("src", myag.settings.remoteImageHost +"/"+ myag.artworksFolder+displayFile);
		img.classList.add("artworkImg");
		//img.setAttribute("onclick", onclick);
		div.appendChild(img);
	}

	if (overlayText != undefined)
	{
		var para = document.createElement("p");
		para.innerHTML = overlayText;
		div.appendChild(para);
	}
	
	return div;
},


/*
group button press handler
inputs: gid (string) - group id of the group to be viewed
outputs: none
*/
visitGroup: function(gid)
{
	window.location = "./group.html?g="+encodeURI(gid);
},




/* Creates an appendable locator div based on an Artwork instance. Is needed
for the XML editor page, unused in the main page itself.
inputs: aw <Artwork> [an Artwork class instance to be visualized]
returns: <DOM element>
*/
generateArtworkLocatorDiv: function(aw=undefined)
{
	var locatorWrapper = document.createElement("div");
	locatorWrapper.classList.add("locatorWrapper", "locatorWrapperArtwork");
	locatorWrapper.setAttribute("awid", aw.awid);
	var locator = document.createElement("div");
	locator.classList.add("locator");
	locator.setAttribute("title", "Insert artwork here")
	if (aw.awid==undefined)
		locator.setAttribute("onclick", "myag.ed.putArtworkAfter('start')");
	else
		locator.setAttribute("onclick", "myag.ed.putArtworkAfter('"+aw.awid+"')");

	locatorWrapper.appendChild(locator);

	return locatorWrapper;
},


/*
for neocities-only version: opens editor in new tab
*/
webOpenEditor: function()
{
	window.open("./editor.html", target="_blank");
}

//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

}

addEventListener("DOMContentLoaded", (event) => { myag.startup() });
