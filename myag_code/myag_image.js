//==========================================================================//
//================ SPECIFIC STUFF FOR FULL IMAGE VIEW ======================//
//==========================================================================//

/*
pre-import requirements:
	bmco_xml.js
	myag_main.js
*/

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

GLOBAL_targetId    = undefined; // this should become the xml entry id
GLOBAL_fullArtwork = undefined; // and should become an Artwork instance
 								// (declared in main) after the page loads up

GLOBAL_returnUrl   = undefined; // url for the 'back' page.
								// redirects to index if user came from the outside
								// to the previous page if from a link on this site

GLOBAL_linkTimeout = undefined;


//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//


/* checks the url for what's in the "id" GET parameter, if empty returns null
inputs: none
return: 'id' GET field contents
*/
function myag_im_readGetFromUrl()
{
	// thanks Franklin Yu 
	// https://stackoverflow.com/questions/814613/how-to-read-get-data-from-a-url-using-javascript
	let params = new URLSearchParams(location.search);
	artworkid = params.get('id');
	return artworkid;
}

/* sends the user back on the button press
inputs: none (reads GLOBAL_returnUrl)
return: none
*/
function myag_im_back()
{
	if (GLOBAL_returnUrl == undefined)
	{
		window.history.back();
	}
	else
	{
		window.location = GLOBAL_returnUrl;
	}
}

/* copies the page link to share on share button click
inputs: none
return: none
*/
function myag_im_share()
{
	var target = document.getElementById("shareText");
	target.innerHTML = "Link copied!";
	target.style.color = "var(--col-text-light)";

	clearTimeout(GLOBAL_linkTimeout);
	GLOBAL_linkTimeout = window.setTimeout(function() {
		t = document.getElementById("shareText");
		t.innerHTML = "Share";
		t.style.color = "var(--col-highlight)";
	}, 3000);

	// thank you w3
	// https://www.w3docs.com/snippets/javascript/how-to-copy-the-text-to-the-clipboard-with-javascript.html
	text = window.location.href;
    navigator.clipboard.writeText(text).then(() => {
              // nice
		return;
	})
	.catch(err => {
		alert('Could not copy, please copy the link manually! ', err);
	});
}

/* initiates download of the displayed image file.
inputs: none
return: none
*/
function myag_im_download() {

	// thank you johnpyp
	// https://stackoverflow.com/questions/45831191/generate-and-download-file-from-js#45831280

    var element = document.createElement('a');
    element.setAttribute('href', GLOBAL_artworksFolder+GLOBAL_fullArtwork.filename);
    element.setAttribute('download', GLOBAL_fullArtwork.filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}


/* image full view page startup function
inputs: none
return: none
*/
function myag_im_startup()
{
	GLOBAL_targetId = myag_im_readGetFromUrl();
	if (GLOBAL_targetId === null)
		window.location = "./index.html"; // go to index if no id param

	myag_getArtworkAll().then(function(artworks) {
		for (var t = 0; t < artworks.length; t++)
		{

			var ta = artworks[t];
			if (ta.awid == GLOBAL_targetId)
			{
				GLOBAL_fullArtwork = ta;
				break;
			}
		}
		if (GLOBAL_fullArtwork == undefined)
			window.location = "./index.html"; // go to index if id param not valid
		


		var img = document.getElementById('fullViewImage');
		var file = "url('"+GLOBAL_artworksFolder+GLOBAL_fullArtwork.filename+"')";
		console.log(file);
		img.style.backgroundImage = file
		
		var name  = document.getElementById('fullViewTextName');
		var about = document.getElementById('fullViewTextAbout');



		name.innerHTML = GLOBAL_fullArtwork.name;
		about.innerHTML = GLOBAL_fullArtwork.about;

		if (GLOBAL_fullArtwork.about == "")
		{
			document.getElementById('fullViewTextAboutWrapper').remove();
			document.getElementById('postAboutHr').remove();
		}


		if(document.referrer.split('/')[2]!=location.hostname)
			GLOBAL_returnUrl = "./index.html";
		else
		    GLOBAL_returnUrl = undefined;
	});	
}


myag_im_startup();