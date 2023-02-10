//==========================================================================//
//================ SPECIFIC STUFF FOR XML EDITOR PAGE ======================//
//==========================================================================//

// EDIT THESE

// set this to the link which appears in the page address line
// when you edit the 'data.xml' document!
USER_neocitiesXmlFileEditLink = "pastelinkhere";


// set this to the link which appears in the page address line
// when you are in the neocities folder view, in "artworks" folder!
USER_neocitiesArtworksFolderLink = "pastelinkhere";

// STOP EDITING

//==========================================================================//
//================================ GLOBAL VARS =============================//
//==========================================================================//

GLOBAL_groupNames = [];
GLOBAL_artworkAwids = [];
GLOBAL_groups    = undefined;
GLOBAL_artworks  = undefined;

/*
// this was used for some testing...
testaw = new Artwork;
testaw.name = "test artwork";
testaw.awid = "1667730569072_fvrjz";
testaw.about = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
testaw.filename = "test2.png";
testaw.groups = ["All", "Furry"];
*/


//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/*
generate an group field div
inputs: gname (group name)
output: div (DOM element)
*/
function myag_ed_generateGfDiv(gname)
{
	var gf  = document.createElement('div');
	gf.classList.add("gf");
	gf.id  = "gf#"  + gname;

	var p1 = document.createElement('p');
	p1.innerHTML = 'group "'+gname +'"';
	p1.id = 'name#'+ gname;
	gf.appendChild(p1);

	var p11 = document.createElement('p');
	p11.innerHTML = "rename";
	p11.classList.add('clickable');
	p11.setAttribute('onclick', 'myag_ed_gfRename("'+gname+'")');
	gf.appendChild(p11);

	var p12 = document.createElement('p');
	p12.innerHTML = "delete";
	p12.classList.add('clickable');
	p12.setAttribute('onclick', 'myag_ed_gfDelete("'+gname+'")');
	gf.appendChild(p12);

	var ta = document.createElement('textarea');
	ta.setAttribute('rows', 3);
	ta.id = 'about#'+ gname;
	gf.appendChild(ta);

	return gf;
}

/*
fills an group field using Group instance for data
inputs: gr (Group instance)
outputs: none (affects the element directly)
*/
function myag_ed_fillGfDiv(gr)
{
	// wow this is such a humongously long, heavy function compared to others
	document.getElementById('about#'+gr.name).value =  gr.about;
}

/*
fully loads one group div on screen
input: aw (Artwork instance)
outputs: none (directly affects the DOM)
*/
function myag_ed_gfLoad(gr)
{
	var t = myag_ed_generateGfDiv(gr.name);
	document.getElementById('gfWrapper').prepend(t);
	myag_ed_fillGfDiv(gr);
}

/*
deletes a group field off the screen, does related work on artwork entries
inputs: artwork id
outputs: none
*/
function myag_ed_gfDelete(gname)
{
	// return if there's no such div
	if (document.getElementById('gf#'+gname) == undefined)
		return null;

	var confirm = window.confirm('Delete group "'+gname+'"? this action can only be undone by refreshing this page, losing all your work.');
	if (!confirm)
		return;

	// delete checkmark off each artwork div
	for (var t = 0; t < GLOBAL_artworks.length; t++)
	{
		var awid = GLOBAL_artworks[t].awid;

		// remove all checkboxes of the group
		var del = document.getElementById('chb-'+awid+"#"+gname);
		if (del == undefined)
			return null;
		del.remove();

		// remove all labels of the group
		del = document.getElementById('lb-'+awid+"#"+gname);
		if (del == undefined)
			return null;
		del.remove();
	}

	// delete the div itself

	document.getElementById('gf#'+gname).remove();


	// do some var stuff

	for (var t = 0; t < GLOBAL_groups.length; t++)
	{
		if (gname == GLOBAL_groups[t].name)
		{
			GLOBAL_groups.splice(t,1);
			GLOBAL_groupNames.splice(t,1);
		}
	}
}

/*
makes a new group field
inputs: artwork id
outputs: none
*/
function myag_ed_gfNew()
{

	var prompt = "aaaabbbbccccddddeeeef";
	while (prompt.length > 20)
	{
		prompt = window.prompt('Enter new group name, 20 symbols max.');
		if (prompt.length > 20)
			window.alert('group name too long, sorry!');
	}

	var newname = prompt; // maybe some unsafe char removal here or some shit
	

	// add a checkmark off each artwork div
	for (var t = 0; t < GLOBAL_artworks.length; t++)
	{
		var awid = GLOBAL_artworks[t].awid;

		var to = document.getElementById('apGroups-'+awid);

		var chb = document.createElement('input');
		chb.setAttribute('type', 'checkbox');
		chb.setAttribute('name', 'chb-'+awid+"#"+newname);
		chb.id = 'chb-'+awid+"#"+newname;
		to.appendChild(chb);

		var lb = document.createElement('label');
		lb.setAttribute('for', 'chb-'+awid+"#"+newname);
		lb.innerHTML = newname+"<br>";
		lb.id = 'lb-'+awid+"#"+newname;
		to.appendChild(lb);

	}

	// append the new div etc
	var abt = "Write your group description here... (optional)"
	var gr = new Group(newname, abt);
	var t = myag_ed_generateGfDiv(newname);
	document.getElementById('gfWrapper').prepend(t);
	myag_ed_fillGfDiv(gr);	
	GLOBAL_groups.push(gr);
	GLOBAL_groupNames.push(gr.name);
}

/*
renames a group field off the screen, does related work on artwork entries
inputs: artwork id
outputs: none
*/
function myag_ed_gfRename(gname)
{
	// return if there's no such div
	if (document.getElementById('gf#'+gname) == undefined)
		return null;

	var confirm = window.confirm('Rename group "'+gname+'"? this action can only be undone by refreshing this page, losing all your work.');
	if (!confirm)
		return;

	var prompt = "aaaabbbbccccddddeeeef";
	while (prompt.length > 20)
	{
		prompt = window.prompt('Enter group name, 20 symbols max.');
		if (prompt.length > 20)
			window.alert('group name too long, sorry!');
	}

	var newname = prompt; // maybe some unsafe char removal here or some shit
	

	// delete checkmark off each artwork div
	for (var t = 0; t < GLOBAL_artworks.length; t++)
	{
		var awid = GLOBAL_artworks[t].awid;

		// remove all checkboxes of the group
		var rm = document.getElementById('chb-'+awid+"#"+gname);
		if (rm ==  undefined)
			return null;		
		rm.id = 'chb-'+awid+"#"+newname;

		// rename all labels of the group
		var rm = document.getElementById('lb-'+awid+"#"+gname);
		if (rm == undefined)
			return null;
		rm.id = 'lb-'+awid+"#"+newname;
		rm.innerHTML = newname+"<br>";
	}

	// replace the div with a renamed one
	var old = document.getElementById('gf#'+gname);
	var abt = document.getElementById('about#'+gname).value;
	var gr = new Group(newname, abt);
	var t = myag_ed_generateGfDiv(newname);
	document.getElementById('gfWrapper').insertBefore(t, old);
	old.remove();
	myag_ed_fillGfDiv(gr);	
	



	// do some var stuff

	for (var t = 0; t < GLOBAL_groups.length; t++)
	{
		if (gname == GLOBAL_groups[t].name)
		{
			GLOBAL_groups[t].name = newname;
			GLOBAL_groupNames[t] = newname;
		}
	}
}

/*
generate an artwork parameters div
inputs: awid (valid artwork id string)
output: div (DOM element)
*/
function myag_ed_generateApDiv(awid)
{
	var partParams  = document.createElement('div');
	var partGroups  = document.createElement('div');
	var partPreview = document.createElement('div');

	partParams.classList.add("apPart", "apParams");
	partGroups.classList.add("apPart", "apGroups");
	partPreview.classList.add("apPart", "apPreview");

	partParams.id  = "apParams-"  + awid;
	partGroups.id  = "apGroups-"  + awid;
	partPreview.id = "apPreview-" + awid;

	var p1 = document.createElement('p');
	p1.innerHTML = "ID "+ awid;
	partParams.appendChild(p1);

	var p11 = document.createElement('p');
	p11.innerHTML = "delete";
	p11.classList.add('clickable');
	p11.setAttribute('onclick', 'myag_ed_apDelete("'+awid+'")');
	partParams.appendChild(p11);

	var p2 = document.createElement('p');
	p2.innerHTML = "name:";
	partParams.appendChild(p2);

	var i1 = document.createElement('input');
	i1.setAttribute('type', 'text');
	i1.setAttribute('name', 'name-'+ awid);
	i1.id = 'name-'+ awid;
	partParams.appendChild(i1);

	var p3 = document.createElement('p');
	p3.innerHTML = "file:";
	partParams.appendChild(p3);

	var i2 = document.createElement('input');
	i2.setAttribute('type', 'text');
	i2.setAttribute('name', 'filename-'+ awid);
	i2.id = 'filename-'+ awid;
	partParams.appendChild(i2);

	var p4 = document.createElement('p');
	p4.innerHTML = "about:";
	partParams.appendChild(p4);

	var ta = document.createElement('textarea');
	ta.setAttribute('rows', 3);
	ta.id = 'about-'+ awid;
	partParams.appendChild(ta);

	for (var t = 0; t < GLOBAL_groupNames.length; t++)
	{

		var lb = document.createElement('label');
		lb.setAttribute('for', 'chb-'+awid+"#"+GLOBAL_groupNames[t]);
		lb.innerHTML = GLOBAL_groupNames[t]+"<br>";
		lb.id = 'lb-'+awid+"#"+GLOBAL_groupNames[t];
		partGroups.prepend(lb);	
			

		var chb = document.createElement('input');
		chb.setAttribute('type', 'checkbox');
		chb.setAttribute('name', 'chb-'+awid+"#"+GLOBAL_groupNames[t]);
		chb.id = 'chb-'+awid+"#"+GLOBAL_groupNames[t];
		partGroups.prepend(chb);	
			

	}


	partPreview.title = "no filename in this entry";

	var pa = document.createElement('div');
	pa.classList.add('ap');
	pa.id = 'ap-'+awid;

	pa.appendChild(partParams);
	pa.appendChild(partGroups);
	pa.appendChild(partPreview);

	return pa;
}

/*
fills an artwork parameters div using Artwork instance for data
inputs: aw (Artwork instance)
outputs: none (affects the element directly)
*/
function myag_ed_fillApDiv(aw)
{
	document.getElementById('name-'+aw.awid).value = aw.name;
	document.getElementById('filename-'+aw.awid).value = aw.filename;
	document.getElementById('about-'+aw.awid).value = aw.about;
	for (var t = 0; t < GLOBAL_groupNames.length; t++)
	{
		if (myag_in(aw.groups, GLOBAL_groupNames[t]))
		{
			var boxname = 'chb-'+aw.awid+"#"+GLOBAL_groupNames[t];
			document.getElementById(boxname).setAttribute('checked', 'checked');
		}
	}
	var prev = document.getElementById('apPreview-'+aw.awid);
	var pfile = "url('./artworks/"+aw.filename+"')";
	prev.style.backgroundImage = pfile;
	prev.title = aw.filename;
}

/*
fully loads one artwork entry div on screen
input: aw (Artwork instance)
outputs: none (directly affects the DOM)
*/
function myag_ed_apLoad(aw)
{
	var t = myag_ed_generateApDiv(aw.awid);
	document.getElementById('apWrapper').prepend(t);
	myag_ed_fillApDiv(aw);
}

/*
deletes an artwork entry div off the screen
inputs: artwork id
outputs: none
*/
function myag_ed_apDelete(awid)
{
	var prev = document.getElementById('apPreview-'+awid);
	var fname = prev.getAttribute('title');
	var confirm = window.confirm("Really delete this artwork entry? if yes - remove file ["+fname+"] from artworks folder.");
	if (confirm)
	{
		document.getElementById("ap-"+awid).remove();
		GLOBAL_artworkAwids = myag_removeFromArray(GLOBAL_artworkAwids, awid);
	}
}

/*
add a new empty artwork details field 
inputs: none
outputs: none
*/
function myag_ed_apNew() 
{
	// new entry id generated by myag_makeAwid() in main js
	var awid = myag_makeAwid();
	var t = myag_ed_generateApDiv(awid);
	document.getElementById('apWrapper').prepend(t);
	GLOBAL_artworkAwids.push(awid);
	var a = new Artwork(undefined, undefined, undefined, awid, undefined);
	GLOBAL_artworks.push(a);
}

/*
checks if the field has been filled out. if not, scrolls the window to the correct element
input: arg (id of the target input element)
output: verdict (bool), true if OK, false if bad
*/
function checkEmptyInputVal(arg)
{
	var t = document.getElementById(arg).value;
	if ((t == undefined) || (t == null) || (!typeof(t) == 'string') || (t.length == 0))
	{
		alert("Looks like a mandatory field (name, filename) is empty! The page will now attempt scrolling to it. Please fix.");
		document.getElementById(arg).scrollIntoView(true);
		return false;
	}
	return true;
}

/*
computes XML text based on the current page contents (== "save")
inputs: none
output: xml string to paste to neocities file or bool false on fail
*/
function myag_ed_constructNewXml()
{
	var xml = document.implementation.createDocument(null, "data");
	var data = xml.childNodes[0];
	var groups = xml.createElement("groups");
	var artworks = xml.createElement("artworks");

	data.appendChild(groups);
	data.appendChild(artworks);

	for (var t = 0; t < GLOBAL_groupNames.length; t++)
	{
		
		var g = xml.createElement("group");
		var gn = xml.createElement("name");
		var ga = xml.createElement("about");

		gn.appendChild(xml.createTextNode(GLOBAL_groupNames[t]));
		ga.appendChild(xml.createTextNode(document.getElementById("about#"+GLOBAL_groupNames[t]).value));
		
		g.appendChild(gn);
		g.appendChild(ga);
		groups.appendChild(g);

	}

	for (var t = 0; t < GLOBAL_artworkAwids.length; t++)
	{
		var awid = GLOBAL_artworkAwids[t]; // artwork class instance
		var a = xml.createElement("artwork");

		var an = xml.createElement("name");
		if (!checkEmptyInputVal("name-"+awid))
			return false;
		an.appendChild(xml.createTextNode(document.getElementById("name-"+awid).value));

		var afn = xml.createElement("filename");
		if (!checkEmptyInputVal("filename-"+awid))
			return false;
		afn.appendChild(xml.createTextNode(document.getElementById("filename-"+awid).value));

		var aa = xml.createElement("about");
		aa.appendChild(xml.createTextNode(document.getElementById("about-"+awid).value));

		var aig = xml.createElement("ingroups");
		for (var c = 0; c < GLOBAL_groupNames.length; c++)
		{
			var chb = document.getElementById("chb-"+awid+"#"+GLOBAL_groupNames[c]);
			db(chb);
			if (chb.checked == true)
			{
				var ig = xml.createElement("ingroup");
				ig.appendChild(xml.createTextNode(GLOBAL_groupNames[c]));
				aig.appendChild(ig);
			}
		}

		var a_awid = xml.createElement("awid");
		a_awid.appendChild(xml.createTextNode(awid));
		a.appendChild(an);
		a.appendChild(afn);
		a.appendChild(aa);
		a.appendChild(aig);
		a.appendChild(a_awid);
		artworks.appendChild(a);

	}
	xmlText = new XMLSerializer().serializeToString(xml.documentElement);
	return '<?xml version="1.0" encoding="utf-8"?>\n'+vkbeautify.xml(xmlText, 5);
}

/*
called on clicking the 'done' button
opens up needed tabs and shit
inputs: none
output: none
*/
function myag_ed_done()
{
	var xml = myag_ed_constructNewXml();

	// jump out if there was an error with xml
	if (!xml)
		return;

	// thank you w3
	// https://www.w3docs.com/snippets/javascript/how-to-copy-the-text-to-the-clipboard-with-javascript.html
    navigator.clipboard.writeText(xml).then(() => {
    
    	window.open(USER_neocitiesXmlFileEditLink, target="_blank");
    	window.location = USER_neocitiesArtworksFolderLink;

	})
	.catch(err => {
		alert('Could not copy, please copy the link manually! ', err);
	});
}

/*
startup function
inputs: none
output: none
*/
function myag_ed_startup()
{
	myag_getGroups().then(function(groups) {
		GLOBAL_groups = groups;
		for (var c = 0; c < groups.length; c++)
		{
			GLOBAL_groupNames.push(groups[c].name);
			myag_ed_gfLoad(groups[c]);
		}
		

		myag_getArtworkAll().then(function(artworks) {
			GLOBAL_artworks = artworks;
			for (var d = 0; d < artworks.length; d++)
			{
				GLOBAL_artworkAwids.push(artworks[d].awid);
				myag_ed_apLoad(artworks[d]);
			}
			
		});
		
	});
}

//==========================================================================//
//================================ STARTUP =================================//
//==========================================================================//

myag_ed_startup();