//==========================================================================//
//================ BRIGHT MOON CO. GENERAL FUNCTION KIT ====================//
//==========================================================================//

/*
pre-import requirements:
	none
*/

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

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

function bmco_HTMLEntitiesDecode(arg) {
	// stolen from https://tertiumnon.medium.com/js-how-to-decode-html-entities-8ea807a140e5
	// thank you Vit Tertiumnon
	/*
	var textArea = document.createElement('textarea');
	textArea.innerHTML = arg;
	out = textArea.value;
	textArea.remove();
	return out;
	*/
	var out = arg;
	var key = ["&amp;", "&lt;", "&gt;", "&quot;", "&apos;"];
	var match = ["&", "<", ">", '"', "'"];
	for (var x = 0; x < key.length; x++)
		out = out.replaceAll(key[x], match[x]);
	return out;
}





/*
checks if item is in an array
inputs: array <array>, item <anything that array has>
return: bool true/false
*/
function bmco_arrayHas(array, item) {
	for (var t = 0; t < array.length; t++)
	{
		if (array[t] == item)
			return true;
	}
	return false;
}

function bmco_arrayRemoveValue(arr, value)
{ 
		// thanks Chris Love
		// https://love2dev.com/blog/javascript-remove-from-array/
				return arr.filter(function(ele){ 
						return ele != value; 
				});
}

/*
returns random string of lowercase characters and numbers of length n
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

/*
puts a new get parameter-value to the current address bar location
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

/*
checks the url for what's in a GET parameter, if empty returns null
inputs: arg (string) - name of the GET param
return: if exists - returns parameter value, null otherwise
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

/*
deletes a GET parameter if it exists, if not exists returns false
inputs: arg (string) - name of the GET param
outputs: True if OK, false if not
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



function bmco_badcharsPresent(arg, badchars)
{
  
  for (var x = 0; x < badchars.length; x++)
  {
    if (arg.indexOf(badchars[x]) != -1)
      return true;
  }
  return false;
}

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

function bmco_timestamp()
{
	return String(Date.now());
}