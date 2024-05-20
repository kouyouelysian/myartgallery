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
			"about": "about"
		};
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
		var tag = xmldoc.createElement(this.xmlTagName);
		for (var m in this.xmlFieldMappings)
		{
			if (typeof(this[m]) == "string")
				tag.appendChild(bmco.xml.nodeTextCreate(xmldoc, m, this[m]));
			else if (this[m].constructor === Array)
			{

			}
			else if (this[m] === null)
				tag.appendChild(xmldoc.createElement(m));
		}
		return tag;
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
			{
				console.log(prop, target);
				this.filloutFieldWrite(target, this[prop]);
			}
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

	}

},

ItemList: class {

	constructor(itemClass, xml=undefined, gui=undefined) {
		this.items = [];
		this.itemClass = itemClass;
		this.addToEnd = true;
		this.xml = xml;
		this.gui = gui; 

		/*
		{ // xml example
			workingDoc: myag.data.xml,
			listTag: myag.data.xml.getElementsByTagName("artworks")[0]
		}

		{ // gui example
			htmlClass:       "artwork",
			htmlIdAttribute: "awid",
			xmlTagName:      "artwork",
			xmlIdTagName:    "awid",
			filloutShow:     "filloutShowArtwork",
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


	putItemsToHtml(target) {
		for (var i of this.items)
		{
			if (this.checkAgainstFilter(target, i))
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

	addFromXml(xmlTag, opts = {xml: true, gui: true}) {
		var i = new this.itemClass();
		i.fromXml(xmlTag);
		this.add(i, opts);
	}

	add(instance, opts = {xml: true, gui: true}) {

		this.addToEnd? this.items.push(instance) : this.items.unshift(instance);

		if (this.xml && opts.xml) {
			if (this.addToEnd)
				this.listTag.appendChild(instance.toXml());
			else
				this.listTag.prepend(instance.toXml());
		}
		if (this.gui && opts.gui) {
			var target = document.getElementsByClassName(this.targetClass)[0];
			if (this.addToEnd)
				target.appendChild(this.gui.generator(target, instance));
			else
				target.prepend(this.gui.generator(target, instance));
		}
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

	move(from, to) {

	}

	moveById(from, to) {

	}

	indexById(id) {
		return bmco.firstInArrayWithProperty(this.items, "id", id, true);
	}

	itemById(id) {
		return bmco.firstInArrayWithProperty(this.items, "id", id);
	}

	htmlById(id) {
		return bmco.firstElementOfClassByAttribute(this.gui.htmlClass, this.gui.htmlIdAttribute, id)	
	}

	htmlItemsVisible(start=0, end=this.items.length - 1, hideOthers=true) {
		for (var i of this.items)
		{
			var index = this.indexById(i.id);
			if (index >= start && index < end)
				this.htmlById(i.id).classList.remove("invisible");
			else if (hideOthers)
				this.htmlById(i.id).classList.add("invisible");
		}
	}

	htmlItemsActive(active) {
		active? bmco.ofClassRemoveClass(this.htmlClass, "inactive") : bmco.ofClassAddClass(this.htmlClass, "inactive");
	}

	filloutShow(item) {

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
}

//==========================================================================//
//=============================== LIBRARY END ==============================//
//==========================================================================//

};