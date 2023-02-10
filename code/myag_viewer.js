//==========================================================================//
//==================== ARTWORK VIEWER THING HANDLER ========================//
//==========================================================================//

//        HOOK UP MYAG_MAIN.JS BEFORE USING THIS!!!!!

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

	var p1 = document.createElement('p');
	var p3 = document.createElement('p');
	p1.innerHTML = "<";
	p3.innerHTML = ">";

	var d1 = document.createElement('div');
	var d2 = document.createElement('div');
	var d3 = document.createElement('div');

	d1.id = 'artworkViewerSidebar1';
	d1.classList.add('artworkViewerSidebar');
	d1.setAttribute('onclick', 'myag_av_jump(false);');
	d2.id = 'artworkViewer';
	d3.id = 'artworkViewerSidebar2';
	d3.classList.add('artworkViewerSidebar');
	d3.setAttribute('onclick', 'myag_av_jump(true);');

	d1.appendChild(p1);
	d3.appendChild(p3);

	// bottombar for d2 (main viewer window)
	var bbar = document.createElement('div');
	bbar.id = "artworkViewerBottomBar";
	d2.appendChild(bbar);
	var img = document.createElement('div');
	img.id = "artworkViewerImg";
	img.setAttribute('alt', 'click to view in full');
	d2.appendChild(img);

	var pExit = document.createElement('p');
	pExit.innerHTML = "Exit";
	var pFull = document.createElement('p');
	pFull.innerHTML = "Full";

	var bExit = document.createElement('div');
	bExit.setAttribute('onclick', 'myag_av_hideViewer();');
	bExit.classList.add('artworkViewerButton');
	bExit.id = "artworkViewerButtonExit";
	bExit.appendChild(pExit);
	var bFull = document.createElement('div');
	bFull.setAttribute('onclick', 'myag_av_openFullView();')
	bFull.classList.add('artworkViewerButton');
	bFull.id = "artworkViewerButtonFull";
	bFull.appendChild(pFull);

	var bw = document.createElement('div'); // prevents changing picture by
	bw.id = "artworkViewerButtonWrapper"   // pressing between the buttons :D
	bw.appendChild(bFull);
	bw.appendChild(bExit);

	target.appendChild(d1);
	target.appendChild(d2);
	target.appendChild(d3);
	target.appendChild(bw);

	


	return target;

}


function myag_av_putToViewer(aw_id)
{
	myag_getArtworkById(aw_id).then(function(aw) {
			
		

		var img = document.getElementById('artworkViewerImg');
		img.style.backgroundImage = "url('./artworks/"+aw.filename+"')";
		GLOBAL_viewerWrapperObject.setAttribute('awid', aw.awid);

		var bar = document.getElementById('artworkViewerBottomBar');
		bar.innerHTML = aw.about;

			
		db(aw.about);
		db(aw.about.length);
		db("REEEEE");
		if (aw.about.length != 0)
		{
			db('show!');
			bar.style.display = "block";
			img.style.height = "calc(96% - 8px - var(--artworkViewerBarHeight))";
		}
		else
		{
			bar.style.display = "none";
			img.style.height = "calc(96% - 8px)";
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
	GLOBAL_viewerWrapperObject.setAttribute('awid', null); // store curent artwork's id
														   // as an html tag attribute.
														   // yes i am a good programmer :D
}


//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

myag_av_startup();


