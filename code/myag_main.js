//==========================================================================//
//============================= EDITABLE SETTINGS ==========================//
//==========================================================================//

SETTING_loadTopDown = true; // true = items upper in the Editor view get
                             // displayed first. false - vice versa.

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

GLOBAL_debug = true ;
GLOBAL_workingFile = "./files/data.xml";
GLOBAL_loadedData = undefined;
GLOBAL_currentlyLoadedArtworks = undefined;

//==========================================================================//
//=============================== CLASSES ==================================//
//==========================================================================//


class Group {
  constructor(name, about) {
    this.name = name;
    this.about = about;
  }
}

class Artwork {
  constructor(filename, about, groups, awid, name) {
    this.filename = filename;
    this.about = about;
    this.groups = groups;
    this.awid = awid;
    this.name = name;
  }
}


//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//


/*
puts to the current address line a "?param=value" if there's no other get
params or "&param=value" if there are
inputs: param, value - any stringable values
outputs: none
*/
function myag_setGetParam(param, value)
{

  var loc = location.href;
  var href = "";
  var prev = myag_getGetParam(param);
  if (prev === null)
  {

    if (loc.indexOf("?") === -1)
      loc += "?";
    else
      loc += "&";
    href = loc + String(param) + "=" + String(value);
    
  }
  else
  {
    toDelete = param+"="+prev; // full check because there may be 2 get params
    toAdd = param+"="+String(value); // with the same value
    href = loc.replace(toDelete,toAdd);
    db('painis');
  }

  window.history.replaceState(null, null, href); 
  
}

/*
checks the url for what's in a GET parameter, if empty returns null
inputs: arg (string) - name of the GET param
outputs: if exists - returns parameter value, null otherwise
*/
function myag_getGetParam(arg)
{
  // thanks Franklin Yu 
  // https://stackoverflow.com/questions/814613/how-to-read-get-data-from-a-url-using-javascript
  let params = new URLSearchParams(location.search);
  return params.get(arg);
}

/*
deletes a GET parameter if it exists, if not exists returns false
inputs: arg (string) - name of the GET param
outputs: True if OK, false if not
*/
function myag_deleteGetParam(arg)
{
  var loc = location.href;
  var param = myag_getGetParam(arg);
  var toSearch = arg+'='+param;
  if (loc.indexOf(toSearch) != -1)
  {
    var newLoc = loc.replace('&'+toSearch,"");
    if (newLoc == loc) // if it was the first parameter
        newLoc = loc.replace('?'+toSearch,"");
    window.history.replaceState(null, null, newLoc); 
    
    return true;
  }

  return false;


}


/*
debug logger function. set GLOBAL_debug to true if you want some console garbage.
handy for building stuff.
inputs: arg (anything) - to be displayed
outputs: none
*/
function db(arg) {
	if (GLOBAL_debug)
		console.log(arg);
}

function myag_removeFromArray(arr, value)
{ 
    // thanks Chris Love
    // https://love2dev.com/blog/javascript-remove-from-array/
        return arr.filter(function(ele){ 
            return ele != value; 
        });
}

/*
returns random string of lowercase characters and numbers of length n
inputs: n (integer) - length of the result
outputs: random string
*/
function myag_randString(n)
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
makes an artwork id (awid) string
inputs: none
output: correct awid
*/
function myag_makeAwid()
{
  return String(Date.now())+"_"+myag_randString(5);
}

/*
extracts timestamp (int) from the awid string
inputs: awid (string) - correct artwork id
output: timestamp (int)
*/
function myag_getTimestampFromAwid(awid)
{
  var tstamp = awid.split("_")[0];
  return parseInt(tstamp);
}

/*
checks if item is in an array
inputs: a (array), i (item)
outputs: bool true/false
*/
function myag_in(a, i) {
  var good = false;
  for (var t = 0; t < a.length; t++)
  {
    if (a[t] == i)
      good = true;
  }
  return good;
}

/*
checks if GLOBAL_loadedData is undefined. If it is - loads the XML data file.
you have to WAIT FOR THIS FUNCTION in other functions!!! (welcome to async hell)
inputs: none
outputs: none
*/
async function myag_checkXmlLoaded() {

	if (GLOBAL_loadedData == undefined)
	{

		await myag_waitForXml();
	}
	return;
}
// part of myag_checkXmlLoaded - waits for the xhr to come back
async function myag_waitForXml() {

  try {
    let xmlText = await myag_promiseXml()
    xmlText = xmlText.replace(/>\s*/g, '>');  // Replace "> " with ">"
    xmlText = xmlText.replace(/\s*</g, '<');  // Replace "< " with "<"
    GLOBAL_loadedData = xmlText.replaceAll(/[\n\r\t]/g, '' );
    return;
  } catch (err) {
    console.log(err)
  }
}
// part of myag_checkXmlLoaded - sends an xhr and promises to myag_waitForXml it will come back
// thank you Blunt Jackson
// https://overclocked.medium.com/truly-understanding-javascript-promises-await-and-async-f3f51e283554
async function myag_promiseXml()
{
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
    xhr.open('GET', GLOBAL_workingFile, true)
    xhr.send();
  });
}

/*
fetches groupnames found in the xml file. very async. :C
inputs: none
outputs: groupnames (array of strings)
*/
async function myag_getGroupNames()
{
	await myag_checkXmlLoaded(); // it's like now i have to say 'await' before every fuckin function

	var parser = new DOMParser();
	var xmldoc = parser.parseFromString(GLOBAL_loadedData, "text/xml");
	var xmlGroups = xmldoc.getElementsByTagName('group');
	var groupnames = [];
	for (var t = 0; t < xmlGroups.length; t++)
  {
    var xmlGroupName = xmlGroups[t].childNodes[0];
		groupnames.push(xmlGroupName.childNodes[0].nodeValue);
  }
	return groupnames;
}

/*
fetches Group class instances as by the xml file. very async. :C
inputs: none
outputs: Groups (array of Group instances)
*/
async function myag_getGroups()
{
  await myag_checkXmlLoaded(); // it's like now i have to say 'await' before every fuckin function

  var parser = new DOMParser();
  var xmldoc = parser.parseFromString(GLOBAL_loadedData, "text/xml");
  var xmlGroups = xmldoc.getElementsByTagName('group');
  var groups = [];
  for (var t = 0; t < xmlGroups.length; t++)
  {
    var xmlGroupName = xmlGroups[t].childNodes[0];
    var xmlGroupAbout = xmlGroups[t].childNodes[1];
    var g = new Group(undefined, undefined);
    //db(xmlGroupAbout)
    g.name = xmlGroupName.childNodes[0].nodeValue;

    try
    {
      g.about = xmlGroupAbout.childNodes[0].nodeValue;
    }
    catch
    {
      g.about = "";
    }

    
    groups.push(g);
  }
  return groups;
}

/*
fetches a Group class instance by its name as by the xml file. very async. :C
inputs: targetName (string) - target group name
outputs: Groups (array of Group instances or null if not found)
*/
async function myag_getGroupByName(targetName)
{
  await myag_checkXmlLoaded(); // it's like now i have to say 'await' before every fuckin function

  var parser = new DOMParser();
  var xmldoc = parser.parseFromString(GLOBAL_loadedData, "text/xml");
  var xmlGroups = xmldoc.getElementsByTagName('group');
  var groups = [];
  for (var t = 0; t < xmlGroups.length; t++)
  {
    var xmlGroupName = xmlGroups[t].childNodes[0];
    var xmlGroupAbout = xmlGroups[t].childNodes[1];
    var g = new Group(undefined, undefined);
    g.name = xmlGroupName.childNodes[0].nodeValue;
    try 
      {g.about = xmlGroupAbout.childNodes[0].nodeValue;}
    catch
      {g.about = "";}
    
    if (g.name == targetName)
      return g;

  }
  return null;
}

/*
My super secret (and (forreal) absolutely harmless) function to check
if the user has gone through my scary javascript! delete if spotted.
inputs: none
output: none
*/
function auberysSuperSecretBackdoor()
{
  alert("this user didn't go through the page's javascript!");
}

/*
fetches Artwork class instances of a particular group based on the xml file artwork entries
inputs: none
outputs: artworks (array of Artwork class instances)
*/
async function myag_getArtworkGroup(groupname)
{
  await myag_checkXmlLoaded(); // it's like now i have to say 'await' before every fuckin function

  var parser = new DOMParser();
  var xmldoc = parser.parseFromString(GLOBAL_loadedData, "text/xml");
  var xmlArtworks = xmldoc.getElementsByTagName('artwork');
  var artworks = [];
  for (var t = 0; t < xmlArtworks.length; t++)
  {
    var good = false;
    var a = new Artwork(undefined, undefined, [], undefined);
    var xmla = xmlArtworks[t];
    var props = xmla.childNodes;
    try
      {a.name = props[0].childNodes[0].nodeValue;}
    catch
      {a.name = ""}
    a.filename = props[1].childNodes[0].nodeValue;
    try 
      {a.about = props[2].childNodes[0].nodeValue;}
    catch
      {a.about = "";}
    a.awid     = props[4].childNodes[0].nodeValue;
    var agroups = props[3].childNodes;
    for (var tt = 0; tt < agroups.length; tt++)
    {
      a.groups.push(agroups[tt].childNodes[0].nodeValue);
      if (agroups[tt].childNodes[0].nodeValue == groupname)
        good = true;
    }
    if (good)
      artworks.push(a);

  }
  return artworks;
}


/*
fetches Artwork class instances based on the xml file artwork entries
inputs: none
outputs: artworks (array of Artwork class instances)
*/
async function myag_getArtworkAll()
{
  await myag_checkXmlLoaded();

  var parser = new DOMParser();
  var xmldoc = parser.parseFromString(GLOBAL_loadedData, "text/xml");
  var xmlArtworks = xmldoc.getElementsByTagName('artwork');
  var artworks = [];
  for (var t = 0; t < xmlArtworks.length; t++)
  {
    var a = new Artwork(undefined, undefined, [], undefined);
    var xmla = xmlArtworks[t];
    var props = xmla.childNodes;

    a.filename = props[1].childNodes[0].nodeValue;

    try
      {a.name = props[0].childNodes[0].nodeValue;}
    catch
      {a.name = ""}
    
    
    try 
      {a.about = props[2].childNodes[0].nodeValue;}
    catch
      {a.about = "";}
    a.awid     = props[4].childNodes[0].nodeValue;
    var agroups = props[3].childNodes;
    for (var tt = 0; tt < agroups.length; tt++)
      a.groups.push(agroups[tt].childNodes[0].nodeValue);
    artworks.push(a);

  }

  if (SETTING_loadTopDown)
    return artworks.reverse();
  else
    return artworks;
}

/*
fetches Artwork class instances based on the xml file artwork entries
inputs: id (string) - awid field value of artwork entry/Artwork class instance
output: (Artwork class instance) the class instance searched for
*/
async function myag_getArtworkById(targetId)
{
  var allArtworks = await myag_getArtworkAll();
  for (var t = 0; t < allArtworks.length; t++)
  {
    db(allArtworks[t].awid);
    if (allArtworks[t].awid == targetId)
    {
      return allArtworks[t];
    }
  }
}




