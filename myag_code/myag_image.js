//==========================================================================//
//================ SPECIFIC STUFF FOR FULL IMAGE VIEW ======================//
//==========================================================================//

/*
pre-import requirements:
	bmco.js
	bmco_xml.js
	bmco_infra.js
	myag.main.js

*/

myag.image = {

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

targetId    : undefined, // this should become the xml entry id
artworkObject : undefined, // and should become an Artwork instance						
returnUrl   : undefined, // url for the 'back' page.
linkTimeout : undefined,

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/* sends the user back on the button press
inputs: none (reads myag.image.returnUrl)
return: none
*/
back: function()
{
	if (myag.image.returnUrl == undefined)
	{
		window.history.back();
	}
	else
	{
		window.location = myag.image.returnUrl;
	}
},

/* copies the page link to share on share button click
inputs: none
return: none
*/
share: function()
{
	var target = document.getElementById("shareText");
	target.innerHTML = "Link copied!";
	target.style.color = "var(--col-text-light)";

	clearTimeout(myag.image.linkTimeout);
	myag.image.linkTimeout = window.setTimeout(function() {
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
},

/* initiates download of the displayed image file.
inputs: none
return: none
*/
download: function() {

	// thank you johnpyp
	// https://stackoverflow.com/questions/45831191/generate-and-download-file-from-js#45831280

    var element = document.createElement('a');
    element.setAttribute('href', myag.artworksFolder+myag.image.artworkObject.filename);
    element.setAttribute('download', myag.image.artworkObject.filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
},


/* image full view page startup function
inputs: none
return: none
*/
startup: function()
{
	myag.image.targetId = bmco.getParamRead("id");
	if (myag.image.targetId === null)
		window.location = "./index.html"; // go to index if no id param

	myag.image.artworkObject = myag.data.artworks.itemById(myag.image.targetId);
	if (myag.image.artworkObject == undefined)
		window.location = "./index.html"; // go to index if id param not valid
	
	var img = document.getElementById('fullViewImage');
	img.style.backgroundImage = `url('${myag.artworksFolder}${myag.image.artworkObject.filename}')`;

	if (myag.image.artworkObject.about)
		document.getElementById('about').innerHTML = myag.image.artworkObject.about;
	else
	{
		document.getElementById('about').remove();
		document.getElementById('hrAbout').remove();
	}		

	if (myag.image.artworkObject.name)
		document.getElementById('name').innerHTML = myag.image.artworkObject.name;
	else
	{
		document.getElementById('name').remove();
		document.getElementById('hrName').remove();
	}

	if(document.referrer.split('/')[2]!=location.hostname)
		myag.image.returnUrl = "./index.html";
	else
	    myag.image.returnUrl = undefined;

},

//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

};

window.addEventListener("artworksLoaded", (event) => { myag.image.startup(); });
