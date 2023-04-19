//==========================================================================//
//==================== ARTWORK VIEWER THING HANDLER ========================//
//==========================================================================//

//        HOOK UP MYAG_MAIN.JS BEFORE USING THIS!!!!!

//==========================================================================//
//============================= EDITABLE SETTINGS ==========================//
//==========================================================================//

SETTING_fullButton = true; // display fullsize view buttoin
SETTING_about      = true; // display about section

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

GLOBAL_viewerWrapperObject = undefined;
GLOBAL_viewerState         = false;
GLOBAL_viewerToggleTimeout = undefined;


//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

function myag_av_createArtworkViewer()
{


	var target = document.getElementById('artworkViewerWrapper');

	if (target == undefined)
	{
		db("createArtworkViewer: #artworkViewerWrapper not found!");
		return null;
	}

	target.setAttribute("onclick", "myag_av_hideViewer();")

	var p1 = document.createElement('p');
	var p3 = document.createElement('p');
	p1.innerHTML = "<";
	p3.innerHTML = ">";

	var sidebarLeft = document.createElement('div');
	var viewField = document.createElement('div');
	var sidebarRight = document.createElement('div');

	sidebarLeft.id = 'artworkViewerSidebar1';
	sidebarLeft.classList.add('artworkViewerSidebar');
	sidebarLeft.setAttribute('onclick', 'myag_av_jump(false);');
	viewField.id = 'artworkViewer';
	sidebarRight.id = 'artworkViewerSidebar2';
	sidebarRight.classList.add('artworkViewerSidebar');
	sidebarRight.setAttribute('onclick', 'myag_av_jump(true);');

	sidebarLeft.appendChild(p1);
	sidebarRight.appendChild(p3);

	viewField.appendChild(sidebarLeft);
	viewField.appendChild(sidebarRight);

	about = document.createElement('div');
	about.id = "artworkViewerAbout";
	about.style.display = "none"; // make it initially invisible so that there is no flickering on first load
	about.setAttribute("onclick", "event.stopPropagation()")

	if (SETTING_fullButton)
	{
		full = document.createElement('p');
		full.id = "artworkViewerFull";
		full.innerHTML = "fullsize view";
		full.setAttribute("onclick", "myag_av_openFullView()");
		viewField.appendChild(full)
	}

	viewField.setAttribute("onclick", "event.stopPropagation()")
	
	target.appendChild(viewField);
	target.appendChild(about);

	return target;
}


function myag_av_putToViewer(aw_id)
{
	myag_getArtworkById(aw_id).then(function(aw) {
			
		

		var img = document.getElementById('artworkViewer');
		img.style.backgroundImage = "url('./artworks/"+aw.filename+"')";
		GLOBAL_viewerWrapperObject.setAttribute('awid', aw.awid);

		myag_setGetParam('id', aw.awid); // put get param to URL so users can share an image directly

		var a = document.getElementById('artworkViewerAbout');

		if (SETTING_about)
		{
			html = "";

			if (aw.name != "")
			{
				html += "<span class='artworkViewerAboutName'>"+aw.name+"</span><br><br>"
			}

			html += aw.about;

			a.innerHTML = html;

				
			if (aw.about.length != 0)
			{
				a.style.display = "block";

			}
			else
			{
				a.style.display = "none";
			}	
		}
		else
		{
			a.style.display = "none";
		}

		GLOBAL_viewerState = true;

	});	
}

/*shows artwork by an artwork id */
function myag_av_showViewer(aw_id)
{
	if (!GLOBAL_viewerState)
	{
		if (GLOBAL_viewerWrapperObject == undefined)
				return null;

		clearTimeout(GLOBAL_viewerToggleTimeout);	
		GLOBAL_viewerWrapperObject.style.display = "block";
		GLOBAL_viewerToggleTimeout = setTimeout(() => {
		  GLOBAL_viewerWrapperObject.style.opacity = 1;	
		}, 50) // yes, a js clutch, what did you expect :D

		myag_av_putToViewer(aw_id);
			
	}
}

function myag_av_jump(dir)
{
	var target = GLOBAL_viewerWrapperObject.getAttribute('awid');
	if (target == null)
	return null; // this means there's nothing loaded at all (non soosible)
	aw = undefined;
	for (var t = 0; t < GLOBAL_currentlyLoadedArtworks.length; t++)
	{

		if (GLOBAL_currentlyLoadedArtworks[t].awid == target) // we found current artwork...
		{
			if (dir) // fwd
			{
				t += 1;
				if (t == GLOBAL_currentlyLoadedArtworks.length)
				t = 0;  //wrap around
			}
			else  // bwd
			{
				t -= 1;
				if (t == -1)
				t = GLOBAL_currentlyLoadedArtworks.length-1; //wrap around
			}
			aw = GLOBAL_currentlyLoadedArtworks[t];
			break;
		}
	}
	myag_av_putToViewer(aw.awid);
	
}

/*
button handler to hide the image viewer
inputs: none
output: none
*/
function myag_av_hideViewer()
{
	if (GLOBAL_viewerState)
	{
		clearTimeout(GLOBAL_viewerToggleTimeout);
		GLOBAL_viewerWrapperObject.style.opacity = 0;	
		GLOBAL_viewerToggleTimeout = setTimeout(() => {
		  
			GLOBAL_viewerWrapperObject.style.display = "none";
		}, 300) // aaand another one
		myag_deleteGetParam('id'); // delete the artwork GET field
		GLOBAL_viewerState = false;
	}
}

/*
'full' button handler. goes to a full image view with correct GET params
inputs: none
output: none
*/
function myag_av_openFullView()
{
	if (GLOBAL_viewerWrapperObject == undefined)
		return null; // do nothing if the viewer has nothing loaded up

	url = "./image.html?id="+GLOBAL_viewerWrapperObject.getAttribute('awid');
	window.location = url;
}

/*
startup function that executes on every page with a viewer enabled (index and group by default)
inputs: none
outputs: none
*/
function myag_av_startup(){

	GLOBAL_viewerWrapperObject = myag_av_createArtworkViewer();	
	GLOBAL_viewerWrapperObject.style.opacity = 0;
	GLOBAL_viewerWrapperObject.style.display = "none";
	GLOBAL_viewerWrapperObject.setAttribute('awid', null); // stores curent artwork's id
														   // as an html tag attribute.
														   // yes i am a good programmer :D
	var awid = myag_getGetParam('id');
	if (awid != null)
	{
		myag_av_showViewer(awid);
	}
}


//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

myag_av_startup();


