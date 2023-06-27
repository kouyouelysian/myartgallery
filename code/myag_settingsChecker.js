
function myag_sc_exists(key)
{
	try
	{
		eval(key);
	}
	catch (e)
	{
		if (e.toString().indexOf("is not defined") != -1)
			return false;
	}
	return true;
}

function myag_sc_detectBadKeys(active, deprecated)
{
	missingKeys = [];
	for (var x = 0; x < active.length; x++)
	{
		if (!(myag_sc_exists(active[x])))
			missingKeys.push(active[x]);
	}

	deprecatedKeys = [];
	for (var x = 0; x < deprecated.length; x++)
	{
		if (myag_sc_exists(deprecated[x]))
			deprecatedKeys.push(deprecated[x]);
	}

	return [missingKeys, deprecatedKeys]
}

function myag_sc_displayBadKeys(active, deprecated)
{

	badKeys = myag_sc_detectBadKeys(active, deprecated);
	missingKeys = badKeys[0];
	deprecatedKeys = badKeys[1];

	target = document.getElementById("results");
	target.innerHTML = "";

	if ((missingKeys.length == 0) && (deprecatedKeys.length == 0))
	{
		target.innerHTML += "Congratulations, no missing or deprecated keys found in user/settings.js!";
	}
	else
	{
		if (missingKeys.length > 0)
		{
			target.innerHTML += "The following keys are missing from user/settings.js:<br><br>";
			for (var x = 0; x < missingKeys.length; x++)
				target.innerHTML += "<b>"+missingKeys[x]+"</b><br>";
			target.innerHTML += "<br>";
			
		}

		if (deprecatedKeys.length > 0)
		{
			target.innerHTML += "The following deprecated keys are no longer used and can be safely erased from user/settings.js:<br><br>";
			for (var x = 0; x < deprecatedKeys.length; x++)
				target.innerHTML += "<b>"+deprecatedKeys[x]+"</b><br>";
			target.innerHTML += "<br>";
			
		}
		
		link = "https://github.com/kouyouelysian/myartgallery/blob/main/user/settings.js";
		target.innerHTML += "Please, find the up-to-date example of a settings file <a href='"+link+"' target='_blank'>here</a>\
		 and fill in the missing keys/delete the deprecated keys in your user/settings.js...";
	}
}

function myag_sc_run()
{
	settings_names = ["SETTING_neocitiesXmlFileEditLink", "SETTING_neocitiesArtworksFolderLink", "SETTING_title", 
	"SETTING_fullButton", "SETTING_about", "SETTING_pagingIndex", "SETTING_pagingGroup", "SETTING_rowsPerPage", "SETTING_nextPageOnWrap"];
	deprecated_names = ["SETTING_loadTopDown"];
	myag_sc_displayBadKeys(settings_names, deprecated_names);
	bmco_setTitle(SETTING_title + " / settings checker");
}






myag_sc_run();