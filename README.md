# Airtable Cartography

A script that allows you to display your GPS coordinates as markers on a map, based on the [Airtable Extensions](https://support.airtable.com/docs/airtable-extensions-overview).

## Usage
- the content of the cartography-airtable.js file needs to be copied in a new [Scripting Extension](https://support.airtable.com/docs/en/scripting-extension-overview) in your Airtable base (warning, Extensions are not available with free plan !)
- the content of the html folder needs to be hosted somewhere (you can use [https://basteks.github.io/cartography/basemap.html](https://basteks.github.io/cartography/basemap.html) for testing purpose)

Once you create your Extension, access the settings page by clicking the gear icon that appears when hovering over the upper right corner.
Here are the available settings :
- *URL*: URL of the basemap.html file
- *Current location*: Would you like to display your current location on the map ?. The options are _no_, _static_ (gets current location only once) or _track_ (updates the marker each time the current location changes)
- *Table*: the table containing the records you want to visualize
- *View*: the view containing the records
- *Latitude*: the latitude field (**number type**)
- *Longitude*: the longitude field (**number type**)
- *Title*: the field containing the title of each marker's popup
- *Grouping*: do you want to group your records by title ? If you do so, a single marker will be shown for every record having the same *title* field, the marker's popup then containing a `<ul></ul>` list of *popup contents* (see bellow) for every record. The options are _yes_ or _no_
- *Popup content*: the text to display in the popup for each record. You can create the desired string here, composed of fields' names between curly brackets, for example `{First Name} {Last Name} : {Age}`. You can also let it empty if you don't want to dosplay anything else that the popup's title. For the  first run, you can write anything (it has to be not empty), it will be configured during the first script run. After this, you will have to copy/paste the desired string in this field

## Limitations
As all the displayed data (GPS coordinates and data to display on popup) are passed through the URI of the map, you may encounter a _414 URI Too Long_ error if you try to display too much markers or too much data for each marker on your map.

## ToDo
- Add support for special field rendering like URLs, mails or attachment by creating an html `href` link, or images
- Convert this script to a proper extension in order to avoid the basemap.html file hosting and to get rid of the potential _414 URI Too Long_ error

## Credits
Based on the great [Leaflet](https://leafletjs.com/) JavaScript library for interactive maps, and on the [leaflet-color-markers](https://github.com/pointhi/leaflet-color-markers) repo (directly getting images URL from the repo)
