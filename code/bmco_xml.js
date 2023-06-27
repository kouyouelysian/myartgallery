//==========================================================================//
//============== BRIGHT MOON CO. XML SPECIFIC FUNCTIONS ====================//
//==========================================================================//

/*
pre-import requirements:
	bmco_general.js
*/

//==========================================================================//
//=============================== CLASSES ==================================//
//==========================================================================//


class bmco_TagValuePair {
  constructor(tag, value) {
    this.tag = tag;
    this.value = value;
  }

  toXmlElement(xmldoc) {
  	var e = xmldoc.createElement(this.tag);
  	if (typeof(this.value) == "string")
  	{
  		bmco_xml_nodeTextWrite(xmldoc, e, this.value);
  		return e;
  	}
  	try
  	{
  		for (var c = 0; c < this.value.length; c++)
  			e.appendChild(this.value[c]);
  		return e;
  	}
  	catch
  	{
  		return null;
  	}
  }

}

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/* the data is held in text format in a JS variable called GLOBAL_loadedData.
to manipulate it, one must use this function to load it to an xml document object.
don't forget to save it after altering using myag_ed_xmlUpdateLoadedData.
inputs: none
return: <xml document object>
 */
function bmco_xml_xmldoc(text)
{
	var parser = new DOMParser();
	var xmldoc = parser.parseFromString(text, "text/xml");
	return xmldoc;
}

/* Creates an xml node with some text inside of it.
inputs: xmldoc <xml document object> [operational xml object],
		elem <string> [element tag name],
		text <string> [text to be put into its insides' text node]
return: <xml element> [tag with some text in its insides]
*/
function bmco_xml_nodeTextCreate(xmldoc, elem, text="")
{
	var e = xmldoc.createElement(elem);
	e.appendChild(xmldoc.createTextNode(text));
	return e;
}

/* Writes to an xml node's insides' text
inputs: xmldoc <xml document object> [operational xml object],
		node <xml element> [node belonging to xmldoc to write to],
		text <string> [text to write]
return: none
*/
function bmco_xml_nodeTextWrite(xmldoc, node, text)
{
	if (node.firstChild == undefined)
	{
		node.appendChild(xmldoc.createTextNode(bmco_HTMLEntitiesEncode(text)));
		return;
	}
	node.firstChild.nodeValue = bmco_HTMLEntitiesEncode(text);
}

/* reads from an xml node's insides' text
inputs: node <xml element> [node to read from]
return: <string> [node insides' text value or "" if no insides with text]
*/
function bmco_xml_nodeTextRead(node, emptyStringOnFail=true)
{
	if (node.childNodes[0] == undefined)
	{
		if (emptyStringOnFail)
			return "";
		else
			return null;
	}
	var text = node.childNodes[0].nodeValue;
	return bmco_HTMLEntitiesDecode(text);
}

/* tries to find the first child tag of a particular name in a parent
node, reports the result. is used to check for fields of artwork, group, etc.
inputs: node <xml element> [node to search children of],
		tag <string> [name of the tag to search for]
return: <bool> [tag exists or not]
 */
 function bmco_xml_childTagExists(node, tag)
 {
 	childrenOfTagName = node.getElementsByTagName(tag);
 	if (childrenOfTagName.length == 0)
 		return false;
 	return true;
 }

 /* tries to get children of the first child tag of a particular name in a parent
node, reports the result. is used to check for fields of artwork, group, etc.
inputs: node <xml element> [node to search children of],
		tag <string> [name of the tag to search for]
return: <array of xml elements> or null if tag not found
 */
 function bmco_xml_childTagGetChildren(node, tag)
 {
 	childrenOfTagName = node.getElementsByTagName(tag);
 	if (childrenOfTagName.length == 0)
 		return null;
 	return childrenOfTagName[0].childNodes;
 }

 /* tries to get children of the first child tag of a particular name in a parent
node, reports the result. is used to check for fields of artwork, group, etc.
inputs: node <xml element> [node to search children of],
		tag <string> [name of the tag to search for]
return: <array of xml elements> or null if tag not found
 */
 function bmco_xml_childTagGetChildrenValues(node, tag)
 {
 	childrenOfTagName = node.getElementsByTagName(tag);
 	if (childrenOfTagName.length == 0)
 		return null;
 	var children = childrenOfTagName[0].childNodes;
 	var values = [];
 	for (var x = 0; x < children.length; x++)
 		values.push(bmco_xml_nodeTextRead(children[x]));
 	return values;
 }


/* tries to find and read the first child tag of a particular name in a parent
node. null on fail. is used to access fields of artwork, group, etc.
inputs: node <xml element> [node to search children of],
		tag <string> [name of the tag to search for]
return: <string> [tag's text contents] or null [if no tag]
 */
 function bmco_xml_childTagRead(node, tag)
 {
 	childrenOfTagName = node.getElementsByTagName(tag);
 	if (childrenOfTagName.length == 0)
 		return null;
 	return bmco_xml_nodeTextRead(childrenOfTagName[0]);
 }

 /* tries to find and read the first child tag of a particular name in a parent
node. null on fail. is used to access fields of artwork, group, etc.
inputs: xmldoc <xml document> [operated xml document object],
		node <xml element> [node to search children of],
		tag <string> [name of the tag to search for],
		text <string> [text to be written into specified node child tag insides]
return: none
 */
 function bmco_xml_ChildTagWrite(xmldoc, node, tag, text)
 {
 	childrenOfTagName = node.getElementsByTagName(tag);
 	if (childrenOfTagName.length == 0)
 		return null;
 	target = childrenOfTagName[0];
 	bmco_xml_nodeTextWrite(xmldoc, target, text);
 }

/* Fetches an <artwork> node with a required awid from xmldoc
inputs: xmldoc <xml document object> [operational xml object],
		awid <string> [target valid artwork id]
return: <xml element> or null if not found
*/
function bmco_xml_nodeGetByChildTagValue(xmldoc, nodeTag, childTag, value)
{
	var tags = xmldoc.getElementsByTagName(nodeTag);
	for (var t = 0; t < tags.length; t++)
	{
		if (bmco_xml_childTagRead(tags[t], childTag) == value)
			return tags[t];
	}
	return null;
}

function bmco_xml_nodeConstruct(xmldoc, nodeTag, childTagValuePairs)
{
	var node = xmldoc.createElement(nodeTag);
	for (var x = 0; x < childTagValuePairs.length; x++)
		node.appendChild(childTagValuePairs[x].toXmlElement(xmldoc));
	return node;
}


function myag_ed_nodeDelete(xmldoc, nodeTag, childTag, value)
{
	var target = bmco_xml_nodeGetByChildTagValue(xmldoc, nodeTag, childTag, value);
	target.parentNode.removeChild(target);
}


/* Picks a group of some name and puts it after another group in xmldoc (used for reordering)
inputs: xmldoc <xml document object> [operational xml object],
		movedGname <string> [moved group's name]
		targetGname <string> [name of the group to put after]
return: none
*/
function bmco_xml_nodePutAfter(xmldoc, nodeTag, childTag, movedValue, targetValue)
{
	if (targetValue == "start")
		bmco_xml_nodePutAtStart(xmldoc, nodeTag, childTag, movedValue);
	else
	{
		var moved = bmco_xml_nodeGetByChildTagValue(xmldoc, nodeTag, childTag, movedValue);
		var target = bmco_xml_nodeGetByChildTagValue(xmldoc, nodeTag, childTag, targetValue);
		moved.parentNode.insertBefore(moved, target.nextSibling);
	}	
}


function bmco_xml_nodePutAtStart(xmldoc, nodeTag, childTag, movedValue)
{
	var moved = bmco_xml_nodeGetByChildTagValue(xmldoc, nodeTag, childTag, movedValue);
	moved.parentNode.prepend(moved);
}






