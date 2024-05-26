//==========================================================================//
//================ MYARTGALLERY MAIN FUNCTIONS/CLASSES =====================//
//==========================================================================//

/*
pre-import requirements:
	bmco.js
	bmco_xml.js
	bmco_infra.js
*/

var myag = {

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

debug: true,
isEditor: bmco.bodyAttributeExists("isEditor"),
isOffline: bmco.bodyAttributeExists("isOffline"),
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

/* EDIT THESE TO CHANGE THE BASIC ENGINE SETTINGS */

settings: {
	neocitiesXmlFileEditLink: undefined,
	neocitiesArtworksFolderLink: undefined,
	fullButton: true, 
	viewerSideInfo: true,
	pagingIndex: "pages",
	pagingGroup: "none",
	artworksPerRow: 4,
	rowsPerPage: 4, 
	nextPageOnWrap: true,
	remoteImageHost: null,
},

//==========================================================================//
//=============================== CLASSES ==================================//
//==========================================================================//


Artwork: class extends bmco.infra.Item {
	constructor() {
		super("aw", "artwork");
		this.filename = null;
		this.thumbnail = null;
		this.ingroups = [];
		this.xmlTag = "artwork",
		this.xmlFieldMappings = {
			"id": "awid",
			"name": "name",
			"about": "about",
			"filename": "filename",
			"thumbnail": "thumbnail",
			"ingroups": "ingroups",
		};
		this.multiTagMappings = {
			"ingroups": "ingroup"
		};
		this.guiFilloutBindings = {
			"id": "inputArtworkId",
			"name": "inputArtworkName",
			"about": "inputArtworkAbout",
			"filename": "inputArtworkFilename",
			"ingroups": "inputArtworkIngroups"
		}
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

Group: class extends bmco.infra.Item {
	constructor() {
		super("g", "group");
		this.xmlTag = "group",
		this.xmlFieldMappings.id = "gid";
		this.guiFilloutBindings = {
			"id": "inputGroupId",
			"name": "inputGroupName",
			"about": "inputGroupAbout",
		}
	}
},

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

setArtworksPerRow(wrapperElem) {
	var artworksPerRow = parseInt(wrapperElem.getAttribute("artworksPerRow"));
	if (isNaN(artworksPerRow))
		artworksPerRow = myag.settings.artworksPerRow;
	wrapperElem.setAttribute("style", `--artworks-per-row: ${artworksPerRow}`);
},

putArtwork(target, aw) {
	var awHtml = target.appendChild(myag.generateArtworkDiv(aw));
	if (myag.isEditor)
		awHtml.appendChild(myag.generateArtworkPlaceMarker(aw));
},

putGroupButton(target, g) {
	var gHtml = target.appendChild(myag.generateGroupDiv(g));
	if (myag.isEditor)
		gHtml.appendChild(myag.generateGroupPlaceMarker(g));
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

/* creates an html element for one group button.
inputs: group <Group object> - group object to make the group button after
return: "div" html group button element 
*/
generateGroupDiv: function(group, action=undefined, forcedText=undefined)
{
	var button = document.createElement('div');
	button.classList.add('groupButton');
	button.setAttribute("gid", group.id);
	var onclick = action;
	if (onclick==undefined)
		myag.isEditor? onclick = `myag.ed.showItemMenu('${group.id}', event)` : onclick = `myag.visitGroup('${group.id}')`;
	button.setAttribute('onclick', onclick);
	var name = document.createElement('p');
	forcedText===undefined? name.innerHTML = group.name : name.innerHTML = forcedText;
	button.appendChild(name);

	return button;
},

/* Creates an appendable locator div based on an Group instance. Is needed
for the XML editor page, unused in the main page itself.
inputs: group <Group object> - group object to make the group locator after
returns: <DOM element>
*/
generateGroupPlaceMarker: function(g)
{
	var marker = document.createElement("div");
	marker.classList.add("marker", "markerGroup", "invisible");
	marker.innerHTML = "<p>Move Here</p>"
	if (!g)
	{
		marker.setAttribute("awid", "start");
		marker.setAttribute("onclick", "myag.ed.place('start')");
	}
	else
	{
		marker.setAttribute("gid", g.id);
		marker.setAttribute("onclick", "myag.ed.place('"+g.id+"')");
	}
	return marker;
},

/* Creates an appendable div based on an Artwork instance
inputs: aw <Artwork> [an Artwork class instance to be visualized]
returns: <DOM element>
*/
generateArtworkDiv: function(aw, action=undefined, overlayText=undefined)
{
	var div = document.createElement("div");
	div.classList.add("artwork");
	div.setAttribute("awid", aw.id);

	var onclick = action;
	if (onclick == undefined)
		myag.isEditor? onclick = "myag.ed.showItemMenu('"+aw.id+"', event)" : onclick = "myag.viewer.showViewer('"+aw.id+"')";
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
	else if (!overlayText)
	{
		div.style.backgroundColor = bmco.randomColor(2, 8, 15, {noGrayscale:true});
		if (myag.isEditor)
			overlayText = aw.name;
	}

	if (overlayText != undefined)
	{
		var para = document.createElement("p");
		para.innerHTML = overlayText;
		div.appendChild(para);
	}
	
	return div;
},

/* Creates an appendable locator div based on an Artwork instance. Is needed
for the XML editor page, unused in the main page itself.
inputs: aw <Artwork> [an Artwork class instance to be visualized]
returns: <DOM element>
*/
generateArtworkPlaceMarker: function(aw=undefined)
{
	var marker = document.createElement("div");
	marker.classList.add("marker", "markerArtwork", "invisible");
	marker.innerHTML = `<p>move here</p>`;
	if (!aw)
	{
		marker.setAttribute("awid", "start");
		marker.setAttribute("onclick", "myag.ed.place('start')");
	}
	else
	{
		marker.setAttribute("awid", aw.id);
		marker.setAttribute("onclick", "myag.ed.place('"+aw.id+"')");
	}
	marker.setAttribute("onmouseover", "event.stopPropagation()");
	return marker;
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

/*
for neocities-only version: opens editor in new tab
*/
webOpenEditor: function()
{
	window.open("./editor.html", target="_blank");
},

/*
index page startup function
inputs: none
outputs: none
*/
startup: function(pagename)
{

	bmco.xml.awaitXmlFromFile(myag.workingFile).then((xmldoc) => {

		myag.data.xml = xmldoc;
		window.dispatchEvent(myag.events.xmlLoaded);

		myag.data.groups = new bmco.infra.ItemList(
			myag.Group,
			{ // xml
				workingDoc: myag.data.xml,
				listTag: myag.data.xml.getElementsByTagName("groups")[0],
				itemTagName: "group",
				idTagName: "gid"
			},
			{ // gui
				htmlClass:       "groupButton",
				htmlMarkerClass: "markerGroup",
				htmlIdAttribute: "gid",
				htmlNewButtonId: "createNewGroup",
				fillout:     "filloutGroup",
				generator:    myag.putGroupButton,
				targetClass: "groupsWrapper",
				filter: null
			}
		);
		if (myag.isEditor)
		{
			var g = new myag.Group();
			g.id = "start";
			g.name = "Add New...";
			myag.data.groups.items.push(g);
		}
		myag.data.groups.startup();
		window.dispatchEvent(myag.events.groupsLoaded);

		myag.data.artworks = new bmco.infra.ItemList(
			myag.Artwork,
			{ // xml
				workingDoc: myag.data.xml,
				listTag: myag.data.xml.getElementsByTagName("artworks")[0],
				itemTagName: "artwork",
				idTagName: "awid"
			},
			{ // gui
				htmlClass:       "artwork",
				htmlMarkerClass: "markerArtwork",
				htmlIdAttribute: "awid",
				htmlNewButtonId: "createNewArtwork",
				fillout:     "filloutArtwork",
				generator:    myag.putArtwork,
				targetClass: "artworksWrapper",
				filter: {
					htmlAttribute: "group",
					objProperty: "ingroups",
					mode: "inArray"
				}
			}
		);
		if (myag.isEditor)
		{
			var aw = new myag.Artwork();
			aw.id = "start";
			aw.name = "Add New...";
			myag.data.artworks.items.push(aw);
		}
		myag.data.artworks.startup();
		window.dispatchEvent(myag.events.artworksLoaded);

		for (var w of document.getElementsByClassName("artworksWrapper"))
		{
			myag.setArtworksPerRow(w);
			myag.pages.addPagination(w);
		}

	});
}

//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

}

addEventListener("DOMContentLoaded", (event) => { myag.startup() });
