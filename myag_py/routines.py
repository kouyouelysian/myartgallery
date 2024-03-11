import json
import xml.etree.ElementTree as xmlet
import xml.dom as xmldom

def makethumbs(channel_instance, request_instance):

	print('painis')
	return
	
	json_datafiles = json.loads(post_request.form['datafiles']);
	for f in json_datafiles:
		if 'data.xml' in f['remote_name']:
			f['contents'] = addThumbnailFields(f['contents'])




def addThumbnailFields(dbtext):
	xml = xmlet.fromstring(dbtext)
	artwoks = xml.findall("artwork")
