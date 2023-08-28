# MyArtGallery (MyAG)

## WHAT, WHY, WHERE

MyArtGallery is an instant-deployment image gallery package for [neocities.org](https://neocities.org) - a free, nice and non-corporate place for hosting and editing your own website. Its joy and demise is that it has no backend whatsoever; you cannot use php or backend JS or anything like that, making it hard to develop any kind of dynamically updated systems with login forms or anything like that. This probably is to remove the misuse threat completely, as having no backend means 1. no weak security applications will be deployed and 2. no resource-hungry stuff is made. As a bonus, this adds to the overall static nature of neocities. But what if i want, as a visual artist, to host my art gallery on neocities and not edit HTML or some makeshift JS each time i want to add a new artwork?

This is where MyAG comes into play. I made this solution so that one could easily roll out and manage such an artwork gallery on their own, no coding required. It also comes with a built-in styling system that's very easy to use and requires no programming skills - you just open a style file, in which each parameter has a description and a guide, and change some text. Since this is still neocities, you can go ahead and edit the HTML of the page further than changing the name and about; you can absolutely restyle, reorder and augment the page as you want. Do note that doing advanced modding may make updating harder at this earlier stage of the project.

MyAG uses an .xml file as its data store; i KNOW that .xml is a transport format and not a database. However, with quite slow update rates (3 artworks per day VS thousands of tweets per hour) and access rates (maybe like 400 visits per day vs millions of users at once), it's OK to work around neocities' backendlessness like that. The .xml file stores information about your artworks - name, description, filename and groups (or tags, if you want). All these are editable via the bundled visual editor. You just fill out the fields for your new artwork, provide its filename - and then update the .xml file (just paste some text and save) and upload the artwork to the correct folder. The .xml file editor and upload folder are opened automatically when you're done filling out the deets on your new stuff. Clunkier than putting it on twitter dot com or something, but better than having your stuff erased by moderators or losing your account because you made a joke about some stinky billionaire.

Wanna see MyAG in action? My own kandi museum page runs on MyAG, [check it out](https://astrossoundhell.neocities.org/data/kandi/)! 

## STEP BY STEP ROLLOUT GUIDE

### 1. load the package contents to neocities.
[Download the package](https://github.com/kouyouelysian/myartgallery/archive/refs/heads/main.zip) from this github page and deploy it to your Neocities. This means extracting the zip file you just got, going to Neocities dashboard view (the thing where you can make and delete files, etc), and drag-n-dropping stuff to the location where you want your gallery to be. All the files and folders from the package must exist in the **same Neocities site folder**. Upload folders one by one, **DO NOT GROUP-LOAD FOLDERS** - neocities has a bug with that. Uploading all the *files* at once is OK though! You have to upload the following:
- folders (drag and drop one by one to load a folder with all its contents):
    - artworks
    - code
    - files
    - style
    - user
- files (basically, upload all .html files from the package):
    - editor.html
    - group.html
    - image.html
    - index.html
    - settingsChecker.html

Click on "index.html" - a page pops up in a new tab. If it displays some test images in a grid - well done, you deployed MyAG!

### 2. open two needed pages in new tabs
In neocities dashboard view (with the folders and all) where you just uploaded the stuff, you have to open (right click + open in new tab for most browsers) two folders in new tabs : 'files' and 'artworks'. On the tab with the 'files' one, click on 'data.xml' - an editor will pop up. you don't have to edit anything; just keep it open. Don't do anything with the 'artworks' folder tab. Keeping these two tabs open, go back to the initial tab with the dashboard view.

### 3. edit user/settings.js
This is the hardest thing you have to do here - this will enable the gallery editor to redirect you automatically. navigate to the "user" folder, then press "edit" at the line showing "settings.js". there are two text lines that you have to edit:

SETTING_neocitiesXmlFileEditLink = "pastelinkhere";
SETTING_neocitiesArtworksFolderLink = "pastelinkhere";

The **pastelinkhere**s have to be replaced with actual links. The first one, SETTING_neocitiesXmlFileEditLink, should get the link to the data.xml file editor tab. Just copy the link from the tab that you opened before, and paste it to the setting.js line. The second one, SETTING_neocitiesArtworksFolderLink, is the same story but with the artworks folder. Don't forget to keep the double quotes! The two lines should look something like this at the end:

SETTING_neocitiesXmlFileEditLink = "https://neocities.org/site_files/files/data.xml";
SETTING_neocitiesArtworksFolderLink = "https://neocities.org/dashboard?dir=Fartworks";

Save the file (ctrl/cmd + S or click the red "save" button) and return to the dashboard view by pressing 'dashboard' at top left corner. Now the bundled gallery editor that helps you edit the image names, infos and groups, will be able to easily redirect you to the artwork upload page and XML update page upon clicking a button.

### 4. customize!
The fun part is that you customize the website look! All the "easy" customization files are located in the "user" folder. You will not have to edit anything else to change things up. Open the file "style.css" in the "user" folder. There are some assignable variables that you can change, with guidance next to them. Feel free to rewrite the default values with custom ones - just be sure to follow the same format that i used and noted in the guide comments if you're not familiar with css! You can open your gallery's index and refresh it to see the results of your customizations. If it doesn't go through, try [force-refreshing](https://www.howtogeek.com/672607/how-to-hard-refresh-your-web-browser-to-bypass-your-cache/) the page.

You can load your user picture to the "files" folder. No size constraints but i suggest resizing to 400x400px. put the filename to the --userpic-file in user/style.css - otherwise it will keep pointing to the question mark image!  

All the pages generate text automatically, except for the landing (index) page. the index page has info that is presented when someone first reaches your webpage! edit "index.html" and put your info instead of the stock text. Done, you're marvelous!

## GALLERY MANAGEMENT TUTORIAL

### 1. Make sure you're logged in to neocities.org
as stupid as it sounds, are you logged in? Log in if not. Security of your XML "database" relies on the security of your neocities.org session. 

### 2. Access editor
neocities doesn't allow writing to files in any way but manually, by accessing the file editor through the dashboard. however, we facilitate this process by reaching a user interface for facilitating the upload of new images. Go to your main page and click on your user picture to have the editor open up in new tab, or access "editor.html" in your gallery's folder manually.

### 3. Add artwork information
Press square "Add new..." button in the framework grid. A little info card comes up for you to fill out. Put the exact filename WITH extention (e.g. *coolartwork.png* or *sanic.jpg*), to the file name field. Do not try to drag and drop the file on this field! this is **not** a file upload window - you will upload the actual image manually in a second! Only the filename is required. If you wish, add more info on this new picture in the "title" and "about" fields.

### 4. Add group
This is not mandatory, but having grouping is nice. Add a group by pressing the rectangular "Add new..." button in the groups (upper) grid. The site will prompt you to enter a group name (64 symbols max - try the current year for starters). If you wish, you can add some info about this group, or leave the about field empty. Hit "create" - your group is now added to the groups grid!

### 5. Assign artwork to group
Note how after you created a group, you can assign an artwork to it. Click on an artwork that you wish to edit, and select "edit". Now you can add this artwork to the group you just created by ticking the corresponding checkbox. You can add one artwork to as many groups as you want, or to none at all.

### 6. Delete stock groups and artworks
The package comes with some pre-packed test images and info. You can go ahead and remove that! Simply click on an artwork that you'd like to remove and hit "delete". The editor will prompt you if you really want to delete that artwork - press "yes". Now, just do this with all the stock artworks and groups! Keep in mind that you are only deleting the record of an image in the database; the actual image file should be deleted manually.

### 7. Update XML
Press the "update xml" button. A new tab will pop up, with an open text editor of "data.xml". The gallery editor already put the updated XML text to your clipboard, so you just have to replace the old one with it. By doing this, you're replacing your old "database" with an updated version. Select everything in the editor (right click on the editing window, 'select all' - or the ctrl-A/cmd-A keyboard shortcut) and delete it with the backspace. Then paste the new text (right click + paste or ctrl-V/cmd-V). Save the file by pressing 'save' on top right or using ctrl-S/cmd-S. Done, you updated your website's "database"!

*Note: generally it's a bad idea to use XML as a database, but for such low access and update rates and lack of backend, it will do.*

### 8. Upload the artwork file
Close the XML file tab, return to the editor page, press the "upload files" button. A new tab pops up, in your /artworks folder. Drag-n-drop your new artwork files to it! Although you did describe the artwork to the database, the actual file isn't on your website just yet, so you have to put it there manually. Same applies for deletion: although you delete an artwork using the editor, you still need to delete the file itself manually.

### 8. Verify!
Check your website! Your new stuff should now be at the top of the index page, and the newly created groups should now show as buttons. If you messed up and didn't paste the XML, in case you didn't close the editor page yet - use the "raw xml" button; it will put the XML text to your clipboard so that you can try to paste it again.

If it doesn't work: my bad, probably :D contact me and we will see what's wrong. This is a one person project and all sorts of stuff may happen. --> [tell me what went wrong](https://astrossoundhell.neocities.org/data/links/)

## CUSTOMIZATION

### Basic

All the user-friendly stuff that changes the look and feel of MyAG is in the ./user folder. "style.css" has some variables that are used throughout the actual stylesheet (./style/main.css) that you can edit! Next to each variable is a little guide of what to do with it. In this file, you can change the fonts and font sizes, borders/corners, colour schemes, etc. The other file, "settings.js", has a few settings that govern how MyAG behaves (and the two mandatory fields that you filled out when deploying the thing). Each setting comes with a guide also. In this file, you can decide what type of page navigation you want, if you want to display the fullsize view button on the big view overlay, etc. Basically, that's about it! These are mere text files, and no coding skill is required to alter them.

### Intermediate

If you need more funky and specific CSS rules -- e.g. you want a border on THIS ONE SPECIFIC element, but not others, you can do so in the ./user/overrides.css file. This is already raw CSS coding, not preset variables in the styles.css file, so i do not guarantee anything at all lmao. All the CSS rules you put here will get loaded *after* everything else, so if you redefine something, it will override the factory styling, hence the name. You can also put your own class/id styling here, if you are adding custom elements. Bear in mind, that it's necessary to put your custom code here and not to the main stylesheet; otherwise you will have big troubles updating.

### Advanced

I mean, this is all text after all! If you want to, go ahead and mess around with the pages' HTML. You can add your own stuff like a banner, or a wiki style table with your info, or whatnot -- see above for where to add styling for this stuff. I *do not recommend* deleting any existing div's. I try writing code so that it just goes on if it does not find some element that it wants, but who knows lol. So, if you want a section gone -- say, you don't want the group buttons div -- just add an inline "display:none" style to it, and it will not be shown. Having custom HTML in the basic pages (index, group, image, editor) means the updating may get clunky at some point, as you won't be able to just wipe out the old files and bring in the new files in case major changes occur to those pages (unlikely). If you're doing this, be sure you know what you're doing!

## UPDATING

### You only did basic or intermediate customizations

Assuming you're running this on neocities.org as intended, you just have to download the [freshest package zip](https://github.com/kouyouelysian/myartgallery/archive/refs/heads/main.zip), in your neocities myag instance - delete the following
- folders: style, code
- files: editor.html, group.html, image.html, index.html, settingsChecker.html
and replace them with the same files/folders from the new package. If all goes right, everything should start working off the bat. If it is wonky, access the settingsChecker.html page and see if your settings.js file is up-to-date. Still sucks? [Tell me what's up](https://astrossoundhell.neocities.org/data/links/).

### You did advanced customizations

Basically, same story as above, but you back up your customized .html pages, and then roll your custom stuff over to the new pages. Good luck :D  



