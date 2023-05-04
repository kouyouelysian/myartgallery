# myartgallery
MyArtGallery for Neocities

=== STEP BY STEP ROLLOUT GUIDE ===

## 1. load the package contents to neocities.
this means going to the dashboard view (where you can make and delete files, etc),
then dragging and dropping each folder, one by one, to the website.
DO NOT GROUP-LOAD FOLDERS! neocities has a bug with it.
Uploading all the files at once is OK though!

## 2. open some pages in new tabs
in neocities dashboard view (with the folders and all) where you just uploaded the stuff, you have to open two folder in new tabs (right click + open in new tab for most browsers): 'files' and 'artworks'. On the 'files' tab, click on 'data.xml' - an editor will pop up. you don't have to edit anything; just keep it open. Don't do anything with the 'artworks' folder tab. Keeping these open, go back to the initial tab with the dashboard view.

## 3. edit user/settings.js
this is the hardest thing you have to do here - this will enable the gallery editor to redirect you automatically. navigate to the "settings" folder, then press "edit" at the line showing "settings.js". there are two lines where you have to paste links:

SETTING_neocitiesXmlFileEditLink = "pastelinkhere";
SETTING_neocitiesArtworksFolderLink = "pastelinkhere";

The **pastelinkhere**s have to be replaced with actual links. The first one, SETTING_neocitiesXmlFileEditLink, should get the link to the data.xml file editor tab. Just copy the link from the tab that you opened before, and paste it to the setting.js line. The second one, SETTING_neocitiesArtworksFolderLink, is the same story but with the artworks folder. The two lines should look something like this at the end:

SETTING_neocitiesXmlFileEditLink = "https://neocities.org/site_files/files/data.xml";
SETTING_neocitiesArtworksFolderLink = "https://neocities.org/dashboard?dir=Fartworks";

Save the file (ctrl/cmd + S or click "save") and return to the dashboard view by pressing 'dashboard' at top left corner. Now the editor that helps you edit the image names, infos and groups, will be able to easily redirect you to the artwork upload page and XML update page upon clicking a button.

## 4. customize!
the fun part where you customize the website looks.
open the file "style.css" in the "user" folder, and then your website index page in a new tab.
in the very top of main.css are some assignable variables that you can change, with some
guidance next to them. feel free to erase the default values and replace them with your
own ones - just be sure to follow the same format that i used if you're not familiar with css!

you can load your user picture to the "files" folder. No size constraints but i suggest resizing
to 400x400px. put the filename to the --userpic-file in vars.css - otherwise it will keep
pointing to the question mark image!  

all the pages generate text automatically, except for the landing (index) page.
the index page has info that is presented when someone first reaches your webpage!
edit "index.html" and put your info instead of the stock text. Done, you're marvelous!

=== STEP BY STEP IMAGE UPLOAD GUIDE ===

## 1. Make sure you're logged in to neocities.org
as stupid as it sounds, are you logged in? Log in if not. Security of your XML "database"
relies on the security of your neocities.org session. 

## 2. Access editor
neocities doesn't allow writing to files in any way but manually, by accessing the file editor
through the dashboard. however, we facilitate this process by reaching a user interface for
facilitating the upload of new images. Go to your main page and click on your user picture
to have the editor open up in new tab.

## 3. Add artwork
press "+new artwork field". A little info card comes up for you to fill out.
Put the exact filename WITH extention (e.g. coolartwork.png, sanic.jpg), to the "file" field
do not try to drag and drop the file on this field! this is not a file upload window, you will
upload the actual image manually in a second! Only the filename is required.
Write something about this new picture in the "about" window. and name it in the "name" window.
leave it empty if you don't want this image to have a displayed name or about-text.

## 4. Add group
This is not mandatory, but having grouping is nice. Add a group by pressing "+add group field".
the site will prompt you to enter a group name (keep it short! try current year for a test).
Upon success, a new group info card will appear. You can add some info on this group, or
leave the about field empty if you wish to not say much.

## 5. Assign artwork to group
Note how after you created a group, a checkbox appeared on every artwork info card. use these
to show if an artwork belongs in a certain group. As you add, delete and rename groups, they
will automatically get updated across artwork entries.

## 6. Update XML
Press the "update xml" button. A new tab will pop up, with an open editor of "data.xml".
The editor put new correct XML to your clipboard already, so you just have to replace
the old one with it.
Select everything in the editor (right click on the editing window, 'select all' - or keyboard
shortcut) and delete it with backspace. Then paste the text (right click + paste). Save the
file by pressing 'save' on top right. Done, you updated your website's "database"!
Note: generally it's a bad idea to use XML as a database, but for such low access and update
rates and lack of backend, it will do.

## 7. upload picture
Close the XML file tab, return to the editor page, press the "upload files" button.
A new tab pops up, in your /artworks folder. Drag-n-drop your artwork files to it.

## 8. Verify!
Check your website! Your new stuff should now be at the top of the index page, and the
newly created groups now show as buttons. If you messed up and didn't paste the XML, in
case you didn't close the editor yet - use the "raw xml" button; it will put the XML
text to your clipboard so that you can try to paste it again.

If it doesn't work: oops :D contact me and we will see what's wrong. This is a one person project
and all sorts of stuff may happen. --> astrossoundhell.neocities.org


