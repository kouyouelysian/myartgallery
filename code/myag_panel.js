//==========================================================================//
//============== LOADS PANELS OF PICS AND PAGE NAVIGATION ==================//
//==========================================================================//

/*
pre-import requirements:
  myag_main.js
*/

//==========================================================================//
//================================ CONSTANTS ===============================//
//==========================================================================//

// used in other scripts like myag_editor.js to detect when the initial
// set of stuff has been loaded
const myag_ip_awLoaded = new CustomEvent("initialArtworksLoaded");

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//


/* Creates an appendable div based on an Artwork instance
inputs: aw <Artwork> [an Artwork class instance to be visualized]
returns: <DOM element>
*/
function myag_ip_generateArtworkDiv(aw, action=undefined, overlayText=undefined)
{
	var div = document.createElement("div");
	div.classList.add("artwork");
	div.setAttribute("artworkId", aw.awid);

	var onclick = action;
	if (onclick == undefined)
	{
		var onclick = "myag_av_showViewer('"+aw.awid+"')";
		if (myag_isEditor())
			onclick = "myag_ed_showItemMenu('"+aw.awid+"', event)";
	}

	
	
	div.setAttribute("onclick", onclick);
	
	if (aw.filename != undefined)
	{
		var img = document.createElement("img");
		if (SETTING_remoteImageHost == null)
			img.setAttribute("src", "./artworks/"+aw.filename);
		else
			img.setAttribute("src", SETTING_remoteImageHost + "/artworks/"+aw.filename);
		img.classList.add("artworkImg");
		//img.setAttribute("onclick", onclick);
		div.appendChild(img);
	}

	if (overlayText != undefined)
	{
		var para = document.createElement("p");
		para.innerHTML = overlayText;
		div.appendChild(para);
	}
	

	return div;
}

/* Creates an appendable locator div based on an Artwork instance. Is needed
for the XML editor page, unused in the main page itself.
inputs: aw <Artwork> [an Artwork class instance to be visualized]
returns: <DOM element>
*/
function myag_ip_generateArtworkLocatorDiv(aw=undefined)
{
	var locatorWrapper = document.createElement("div");
	locatorWrapper.classList.add("locatorWrapper", "locatorWrapperArtwork");
	locatorWrapper.setAttribute("artworkId", aw.awid);


	var locator = document.createElement("div");
	locator.classList.add("locator");
	locator.setAttribute("title", "Insert artwork here")
	if (aw.awid==undefined)
		locator.setAttribute("onclick", "myag_ed_putArtworkAfter('start')");
	else
		locator.setAttribute("onclick", "myag_ed_putArtworkAfter('"+aw.awid+"')");

	locatorWrapper.appendChild(locator);

	return locatorWrapper;
}

/* generates and appends a single group button to a target.
inputs: aw <Artwork> [source Artwork instance], target <html element> [append target element],
		mode <string> [append mode. 'appendChild', 'prepend' or 'insertAfter']
return: appended artwork div <html element>
*/
function myag_ip_appendSingleArtwork(aw, target, mode="appendChild", action=undefined, text=undefined)
{
	var artwork = myag_ip_generateArtworkDiv(aw, action, text);
	var locator = myag_ip_generateArtworkLocatorDiv(aw);
	myag_appendToGridMode(artwork, locator, target, mode);
	return artwork;
}

/* processes an array of Artwork class instances and appends them to the target div wrapper
inputs: as <array of Artwork objects>
		start <int> [start loading from this 'as' index]
		end <int> [stop loading when this 'as' index encountered]
		renew <bool> [true=rebuild GLOBAL_currentlyLoadedArtworks, false=add to GLOBAL_currentlyLoadedArtworks]
		target <string> [target div id]
return: none
*/
function myag_ip_appendArworksRange(as, start, end, renew=true, target="artworksWrapper")
{
	// validate start/end
	if ((start < 0) || (start > as.length) || (end <= start))
	{
		db("invalid start/end args: "+String(start)+","+String(end))
	}
   
	if (end > as.length) // end more than length is OK - gets clipped
		end = as.length;

	// find and validate append target
	var t = document.getElementById(target);

	if (t == undefined)
	{
		db("myag_ip_appendArworksRange: no target "+target+" found");
		return;
	}

	if (renew)
	{
		displayedArtworks = document.getElementsByClassName("artwork");
		while(displayedArtworks.length > 0){
        	displayedArtworks[0].parentNode.removeChild(displayedArtworks[0]);
    	}
    	GLOBAL_currentlyLoadedArtworks = as.slice(start,end);
	}
	else
		GLOBAL_currentlyLoadedArtworks = GLOBAL_currentlyLoadedArtworks.concat(as.slice(start,end))
	

	for (var c = start; c < end; c++)	 
		myag_ip_appendSingleArtwork(as[c], t);
}

/* pagination-type-minding wrapper for myag_ip_appendArworksRange.
inputs: as <Artwork object array> [array of loaded Artwork objects], 
		type <string> [pagination type -- either "none", "append" or "pages"]
		reverse <bool> [should the artworks be loaded up in reverse order or not]
		target <string> [parent to append pagination to]
return: whatever the called functions return (supposed none) */
function myag_ip_appendArworks(as, type="none", reverse=false, target="artworksWrapper")
{
	if (type == "none")
		return myag_ip_appendArworksRange(as, 0, as.length, true, target)
	else if (type == "append")
		return myag_ip_appendArworksRange(as, 0, as.length, false, target)
	else if (type == "pages")
		return myag_ip_appendArworksRange(as, GLOBAL_currentPage*GLOBAL_artworksPerPage, (GLOBAL_currentPage+1)*GLOBAL_artworksPerPage, true, target)
}

/* 'switch function' to initialize the panel. called from myag_index.js and myag_group.js
to start things up.
inputs: artworks <Artwork object array> [array of loaded Artwork objects],
		type <string> [pagination type -- either "none", "append" or "pages"]
		reverse <bool> [should the artworks be loaded up in reverse order or not]
		target <string> [parent to append pagination to]
return: whatever the called functions return (supposed none)
*/
function myag_ip_initArtworks(as, type="none", reverse=false, target="artworksWrapper")
{
	if (type == "none")
		return myag_ip_appendArworksRange(as, 0, as.length, true, target);
	else
	{
		GLOBAL_artworksPerPage = SETTING_rowsPerPage * myag_ip_getArtworksPerRow();
		return myag_ip_addPagination(as, type);
	}
}

/* 'switch function' to generate the selected pagination type elements and so on
inputs: artworks <Artwork object array> [array of loaded Artwork objects],
		type <string> [pagination type -- either "none", "append" or "pages"]
		target <string> [parent to append pagination to]
return: none
*/
function myag_ip_addPagination(artworks, type, target="artworksWrapper")
{
  if (type == "none")
    return

  else 
  {
    t = document.getElementById(target);
    if (t == null)
    {
      db("myag_addPagination: target div "+target+" not found");
      return;
    }

    GLOBAL_pagesTotal = Math.ceil(artworks.length / GLOBAL_artworksPerPage);

    if (type == "pages")
    	myag_ip_makePaginationPages(artworks, t);
    else if (type == "append")
		myag_ip_makePaginationAppend(artworks, t);

    GLOBAL_usedPaginationType = type;

    window.dispatchEvent(myag_ip_awLoaded);

  }
}

/* generates the page-style pagination (tumblr-style default option) and loads up the first page
inputs: artworks <Artwork object array> [array of loaded Artwork objects]
		parent <DOM element> [parent to append pagination to]
return: none
*/
function myag_ip_makePaginationPages(artworks, parent)
{
    pagination = document.createElement("div");
    pagination.id = "paginationPages";
      
    prev = document.createElement("p");
    prev.innerHTML = "&lt;";
    prev.classList.add("paginationArrow");
    prev.setAttribute("onclick", "myag_ip_prev()");
    next = document.createElement("p");
    next.innerHTML = "&gt;";
    next.classList.add("paginationArrow");
    next.setAttribute("onclick", "myag_ip_next()");
      

    pagination.appendChild(prev);
    for (x=0; x<GLOBAL_pagesTotal; x++)
    {
    	var temp = document.createElement("p");
    	temp.innerHTML = String(x+1);
    	temp.classList.add("paginationPageLink");
    	temp.setAttribute("onclick", "myag_ip_goto("+String(x)+")");
    	pagination.appendChild(temp);
    }
    pagination.appendChild(next);
    parent.parentNode.insertBefore(pagination, parent.nextSibling);


    getPage = bmco_getParamRead("page");
    if (getPage == null)
    	myag_ip_goto(0, generateGetParam=false);
    else
    {
    	getPage = parseInt(getPage);
     	if (getPage == NaN)
      		myag_ip_goto(0, generateGetParam=false);
    	else
    		myag_ip_goto(getPage);
    }
}

/* Function to load Nth page for 'pages' style pagination
inputs: n <int> [page number, gets validated inside the function]
		generateGetParam <bool> [if the function should update url's GET to contian the page number]
return: none
*/
function myag_ip_goto(n, generateGetParam=true)
{

 	// validate stuff
 	if ((n < 0) || (n > GLOBAL_pagesTotal))
 	{
		db("myag_ip_goto: page number "+String(n)+" out of bounds");
    	return;
	}

	page = parseInt(n);
	if (page == NaN)
	{
		db("myag_ip_goto: page number arg "+String(n)+" is not integer");
		return;
	}

	GLOBAL_currentPage = page; 
	myag_ip_appendArworks(GLOBAL_loadedArtworks, type="pages");	

 	pageLinks = document.getElementsByClassName("paginationPageLink");

	for (x=0; x<pageLinks.length; x++)
	{
		if (x == GLOBAL_currentPage)
			pageLinks[x].classList.add("paginationPageSelected");
		else
			pageLinks[x].classList.remove("paginationPageSelected");
	}

	arrows = document.getElementsByClassName("paginationArrow");
	arrows[0].style.removeProperty("color");
	arrows[1].style.removeProperty("color");
	if (GLOBAL_currentPage == 0)
		arrows[0].style.color = "var(--col-body)";
	if (GLOBAL_currentPage == GLOBAL_pagesTotal - 1)
		arrows[1].style.color = "var(--col-body)";


	if (generateGetParam)
		bmco_getParamWrite("page", GLOBAL_currentPage);
  
}

/* special case of myag_ip_goto() - go to next page relatively to the currently loaded one
inputs: none
return: none 
*/
function myag_ip_next()
{
	if (GLOBAL_currentPage + 1 == GLOBAL_pagesTotal)
		return;
	myag_ip_goto(GLOBAL_currentPage + 1);
}

/* special case of myag_ip_goto() - go to previous page relatively to the currently loaded one
inputs: none
return: none 
*/
function myag_ip_prev()
{
	if (GLOBAL_currentPage == 0)
		return;
	myag_ip_goto(GLOBAL_currentPage - 1);

}

/* create pagination for a twitter-style manually-appending pagination
inputs: artworks <Artwork object array> [array of loaded Artwork objects]
		parent <DOM element> [parent to append pagination to]
return: none
*/
function myag_ip_makePaginationAppend(artworks, parent)
{
	button = document.createElement("div");
	button.id = "paginationMoreTrigger";
	parent.parentNode.insertBefore(button, parent.nextSibling);

	myag_ip_appendArworksRange(artworks, 0, GLOBAL_artworksPerPage, true);

	document.addEventListener('scroll', myag_ip_loadMore);
	const t = setTimeout(myag_ip_loadMore, 100); // prevents a "screen with one row stuck forever" cornercase
												 // a bit crutchy... i will figure a better way someday.

}

function myag_ip_loadAllowed()
{
	target = document.getElementById("paginationMoreTrigger");
	if (window.scrollY+window.innerHeight-250 >= target.getBoundingClientRect().top)
		return true;
	if (target.getBoundingClientRect().top <= window.innerHeight)
		return true;
	return false;
}

/* append another "page" of artworks to the already loaded ones.
inputs: none
return: none
*/
function myag_ip_loadMore()
{
	
	if (myag_ip_loadAllowed())
	{
		GLOBAL_currentPage += 1;
		myag_ip_appendArworksRange(GLOBAL_loadedArtworks, GLOBAL_currentPage*GLOBAL_artworksPerPage, (GLOBAL_currentPage+1)*GLOBAL_artworksPerPage, false);
		if (GLOBAL_currentPage >= GLOBAL_pagesTotal-1) // remove the button if we loaded everything
		{
			document.removeEventListener('scroll', myag_ip_loadMore);
			document.getElementById("paginationMoreTrigger").remove();
		}
	}
}

/* get the user-set number of artworks per row, now using a less dirty hack
inputs: none
return: <integer> int-parsed value of the --artworks-per-row CSS variable
*/
function myag_ip_getArtworksPerRow()
{
	return parseInt(getComputedStyle(document.body).getPropertyValue('--artworks-per-row'));
}
