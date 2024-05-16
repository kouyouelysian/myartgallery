//==========================================================================//
//============ BRIGHT MOON CO. INFRASTRUCTURE-RELATED CODE =================//
//==========================================================================//

/*
pre-import requirements:
	none

available functions:
	bmco.infra.makeIdBase()
	bmco.infra.bodyAttributeExists: function(name)
*/

bmco.infra = {

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/* makes an id base string
inputs: none
outputs: id string base
*/
makeIdBase: function()
{
  return bmco.timestamp()+"_"+bmco.randString(5);
},

/* checks if <body> tag has some attribute or not. used in neomanager for flow control
inputs: name <string> [name of the attribute to check]
return: <bool> attribute exists or not
*/
bodyAttributeExists: function(name)
{
	return bmco.arrayHas(document.body.getAttributeNames(), name.toLowerCase());
}

//==========================================================================//
//=============================== LIBRARY END ==============================//
//==========================================================================//

};