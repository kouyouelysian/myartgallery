//==========================================================================//
//============ BRIGHT MOON CO. INFRASTRUCTURE-RELATED CODE =================//
//==========================================================================//

/*
pre-import requirements:
	bmco.js
	bmco_xml.js

available functions:
	bmco.infra.makeIdBase()
	bmco.infra.bodyAttributeExists: function(name)
*/

bmco.infra = {

//==========================================================================//
//=============================== CLASSES ==================================//
//==========================================================================//

Item: class {

	constructor(prefix="i", xmlTagName="item", name=null, about=null) {
		this.id = bmco.infra.makeId(prefix);
		this.prefix = prefix;
		this.name = name;
		this.about = about;
		this.xmlFieldMappings = {
			"id": "id",
			"name": "name",
			"about": "about",
		};
		this.xmlMultiTagMappings = {};
		this.guiFilloutBindings = {
			"id": "filloutId",
			"name": "filloutName",
			"about": "filloutAbout",
		}
		this.xmlTagName = xmlTagName;
	}

	fromXml(tag) {
		for (var m in this.xmlFieldMappings) 
		{
			var fieldTag = tag.getElementsByTagName(this.xmlFieldMappings[m])[0];
			if (!fieldTag)
				this[m] = null
			else if (bmco.xml.nodeTextCheck(fieldTag))
			{
				var tagTextValue = bmco.xml.nodeTextRead(fieldTag);
				if (tagTextValue)
					this[m] = tagTextValue;
			}
			else if (fieldTag.childElementCount > 0)
			{
				for (var elem of fieldTag.getElementsByTagName("*"))
					this[m].push(bmco.xml.nodeTextRead(elem));
			}
			else
				this[m] = null;
		}
	}

	toXml(xmldoc) {
		var itemTag = xmldoc.createElement(this.xmlTagName);

		for (var m in this.xmlFieldMappings)
		{	
			if (this[m] === null)
				itemTag.appendChild(xmldoc.createElement(this.xmlFieldMappings[m]));
			else if (typeof(this[m]) == "string")
				itemTag.appendChild(bmco.xml.nodeTextCreate(xmldoc, this.xmlFieldMappings[m], this[m]));
			else if (this[m].constructor === Array)
			{
				var multiTag = xmldoc.createElement(this.xmlFieldMappings[m]);
				var childTagName = this.multiTagMappings[this.xmlFieldMappings[m]];
				for (var val of this[m])
				{
					var childTag = bmco.xml.nodeTextCreate(xmldoc, childTagName, val)
					multiTag.appendChild(childTag);
				}
				itemTag.appendChild(multiTag);
			}
			
		}
		return itemTag;
	}

	filloutWrite() {
		for (var prop in this.guiFilloutBindings)
		{
			target = document.getElementById(this.guiFilloutBindings[prop]);
			if (!target)
				continue;
			if (target.nodeName.toLowerCase() == "div")
			{	// div with multiple inputs - read all into an array
				for (var i of target.getElementsByTagName("input"))
				{
					if (!bmco.arrayHas(this[prop], i.getAttribute("name")))
						this.filloutFieldWrite(i, false);
					else
						this.filloutFieldWrite(i, i.getAttribute("name")); 				
				} 
			
			}
			else
				this.filloutFieldWrite(target, this[prop]);
		}
	}

	filloutFieldWrite(target, value) {
		if (!target)
			return;
		else if (bmco.arrayHas(["input", "textarea"], target.nodeName.toLowerCase()))
		{
			if (target.getAttribute("type") == "checkbox")
				return value? target.checked = true : target.checked = false;
			return target.value = value; 
		}
	}

	filloutRead() {
		for (var prop in this.guiFilloutBindings)
		{
			target = document.getElementById(this.guiFilloutBindings[prop]);
			if (!target)
				continue;
			if (target.nodeName.toLowerCase() == "div")
			{	// multi-input -read all into an array
				for (var i of target.getElementsByTagName("input"))
				{
					var val = this.filloutFieldRead(i);
					if (!val)
						continue;
					this[prop].push(val);			
				}
			}
			else
				this[prop] = this.filloutFieldRead(target);

		}
	}

	filloutFieldRead(target) {
		if (!target)
			return null;
		else if (bmco.arrayHas(["input", "textarea"], target.nodeName.toLowerCase()))
		{
			if (target.getAttribute("type") == "checkbox")
				return target.checked? target.name : null;
			return target.value; 
		}
	}

},

ItemList: class {

	constructor(itemClass, xml=undefined, gui=undefined) {
		this.items = [];
		this.itemClass = itemClass;
		this.putNewItemsToStart = true;
		this.xml = xml;
		this.gui = gui; 

		/*
		{ // xml example
			workingDoc: myag.data.xml,
			listTag: myag.data.xml.getElementsByTagName("artworks")[0]
		}

		{ // gui example
			htmlClass:       "artwork",
			htmlMarkerClass: "moveMarkerArtwork",
			htmlNewButtonId: "createNewArtwork",
			htmlIdAttribute: "awid",
			xmlTagName:      "artwork",
			xmlIdTagName:    "awid",
			fillout:     "filloutArtwork",
			generator:    myag.createArtwork,
			targetClass: "myag_artworksWrapper",
			filter: {
				htmlAttribute: "group",
				objProperty: "ingroups",
				mode: "inArray"
			}
		}
		*/
	}

	startup() {
		if (!this.xml || !this.gui)
			return;

		this.extractItemsFromXml();

		for (var target of document.getElementsByClassName(this.gui.targetClass))
			this.putItemsToHtml(target);
	}

	extractItemsFromXml() {
		if (!this.xml)
			 return;
		for (var tag of this.xml.listTag.childNodes)
		{
			var instance = new this.itemClass();
			instance.fromXml(tag);
			this.items.push(instance);
		}
	}

	putItemsToHtml(target, forceFirstItem=false) {
		for (var i of this.items)
		{
			if (this.checkAgainstFilter(target, i) || (forceFirstItem && this.indexById(i.id) == 0))
				this.gui.generator(target, i);
		}
	}


	checkAgainstFilter(htmlTarget, renderedObject) {
		if (!this.gui.filter)
			return true;
		var targetValue = htmlTarget.getAttribute(this.gui.filter.htmlAttribute);
		if (!targetValue)
			return true;
		var objectValue = renderedObject[this.gui.filter.objProperty];
		if (!objectValue)
			return false;
		switch (this.gui.filter.mode)
		{
			case "equals":
				return targetValue === objectValue;
			case "inArray":
				return bmco.arrayHas(objectValue, targetValue);
			default:
				return false;
		}
		return false;
	}

	addNew(item = undefined) {
		var i = item;
		if (!i)
		{
			var i = new this.itemClass();
			i.filloutRead();
		}
		this.items.push(i);
		if (this.xml)
			this.xml.listTag.appendChild(i.toXml(this.xml.workingDoc));
		
		if (this.gui) {
			bmco.gui.filloutHide(this.gui.fillout);
			var target = document.getElementsByClassName(this.gui.targetClass)[0];
			this.gui.generator(target, i);
		}

		if (this.putNewItemsToStart)
			this.moveById(i.id, "start");
	}

	remove(item) {
		this.items.splice(this.indexById(item.id), 1);
		if (this.xml) {

			var tag = bmco.xml.nodeGetByChildTagValue(
				this.xml.workingDoc,
				item.xmlTagName,
				item.xmlFieldMappings["id"],
				item.id
			).remove();
		}
		if (this.gui) {
			bmco.firstElementOfClassByAttribute(
				this.gui.htmlClass,
				this.gui.htmlIdAttribute,
				item.id
			).remove();
		}
	}

	removeByIndex(index) {
		this.remove(this.items[index]);
	}

	removeById(id) {
		this.remove(this.itemById(id));
	}

	moveById(idMoved, idAfter) {

		console.log(
this.xml.workingDoc,
					this.xml.itemTagName,
					this.xml.idTagName,
					idMoved,

			bmco.xml.nodeGetByChildTagValue(
					this.xml.workingDoc,
					this.xml.itemTagName,
					this.xml.idTagName,
					idMoved
				)
		);

		bmco.arrayValuePutAfter(
			this.items, 
			this.indexById(idMoved), 
			idAfter=="start"? 0 : this.indexById(idAfter)
		);
		
		if (this.xml) {
			this.xml.listTag.insertBefore(
				bmco.xml.nodeGetByChildTagValue(
					this.xml.workingDoc,
					this.xml.itemTagName,
					this.xml.idTagName,
					idMoved
				),
				idAfter == "start"? this.xml.listTag.firstElementChild :
				bmco.xml.nodeGetByChildTagValue(
					this.xml.workingDoc,
					this.xml.itemTagName,
					this.xml.idTagName,
					idAfter
				).nextElementSibling
			);

		}
		if (this.gui) {
			var moved = this.htmlById(idMoved);
			var movedMarker = this.htmlById(idMoved, true);
			var target;
			if (idAfter == "start")
			{
				var newInstanceButton = document.getElementById(this.gui.htmlNewButtonId);
				if (!newInstanceButton)
					target = document.getElementsByClassName(this.gui.targetClass)[0].children[0];
				else
					target = newInstanceButton.nextElementSibling.nextElementSibling;
			}
			else
				var target = this.htmlById(idAfter).nextElementSibling.nextElementSibling;
			var wrapper = document.getElementsByClassName(this.gui.targetClass)[0];
			wrapper.insertBefore(moved, target);
			wrapper.insertBefore(movedMarker, target); 
		}
	}

	moveByIndex(indexMoved, indexAfter) {

		this.moveById(
			this.items[indexMoved].id, 
			indexAfter=="start"? "start" : this.items[indexAfter].id
		);
	}

	indexById(id) {
		return bmco.firstInArrayWithProperty(this.items, "id", id, true);
	}

	itemById(id) {
		return bmco.firstInArrayWithProperty(this.items, "id", id);
	}

	htmlById(id, marker=false) {
		var hc = marker? this.gui.htmlMarkerClass : this.gui.htmlClass;
		return bmco.firstElementOfClassByAttribute(hc, this.gui.htmlIdAttribute, id)	
	}

	htmlItemVisible(id, visible, opts={visibilityClass:["invisible", "invisible"]}) {
		var item = this.htmlById(id);
		if (item)
			visible? item.classList.remove(opts.visibilityClass[0]) : item.classList.add(opts.visibilityClass[0]);
		if (!this.gui.htmlMarkerClass || !opts.affectMarker)
			return;
		item = this.htmlById(id, true);
		if (!item) return;
		visible? item.classList.remove(opts.visibilityClass[1]) : item.classList.add(opts.visibilityClass[1]);
		if (!opts.affectPreviousMarker) return;
		item = this.htmlById(this.items[this.indexById(id)-1].id, true);
		if (!item) return;
		visible? item.classList.remove(opts.visibilityClass[1]) : item.classList.add(opts.visibilityClass[1]);
	}

	htmlItemRangeVisible(start=0, end=this.items.length - 1, hideOthers=false) {
		for (var i of this.items)
		{
			var index = this.indexById(i.id);
			if (index >= start && index < end)
				this.htmlItemVisible(i.id, true);
			else if (hideOthers)
				this.htmlItemVisible(i.id, false);
		}
	}

	htmlItemsActive(active) {
		active? bmco.ofClassRemoveClass(this.gui.htmlClass, "inactive") : bmco.ofClassAddClass(this.gui.htmlClass, "inactive");
	}

	reverse() {
		for (var x = 0; x < this.items.length-2; x++)
			this.moveByIndex(this.items.length - 1, x);
	}

},

//==========================================================================//
//================================ FUNCTIONS ===============================//
//==========================================================================//

/* makes an id base string
inputs: none
outputs: id string base
*/
makeIdBase: function()
{
  return `${bmco.timestamp()}_${bmco.randString(5)}`;
},

/* tells if the provided string is a valid id string base
inputs: arg <string> [string to test]
output: <bool> [if it is a valid id base]
*/
isIdBase: function(arg)
{
	var timestamp = arg.substr(0,13);
	var underscore = arg.substr(13,1);
	var rands = arg.substr(14); 

	if (isNaN(timestamp))
		return false;
	if (underscore != "_")
		return false;
	if (rands.length != 5)
		return false;

	return true;
},

makeId: function(prefix)
{
	return `${prefix}_${bmco.infra.makeIdBase()}`; 
},

/* checks if <body> tag has some attribute or not. used in neomanager for flow control
inputs: name <string> [name of the attribute to check]
return: <bool> attribute exists or not
*/
bodyAttributeExists: function(name)
{
	return bmco.arrayHas(document.body.getAttributeNames(), name.toLowerCase());
},


metaTagUpdate: function(xmldoc)
{
	var uc = xmldoc.getElementsByTagName("updateCount")[0];
	var uts = xmldoc.getElementsByTagName("updateTimestamp")[0];
	if (!uc || !uts)
		return;
	if (isNaN(bmco.xml.nodeTextRead(uc)))
		return;
	var v = parseInt(bmco.xml.nodeTextRead(uc)) + 1;
	bmco.xml.nodeTextWrite(xmldoc, uc, v.toString());
	bmco.xml.nodeTextWrite(xmldoc, uts, bmco.timestamp());

},

metaTagRead: function(xmldoc)
{
	var uc = xmldoc.getElementsByTagName("updateCount")[0];
	var uts = xmldoc.getElementsByTagName("updateTimestamp")[0];
	if (!uc || !uts)
		return [-1, -1];
	var uc = bmco.xml.nodeTextRead(uc);
	var uts = bmco.xml.nodeTextRead(uts);
	if (isNaN(uc) || isNaN(uts) || !uc || !uts)
		return [-1, -1];
	return [parseInt(uc), parseInt(uts)]
}

//==========================================================================//
//=============================== LIBRARY END ==============================//
//==========================================================================//

};