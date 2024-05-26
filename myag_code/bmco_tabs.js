//==========================================================================//
//================ BRIGHT MOON CO. PAGE TAB SYSTEM CODE ====================//
//==========================================================================//

/*
pre-import requirements:
	bmco.js

available default stylesheets:
	bmco_tabs.css
*/

bmco.tabs = {

//==========================================================================//
//=============================== CLASSES ==================================//
//==========================================================================//


TabHandler: class
{
	constructor(opts = {/* prefix, activeMarker, navSuffix, navOptionSuffix, mode, firstTabId, */} ) {

		bmco.addToObjectIfNotThere(opts, "prefix", "tab");
		bmco.addToObjectIfNotThere(opts, "activeMarker", "Active");
		bmco.addToObjectIfNotThere(opts, "navSuffix", "Nav");
		bmco.addToObjectIfNotThere(opts, "navOptionSuffix", "Option");
		bmco.addToObjectIfNotThere(opts, "mode", "children");
		bmco.addToObjectIfNotThere(opts, "inNeomanager", false);

		this.classTab = opts.prefix;
		this.triggerGetParamName = opts.prefix;
		this.classTabActive = this.classTab + opts.activeMarker;
		this.classNav = opts.prefix + opts.navSuffix; 
		this.classNavOption = this.classNav + opts.navOptionSuffix;
		this.classNavOptionActive = this.classNavOption + opts.activeMarker;

		this.mode = opts.mode;
		this.firstTabId = opts.firstTabId;
		this.inNeomanager = opts.inNeomanager;
		this.init();
	}

	init()
	{
		var getParamTab = bmco.getParamRead(this.triggerGetParamName);
		if (getParamTab)
			return this.switchTo(getParamTab, "id");
		if (this.firstTabId)
			return this.switchTo(this.firstTabId, "id", false);

	}

	switchTo(trigger, method="onclick", writeGet=true)
	{

		// get the target tab
		var targetTabId = null;
		if (method == "onclick")
			targetTabId = trigger.getAttribute("tab");
		else if (method == "id")
			targetTabId = trigger;
		if (!targetTabId)
			return console.log("no tab id");
		var targetTab = document.getElementById(targetTabId);
		if (!targetTab)
			return console.log(`no tab ${targetTabId}`);
		
		// hide all tabs, show the one we need
		switch (this.mode)
		{
			case "semantic": {bmco.removeClassMany(document.getElementsByTagName("section"), this.classTabActive); break;}
			default: bmco.ofClassRemoveClass(this.classTab, this.classTabActive);
		}
		
		targetTab.classList.add(this.classTabActive);

		// make all navbar options inactive
		var navOptions = null;
		switch (this.mode)
		{
			case "direct": {navOptions = document.getElementsByClassName("classNavOption"); break;}
			case "children": {navOptions = document.getElementsByClassName(this.classNav)[0].children; break;}
			case "semantic": {navOptions = document.getElementsByTagName("nav")[0].children; break;}
		}
		if (!navOptions || navOptions.length == 0)
			return;
		bmco.removeClassMany(navOptions, this.classNavOptionActive);


		if (method == "onclick") // trigger is the element itself under onclick
		{
			trigger.classList.add(this.classNavOptionActive);
			if (this.inNeomanager)
				bmco.removeAllElementsOfClass("alert");
		}
		else
		{
			for (var no of navOptions)
			{
				if (no.getAttribute("tab") == targetTabId)
					no.classList.add(this.classNavOptionActive);
			}
		}

		if (writeGet)
			bmco.getParamWrite(this.triggerGetParamName, targetTabId);	
	}

}

//==========================================================================//
//=============================== LIBRARY END ==============================//
//==========================================================================//

};
