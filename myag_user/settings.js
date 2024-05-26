
//============== MANDATORY TO EDIT - WON'T WORK NICELY WITHOUT IT ==============//

/*
set this to the link which appears in the page address line
when you edit the 'data.xml' document!
*/
myag.settings.neocitiesXmlFileEditLink = "pasteXmlEditorLinkHere",

/*
set this to the link which appears in the page address line
when you are in the neocities folder view, in "artworks" folder!
*/
myag.settings.neocitiesArtworksFolderLink = "pasteArtworksFolderDashboardLinkHere",


//============== OPTIONAL TO EDIT - WORKS AS INTENDED W/ DEFAULTS ==============//

/*
. These are some settings that you can change to customize your experience.
. They are declared in the myag_main.js file, but it's possible to override them here
. To edit a setting, uncomment its line (remove the //) and change its value
. (comes after =). The pre-written values copy the default values, so you
. gotta change them if you want other action
*/

/*
display fullsize view button in overlay image viewer (true/false)
*/
//myag.settings.fullButton = true, 

/*
if an artwork has a name or an about-it -- display it in overlay image viewer (true/false)
*/
//myag.settings.viewerSideInfo = true,

/*
type of pagination used -- "none", "pages" or "append". set for main and
group display separately. 
"none": use no pagination, load everything at once, slow but simplest.
"pages" is tumblr-style page-number footer. less fluid (bah) but has
an upside of clearer navigation and robust URL location and easy on RAM.
"append" is like twitter - autoload more pictures as you scroll far enough
NB! if you send a link to an artwork far below on an "append" paginated deploy,
it WILL get loaded, but when the big overlay view is closed, the page itself
will have to be scrolled down to see it again, huge loading times otherwise.
basically, i suggest using "pages", but "append" is here for whoever needs it.
*/
//myag.settings.pagingIndex = "pages",
//myag.settings.pagingGroup = "none",


/*
How many artworks should appear per row, unless specified in target div "artworksPerRow" attribute
*/
//myag.settings.artworksPerRow = 4,

/*
rows of artworks per page, integer. effective if pagination is used.
*/
//myag.settings.rowsPerPage = 4, 

/*
if "pages" is the pagination method, "true" means next page will get loaded
when the user clicks through images in the big overlay. "false" means when
the user reaches the last image on the page, they will wrap around to the
first one.
*/
// myag.settings.nextPageOnWrap = true,

/*
this should be set if the package is being run as an editor-only instance
within neomanager. it's set automatically under normal conditions!
'null' is normal for standalone, no-localhost-manager operation.
Basically, you don't really have to change it unless you know what you're doing.
*/
//myag.settings.remoteImageHost = null,

//============== SETTINGS END - DO NOT CHANGE THE STUFF BELOW ==============//

myag.settings.artworksPerPage = myag.settings.artworksPerRow * myag.settings.rowsPerPage;
myag.navigation.mode = myag.settings.pagingIndex;
