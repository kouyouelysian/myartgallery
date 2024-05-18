//==========================================================================//
//============== LOADS PANELS OF PICS AND PAGE NAVIGATION ==================//
//==========================================================================//

/*
pre-import requirements:
	myag_main.js
	settings.js (in myag_user/)
*/

myag.pages = {

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/* 'switch function' to generate the selected pagination type elements and so on
inputs: artworks <Artwork object array> [array of loaded Artwork objects],
		type <string> [pagination type -- either "none", "append" or "pages"]
		target <string> [parent to append pagination to]
return: none
*/
addPagination: function(targetElem)
{
	if (!targetElem)
		return;
	myag.pagesTotal = Math.ceil(myag.data.artworks.length / myag.settings.artworksPerPage);
	switch (myag.navigation.mode)
	{
		case "none": return;
		case "pages": return myag.pages.makePaginationPages(targetElem);
		case "append": return myag.pages.makePaginationAppend(targetElem);
	}	
},

/* generates the page-style pagination (tumblr-style default option) and loads up the first page
inputs: parent <DOM element> [parent to append pagination to]
return: none
*/
makePaginationPages: function(parent)
{
			
		var makeNavArrow = function(content, action) {
			arrow = document.createElement("p");
			arrow.innerHTML = content;
			arrow.classList.add("paginationArrow");
			arrow.setAttribute("onclick", action);
			return arrow;
		}

		pagination = document.createElement("div");
		pagination.id = "paginationPages";

		pagination.appendChild(makeNavArrow("&lt;", "myag.pages.pagePrev()"));
		
		for (x=0; x<myag.pagesTotal; x++)
		{
			var pageMarker = document.createElement("p");
			pageMarker.innerHTML = String(x+1);
			pageMarker.classList.add("paginationPageLink");
			pageMarker.setAttribute("onclick", "myag.pages.pageJump("+String(x)+")");
			pagination.appendChild(pageMarker);
		}

		pagination.appendChild(makeNavArrow("&gt;", "myag.pages.pageNext()"));
		parent.parentNode.insertBefore(pagination, parent.nextSibling);

		getPage = bmco.getParamRead("page");
		if (getPage == null)
		{
			getPage = parseInt(getPage);	
			if (!isNaN(getPage))
				return myag.pages.pageJump(getPage);
		}
		return myag.pages.pageJump(0, generateGetParam=false);
},

pageVisible: function(n, visible=true)
{
	var elems = document.getElementsByClassName("artwork");
	var start = 0;
	var end = elems.length;
	if (n != "all")
	{
		start = myag.settings.artworksPerPage*n;
		end = start + myag.settings.artworksPerPage;
		if (end > elems.length)
			end = elems.length;
	}
	for (var x = start; x < end; x++)
		visible? elems[x].classList.remove("invisible") : elems[x].classList.add("invisible");
},

/* Function to load Nth page for 'pages' style pagination
inputs: n <int> [page number, gets validated inside the function]
		writeGetParam <bool> [if the function should update url's GET to contian the page number]
return: none
*/
pageJump: function(n, writeGetParam=true)
{
	if ((n < 0) || (n > myag.pagesTotal))
		return
	page = parseInt(n);
	if (page == NaN)
		return;

	myag.navigation.counter = page; 	
	myag.pages.pageVisible("all", false);
	myag.pages.pageVisible(myag.navigation.counter, true);	

	pageMarkers = document.getElementsByClassName("paginationPageLink");
	bmco.ofClassRemoveClass("paginationPageLink", "paginationPageSelected");
	pageMarkers[myag.navigation.counter].classList.add("paginationPageSelected");

	myag.pages._paginationArrowsUpdate();

	if (writeGetParam)
		bmco.getParamWrite("page", myag.navigation.counter);
},

/* special case of myag.pages.pageJump() - go to next page relatively to the currently loaded one
inputs: none
return: none 
*/
pageNext: function()
{
	if (myag.navigation.counter + 1 == myag.pagesTotal)
		return;
	myag.pages.pageJump(myag.navigation.counter + 1);
},

/* special case of myag.pages.pageJump() - go to previous page relatively to the currently loaded one
inputs: none
return: none 
*/
pagePrev: function()
{
	if (myag.navigation.counter == 0)
		return;
	myag.pages.pageJump(myag.navigation.counter - 1);

},

_paginationArrowsUpdate() {
	arrows = document.getElementsByClassName("paginationArrow");
	arrows[0].style.removeProperty("color");
	arrows[1].style.removeProperty("color");
	if (myag.navigation.counter == 0)
		arrows[0].style.color = "var(--col-body)";
	if (myag.navigation.counter == myag.pagesTotal - 1)
		arrows[1].style.color = "var(--col-body)";

},

/* create pagination for a twitter-style manually-appending pagination
inputs: parent <DOM element> [parent to append pagination to]
return: none
*/
makePaginationAppend: function(parent)
{
	showMoreMarker = document.createElement("div");
	showMoreMarker.id = "paginationMoreTrigger";
	parent.parentNode.insertBefore(showMoreMarker, parent.nextSibling);

	myag.pages.pageVisible(0);

	document.addEventListener('scroll', myag.pages.loadMore);
	const t = setTimeout(myag.pages.loadMore, 100); // prevents a "screen with one row stuck forever" cornercase
												 // a bit crutchy... i will figure a better way someday
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
	if (!myag.pages.loadAllowed())
		return;

	myag.navigation.counter += 1;
	myag.pages.pageVisible(myag.navigation.counter);
	if (myag.navigation.counter >= myag.pagesTotal-1) // remove the button if we loaded everything
	{
		document.removeEventListener('scroll', myag.pages.loadMore);
		document.getElementById("paginationMoreTrigger").remove();
	}
},

/* get the user-set number of artworks per row, now using a less dirty hack
inputs: none
return: <integer> int-parsed value of the --artworks-per-row CSS variable
*/
getArtworksPerRow: function()
{
	return parseInt(getComputedStyle(document.body).getPropertyValue('--artworks-per-row'));
}

//==========================================================================//
//=============================== LIBRARY END ==============================//
//==========================================================================//

}