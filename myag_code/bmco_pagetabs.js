//==========================================================================//
//================ BRIGHT MOON CO. PAGE TAB SYSTEM CODE ====================//
//==========================================================================//

/*
pre-import requirements:
	bmco_general.js

stylesheet requirements:
	bmco_pagetabs.css
*/

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

function bmco_tab_init(firstTabName)
{
	var getTab = bmco_getParamRead("tab");
	if (getTab == null)
		return bmco_tab_switchTo(firstTabName, null, writeGet=false);
	bmco_tab_switchTo(getTab, null);

}

/* Called onclick of a navbar header on app index,
switches between activity tabs.
inputs: tabName <string> [name of the tab, provided in onclick call],
		navbarOptionObject <DOM object> ["this" from onclick call]
return: none
*/
function bmco_tab_switchTo(tabName, navbarOptionObject, writeGet=true)
{
	var targetTab = document.getElementById(tabName);
	if (targetTab == undefined)
		return;
	bmco_removeAttributeForAllElementsOfClass("tab", "style");
	targetTab.setAttribute("style", "display: block;");
	bmco_removeAttributeForAllElementsOfClass("navbarOption", "id");

	if (navbarOptionObject == null)
	{
		var allOptions = document.getElementsByClassName("navbarOption");
		for (var x = 0; x < allOptions.length; x++)
		{
			var onclick = allOptions[x].getAttribute("onclick");
			if (onclick.search(tabName) != -1)
			{
				navbarOptionObject = allOptions[x];
				break;
			}
		}
	}
	else
	{
		bmco_removeAllElementsOfClass("error");
		bmco_removeAllElementsOfClass("success");
	}
	if (writeGet)
		bmco_getParamWrite("tab", tabName);
	navbarOptionObject.setAttribute('id', 'navbarSelected');
}
