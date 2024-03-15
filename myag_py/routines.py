import json
import xml.etree.ElementTree as xmlet
import xml.dom as xmldom
import nmfunctions as nm
from math import floor
from PIL import Image
from urllib.request import urlopen
import os
import io
import bmco
from werkzeug.utils import secure_filename

awids_without_thumbnails = []

def xmldoc(post_request):
	json_datafiles = json.loads(post_request.form['datafiles']);
	xml = None
	for f in json_datafiles:
		if 'data.xml' in f['remote_name']:
			xml = xmlet.fromstring(f['contents'])
	if xml == None:
		raise ValueError("no xml file found in post request datafiles dict, cannot add thumbnails!")
	return xml

def routine_thumbs_xml(channel_instance, post_request, neocities):

	# update JS tags - in case there are older uploads without thumbs
	xml = xmldoc(post_request)
	for aw in xml.find("artworks").findall("artwork"):
		if aw.findtext("thumbnail") == None:
			thumb_name = make_thumb_name(aw.findtext("awid"))
			nm.xmlAddChildWithText(aw, "thumbnail", thumb_name)			
			awids_without_thumbnails.append(aw.findtext("awid"))
			
	json_datafiles = json.loads(post_request.form['datafiles']);
	for f in json_datafiles:
		if 'data.xml' in f['remote_name']:
			f['contents'] = xmlet.tostring(xml, encoding="unicode")
	post_request.form['datafiles'] = json.dumps(json_datafiles)




def filename_by_awid(xmldoc, awid):
	for aw in xmldoc.find("artworks").findall("artwork"):
		if aw.findtext("awid") == awid:
			return aw.findtext("filename")
	return False




def routine_thumbs_files(channel_instance, post_request, neocities):
	
	remote_folder = os.path.join(channel_instance.location, "myag_artworks").replace('./', '')
	remote_names = json.loads(post_request.form['uploadnames'])

	# this checks AWIDs that were fixed in routine_thumbs_xml, and if any of them are not a fresh upload - make a thumb from remote image
	xml = xmldoc(post_request)
	for awid in awids_without_thumbnails:
		if [upload for upload in remote_names if awid_from_filename(upload["remote_name"]) == awid] == []:
			# we did not find this awid in new uploads
			# this means it's an old artwork that has no thumb; grabbing image remotely
			original = filename_by_awid(xml, awid)
			if not original:
				continue
			send_thumb(remote_folder, original, awid, neocities, local=False)

	# this makes and uploads thumbs for the fresh uploads
	for upload_id in post_request.files:
		file = post_request.files[upload_id]
		filename = secure_filename(file.filename)
		local_name = os.path.join("./data/temp", filename)
		awid = os.path.splitext(os.path.basename(next(upload for upload in remote_names if upload["upload_tag_id"] == upload_id)["remote_name"]))[0] #AHAHAHAHAH ! :D
		send_thumb(remote_folder, local_name, awid, neocities)


def awid_from_filename(arg):
	return os.path.splitext(os.path.basename(arg))[0]

def make_thumb_name(arg):
	return "{}_thumb.png".format(arg)


def send_thumb(remote_folder, file, awid, neocities, local=True):
	image = None
	if local:
		image = Image.open(file)
	else:
		fd = urlopen(os.path.join("https://{}.neocities.org".format(nm.fetchSiteName(neocities.api_key)), remote_folder, file))
		image_file = io.BytesIO(fd.read())
		image = Image.open(image_file)

	if not image:
		return

	thumb = make_thumb(image)
	name = "./data/temp/thumb_{}.png".format(bmco.randString())
	thumb.save(name)
	remote_name = os.path.join(remote_folder, make_thumb_name(awid))
	tup = (name, remote_name)
	print(tup)
	neocities.upload(tup)




def make_thumb(pil_image, thumb_bigger_side = 200):
	w, h = pil_image.size
	bigger_side = max(w, h)
	if bigger_side < thumb_bigger_side:
		return pil_image
	ratio =  thumb_bigger_side/bigger_side
	newsize = (floor(w*ratio), floor(h*ratio))
	return pil_image.resize(newsize)