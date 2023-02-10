//==========================================================================//
//================= THIS THING MAKES PANELS OF PICS ========================//
//==========================================================================//

//        HOOK UP MYAG_MAIN.JS BEFORE USING THIS!!!!!

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//


/*
Creates an appendable div based on an Artwork instance
inputs: an Artwork class instance
output: correct DOM element
*/
function myag_ip_generateImgDiv(aw)
{
	
	var img = document.createElement('img');
	img.setAttribute('src', "./artworks/"+aw.filename);

	// onclick will activate a function in myag_viewer.js
	img.setAttribute('onclick', "myag_av_showViewer('"+aw.awid+"');");

	var d = document.createElement('div');
	d.classList.add('artwork');
	d.appendChild(img);

	return d;


}



/*
processes an array of Artwork class instances and appends them to the target div wrapper
inputs: as (array of Artwork instances), target (string, target div id)
output: none
*/
function myag_ip_appendArworks(as, target="artworksWrapper")
{
	GLOBAL_currentlyLoadedArtworks = as; // store loaded selection into the global var

	var t = document.getElementById("artworksWrapper");
	if (t == undefined)
	{
		db("myag_ip_appendArworks: no target found!");
		return null;
	}

	for (var c = 0; c < as.length; c++)
	{
		var aw = myag_ip_generateImgDiv(as[c]);
		t.appendChild(aw);
	}
}