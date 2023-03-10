# myartgallery
MyArtGallery for Neocities

=== STEP BY STEP ROLLOUT GUIDE ===

## 1. load the package contents to neocities.
this means going to the dashboard view (where you can make and delete files, etc),
then dragging and dropping each folder, one by one, to the website.
DO NOT GROUP-LOAD FOLDERS! neocities has a bug with it.
Uploading all the files at once is OK though!

## 2. open some pages in new tabs
in neocities dashboard view (with the folders and all) where you just uploaded the stuff,
open the "artworks" folder and "files" folder, each in its own new tab
(right click + open in new tab for most browsers)
keep these open, go back to the first tab with dashboard view

## 3. edit code/myag_editor.js
this is the hardest thing you have to do here - this will enable the gallery editor
to redirect you instantly. navigate to "code" folder, then press "edit" at the
line showing "myag_editor.js". at the very top of the page there are two lines
where you have to paste your links with further guidance. the two lines should
look something like this at the end:

USER_neocitiesXmlFileEditLink = "https://neocities.org/site_files/files/data.xml";
USER_neocitiesArtworksFolderLink = "https://neocities.org/dashboard?dir=Fartworks";

save the file and return to the dashboard view by pressing 'dashboard' at top left corner.

## 4. customize!
the fun part where you customize the website looks.
open the file "main.css" in the "style" folder, and then your website index page in a new tab.
in the very top of main.css are some assignable variables that you can change, with some
guidance next to them. feel free to erase the default values and replace them with your
own ones - just be sure to follow the same format that i used if you're not familiar with css!

your user picture is stored in "files" as "userpic.png". delete the included picture and
upload your own (no size constraints but i suggest resizing to 400x400px)

all the pages generate text automatically, except for the landing (index) page.
the index page has info that is presented when someone first reaches your webpage!
edit "index.html" and put your info up! Done, you're marvelous.

=== STEP BY STEP IMAGE UPLOAD GUIDE ===

## 1. Make sure you're logged in to neocities.org
as stupid as it sounds, are you logged in?

## 2. Access editor
neocities doesn't allow writing to files in any way but manually, by accessing the file editor
through the dashboard. however, we facilitate this process by reaching a user interface for
facilitating the upload of new images. Go to your main page and click on your user picture
to have the editor open up in new tab.

## 3. Add artwork
press "+new artwork field". A little info card comes up for you to fill out.
Put the name of your artwork to the "name" field.
Put the exact filename WITH extention (e.g. coolartwork.png, sanic.jpg), to the "file" field
do not try to drag and drop the file on this field! this is not a file upload window, you will
upload the actual image manually in a second.
Write something about this new picture in the "about" window. leave it empty if you don't
want to write anything about this.

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
Press the "done" button. A new tab will pop up, with an open editor of "data.xml".
The editor put new correct XML to your clipboard already, so you just have to replace
the old one with it.
Select everything in the editor (right click on the editing window, 'select all')
and delete it with backspace. Then paste the text (right click + paste). You can, of course,
use hotkeys, too. Save the file by pressing 'save' on top right. Done, you updated your
website's "database"!

## 7. upload picture
if you return to the tab which had the gallery editor open, you will find it open at
the "artworks" folder in dashboard view. Simply drag and drop your new artwork image file
there.

## 8. Verify!
Check your website! Your new stuff should now be at the bottom of the index page, and the
newly created groups now show as buttons. If it doesn't: oops :D contact me and we will
see what's wrong. astrossoundhell.neocities.org


