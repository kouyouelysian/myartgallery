//==========================================================================//
//============== BRIGHT MOON CO. XML SPECIFIC FUNCTIONS ====================//
//==========================================================================//

/*
pre-import requirements:
	bmco.js

available classes:
	bmco.xml.TagValuePair

available functions:
	bmco.xml.xmldocFromString(text)
	bmco.xml.xmldocToString(xmldoc) 
	bmco.xml.xmldocTextToClipboard(xmldoc, gui=true)
	bmco.xml.awaitXmlFromFile(fname)
	bmco.xml.nodeTextCreate(xmldoc, elem, text="")
	bmco.xml.nodeTextWrite(xmldoc, node, text)
	bmco.xml.nodeTextRead(node, emptyStringOnFail=true)
	bmco.xml.nodeTextCheck(node)
	bmco.xml.childTagExists(node, tag)
	bmco.xml.childTagGetChildren(node, tag)
	bmco.xml.childTagGetChildrenValues(node, tag)
	bmco.xml.childTagRead(node, tag)
	bmco.xml.childTagWrite(xmldoc, node, tag, text)
	bmco.xml.nodeGetFirstOfTag(xmldoc, nodeTag)
	bmco.xml.nodeGetByChildTagValue(xmldoc, nodeTag, childTag, value)
	bmco.xml.nodeAndChildrenWithTextConstruct(xmldoc, nodeTag, childTagValuePairs)
	bmco.xml.nodeDeleteByChildTagText(xmldoc, nodeTag, childTag, value)
	bmco.xml.nodePutTo(xmldoc, nodeTag, childTag, movedValue, targetValue, position)
	bmco.xml.nodePutBefore(xmldoc, nodeTag, childTag, movedValue, targetValue)
	bmco.xml.nodePutAfter(xmldoc, nodeTag, childTag, movedValue, targetValue)
	bmco.xml.nodePutAtStart(xmldoc, nodeTag, childTag, movedValue)
*/

bmco.xml = {

//==========================================================================//
//=============================== CLASSES ==================================//
//==========================================================================//

/*  This class is used to store a tag and its value for quicker loop-processing
params: tag <string> tag name
		value <string> or <array of xml elements> tag value
*/
TagValuePair: class {
	constructor(tag, value) {
		this.tag = tag;
		this.value = value;
	}

	toXmlElement(xmldoc) {
	var e = xmldoc.createElement(this.tag);
	if (typeof(this.value) == "string")
	{
		bmco.xml.nodeTextWrite(xmldoc, e, this.value);
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
},

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/*  Creates an XML document out of some valid text
inputs: text <string> [text of a valid xml document]
return: <xml document object>
*/
xmldocFromString: function(text)
{
	var parser = new DOMParser();
	var xmldoc = parser.parseFromString(text, "text/xml");
	return xmldoc;
},

/*  returns the contents of an xml document object as a string
inputs: xmldoc <xml document object> [source xml]
return: string;
*/
xmldocToString: function(xmldoc)
{
	return new XMLSerializer().serializeToString(xmldoc.documentElement);
},

/*  Puts the current XML text to user's text clipboard.
inputs: none
outputs: <bool> [success or not]
*/
xmldocTextToClipboard: function(xmldoc, gui=true)
{
	var xml = bmco.xml.xmldocToString(xmldoc);

	navigator.clipboard.writeText(xml).then(() => {
		return true;
	})
	.catch(err => {
		return false;
	});
},

/*  Reads XML data from a file, returns a ready-to-use xmldoc object
inputs: fname <string> [relative path to a file somewhere on the same server]
return: <xml document>
*/

awaitXmlFromFile: async function(fname) {
	try
	{
		let xmlText = await bmco.httpRequest(fname);
		xmlText = xmlText.replace(/>\s*/g, '>');  // Replace "> " with ">"
		xmlText = xmlText.replace(/\s*</g, '<');  // Replace "< " with "<"
		return bmco.xml.xmldocFromString(bmco.replaceAllInString(xmlText, /[\n\r\t]/g));
	} 
	catch (err)
	{
		console.log(err)
	}
},

/*  Creates an xml node with some text inside of it.
inputs: xmldoc <xml document object> [operational xml object],
		elem <string> [element tag name],
		text <string> [text to be put into its insides' text node]
return: <xml element> [tag with some text in its insides]
*/
nodeTextCreate: function(xmldoc, elem, text="")
{
	var e = xmldoc.createElement(elem);
	e.appendChild(xmldoc.createTextNode(text));
	return e;
},

/*  Writes to an xml node's insides' text
inputs: xmldoc <xml document object> [operational xml object],
		node <xml element> [node belonging to xmldoc to write to],
		text <string> [text to write]
return: none
*/
nodeTextWrite: function(xmldoc, node, text)
{
	if (node.firstChild == undefined)
	{
		node.appendChild(xmldoc.createTextNode(bmco.HTMLEntitiesEncode(text)));
		return;
	}
	node.firstChild.nodeValue = bmco.HTMLEntitiesEncode(text);
},

/*  reads from an xml node's insides' text
inputs: node <xml element> [node to read from]
return: <string> [node insides' text value or "" if no insides with text]
*/
nodeTextRead: function(node, emptyStringOnFail=true)
{
	if (node.childNodes[0] == undefined)
	{
		if (emptyStringOnFail)
			return "";
		else
			return null;
	}
	var text = node.childNodes[0].nodeValue;
	return bmco.HTMLEntitiesDecode(text);
},

/*  checks if an xml node has text in it
inputs: node <xml element> [node to read from]
return: <bool> [has text or not]
*/
nodeTextCheck: function(node)
{
	if (node.childElementCount != 0)
		return false;
	if (node.childNodes.length != 1)
		return false;
	if (node.childNodes[0] == undefined)
		return false;
	return true;
},

/*  tries to find the first child tag of a particular name in a parent
node, reports the result. is used to check for fields of artwork, group, etc.
inputs: node <xml element> [node to search children of],
		tag <string> [name of the tag to search for]
return: <bool> [tag exists or not]
*/
childTagExists: function(node, tag)
{
	childrenOfTagName = node.getElementsByTagName(tag);
	if (childrenOfTagName.length == 0)
		return false;
	return true;
},

/*  tries to get children of the first child tag of a particular name in a parent
node, reports the result. is used to check for fields of artwork, group, etc.
inputs: node <xml element> [node to search children of],
		tag <string> [name of the tag to search for]
return: <array of xml elements> or null if tag not found
*/
childTagGetChildren: function(node, tag)
{
	childrenOfTagName = node.getElementsByTagName(tag);
	if (childrenOfTagName.length == 0)
		return null;
	return childrenOfTagName[0].childNodes;
},

/*  tries to get children of the first child tag of a particular name in a parent
node, reports the result. is used to check for fields of artwork, group, etc.
inputs: node <xml element> [node to search children of],
		tag <string> [name of the tag to search for]
return: <array of xml elements> or null if tag not found
*/
childTagGetChildrenValues: function(node, tag)
{
	childrenOfTagName = node.getElementsByTagName(tag);
	if (childrenOfTagName.length == 0)
		return null;
	var children = childrenOfTagName[0].childNodes;
	var values = [];
	for (var x = 0; x < children.length; x++)
		values.push(bmco.xml.nodeTextRead(children[x]));
	return values;
},


/*  tries to find and read the first child tag of a particular name in a parent
node. null on fail. is used to access fields of artwork, group, etc.
inputs: node <xml element> [node to search children of],
		tag <string> [name of the tag to search for]
return: <string> [tag's text contents] or null [if no tag]
*/
childTagRead: function(node, tag)
{
	childrenOfTagName = node.getElementsByTagName(tag);
	if (childrenOfTagName.length == 0)
		return null;
	return bmco.xml.nodeTextRead(childrenOfTagName[0]);
},

/*  tries to find and write to the first child tag of a particular name in a parent
node. null on fail. is used to alter fields of artwork, group, etc.
inputs: xmldoc <xml document> [operated xml document object],
		node <xml element> [node to search children of],
		tag <string> [name of the tag to search for],
		text <string> [text to be written into specified node child tag insides]
return: none
*/
childTagWrite: function(xmldoc, node, tag, text)
{
	childrenOfTagName = node.getElementsByTagName(tag);
	if (childrenOfTagName.length == 0)
		return null;
	target = childrenOfTagName[0];
	bmco.xml.nodeTextWrite(xmldoc, target, text);
},

/*  Fetches the first found instance of a given tag in an xml document
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the target parent tag]
return: <xml element> or null if not found
*/
nodeGetFirstOfTag: function(xmldoc, nodeTag)
{
	var tags = xmldoc.getElementsByTagName(nodeTag);
	if (!tags)
		return null;
	return tags[0];
},

/*  Fetches the first found instance of a tag in an xml document which has
a child tag with some particular inner text value. Null on fail.
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the target parent tag]
		childTag <string> [name of the child tag whose value is being searched for],
		value <string> [value of childTag to match for]
return: <xml element> or null if not found
*/
nodeGetByChildTagValue: function(xmldoc, nodeTag, childTag, value)
{
	var tags = xmldoc.getElementsByTagName(nodeTag);
	for (var t = 0; t < tags.length; t++)
	{
		if (bmco.xml.childTagRead(tags[t], childTag) == value)
			return tags[t];
	}
	return null;
},

/*  Constructs an XML node with child nodes filled with some values
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the returned tag],
		childTagValuePairs <array of bmco.xml.TagValuePair instances> [descriptions of 
			child nodes to be appended]
return: <xml element> nodeTag node with specified child nodes appended
*/
nodeAndChildrenWithTextConstruct: function(xmldoc, nodeTag, childTagValuePairs)
{
	var node = xmldoc.createElement(nodeTag);
	for (var x = 0; x < childTagValuePairs.length; x++)
		node.appendChild(childTagValuePairs[x].toXmlElement(xmldoc));
	return node;
},

/*  Delete the first found instance of a tag in an xml document which has
a child tag with some particular inner text value.
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the target parent tag]
		childTag <string> [name of the child tag whose value is being searched for],
		value <string> [value of childTag to match for]
return: none
*/
nodeDeleteByChildTagText: function(xmldoc, nodeTag, childTag, value)
{
	var target = bmco.xml.nodeGetByChildTagValue(xmldoc, nodeTag, childTag, value);
	target.parentNode.removeChild(target);
},

/*  Used for reordering tags of the same name inside a parent tag. Moves one tag of some name
before or after another of the same name, locating by their child tags' values.
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the target parent tag]
		childTag <string> [name of the child tags whose value are being considered],
		movedValue <string> [value of childTag belonging to the moved nodeTag],
		targetValue <string> [value of childTag belonging to the nodeTag we're putting the other one after],
		position <string "before" or "after"> [desired position relative to target tag]
return: none
*/
nodePutTo: function(xmldoc, nodeTag, childTag, movedValue, targetValue, position)
{
	if (targetValue == "start")
		bmco.xml.nodePutAtStart(xmldoc, nodeTag, childTag, movedValue);
	else
	{
		var moved = bmco.xml.nodeGetByChildTagValue(xmldoc, nodeTag, childTag, movedValue);
		var target = bmco.xml.nodeGetByChildTagValue(xmldoc, nodeTag, childTag, targetValue);
		if (position == "after")
			moved.parentNode.insertBefore(moved, target.nextSibling);
		else if (position == "before")
			moved.parentNode.insertBefore(moved, target);
	}	
},

/*  "after" bmco.xml.nodePutTo wrapper
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the target parent tag]
		childTag <string> [name of the child tags whose value are being considered],
		movedValue <string> [value of childTag belonging to the moved nodeTag],
		targetValue <string> [value of childTag belonging to the nodeTag we're putting the other one after]
return: none
*/
nodePutAfter: function(xmldoc, nodeTag, childTag, movedValue, targetValue)
{
	bmco.xml.nodePutTo(xmldoc, nodeTag, childTag, movedValue, targetValue, "after");
},

/*  "before" bmco.xml.nodePutTo wrapper
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the target parent tag]
		childTag <string> [name of the child tags whose value are being considered],
		movedValue <string> [value of childTag belonging to the moved nodeTag],
		targetValue <string> [value of childTag belonging to the nodeTag we're putting the other one after]
return: none
*/
nodePutBefore: function(xmldoc, nodeTag, childTag, movedValue, targetValue)
{
	bmco.xml.nodePutTo(xmldoc, nodeTag, childTag, movedValue, targetValue, "before");
},

/*  Used for reordering tags of the same name inside a parent tag. Moves a tag of some name
	to the beginning of its parent tag (before all its other children).
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the target parent tag]
		childTag <string> [name of the child tags whose value are being considered],
		movedValue <string> [value of childTag belonging to the moved nodeTag]
return: none
*/
nodePutAtStart: function(xmldoc, nodeTag, childTag, movedValue)
{
	var moved = bmco.xml.nodeGetByChildTagValue(xmldoc, nodeTag, childTag, movedValue);
	moved.parentNode.prepend(moved);
},

/*  Used for reordering tags of the same name inside a parent tag. Moves a tag of some name
	to the end of its parent tag (after all its other children).
inputs: xmldoc <xml document object> [operational xml object],
		nodeTag <string> [name of the target parent tag]
		childTag <string> [name of the child tags whose value are being considered],
		movedValue <string> [value of childTag belonging to the moved nodeTag]
return: none
*/
nodePutAtEnd: function(xmldoc, nodeTag, childTag, movedValue)
{
	var moved = bmco.xml.nodeGetByChildTagValue(xmldoc, nodeTag, childTag, movedValue);
	moved.parentNode.append(moved);
},

//==========================================================================//
//================================ PLUG-INS ================================//
//==========================================================================//

/*
* THIS IS A MODIFIED VERSION OF THE ORIGINAL CODE, STRIPPED DOWN TO ONLY THE STUFF I NEEDED! -Aubery
* vkBeautify - javascript plugin to pretty-print or minify text in XML, JSON, CSS and SQL formats.
* Copyright (c) 2012 Vadim Kiryukhin
* vkiryukhin @ gmail.com
* http://www.eslinstructor.net/vkbeautify/
* Dual licensed under the MIT and GPL licenses:
*/

createShiftArr: function(step) {
	var space = '    ';
	if ( isNaN(parseInt(step)) )  // argument is string
		space = step;
	else 
	{ // argument is integer
		space = '';
		for (var x = 0; x < step; x++)
			space += ' ';
	}
	var shift = ['\n']; // array of shifts
	for (ix = 0; ix < 100; ix++)
		shift.push(shift[ix]+space); 
	return shift;
},

beautify: function(text, step="\t") {

	var ar = text.replace(/>\s{0,}</g,"><")
				 .replace(/</g,"~::~<")
				 .replace(/\s*xmlns\:/g,"~::~xmlns:")
				 .replace(/\s*xmlns\=/g,"~::~xmlns=")
				 .split('~::~'),
		len = ar.length,
		inComment = false,
		deep = 0,
		str = '',
		ix = 0,
		shift = bmco.xml.createShiftArr(step)
		for(ix=0;ix<len;ix++) {
			if(ar[ix].search(/<!/) > -1) { // start comment or <![CDATA[...]]> or <!DOCTYPE //
				str += shift[deep]+ar[ix];
				inComment = true; 
				// end comment  or <![CDATA[...]]> //
				if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1 ) { 
					inComment = false; 
				}
			} 
			else if(ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) { 
				str += ar[ix]; // end comment  or <![CDATA[...]]> //
				inComment = false; 
			} 
			else if( /^<\w/.exec(ar[ix-1]) && /^<\/\w/.exec(ar[ix]) && // <elm></elm> //
				/^<[\w:\-\.\,]+/.exec(ar[ix-1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/','')) { 
				str += ar[ix];
				if(!inComment) deep--;
			}
			else if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1 )
				str = !inComment ? str += shift[deep++]+ar[ix] : str += ar[ix];  // <elm> //
			else if(ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) // <elm>...</elm> //
				str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
			else if(ar[ix].search(/<\//) > -1) // </elm> //
				str = !inComment ? str += shift[--deep]+ar[ix] : str += ar[ix];
			else if(ar[ix].search(/\/>/) > -1 ) // <elm/> //
				str = !inComment ? str += shift[deep]+ar[ix] : str += ar[ix];
			else if(ar[ix].search(/<\?/) > -1) // <? xml ... ?> //
				str += shift[deep]+ar[ix];
			else if( ar[ix].search(/xmlns\:/) > -1  || ar[ix].search(/xmlns\=/) > -1)
					str += shift[deep]+ar[ix]; // xmlns //
			else
				str += ar[ix];
		}
	return  (str[0] == '\n') ? str.slice(1) : str;
},

minify: function(text, preserveComments) {
	var str = preserveComments ? text
							   : text.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g,"")
									 .replace(/[ \r\n\t]{1,}xmlns/g, ' xmlns');
	return  str.replace(/>\s{0,}</g,"><"); 
}

//==========================================================================//
//=============================== LIBRARY END ==============================//
//==========================================================================//

};
