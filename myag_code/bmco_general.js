//==========================================================================//
//================ BRIGHT MOON CO. GENERAL FUNCTION KIT ====================//
//==========================================================================//

/*
pre-import requirements:
	none

available functions:
	bmco_replaceAllInString(arg, target, replace="")
	bmco_HTMLEntitiesEncode(arg)
	bmco_HTMLEntitiesDecode(arg)
	bmco_arrayHas(array, item)
	bmco_arrayRemoveValue(arr, value)
	bmco_randString(n)
	bmco_getParamRead(arg)
	bmco_getParamWrite(param, value)
	bmco_getParamDelete(arg)
	bmco_setTitle(arg)
	bmco_removeIfExists(id)
	bmco_badcharsPresent(arg, badchars)
	bmco_badcharsAsString(badchars)
	bmco_timestamp()
	bmco_makeIdBase()
	bmco_urlOpen(url, blank=true)
	bmco_parseIntSafe(arg)
	bmco_inputValueSet(id, val)
	bmco_inputValueGet(id)
*/


//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/* Replaces all occurences of target in arg to replace
inputs: arg <string> [plain string to be processed],
		target <string> [string to be found in arg],
		replace <string, optional> [replace target with this
			string, not provided = delete occurences]
return: <string>

*/
function bmco_replaceAllInString(arg, target, replace="")
{
	while (arg.indexOf(target) != -1)
		arg = arg.replace(target, replace);
	return arg;
}

/* Encodes the following characters into HTML entities: & < > " '
inputs: arg <string> [plain string to be entity-encoded]
return: <string>
*/
function bmco_HTMLEntitiesEncode(arg)
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
}

/* Decodes the following HTML entities into characters: & < > " '
inputs: arg <string> [entity-encoded string to be decoded]
return: <string>
*/
function bmco_HTMLEntitiesDecode(arg) {
	var out = arg;
	var key = ["&amp;", "&lt;", "&gt;", "&quot;", "&apos;"];
	var match = ["&", "<", ">", '"', "'"];
	for (var x = 0; x < key.length; x++)
		out = bmco_replaceAllInString(out, key[x], match[x]);
	return out;
}

/* checks if item is in an array
inputs: array <array>, item <any>
return: <bool> true/false
*/
function bmco_arrayHas(array, item) {
	for (var t = 0; t < array.length; t++)
	{
		if (array[t] == item)
			return true;
	}
	return false;
}

/* removes any occurences of a value from an array
inputs: arr <array>, value <any>
return: <array> [arr without value occurences]
*/
function bmco_arrayRemoveValue(arr, value)
{ 
	// thanks Chris Love
	// https://love2dev.com/blog/javascript-remove-from-array/
	return arr.filter(function(ele){ 
		return ele != value; 
	});
}

/* returns random string of lowercase characters and numbers of length n
inputs: n <integer> [length of the resulting string]
return: <string> random string
*/
function bmco_randString(n)
{
	dict = '1234567890qwertyuiopasdfghjklzxcvbnm'; // PRESS ALL THE BUTTONS :D
	randStr = "";
	for (var t = 0; t < n; t++)
	{
		randStr += dict.charAt(Math.floor(Math.random()*dict.length));
	}

	return randStr;
}

/* checks the url for what's in a GET parameter, if empty returns null
inputs: arg <string> - name of the GET param
return: <string> parameter value if exists, null otherwise
*/
function bmco_getParamRead(arg)
{
	// thanks Franklin Yu 
	// https://stackoverflow.com/questions/814613/how-to-read-get-data-from-a-url-using-javascript
	let params = new URLSearchParams(location.search);
	let value = params.get(arg);
	if (value == null)
		return null;
	else
		return decodeURI(value);
}

/* puts a new get parameter-value to the current address bar location
inputs: param <string> [get parameter name], value <string> [its value]
return: none
*/
function bmco_getParamWrite(param, value)
{
	var valueString = encodeURI(String(value));
	var loc = location.href;
	var href = "";
	var prev = bmco_getParamRead(param);
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
	
}

/* deletes a GET parameter if it exists, if not exists returns false
inputs: arg <string> [name of the GET param]
outputs: <bool> true if OK, false if not
*/
function bmco_getParamDelete(arg)
{
	var loc = location.href;
	var param = bmco_getParamRead(arg);
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
}

/* Set page title (tab text) to some string if the arg is a valid string
inputs: arg <string> - string to set the title to
return: none
*/
function bmco_setTitle(arg)
{
	if (typeof(arg) == "string")
		document.title = arg;
}

/* Remove an html element by ID if it exists. True if OK, false if not.
inputs: id <string> [target element id]
return: bool
*/
function bmco_removeIfExists(id)
{
	var m = document.getElementById(id);
	if (m != undefined)
	{
		m.remove();
		return true; 
	}
	return false;
}


/* Checks if any of the (supposedly) bad characters are presented in string
inputs: arg <string> [checked string],
		badchars <array of single char strings> [list of bad characters]
return: <bool>
*/
function bmco_badcharsPresent(arg, badchars)
{
  
  for (var x = 0; x < badchars.length; x++)
  {
    if (arg.indexOf(badchars[x]) != -1)
      return true;
  }
  return false;
}

/* Returns a badchars array used for bmco_badcharsPresent() as a comma-separated string
is used for visual representation in popup alerts etc.
inputs: badchars <array of single char strings> [list of bad characters]
return: <string>
*/
function bmco_badcharsAsString(badchars)
{
  out = "";
  for (var x = 0; x < badchars.length; x++)
  {
    out += badchars[x];
    if (x != badchars.length-1)
      out += ", ";
  }
  return out;
}

/* Get a string of a 13-digit unix UTC timestamp
inputs: none
return: <string> timestamp
*/
function bmco_timestamp()
{
	return String(new Date().getTime());
}

/* makes an id base string
inputs: none
outputs: id string base
*/
function bmco_makeIdBase()
{
  return bmco_timestamp()+"_"+bmco_randString(5);
}

/* open a url from string
inputs: url <string> [valid URL to visit],
		blank <bool> [true = in new tab, false = in this tab]
return: none
*/
function bmco_urlOpen(url, blank=true)
{
	var a = document.createElement("a");
	if (blank)
		a.setAttribute("target", "_blank");
	a.setAttribute("href", url);
	document.body.appendChild(a);
	a.click();
	a.remove();
}

/* creates and submits a correct form. to be used with
offline channel editors instead of copying raw xml to the buffer
and opening the neocities file editors; the POST action is
handled by the web app to upload all the user files and convert the
stuff defined in post data into files and upload them too
inputs: datafiles <array of dicts> [descriptions of files to be created from POST],
		chid <string> [valid channel id string, used to return the user to the editor page
					  offline editor template fills in this attr when rendered when POST is done]
return: none
*/
function bmco_runUpdateForm(datafiles, chid=document.body.getAttribute('chid'))
{
	var form = document.createElement("form");
	form.setAttribute("method", "POST");
	form.setAttribute("action", "../m/"+chid); // 
	document.body.appendChild(form);

	var dataFilesInput = document.createElement("input");
	dataFilesInput.setAttribute("name", "datafiles");
	dataFilesInput.setAttribute("type", "hidden");
	dataFilesInput.setAttribute("value", JSON.stringify(datafiles))
	form.appendChild(dataFilesInput)

	form.submit();
}

/*  safely parse a string into an integer
inputs: arg <string> [integerlike string] 
return: <integer> [parsed number] or <false>
*/
function bmco_parseIntSafe(arg)
{
	var ret = parseInt(arg);
	if (isNaN(ret))
		return 0;
	return ret;
}

/* Removes some attribute from every DOM element of a class
inputs: classname <string> [name of assigned class],
		attribute <string> [name of the attribute to be removed]
return: none
*/
function bmco_removeAttributeForAllElementsOfClass(classname, attribute)
{
	var targets = document.getElementsByClassName(classname);
	for (var x = 0; x < targets.length; x++)
		targets[x].removeAttribute(attribute);
}

/* Sets some attribute to a value for every DOM element of a class
inputs: classname <string> [name of assigned class],
		attribute <string> [name of the attribute to be added]
		value <string> [value to assign attribute to for each element]
return: none
*/
function bmco_setAttributeForAllElementsOfClass(classname, attribute, value)
{

	var targets = document.getElementsByClassName(classname);
	for (var x = 0; x < targets.length; x++)
		targets[x].setAttribute(attribute, value);
}

/* Removes every DOM element of a class
inputs: classname <string> [name of assigned class],
return: none
*/
function bmco_removeAllElementsOfClass(classname)
{
	var targets = document.getElementsByClassName(classname);
	for (var x = 0; x < targets.length; x++)
		targets[x].remove();
}


/* Sets an input's value
inputs: id <string> [id of the input field],
		val <string> [value to set]
return: <bool> successful or not
*/
function bmco_inputValueSet(id, val)
{
	var t = document.getElementById(id);
	if (t == undefined)
		return false;
	t.value = val;
	return true;
}


/* Gets an input's value. False if not found
inputs: id <string> [id of the input field],
		val <string> [value to set]
return: <string> or <bool:False> if not found
*/
function bmco_inputValueGet(id)
{
	var t = document.getElementById(id);
	if (t == undefined)
		return false;
	return t.value;
}
