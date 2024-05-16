//==========================================================================//
//============= BRIGHT MOON CO. NEOMANAGER FRONTEND CODE ===================//
//==========================================================================//

/*
pre-import requirements:
	bmco.js
*/

bmco.nm = {

//==========================================================================//
//=============================== CLASSES ==================================//
//==========================================================================//



/* shows/hides the channel adding form
inputs: state <bool> [requested state]
return: none
*/
channelAddFormToggle: function(state)
{
	var target = document.getElementById("channelAddForm");
	if (target == undefined)
		return;
	var styleLine = "display: none";
	if (state)
		target.removeAttribute("style");
	else
		target.setAttribute("style", styleLine);


},

/* Confirms a selection of a channel kind, reveals its setup options
inputs: selectorElement <DOM element> [passed as 'this' in sekector onclick,
		contains 'kind' attr.]
return: none
*/
channelSourceSelect: function(selectorElement)
{
	var kind = selectorElement.getAttribute("kind");
	if (kind == undefined)
		return;

	var channelKindInput = document.getElementById("channelAddFormKind");
	channelKindInput.setAttribute("value", kind);
	bmco.removeAttributeForAllElementsOfClass("sourceSelector", "id");
	selectorElement.setAttribute("id", "sourceSelectorActive");

	bmco.setAttributeForAllElementsOfClass("sourceOption", "style", "display: none")
	bmco.removeAttributeForAllElementsOfClass("optFor_"+kind, "style");
},


/* Function called by the channel installation form submit button.
inputs: none
return: none
*/
addChannelFormSubmit: function()
{
	// verify the channel kind
	var kind = document.getElementById('channelAddFormKind').value;
	if (kind == null || kind.length == 0)
		return bmco.popup_alert("Please, select the channel kind above the form first!");
	
	// verify the channel naming
	var name = document.getElementById('channelAddFormName').value;
	if (name == null || name.trim() == 0)
		return bmco.popup_alert("Channel name cannot be empty or all-spacebars!");
	if (name.length > 64)
		return bmco.popup_alert("Channel name cannot be over 64 symbols long!");
	document.getElementById('channelAddFormName').value = name.trim(); // replace with trimmed ver., just in case

	// aggregate all source-specific options as json into a hidden text element
	// we never know what those options are called, so we can't make a universal routine in app.py easily
	var optTags = document.getElementsByClassName("sourceOption");
	var neededOptsClass = "optFor_"+kind;
	var opts = [];

	while (optTags.length > 0)
	{
		if (optTags[0].tagName.toLowerCase() == "input" && optTags[0].classList.contains(neededOptsClass))
		{
			var v = optTags[0].getAttribute("value");
			if (optTags[0].getAttribute("type") == "checkbox") // STUPID CHECKBOX HTML!!!!
			{
				if (optTags[0].checked)
					v = true;
				else
					v = false; 
			}

			var dic = {
				name: optTags[0].getAttribute('name'),
				type: optTags[0].getAttribute("type"),
				value: v
			}
			opts.push(dic);
		}
		optTags[0].remove();
	}

	if (opts.length > 0) // if the channel we installed had some options and we found them - push to the hidden input
		document.getElementById('channelAddFormOptions').value = JSON.stringify(opts);

	// submit the form
	bmco.nm.formSubmit("channelAddForm");
},

/* Submits a form by its id
inputs: fid <string> [form element's id]
return: none
*/
formSubmit: function(fid)
{
	bmco.gui.loadingSpinnerCreate();
	document.getElementById(fid).submit();
},

channelView: function(sitename, location)
{
	var url = "https://"+sitename+".neocities.org/"+location;
	bmco.urlOpen(url);
},

channelManage: function(chid)
{
	window.location.href = "/m/"+chid;
},

channelConfirmRemove: function(chid)
{
	var fn = "channelRemove('" + chid + "')";
	bmco.gui.popupConfirm("Really delete?", fn);
},

channelRemove: function(chid)
{
	document.getElementById("removedChannelId").value = chid;
	formSubmit("channelRemoveForm"); 
}





//==========================================================================//
//=============================== LIBRARY END ==============================//
//==========================================================================//

};
