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

/* This class is used to store a tag and its value for quicker loop-processing
params: tag <string> tag name
		value <string> or <array of xml elements> tag value
*/
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

/* Creates an XML document out of some valid text
inputs: text <string> [text of a valid xml document]
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

 /* tries to find and write to the first child tag of a particular name in a parent
node. null on fail. is used to alter fields of artwork, group, etc.
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

/* Fetches the first found instance of a tag in an xml document which has
a child tag with some particular inner text value. Null on fail.
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the target parent tag]
		childTag <string> [name of the child tag whose value is being searched for],
		value <string> [value of childTag to match for]
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

/* Constructs an XML node with child nodes filled with some values
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the returned tag],
		childTagValuePairs <array of bmco_TagValuePair instances> [descriptions of 
			child nodes to be appended]
return: <xml element> nodeTag node with specified child nodes appended
*/
function bmco_xml_nodeConstruct(xmldoc, nodeTag, childTagValuePairs)
{
	var node = xmldoc.createElement(nodeTag);
	for (var x = 0; x < childTagValuePairs.length; x++)
		node.appendChild(childTagValuePairs[x].toXmlElement(xmldoc));
	return node;
}

/* Delete the first found instance of a tag in an xml document which has
a child tag with some particular inner text value.
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the target parent tag]
		childTag <string> [name of the child tag whose value is being searched for],
		value <string> [value of childTag to match for]
return: none
*/
function myag_ed_nodeDelete(xmldoc, nodeTag, childTag, value)
{
	var target = bmco_xml_nodeGetByChildTagValue(xmldoc, nodeTag, childTag, value);
	target.parentNode.removeChild(target);
}

/* Used for reordering tags of the same name inside a parent tag. Moves one tag of some name
after another of the same name, locating by their child tags' values.
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the target parent tag]
		childTag <string> [name of the child tags whose value are being considered],
		movedValue <string> [value of childTag belonging to the moved nodeTag],
		targetValue <string> [value of childTag belonging to the nodeTag we're putting the other one after]
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

/* Used for reordering tags of the same name inside a parent tag. Moves a tag of some name
to the beginning of its parent tag (before all its other children).
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the target parent tag]
		childTag <string> [name of the child tags whose value are being considered],
		movedValue <string> [value of childTag belonging to the moved nodeTag]
return: none
*/
function bmco_xml_nodePutAtStart(xmldoc, nodeTag, childTag, movedValue)
{
	var moved = bmco_xml_nodeGetByChildTagValue(xmldoc, nodeTag, childTag, movedValue);
	moved.parentNode.prepend(moved);
}
