//==========================================================================//
//================ BRIGHT MOON CO. GENERAL FUNCTION KIT ====================//
//==========================================================================//

/*
pre-import requirements:
	none

available functions:
	bmco.httpRequest(fname)
	bmco.replaceAllInString(arg, target, replace)
	bmco.HTMLEntitiesEncode(arg)
	bmco.HTMLEntitiesDecode(arg)
	bmco.arrayHas(array, item)
	bmco.arrayRemoveValue(arr, value)
	bmco.randString(n)
	bmco.getParamRead(arg)
	bmco.getParamWrite(param, value)
	bmco.getParamDelete(arg)
	bmco.setTitle(arg)
	bmco.removeIfExists(id)
	bmco.badcharsPresent(arg, badchars)
	bmco.badcharsAsString(badchars)
	bmco.timestamp()
	bmco.urlOpen(url, blank=true)
	bmco.parseIntSafe(arg)
	bmco.removeAttributeForAllElementsOfClass(classname, attribute)
	bmco.setAttributeForAllElementsOfClass(classname, attribute, value)
	bmco.removeAllElementsOfClass(classname)
	bmco.removeClassForAllTagsNamed(tagname, classToRemove)
	bmco.inputValueSet(id, val)
	bmco.inputValueGet(id)
	bmco.firstElementOfClassByAttribute: function(classname, attribute, value)
	bmco.ofClassAddClass: function(haveClass, otherClass, remove)
	bmco.ofClassRemoveClass: function(haveClass, removeClass)
	bmco.forceCssToSheet: function(typeAndClass, sheetIndex, newRule, newValue)
	bmco.cookieGet: function(name)
	bmco.cookieSet: function(name, value, exp, path)
	bmco.addToObjectIfNotThere(object, property, value)
	bmco.elementAttributeExists: function(elem, attribName) {
	bmco.bodyAttributeExists: function(attribName) {
*/

var bmco = {

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/*  Sends an http request for a file, returns its contents as a string
inputs: fname <string> [relative path to a file somewhere on the same server]
return: <string>
*/
httpRequest: async function(fname)
{
	// thank you Blunt Jackson
	// https://overclocked.medium.com/truly-understanding-javascript-promises-await-and-async-f3f51e283554
	var xhr = new XMLHttpRequest();
	return new Promise(function(resolve, reject)
	{
		xhr.onreadystatechange = function()
		{
			if (xhr.readyState == 4)
			{
			if (xhr.status >= 300)
				reject("Error, status code = " + xhr.status)
			else
				resolve(xhr.responseText);      
			}
		}
		xhr.open('GET', fname, true)
		xhr.send();
	});
},

/* Replaces all occurences of target in arg to replace
inputs: arg <string> [plain string to be processed],
		target <string> [string to be found in arg],
		replace <string, optional> [replace target with this
			string, not provided = delete occurences]
return: <string>

*/
replaceAllInString: function(arg, target, replace="")
{
	while (arg.indexOf(target) != -1)
		arg = arg.replace(target, replace);
	return arg;
},

/* Encodes the following characters into HTML entities: & < > " '
inputs: arg <string> [plain string to be entity-encoded]
return: <string>
*/
HTMLEntitiesEncode: function(arg)
{
	// stolen from https://javascript.plainenglish.io/javascript-algorithm-convert-html-entities-99719d8ca118
	// thank you Max N
	let regex = /[&|<|>|"|']/g;
	let out = arg.replace(regex, function(match){
		if(match === "&"){
			return "&amp;";
		}else if(match === "<"){
			return "&lt;"
		}else if(match === ">"){
			return "&gt;";
		}else if(match === '"'){
			return "&quot;";
		}else{
			return "&apos;";
		}
	});
	return out;
},

/* Decodes the following HTML entities into characters: & < > " '
inputs: arg <string> [entity-encoded string to be decoded]
return: <string>
*/
HTMLEntitiesDecode: function(arg) {
	var out = arg;
	var key = ["&amp;", "&lt;", "&gt;", "&quot;", "&apos;"];
	var match = ["&", "<", ">", '"', "'"];
	for (var x = 0; x < key.length; x++)
		out = bmco.replaceAllInString(out, key[x], match[x]);
	return out;
},

/* checks if item is in an array
inputs: array <array>, item <any>
return: <bool> true/false
*/
arrayHas: function(array, item) {
	for (var t = 0; t < array.length; t++)
	{
		if (array[t] == item)
			return true;
	}
	return false;
},

/* removes any occurences of a value from an array
inputs: arr <array>, value <any>
return: <array> [arr without value occurences]
*/
arrayRemoveValue: function(arr, value)
{ 
	// thanks Chris Love
	// https://love2dev.com/blog/javascript-remove-from-array/
	return arr.filter(function(ele){ 
		return ele != value; 
	});
},

/* returns random string of lowercase characters and numbers of length n
inputs: n <integer> [length of the resulting string]
return: <string> random string
*/
randString: function(n)
{
	dict = '1234567890qwertyuiopasdfghjklzxcvbnm'; // PRESS ALL THE BUTTONS :D
	randStr = "";
	for (var t = 0; t < n; t++)
	{
		randStr += dict.charAt(Math.floor(Math.random()*dict.length));
	}

	return randStr;
},

/* checks the url for what's in a GET parameter, if empty returns null
inputs: arg <string> - name of the GET param
return: <string> parameter value if exists, null otherwise
*/
getParamRead: function(arg)
{
	// thanks Franklin Yu 
	// https://stackoverflow.com/questions/814613/how-to-read-get-data-from-a-url-using-javascript
	let params = new URLSearchParams(location.search);
	let value = params.get(arg);
	if (value == null || value == "null")
		return null;
	else
		return decodeURI(value);
},

/* puts a new get parameter-value to the current address bar location
inputs: param <string> [get parameter name], value <string> [its value]
return: none
*/
getParamWrite: function(param, value)
{
	var valueString = encodeURI(String(value));
	var loc = location.href;
	var href = "";
	var prev = bmco.getParamRead(param);
	if (prev === null)
	{

		if (loc.indexOf("?") === -1)
			loc += "?";
		else
			loc += "&";
		href = loc + String(param) + "=" + valueString;
		
	}
	else
	{
		toDelete = param+"="+prev; // full check because there may be 2 get params
		toAdd = param+"="+String(valueString); // with the same value
		href = loc.replace(toDelete,toAdd);
	}

	window.history.replaceState(null, null, href); 
	
},

/* deletes a GET parameter if it exists, if not exists returns false
inputs: arg <string> [name of the GET param]
outputs: <bool> true if OK, false if not
*/
getParamDelete: function(arg)
{
	var loc = location.href;
	var param = bmco.getParamRead(arg);
	if (param == null)
		return false;

	var toSearch = arg+'='+param;
	if (loc.indexOf("?"+toSearch) != -1)
	{
		var newLoc = loc.replace("?"+toSearch, "-->").replace("-->&", "?").replace("-->", "");
		window.history.replaceState(null, null, newLoc);	
		return true;
	}
	else if (loc.indexOf("&"+toSearch) != -1)
	{
		window.history.replaceState(null, null, loc.replace("&"+toSearch, ""));	
		return true;
	}
	else
		return false;
},

/* Set page title (tab text) to some string if the arg is a valid string
inputs: arg <string> - string to set the title to
return: none
*/
setTitle: function(arg)
{
	if (typeof(arg) == "string")
		document.title = arg;
},

/* Remove an html element by ID if it exists. True if OK, false if not.
inputs: id <string> [target element id]
return: bool
*/
removeIfExists: function(id)
{
	var m = document.getElementById(id);
	if (m != undefined)
	{
		m.remove();
		return true; 
	}
	return false;
},


/* Checks if any of the (supposedly) bad characters are presented in string
inputs: arg <string> [checked string],
		badchars <array of single char strings> [list of bad characters]
return: <bool>
*/
badcharsPresent: function(arg, badchars)
{
  
  for (var x = 0; x < badchars.length; x++)
  {
    if (arg.indexOf(badchars[x]) != -1)
      return true;
  }
  return false;
},

/* Returns a badchars array used for bmco.badcharsPresent() as a comma-separated string
is used for visual representation in popup alerts etc.
inputs: badchars <array of single char strings> [list of bad characters]
return: <string>
*/
badcharsAsString: function(badchars)
{
  out = "";
  for (var x = 0; x < badchars.length; x++)
  {
    out += badchars[x];
    if (x != badchars.length-1)
      out += ", ";
  }
  return out;
},

/* Get a string of a 13-digit unix UTC timestamp
inputs: none
return: <string> timestamp
*/
timestamp: function()
{
	return String(new Date().getTime());
},



/* open a url from string
inputs: url <string> [valid URL to visit],
		blank <bool> [true = in new tab, false = in this tab]
return: none
*/
urlOpen: function(url, blank=true)
{
	var a = document.createElement("a");
	if (blank)
		a.setAttribute("target", "_blank");
	a.setAttribute("href", url);
	document.body.appendChild(a);
	a.click();
	a.remove();
},

/* creates and submits a correct form. to be used with
offline channel editors instead of copying raw xml to the buffer
and opening the neocities file editors; the POST action is
handled by the web app to upload all the user files and convert the
stuff defined in post data into files and upload them too
inputs: datafiles <array of dicts> [descriptions of files to be created from POST],
		uploads <array of {tag: HTMLelement; remote_name: string} dicts > [local files to be uploaded remotely],
		chid <string> [valid channel id string, used to return the user to the editor page
					  offline editor template fills in this attr when rendered when POST is done]
return: none
*/
runUpdateForm: function(datafiles=[], uploads=[], deletes=[], chid=document.body.getAttribute('chid'))
{
	
	var makehidden = function(name)
	{
		var tag = document.createElement("input");
		tag.setAttribute("name", name);
		tag.setAttribute("type", "hidden"); 
		return tag;
	}

	var form = document.createElement("form");
	form.setAttribute("method", "POST");
	form.setAttribute("action", "../m/"+chid);
	form.setAttribute("enctype", "multipart/form-data");
	document.body.appendChild(form);

	var dataFilesInput = makehidden("datafiles");
	dataFilesInput.setAttribute("value", JSON.stringify(datafiles));


	var uploadNamesInput = makehidden("uploadnames");
	var uploadNames = []

	dataFilesInput.setAttribute("type", "hidden");
	for ( var x = 0; x < uploads.length; x++)
	{
		var dic = uploads[x];
		var fname = "file"+String(x);
		dic['tag'].id = fname;
		dic['tag'].setAttribute("name", fname);
		form.appendChild(dic['tag']);
		uploadNames.push({
			upload_tag_id: fname,
			remote_name: dic['remote_name']
		});
	}

	uploadNamesInput.setAttribute("value", JSON.stringify(uploadNames));

	var deleteNamesInput = makehidden("deletenames");
	deleteNamesInput.setAttribute("value", JSON.stringify(deletes));

	form.appendChild(dataFilesInput);
	form.appendChild(uploadNamesInput);
	form.appendChild(deleteNamesInput);

	form.submit();
},


/*  safely parse a string into an integer
inputs: arg <string> [integerlike string] 
return: <integer> [parsed number] or <false>
*/
parseIntSafe: function(arg)
{
	var ret = parseInt(arg);
	if (isNaN(ret))
		return 0;
	return ret;
},

/* Removes some attribute from every DOM element of a class
inputs: classname <string> [name of assigned class],
		attribute <string> [name of the attribute to be removed]
return: none
*/
removeAttributeForAllElementsOfClass: function(classname, attribute)
{
	var targets = document.getElementsByClassName(classname);
	for (var x = 0; x < targets.length; x++)
		targets[x].removeAttribute(attribute);
},

/* Sets some attribute to a value for every DOM element of a class
inputs: classname <string> [name of assigned class],
		attribute <string> [name of the attribute to be added]
		value <string> [value to assign attribute to for each element]
return: none
*/
setAttributeForAllElementsOfClass: function(classname, attribute, value)
{

	var targets = document.getElementsByClassName(classname);
	for (var x = 0; x < targets.length; x++)
		targets[x].setAttribute(attribute, value);
},

/* Removes every DOM element of a class
inputs: classname <string> [name of assigned class],
return: none
*/
removeAllElementsOfClass: function(classname)
{
	var targets = document.getElementsByClassName(classname);
	for (var x = 0; x < targets.length; x++)
		targets[x].remove();
},

/* Removes class for every DOM element of a tag name
inputs: tagname <string> [name of target tags],
		classToRemove <string> [name of class to remove],
return: none
*/
removeClassForAllTagsNamed: function(tagname, classToRemove)
{
	var targets = document.getElementsByTagName(tagname);
	for (var x = 0; x < targets.length; x++)
		targets[x].classList.remove(classToRemove);
},


/* Sets an input's value
inputs: id <string> [id of the input field],
		val <string> [value to set]
return: <bool> successful or not
*/
inputValueSet: function(id, val)
{
	var t = document.getElementById(id);
	if (t == undefined)
		return false;
	t.value = val;
	return true;
},


/* Gets an input's value. False if not found
inputs: id <string> [id of the input field],
		val <string> [value to set]
return: <string> or <bool:False> if not found
*/
inputValueGet: function(id)
{
	var t = document.getElementById(id);
	if (t == undefined)
		return false;
	return t.value;
},


/* Finds the first element of class 'classname'  which has
the 'attribute' set to 'value'. Used to locate buttons, artwork divs, etc... a lot.
inputs: classname <string> [elements of this class will get searched up]
		attribute <string> [attribute name to look for]
		value <string> [attribute value to match]
return: <html element> or <undefined> on fail
*/
firstElementOfClassByAttribute: function(classname, attribute, value)
{
	var classItems = document.getElementsByClassName(classname);
	for (var x = 0; x < classItems.length; x++)
	{
		var target = classItems[x];
		if (target.getAttribute(attribute) == value)
		{
			return target;
			break;
		}
	}
	return undefined;
},

/*  */
addClassMany: function(els, classToAdd, remove=false)
{
	if (els.length == 0)
		return;
	for (var x = 0; x < els.length; x++)
		remove? els[x].classList.remove(classToAdd) : els[x].classList.add(classToAdd);
},

/*  */
removeClassMany: function(els, classToRemove)
{
	return bmco.addClassMany(els, classToRemove, true);
},

/* adds a new class to every element of some class
inputs: haveClass <string> [class that the tags already have],
		otherClass <string> [class that the tags should obtain],
		remove <bool=false> [set to true if we remove otherClass instead of adding]
return: none
*/
ofClassAddClass: function(haveClass, otherClass, remove=false)
{
	var els = document.getElementsByClassName(haveClass);
	remove? bmco.removeClassMany(els, otherClass) : bmco.addClassMany(els, otherClass);
},

/* wrapper for ofClassAndClass with remove set to true.
inputs: haveClass <string> [class that the tags already have],
		otherClass <string> [class that the tags should obtain],
return: none
*/
ofClassRemoveClass: function(haveClass, removeClass)
{
	bmco.ofClassAddClass(haveClass, removeClass, true)
},

/* Changes a line for an existing rule in one of the loaded CSS sheets
inputs: typeAndClass <string> [valid name of a selector, e.g. ".myAss p"],
		sheetIndex <int> [index of the CSS file to refer to, as they appear in <head>],
		newRule <string> [name of a rule line, e.g. "margin-left"],
		newValue <string> [a valid parameter for the rule, e.g. "20px"]
return: none 
*/
forceCssToSheet: function(typeAndClass, sheetIndex, newRule, newValue)
{
	// stolen from https://stackoverflow.com/questions/18421962/how-to-add-a-new-rule-to-an-existing-css-class
    var thisCSS=document.styleSheets[sheetIndex];
    var ruleSearch=thisCSS.cssRules? thisCSS.cssRules: thisCSS.rules;
    for (i=0; i<ruleSearch.length; i++)
    {
        if(ruleSearch[i].selectorText==typeAndClass)
        {
            var target=ruleSearch[i];
            break;
        }
    }
    target.style[newRule] = newValue;
},

/* parses the current document.cookie and gets a value string corresponding to the name.
inputs: name <string> [name of the parameter to read]
return: <string> param value or <null> if name not found in cookie
*/
cookieGet: function(name)
{
	// thank you w3schools https://www.w3schools.com/js/js_cookies.asp
	let search = name + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(search) == 0) {
			return c.substring(search.length, c.length);
		}
	}
	return null;
},

/* adds a key-value pair to a cookie at location. Creates a new one if didn't exist
inputs: name <string> [name of the cookie parameter]
		value <string> [value of the cookie parameter]
		exp <int=30> [expiration date, days from createion moment]
		path <str="/"> [cookie path, defaults to website root]
return: nothing useful
*/
cookieSet: function(name, value, exp=30, path="/")
{
	if (!document.cookie || !bmco.cookieGet(name))
		return bmco._cookieCreate(name, value, exp);
	document.cookie = name+" = "+value+"; path=" + path;
},

/* creates an entirely new cookie. wrapper for writing to document.cookie
writes only one key-value pair. more can be added with cookieSet
inputs: name <string> [name of the cookie parameter]
		value <string> [value of the cookie parameter]
		exp <int=30> [expiration date, days from createion moment]
		path <str="/"> [cookie path, defaults to website root]
return: nothing useful
*/
_cookieCreate: function(name, value, exp=30, path="/")
{
	// thank you w3schools https://www.w3schools.com/js/js_cookies.asp
	return document.cookie = name + "=" + value + ";" + bmco._cookieExpirationTime(exp) + ";path=" + path;
},

/* Generates a cookie expiration time string set to N days after creation moment
inputs: days <int> [how many days to keep it alive]
return: <string> the "expires=..." part of the cookie
*/
_cookieExpirationTime: function(days)
{
	const d = new Date();
	d.setTime(d.getTime() + (days*24*60*60*1000));
	let expires = "expires="+ d.toUTCString();
	return expires;
},

/*
todo
*/
addToObjectIfNotThere: function(object, property, value) {
	if (!object[property])
		return object[property] = value;
},

elementAttributeExists: function(elem, attribName) {
	if (!elem)
		return false;
	if (!elem.getAttribute(attribName))
		return false;
	return true;
},

bodyAttributeExists: function(attribName) {
	return bmco.elementAttributeExists(document.body, attribName)	
}


//==========================================================================//
//=============================== LIBRARY END ==============================//
//==========================================================================//

};