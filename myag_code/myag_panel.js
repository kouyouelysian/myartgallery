//==========================================================================//
//============== LOADS PANELS OF PICS AND PAGE NAVIGATION ==================//
//==========================================================================//

/*
pre-import requirements:
  myag_main.js
  settings.js (in myag_user/)
*/

myag.panel = {

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/* pagination-type-minding wrapper for myag.ip.appendArworksRange.
inputs: as <Artwork object array> [array of loaded Artwork objects], 
		type <string> [pagination type -- either "none", "append" or "pages"]
		reverse <bool> [should the artworks be loaded up in reverse order or not]
		target <string> [parent to append pagination to]
return: whatever the called functions return (supposed none) */
appendArworks: function(as, type="none", reverse=false, target="artworksWrapper")
{
	if (type == "none")
		return myag.ip.appendArworksRange(as, 0, as.length, true, target)
	else if (type == "append")
		return myag.ip.appendArworksRange(as, 0, as.length, false, target)
	else if (type == "pages")
		return myag.ip.appendArworksRange(as, myag.currentPage*myag.artworksPerPage, (myag.currentPage+1)*myag.artworksPerPage, true, target)
},

/* 'switch function' to initialize the panel. called from myag.index.js and myag.group.js
to start things up.
inputs: artworks <Artwork object array> [array of loaded Artwork objects],
		type <string> [pagination type -- either "none", "append" or "pages"]
		reverse <bool> [should the artworks be loaded up in reverse order or not]
		target <string> [parent to append pagination to]
return: whatever the called functions return (supposed none)
*/
initArtworks: function(as, type="none", reverse=false, target="artworksWrapper")
{
	if (type == "none")
		return myag.ip.appendArworksRange(as, 0, as.length, true, target);
	else
	{
		myag.artworksPerPage = myag.settings.rowsPerPage * myag.ip.getArtworksPerRow();
		return myag.ip.addPagination(as, type);
	}
},

/* 'switch function' to generate the selected pagination type elements and so on
inputs: artworks <Artwork object array> [array of loaded Artwork objects],
		type <string> [pagination type -- either "none", "append" or "pages"]
		target <string> [parent to append pagination to]
return: none
*/
addPagination: function(artworks, type, target="artworksWrapper")
{
  if (type == "none")
    return

  else 
  {
    t = document.getElementById(target);
    if (t == null)
    {
      db("myag.addPagination: target div "+target+" not found");
      return;
    }

    myag.pagesTotal = Math.ceil(artworks.length / myag.artworksPerPage);

    if (type == "pages")
    	myag.ip.makePaginationPages(artworks, t);
    else if (type == "append")
		myag.ip.makePaginationAppend(artworks, t);

    myag.usedPaginationType = type;

    window.dispatchEvent(myag.ip.awLoaded);

  }
},

/* generates the page-style pagination (tumblr-style default option) and loads up the first page
inputs: artworks <Artwork object array> [array of loaded Artwork objects]
		parent <DOM element> [parent to append pagination to]
return: none
*/
makePaginationPages: function(artworks, parent)
{
    pagination = document.createElement("div");
    pagination.id = "paginationPages";
      
    prev = document.createElement("p");
    prev.innerHTML = "&lt;";
    prev.classList.add("paginationArrow");
    prev.setAttribute("onclick", "myag.ip.prev()");
    next = document.createElement("p");
    next.innerHTML = "&gt;";
    next.classList.add("paginationArrow");
    next.setAttribute("onclick", "myag.ip.next()");
      

    pagination.appendChild(prev);
    for (x=0; x<myag.pagesTotal; x++)
    {
    	var temp = document.createElement("p");
    	temp.innerHTML = String(x+1);
    	temp.classList.add("paginationPageLink");
    	temp.setAttribute("onclick", "myag.ip.goto("+String(x)+")");
    	pagination.appendChild(temp);
    }
    pagination.appendChild(next);
    parent.parentNode.insertBefore(pagination, parent.nextSibling);


    getPage = bmco_getParamRead("page");
    if (getPage == null)
    	myag.ip.goto(0, generateGetParam=false);
    else
    {
    	getPage = parseInt(getPage);
     	if (getPage == NaN)
      		myag.ip.goto(0, generateGetParam=false);
    	else
    		myag.ip.goto(getPage);
    }
},

/* Function to load Nth page for 'pages' style pagination
inputs: n <int> [page number, gets validated inside the function]
		generateGetParam <bool> [if the function should update url's GET to contian the page number]
return: none
*/
goto: function(n, generateGetParam=true)
{

 	// validate stuff
 	if ((n < 0) || (n > myag.pagesTotal))
 	{
		db("myag.ip.goto: page number "+String(n)+" out of bounds");
    	return;
	}

	page = parseInt(n);
	if (page == NaN)
	{
		db("myag.ip.goto: page number arg "+String(n)+" is not integer");
		return;
	}

	myag.currentPage = page; 
	myag.ip.appendArworks(myag.loadedArtworks, type="pages");	

 	pageLinks = document.getElementsByClassName("paginationPageLink");

	for (x=0; x<pageLinks.length; x++)
	{
		if (x == myag.currentPage)
			pageLinks[x].classList.add("paginationPageSelected");
		else
			pageLinks[x].classList.remove("paginationPageSelected");
	}

	arrows = document.getElementsByClassName("paginationArrow");
	arrows[0].style.removeProperty("color");
	arrows[1].style.removeProperty("color");
	if (myag.currentPage == 0)
		arrows[0].style.color = "var(--col-body)";
	if (myag.currentPage == myag.pagesTotal - 1)
		arrows[1].style.color = "var(--col-body)";


	if (generateGetParam)
		bmco_getParamWrite("page", myag.currentPage);
  
},

/* special case of myag.ip.goto() - go to next page relatively to the currently loaded one
inputs: none
return: none 
*/
next: function()
{
	if (myag.currentPage + 1 == myag.pagesTotal)
		return;
	myag.ip.goto(myag.currentPage + 1);
},

/* special case of myag.ip.goto() - go to previous page relatively to the currently loaded one
inputs: none
return: none 
*/
prev: function()
{
	if (myag.currentPage == 0)
		return;
	myag.ip.goto(myag.currentPage - 1);

},

/* create pagination for a twitter-style manually-appending pagination
inputs: artworks <Artwork object array> [array of loaded Artwork objects]
		parent <DOM element> [parent to append pagination to]
return: none
*/
makePaginationAppend: function(artworks, parent)
{
	button = document.createElement("div");
	button.id = "paginationMoreTrigger";
	parent.parentNode.insertBefore(button, parent.nextSibling);

	myag.ip.appendArworksRange(artworks, 0, myag.artworksPerPage, true);

	document.addEventListener('scroll', myag.ip.loadMore);
	const t = setTimeout(myag.ip.loadMore, 100); // prevents a "screen with one row stuck forever" cornercase
												 // a bit crutchy... i will figure a better way someday.

},

loadAllowed: function()
{
	target = document.getElementById("paginationMoreTrigger");
	if (window.scrollY+window.innerHeight-250 >= target.getBoundingClientRect().top)
		return true;
	if (target.getBoundingClientRect().top <= window.innerHeight)
		return true;
	return false;
},

/* append another "page" of artworks to the already loaded ones.
inputs: none
return: none
*/
loadMore: function()
{
	
	if (myag.ip.loadAllowed())
	{
		myag.currentPage += 1;
		myag.ip.appendArworksRange(myag.loadedArtworks, myag.currentPage*myag.artworksPerPage, (myag.currentPage+1)*myag.artworksPerPage, false);
		if (myag.currentPage >= myag.pagesTotal-1) // remove the button if we loaded everything
		{
			document.removeEventListener('scroll', myag.ip.loadMore);
			document.getElementById("paginationMoreTrigger").remove();
		}
	}
},

/* get the user-set number of artworks per row, now using a less dirty hack
inputs: none
return: <integer> int-parsed value of the --artworks-per-row CSS variable
*/
getArtworksPerRow: function()
{
	return parseInt(getComputedStyle(document.body).getPropertyValue('--artworks-per-row'));
},

//==========================================================================//
//=============================== LIBRARY END ==============================//
//==========================================================================//

}