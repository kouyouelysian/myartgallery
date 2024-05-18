//==========================================================================//
//================ SPECIFIC STUFF FOR GROUPVIEW PAGE =======================//
//==========================================================================//

/*
pre-import requirements:
	bmco.js
*/

myag.group = {

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

setupWrapperAttribute: function() {
	var wrapper = document.getElementsByClassName("myag_artworksWrapper")[0];
	var group = bmco.getParamRead("g");
	if (!group)
		return bmco.urlOpen("./index.html", false);
	wrapper.setAttribute("group", group);
	return group;
},

setupPageElements: function() {
	var gObj = myag.groupById(bmco.getParamRead("g"));
	document.getElementById("groupAbout").innerHTML = gObj.about;
	document.getElementById("groupName").innerHTML = gObj.name;
}

//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

}

myag.group.setupWrapperAttribute();
window.addEventListener("groupsLoaded", (event) => { myag.group.setupPageElements() });
myag.navigation.mode = myag.settings.pagingGroup;