//==========================================================================//
//================ MYARTGALLERY MAIN FUNCTIONS/CLASSES =====================//
//==========================================================================//

/*
pre-import requirements:
  bmco_general.js
  bmco_xml.js
*/

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

GLOBAL_debug = true;
GLOBAL_workingFile = "./myag_files/data.xml";
GLOBAL_loadedData = undefined;
GLOBAL_loadedArtworks = undefined;
GLOBAL_currentlyLoadedArtworks = [];
GLOBAL_currentPage = 0;
GLOBAL_pagesTotal = null;
GLOBAL_usedPaginationType = "none";
GLOBAL_artworksPerPage = null;

const myag_xmlLoaded = new CustomEvent("xmlFileLoaded");

//==========================================================================//
//=============================== CLASSES ==================================//
//==========================================================================//


class Group {
  constructor(gid, name, about) {
    this.gid = gid;
    this.name = name;
    this.about = about;
  }
}

class Artwork {
  constructor(awid, name, filename, about, groups) {
    this.awid = awid;
    this.name = name;
    this.filename = filename;
    this.about = about;
    this.groups = groups;
  }

  ingroup(gid) {
    for (var x = 0; x < this.groups.length; x++)
    {
      if (this.groups[x] == gid)
        return true;
    }
    return false;
  }
}


//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/* Literally what it says. Is used in some hover-blocking shenanigans.
*/
function myag_doNothing()
{
  return;
}

/* Lazy check if the current location is index.html to alter load-ups
inputs: none
return: bool
*/
function myag_isEditor()
{
  if (document.body.getAttribute('isEditor') != null)
    return true;
  if (window.location.toString().search("editor.html") != -1)
    return true;
  if (window.location.toString().split("/").reverse()[0] == "editor")
    return true;
  return false;
}

/* Appends a div to target, another one after it if the editor is open.
Is a base function for stuff in panel and index script files.
inputs: elem <html element> [element to add in all cases],
        elemIfEditor <html element> [element to add if page is editor.html],
        target <html element> [target element],
        mode <string = "appendChild", "insertAfter" or "prepend"> [function mode]
return: none
*/
function myag_appendToGridMode(elem, elemIfEditor, target, mode)
{
  if (mode == "appendChild")
  {
    target.appendChild(elem);
    if (myag_isEditor())
      target.appendChild(elemIfEditor);
  }
  else if (mode == "insertAfter")
  {
    target.parentNode.insertBefore(elem, target.nextSibling);
    if (myag_isEditor())
      target.parentNode.insertBefore(elemIfEditor, target.nextSibling.nextSibling);
  }
  else if (mode == "prepend")
  {
    
    if (myag_isEditor())
      target.prepend(elemIfEditor);
    target.prepend(elem);
  }
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

/* makes an id base string
inputs: none
outputs: id string base
*/
function myag_makeIdBase()
{
  return bmco_timestamp()+"_"+bmco_randString(5);
}

/*
makes an artwork id (awid) string
inputs: none
output: correct awid
*/
function myag_makeAwid()
{
  return "aw_"+String(Date.now())+"_"+bmco_randString(5);
}

/*
makes a group id string
inputs: none
output: correct gid 
*/
function myag_makeGid()
{
  return "g_"+String(Date.now())+"_"+bmco_randString(5);
}


/* tells if the provided string is a valid id string base
inputs: arg <string> [string to test]
output: <bool> [if it is a valid id base]
*/
function myag_isIdBase(arg)
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
}

/* tells if the provided string is a valid awid
inputs: awid <string> [string to test]
output: <bool> [if it is a valid artwork id]
*/
function myag_isAwid(awid)
{
  var header = awid.substr(0,3);
  var base = awid.substr(3);
  if (header != "aw_")
    return false;
  if (!myag_isIdBase(base))
    return false;
  return true;
}

/* tells if the provided string is a valid gid
inputs: gid <string> [string to test]
output: <bool> [if it is a valid group id]
*/
function myag_isGid(gid)
{
  var header = gid.substr(0,2);
  var base = gid.substr(2);
  if (header != "g_")
    return false;
  if (!myag_isIdBase(base))
    return false;
  return true;
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
    GLOBAL_loadedData = bmco_replaceAllInString(xmlText, /[\n\r\t]/g);
    window.dispatchEvent(myag_xmlLoaded);
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
    groups.push(myag_groupXmlToObject(xmlGroups[t]));
  
  return groups;
}

/*
fetches a Group class instance by its name as by the xml file. very async. :C
inputs: targetName (string) - target group name
outputs: Groups (array of Group instances or null if not found)
*/
/*
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
    var xmlGroupId = xmlGroups[t].childNodes[2];
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
*/

function myag_groupXmlToObject(groupXml)
{
  var g = bmco_xml_childTagRead(groupXml, "gid");
  var n = bmco_xml_childTagRead(groupXml, "name");
  var a = bmco_xml_childTagRead(groupXml, "about");
  var out = new Group(g, n, a);
  return out;
}

function myag_artworkXmlToObject(artworkXml)
{
  var aw = bmco_xml_childTagRead(artworkXml, "awid");
  var n = bmco_xml_childTagRead(artworkXml, "name");
  var fn = bmco_xml_childTagRead(artworkXml, "filename");
  var a = bmco_xml_childTagRead(artworkXml, "about");
  var ig = bmco_xml_childTagGetChildrenValues(artworkXml, "ingroups");
  return new Artwork(aw, n, fn, a, ig);
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
fetches Artwork class instances based on the xml file artwork entries
inputs: none
outputs: artworks (array of Artwork class instances)
*/
async function myag_getArtworkAll()
{
  return myag_getArtworksInGroup("any");
}

/*
fetches Artwork class instances of a particular group based on the xml file artwork entries
inputs: none
outputs: artworks (array of Artwork class instances)

probably could be done using myag_getArtworkAll() to avoid repetition..
*/
async function myag_getArtworksInGroup(gid)
{
  await myag_checkXmlLoaded();
  var xmldoc = bmco_xml_xmldocFromString(GLOBAL_loadedData);
  artworks = [];
  var xmlArtworks = xmldoc.getElementsByTagName('artwork');
  for (var t = 0; t < xmlArtworks.length; t++)
  {
    var aw = myag_artworkXmlToObject(xmlArtworks[t]);
    if ((aw.ingroup(gid)) || (gid == "any"))
      artworks.push(aw);
  }
  return artworks;
    
}

/*
fetches Artwork class instances based on the xml file artwork entries
inputs: awid (string) - awid field value of artwork class instance
output: (Artwork class instance) the class instance searched for
*/
async function myag_getArtworkById(awid)
{
  var allArtworks = await myag_getArtworkAll();
  for (var t = 0; t < allArtworks.length; t++)
  {
    if (allArtworks[t].awid == awid)
    {
      return allArtworks[t];
    }
  }
  return null;
}

/*
fetches Group class instances based on the xml file artwork entries
inputs: gid (string) - gid field value of group class instance
output: (Group class instance) the class instance searched for
*/
async function myag_getGroupById(gid)
{
  var allGroups = await myag_getGroups();
  for (var t = 0; t < allGroups.length; t++)
  {
    if (allGroups[t].gid == gid)
    {
      return allGroups[t];
    }
  }
  return null;
}


