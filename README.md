# Airtable Cartography

A script that allows you to visualize your records on a map, based on the [Airtable Extensions](https://support.airtable.com/docs/airtable-extensions-overview).

## Usage
- the basemap.html file needs to be hosted somewhere (you can use [https://basteks.github.io/basemap.html](https://basteks.github.io/basemap.html) for testing purpose only)
- the content of the map_generation.js file needs to be copied in a new Scripting Extension in your Airtable base (warning, Extensions are not available with free plan !)

Once you create your Extension, access the settings page by clicking the gear icon in the top right corner
Here are the available settings :
- *URL* of the basemap.html file
- *Current location* : a Yes/No option to choose if you want to display your current location on the map
- *Table* : the table containing the records you want to visualize
- *View* : the view containing the records
- *Latitude* : the latitude field (**number type**)
- *Longitude* : the longitude field (**number type**)
- *Title* : the field containing the title of each marker's popup
- *Grouping* : a Yes/No option to choose if you want to group your records by the title. If you do, a single marker will be shown for every record having the same *title* field, the marker's popup then containing a `<ul></ul>` list of *popup contents* (see bellow) for every record
- *Popup content* : the text to display in the popup for each record. For the  first run, you can write anything, it will be configured during later. Afterwards, you will have to copy/paste the desired string here, composed of fields' names between curly brackets, for example `{First Name} {Last Name} : {Age}`)

## Limitations
As all the displayed data (GPS coordinates and data to display on popup) are passed through the URI of the map, you may encounter a _414 URI Too Long_ error if you try to display too much markers or too much data for each marker on your map.

## ToDo
- Add support for special field rendering like URLs, mails or attachment by creating an html `href` link.
- Convert this script to a proper extension in order to avoid the basemap.html file hosting and to get rid of the potential 414 URI Too Long error.

## Credits
Based on the great [Leaflet](https://leafletjs.com/) JavaScript library for interactive maps, and on the [Leaflet.awesome-markers](https://github.com/lennardv2/Leaflet.awesome-markers) plugin (this version only allow color on markers, but no icons yet)
