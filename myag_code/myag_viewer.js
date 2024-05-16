//==========================================================================//
//==================== ARTWORK VIEWER THING HANDLER ========================//
//==========================================================================//

/*
pre-import requirements:
	myag_general.js
	myag_panel.js
*/

myag.viewer = {

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

wrapperObject: undefined,
state:  false,
toggleTimeout: undefined,

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

createArtworkViewer: function()
{


	var target = document.getElementById('artworkViewerWrapper');

	if (target == undefined)
	{
		db("createArtworkViewer: #artworkViewerWrapper not found!");
		return null;
	}

	target.setAttribute("onclick", "myag.viewer.hideViewer();")

	var p1 = document.createElement('p');
	var p3 = document.createElement('p');
	p1.innerHTML = "<";
	p3.innerHTML = ">";

	var sidebarLeft = document.createElement('div');
	var viewField = document.createElement('div');
	var sidebarRight = document.createElement('div');

	sidebarLeft.id = 'artworkViewerSidebar1';
	sidebarLeft.classList.add('artworkViewerSidebar');
	sidebarLeft.setAttribute('onclick', 'myag.viewer.jump(false);');
	viewField.id = 'artworkViewer';
	sidebarRight.id = 'artworkViewerSidebar2';
	sidebarRight.classList.add('artworkViewerSidebar');
	sidebarRight.setAttribute('onclick', 'myag.viewer.jump(true);');

	sidebarLeft.appendChild(p1);
	sidebarRight.appendChild(p3);

	viewField.appendChild(sidebarLeft);
	viewField.appendChild(sidebarRight);

	about = document.createElement('div');
	about.id = "artworkViewerAbout";
	about.style.display = "none"; // make it initially invisible so that there is no flickering on first load
	about.setAttribute("onclick", "event.stopPropagation()")

	if (myag.settings.fullButton)
	{
		full = document.createElement('p');
		full.id = "artworkViewerFull";
		full.innerHTML = "fullsize view";
		full.setAttribute("onclick", "myag.viewer.openFullView()");
		viewField.appendChild(full)
	}

	viewField.setAttribute("onclick", "event.stopPropagation()")
	
	target.appendChild(viewField);
	target.appendChild(about);

	return target;
},


putToViewer: function(aw_id)
{
	var aw = myag.getArtworkById(aw_id)
	var img = document.getElementById('artworkViewer');
	img.style.backgroundImage = `url('${myag.artworksFolder+aw.filename}')`;
	myag.viewer.wrapperObject.setAttribute('awid', aw.awid);
	bmco.getParamWrite('id', aw.awid); // put get param to URL so users can share an image directly
	var a = document.getElementById('artworkViewerAbout');
	if (myag.settings.about)
	{
		html = "";

		if (aw.name != "")
			html += "<span class='artworkViewerAboutName'>"+aw.name+"</span><br><br>"
		html += aw.about;
		a.innerHTML = html;			
		aw.about.length != 0? a.style.display = "block" : a.style.display = "none";
	}
	else
		a.style.display = "none";
},

/*shows artwork by an artwork id */
showViewer: function(aw_id)
{
	if (!myag.viewer.state)
	{
		if (myag.viewer.wrapperObject == undefined)
				return null;

		clearTimeout(myag.viewer.toggleTimeout);	
		myag.viewer.wrapperObject.style.display = "block";
		myag.viewer.toggleTimeout = setTimeout(() => {
		  myag.viewer.wrapperObject.style.opacity = 1;	
		}, 50) // yes, a js clutch, what did you expect :D

		myag.viewer.state = true;
		if (aw_id != null)
			myag.viewer.putToViewer(aw_id);
			
	}
},

jump: function(dir)
{
	var target = myag.viewer.wrapperObject.getAttribute('awid');
	if (target == null)
	return null; // this means there's nothing loaded at all (non soosible)
	aw = undefined;
	for (var t = 0; t < myag.artworks.length; t++)
	{

		if (myag.artworks[t].awid == target) // we found current artwork...
		{
			if (dir) // fwd
			{
				t += 1;
				if (t == myag.artworks.length)
				{
					t = 0;  //wrap around
					if (myag.settings.nextPageOnWrap && myag.settings.pagingIndex == "pages")
					{
						currentPage += 1;
						if (currentPage == pagesTotal)
							currentPage = 0;
						myag.ip.goto(currentPage);
					}
				}
				
			}
			else  // bwd
			{
				t -= 1;
				if (t == -1)
				{
					t = myag.artworks.length-1; //wrap around
					if (myag.settings.nextPageOnWrap && myag.settings.pagingIndex == "pages")
					{
						currentPage -= 1;
						if (currentPage == -1)
							currentPage = pagesTotal - 1;
						myag.ip.goto(currentPage);
						t = myag.artworks.length-1; // redo
					}
				}
				
			}
			aw = myag.artworks[t];
			break;
		}
	}
	myag.viewer.putToViewer(aw.awid);
	
},

/*
button handler to hide the image viewer
inputs: none
output: none
*/
hideViewer: function()
{
	if (myag.viewer.state)
	{
		clearTimeout(myag.viewer.toggleTimeout);
		myag.viewer.wrapperObject.style.opacity = 0;	
		myag.viewer.toggleTimeout = setTimeout(() => {
		  
			myag.viewer.wrapperObject.style.display = "none";
		}, 300) // aaand another one
		bmco.getParamDelete('id'); // delete the artwork GET field
		myag.viewer.state = false;
	}
},

/*
'full' button handler. goes to a full image view with correct GET params
inputs: none
output: none
*/
openFullView: function()
{
	if (myag.viewer.wrapperObject == undefined)
		return null; // do nothing if the viewer has nothing loaded up

	url = "./image.html?id="+myag.viewer.wrapperObject.getAttribute('awid');
	window.location = url;
},

/*
startup function that executes on every page with a viewer enabled (index and group by default)
inputs: none
outputs: none
*/
startup: function(){

	myag.viewer.wrapperObject = myag.viewer.createArtworkViewer();	
	myag.viewer.wrapperObject.style.opacity = 0;
	myag.viewer.wrapperObject.style.display = "none";
	myag.viewer.wrapperObject.setAttribute('awid', null); // stores curent artwork's id
														   // as an html tag attribute.
														   // yes i am a good programmer :D
	var awid = bmco.getParamRead('id');
	if (awid != null)
	{
		myag.viewer.showViewer(awid);
	}
}

//==========================================================================//
//=============================== LIBRARY END ==============================//
//==========================================================================//

}

myag.viewer.startup();

