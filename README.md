# MyArtGallery (MyAG)

## Index

- [Overview](#Overview)
- [Step-by-step rollout guide](#Step-by-step-rollout-guide)
- [Editor tutorial](#Editor-tutorial)
- [Customisation](#Customisation)

## Overview

MyArtGallery is an instant-deployment image gallery package for [neocities.org](https://neocities.org) - a free, nice and non-corporate place for hosting and editing your own website. Its joy and demise is that it has no backend whatsoever; you cannot use php or backend JS or anything like that, making it hard to develop any kind of dynamically updated systems with login forms or anything like that. This is likely to both remove a lot of security risks and prevent resource-heavy and profit-driven services from emerging. But what if i, as a visual artist, want to host my art gallery on neocities, *and* not edit the HTML each time i want to publish a new artwork?

This is where MyArtGallery comes into play. I made this package so that one could easily roll out and manage such an artwork gallery on their own - no coding skills required whatsoever. MyAG comes copmlete with a default set of pages that can be deployed, and gradually customized as your web-development skills grow. For more advanced users, MyAG is easily integrated into existing pages by importing some scripts and specifying target containers.

MyAG uses an [XML](https://en.wikipedia.org/wiki/XML) file as its data store, which is OK for small-scale databases. This file stores information about your artworks - names, descriptions, filenames and group markers (more robust version of tags), as well as group names and descriptions. You don't have to edit any XML by hand: the bundled editor webpage takes care of that. Just click the "New Artwork" button, fill out the fields for your future upload, and once you're done - the editor already has all you need prepared for you. 

Neocities does not have a back-end, so when running autonomously, MyAG still requires some manual actions to finalize your uploads. Once you're done, you will need to update the .xml file (= paste some text and press "save") and upload the artwork files to the correct folder. The .xml file editor and upload folder are opened automatically when you're done working with editor. A desktop application is being developed to take advantage of Neocities' API to allow automatic file uploads.

Wanna see MyAG in action? My own kandi museum page runs on MyAG, [check it out](https://auberylis.moe/data/kandi/)! 

## Step-by-step rollout guide

### 1. Upload the package contents to your Neocities website.
[Download](https://github.com/kouyouelysian/myartgallery/archive/refs/heads/main.zip) the package from this github page and deploy it to your Neocities. This means extracting the zip archive you just got, going to your Neocities dashboard view (the thing where you can make and delete files, etc), and drag-n-dropping stuff to the location where you want your gallery to be. All the files and folders from the package must exist in the **same Neocities site folder**. Creating a gallery in the website root is possible, but making a subfolder and deploying to it is advised. Items with an asterisk may be omitted if you are an experienced user and are going to roll your own HTML.

- folders (drag and drop one by one to load a folder with all its contents):
    - myag_artworks
    - myag_code
    - myag_files
    - myag_style
    - myag_user
- files (basically, upload all .html files from the package):
    - editor.html 
    - group.html *
    - image.html 
    - index.html *

After everything's done uploading, click on "index.html" - a page pops up in a new tab. If it displays some test images in a grid - well done, you deployed MyAG! Otherwise, feel free to [contact me](https://auberylis.moe/links/) and help me improve MyAG by telling what went wrong.

### 2. Open thes two pages in new tabs (you'll need them later)
Next is setting up the simplified update process. In Neocities dashboard view (with the html files, directories and all), in the directory where you just deployed the package, you have to open in new tabs (right click + open in new tab for most browsers) the following two directories: 'myag_files' and 'myag_artworks'. The former stores the database and other working files, the latter is for your images. In 'myag_files', click "edit" on the line showing "data.xml" (the database) - an editor will pop up. You don't have to edit anything; just keep it open. Keep the tab with the 'myag_artworks' directory view open. Now, go back to the initial tab with the dashboard view of your MyAG deployment directory.

### 3. Edit these two lines in myag_user/settings.js
This is the hardest thing you have to do here: this will enable the gallery editor to redirect you automatically, simplifying the update/upload process. Navigate to the "myag_user" folder, then press "edit" at the line showing "settings.js". there are two text lines that you have to edit:

`myag.settings.neocitiesXmlFileEditLink = "pasteXmlEditorLinkHere"`

`myag.settings.neocitiesArtworksFolderLink = "pasteArtworksFolderDashboardLinkHere"`

The stuff inside double-quotes has to be replaced with actual links. The first one, `neocitiesXmlFileEditLink`, should become the link to the data.xml file editor tab. Just go to the browser tab with the data.xml editor open, copy the link from the address bar, and paste it instead of `pasteXmlEditorLinkHere`. The second one, `neocitiesArtworksFolderLink`, is same story, but with the artworks folder. Don't forget to keep the double quotes!

The two lines should look something like this at the end:

`myag.settings.neocitiesXmlFileEditLink = "https://neocities.org/site_files/myag_files/data.xml";`

`myag.settings.neocitiesArtworksFolderLink = "https://neocities.org/site_files/text_editor?filename=Fmyag_files%2Fdata.xml";`

Save the changes you made to *settings.js* file (ctrl/cmd + S or click the red "save" button) and return to the gallery directory overview by pressing its name at the top left corner. After you did these edits, the bundled editor will be able to easily redirect you to the XML editor page and the artwork file upload view upon finishing the editing.

### 4. Customize!
The fun part is that you customize the website look! All the "easy" customization files are located in the "myag_user" folder. You will not have to edit anything else to change things up lightly. Open the file "style.css" in the "myag_user" folder. There are some assignable variables that you can change, with guidance next to them. Feel free to rewrite the default values with custom ones. You can open your gallery's index and refresh it to see the results of your customizations. If it doesn't go through, try [force-refreshing](https://www.howtogeek.com/672607/how-to-hard-refresh-your-web-browser-to-bypass-your-cache/) the page. The index page has some dummy text in the `<p>` element - you may want to rewrite the text with something about you, like a welcoming message, or some information on your digital display.

All deeper customisations require at least basic HTML/CSS knowledge, and shall be done by hand by you; i *highly* encourage you to try and do that, because that's the most fun part of the user-made web. 

## Editor tutorial

### 1. Make sure you're logged in to neocities.org
As stupid as it sounds, are you logged in? Log in if not. Security of your XML "database" relies on the security of your neocities.org session. 

### 2. Access editor
MyAG facilitates managing your uploads by providing a graphic user interface. The bundled editor is "editor.html" in your gallery's deployment folder. For example: if your gallery is located at "yoursite.neocities.com/gallery/", the editor is at "yoursite.neocities.com/gallery/editor". Anyone can access your editor and poke around, but only you can *actually* update the database and upload new images. Think about it as 'imagining' your changes with the editor (accessible to anybody), and 'making them real' by updating the XML file and uploading new artworks (only for you). If you have security concerns anyways, rename "editor" to 64 random characters, and bookmark it in your browser for convenience.

### 3. Add a new artwork
Navigate to the *Artworks* tab and press the "Add new..." button in the grid's top left. A little info card comes up for you to fill out. Put the exact filename WITH extention (e.g. `coolartwork.png`, `sanic.jpg`), to the file name field. *Do not try to drag and drop the file on this field!* this is **not** a file upload window; you will upload the actual image manually in just a second. Only the filename is required. If you wish, add more info on this new picture in the other fields. Press "Create". The artwork should be added to the grid now, displaying as a coloured rectangle with the name you provided, or its ID string if you didn't.

### 4. Add a new group
Groups are like tags, but more structured and robust. Add a group by navigating to the *Groups* tab and pressing the "Add new..." button in the grid's top left. Another fillout pops up. Fill it out and hit "Create": your group is now added to the groups grid!

### 5. Assign your new artwork to your new group
Now that you created a group, you can assign an artwork to it. Click on the artwork you created in step 3, and select "edit" in the context menu. Now you can add this artwork to the group you just created by ticking the corresponding checkbox. You can add one artwork to as many groups as you want, or to none at all.

### 6. Delete stock groups and artworks
The package comes with some pre-packed test images and groups. You can go ahead and remove them! Simply click on an artwork or group that you'd like to remove, and hit "delete". The editor will prompt you if you really want to delete that item: if so, press "yes". Now, just do this with all the stock artworks and groups! Keep in mind that you are only deleting the *record of an image in the database*; the actual test image *files* should be deleted manually from the myag_artworks folder.

### 7. Update XML
Press the "update xml" button at the editor's bottom bar. A new tab will pop up, with an open text editor of "data.xml". The editor already put the updated XML database as text to your clipboard, so you only have to replace the old one with it. Select everything in the editor (right click on the editing window, 'select all' - or the ctrl-A/cmd-A keyboard shortcut) and delete it with the backspace. Then paste the new text (right click + paste or ctrl-V/cmd-V). Save the file by pressing 'save' on top right or using ctrl-S/cmd-S. And just like that, the changes you just made are now recorded into the database and will display to you and your visitors.

### 8. Upload the artwork file
Close the XML file tab and press the "upload files" button in the editor. Another tab pops up, serving your /myag_artworks directory. This is where your uploaded images live. Although you did describe the artwork to the database, the *actual file* isn't on your website just yet: drag-n-drop your new artwork file to the directory to upload. Same applies for deletion: although you delete an artwork using the editor, you still need to delete the file itself manually.

### 8. Verify!
Refresh your gallery's index.html! Your new stuff should now be at the top of the index page, and the newly created groups should now show as buttons. If you forgot to paste the XML, and didn't close the editor page yet - use the "raw xml" button; it will put the XML text to your clipboard so that you can try to paste it again.

### 9. Not working?
If it doesn't work: my bad, probably :D contact me and we will see what's wrong. This is a one person project and all sorts of stuff may happen, so [tell me what went wrong](https://auberylis.moe/data/links/)

## Updating MyArtGallery

Assuming you're running this on neocities.org as intended, you just have to download the [freshest version](https://github.com/kouyouelysian/myartgallery/archive/refs/heads/main.zip). Inside your neocities MyAG instance directory, upload the following items from the extracted MyAG zip archive:

- folders (drag and drop one by one to load a folder with all its contents):
    - myag_code
    - myag_style
- files (basically, upload all .html files from the package):
    - editor.html 
    - image.html 

The new uploads will automatically replace the old files, so the code and default styling will all get updated. Pay attention and **do not** upload *myag_user*, *myag_files*, or anything else that is not listed, as this may break your customizations, or even reset your database or artworks folder!

In case you did deep mods of MyAG, like tweaking the code - you know what you're doing, so you will have to handle figuring out what of your mods are in stuff subject to be updated, and applying your hacks on the new code on your own. I heavily advise you to do as much as possible with custom CSS.

## Customisation

### Basic

Basic customizations are described in *MyArtGallery step-by-step rollout guide*, point 4. They are guaranteed to not hinder the update cycle.

### Intermediate

If you need more funky and specific CSS rules -- e.g. you want a rainbow background on THIS ONE SPECIFIC element, but not the others, you add the corresponding styles to the *myag_user/style.css* file. This is something everyone is encouraged to do. All the CSS rules you put here will get loaded *after* everything else, so if you redefine something, it will override the factory styling. You can also put your own class/id styling here, if you are adding your own custom elements. Bear in mind, that it's necessary to put your custom code to *myag_user/style.css* and not to any other stylesheets - otherwise, your mods will vanish upon updating.

### Advanced

This section is for people who want to roll their own HTML and integrate MyAG into it on their own. MyAG is engineered to be non-invasive, and barely ever interfere with your own's artistic goals. It's easily integrated into an existing page, and renders its items into specified containers.

In your htm's `<head>` tag, you *have* to import the following CSS styles via `<link>`s:

- myag_style/items.css
- myag_style/viewer.css

At the bottom of your page, before the closing `</body>` tag, hook up the following scripts using `<script>` elements:

- myag_code/bmco.js
- myag_code/bmco_xml.js
- myag_code/bmco_infra.js
- myag_code/myag_main.js
- myag_user/settings.js
- myag_code/myag_pages.js
- myag_code/myag_viewer.js

If confused, refer to the bundled *index.html* for a reference; bear in mind that it imports some default styles, too.

Now you connected all the bits and bobs that make MyAG run. It automatically detects targets (like `<div>`s) by class and renders items into them as HTML structures. In order to have MyAG render *artworks* into a container (`<div`>, `<section`>, `<content`>, ...) - set its class to `artworksWrapper`. If you want MyAG to render group buttons to a container, its classlist has to contain `groupsWrapper`. Obviously, you can add many classes to an element: the clas you're using in your own page's styling can be next to the class MyAG is targetting.

An `artworksWrapper` container can be customized with HTML attributes, e.g. `<div class="artworksWrapper" attribute="value">`:

- artworksPerRow: number, overrides the general artworks per row setting just for this container
- group: string, group's *id* (**not** the group's name). Group's ID can be found in editor by selecting 'Copy ID' in the context menu. The container will only display artworks from the target group. Displays all groups if not set.

If no wrappers are found for groups/artworks, no errors are thrown, and they are simply not loaded. You can use this to your advantage, e.g. omit artwork containers to have the gallery index be a list of groups for user to narrow into, or vice versa - display each group in a separate `artworksWrapper` with its *group* attribute set accordingly, while not displaying the group buttons at all.








