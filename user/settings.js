/* EDIT THESE TO CHANGE THE BASIC ENGINE SETTINGS */



//========MANDATORY TO EDIT - WON'T WORK NICELY WITHOUT IT========//

// set this to the link which appears in the page address line
// when you edit the 'data.xml' document!
SETTING_neocitiesXmlFileEditLink    = "pastelinkhere";

// set this to the link which appears in the page address line
// when you are in the neocities folder view, in "artworks" folder!
SETTING_neocitiesArtworksFolderLink = "pastelinkhere";



//========OPTIONAL TO EDIT - WORKS AS INTENDED W/ DEFAULTS========//

// display artworks top-down as they appear in the textual editor view
SETTING_loadTopDown     = true;

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