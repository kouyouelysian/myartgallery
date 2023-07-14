/* EDIT THESE TO CHANGE THE BASIC ENGINE SETTINGS */



//========MANDATORY TO EDIT - WON'T WORK NICELY WITHOUT IT========//

// set this to the link which appears in the page address line
// when you edit the 'data.xml' document!
SETTING_neocitiesXmlFileEditLink    = "pastelinkhere";

// set this to the link which appears in the page address line
// when you are in the neocities folder view, in "artworks" folder!
SETTING_neocitiesArtworksFolderLink = "pastelinkhere";

//========OPTIONAL TO EDIT - WORKS AS INTENDED W/ DEFAULTS========//

// name for your page - displayed in the tab text.
// Edit the string to your liking, e.g "Aubery's Gallery", with
// double quotes! don't put other double quotes in the name. 
SETTING_title           = "MyArtGallery";

// display fullsize view button in overlay image viewer
SETTING_fullButton      = true; 

// if artwork has a name or an about-it -- display it in overlay image viewer
SETTING_about           = true;

// type of pagination used -- "none", "pages" or "append". set for main and
// group display separately. 
// "none" = use no pagination, load everything at once; slow but simplest.
// "pages" is tumblr-style page-number footer. less fluid (bah) but has
// an upside of clearer navigation and robust URL location and easy on RAM.
// "append" is like twitter - autoload more pictures as you scroll far enough
// NB! if you send a link to an artwork far below on an "append" paginated deploy,
// it WILL get loaded, but when the big overlay view is closed, the page itself
// will have to be scrolled down to see it again; huge loading times otherwise.
// basically, i suggest using "pages", but "append" is here for whoever needs it.
SETTING_pagingIndex     = "pages";
SETTING_pagingGroup     = "none";

// rows of artworks per page, integer. effective if pagination is used.
SETTING_rowsPerPage     = 1; 

// if "pages" is the pagination method, "true" means next page will get loaded
// when the user clicks through images in the big overlay. "false" means when
// the user reaches the last image on the page, they will wrap around to the
// first one.
SETTING_nextPageOnWrap  = true;

// this should be set if the package is being run as an editor-only instance
// within neomanager. it's set automatically under normal conditions!
// 'null' is normal for standalone, no-localhost-manager operation.
SETTING_remoteImageHost = null;