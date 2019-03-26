import * as fs from 'fs';
import { outbox } from 'file-transfer';
import { geolocation } from 'geolocation';
import * as messaging from 'messaging';
import { device } from 'peer';
import { settingsStorage } from 'settings';
import * as util from './utils';

if (!device.screen) device.screen = { width: 348, height: 250 };

const palettes = {
  'grey':           {'roadColor': '0xafafaf',
                     'waterColor': '0x444444'},
  'red':            {'roadColor': '0xff91a4',
                     'waterColor': '0x51090b'},
  'lightsalmon':    {'roadColor': '0xffa07a',
                     'waterColor': '0x882d17'},
  'peach':          {'roadColor': '0xffcc33',
                     'waterColor': '0x6d560f'},
  'yellow':         {'roadColor': '0xfff55e',
                     'waterColor': '0xB8860B'},
  'lime':           {'roadColor': '0x5be37d',
                     'waterColor': '0x013220'},
  'teal':           {'roadColor': '0x00ffff',
                     'waterColor': '0x0d7c7c'},
  'cyan':           {'roadColor': '0x14d3f5',
                     'waterColor': '0x095a68'},
  'orchid':         {'roadColor': '0xda70d6',
                     'waterColor': '0x70396e'},
  'pink':           {'roadColor': '0xe572af',
                     'waterColor': '0x5e122d'},
};
var imageCount = 0;
if (settingsStorage.getItem('count') != null) {
  var lastCount = settingsStorage.getItem('count');
}

// Uses fetch() API to get data from the Internet
function fetchImage(url) {
  console.log(`URL requested is ${encodeURI(url)}`);
  return fetch(encodeURI(url))
    .then((response) => {
      if (response.url !== url && response.status > 200) {
        console.log(`Could not get image!`);
      } else {
        return response.arrayBuffer();
      }
    }).catch((error) => {
      console.log(`An error occurred: ${error}`);
    })
}

// Build URL with settings and position
function buildURL(position) {
  // Base URL
  let url = 'https://maps.googleapis.com/maps/api/staticmap?';
  
  // Build some parameters
  let params = ['format=jpg-baseline',
                'key=AIzaSyCZUysMzO0r0_TkCHAbai0Yn9ap8PFMekQ',
                'style=feature:poi|visibility:off',
                'style=feature:administrative|element:geometry.fill|visibility:off',
                'style=feature:administrative|element:geometry.stroke|visibility:off',
                'style=feature:landscape|element:geometry.fill|color:0x000000',
                'style=feature:transit|visibility:off'];

  // Colour
  let palette = 'grey';
  if (settingsStorage.getItem('palette') !== null) {
    palette = JSON.parse(settingsStorage.getItem('palette'));
  }
  let roadColor = palettes[palette].roadColor;
  let waterColor = palettes[palette].waterColor;
  params.push(`style=feature:road|color:${roadColor}|lightness:-25|visibility:simplified`);
  params.push(`style=feature:road.local|color:${roadColor}|lightness:-50|visibility:on`);
  params.push(`style=feature:water|color:${waterColor}`);
  params.push(`style=feature:all|element:labels|visibility:off`); // Order matters! Always put labels last

  // Dimensions
  params.push(`size=${device.screen.width}x${device.screen.height + 20}`);
  
  // Zoom level
  let zoomLevel = '10';
  if (settingsStorage.getItem('zoomLevel') !== null) {
    zoomLevel = JSON.stringify(JSON.parse(settingsStorage.getItem('zoomLevel')).values[0].value);
  }
  params.push('zoom=' + zoomLevel);

  // Location
  let location = position;
  params.push('center=' + location);

  return url + params.join('&');
}

// Gets a map, sends location of map, and sends map to device
function fetchAndSendMap(position) {
  let cityValue = {};
  if (typeof position === 'object') {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    console.log(`Latitude: ${latitude}`, `Longitude: ${longitude}`);
    position = '"' + [latitude, longitude].join(', ') + '"';
    // location = '"31.230390, 121.473702"'; // For testing
    // console.log(`Final location string is ${location}`);

    cityValue = {'name': `${Math.abs(latitude.toFixed(2))}°${latitude >= 0 ? 'N' : 'S'}, `
                            + `${Math.abs(longitude.toFixed(2))}°${longitude >= 0 ? 'E' : 'W'}`};
  } else {
    cityValue = {'name': position};
  }

  let data = util.createData('city', cityValue);
  sendVal(data);

  let url = buildURL(position);

  // Construct url and fetch image, then send it
  fetchImage(url).then((data) => {
    imageCount++;
    
    // Prevent collisions for filenames
    if (imageCount == lastCount) {
      imageCount++;
    }
    settingsStorage.setItem('count', imageCount);
    
    outbox.enqueue(`map${imageCount}.jpg`, data).then((ft) => {
      console.log('Successfully queued transfer');
    }).catch((error) => {
      console.log(`Error queueing: ${error}`);
    })
  });
}

// Check whether to use a set location for image
// Or use Geolocation API to get user's current location
function checkPositionAndFetch() {
  if (settingsStorage.getItem('toggleCity') === 'true'
    && settingsStorage.getItem('city') != null) {
    let city = JSON.parse(settingsStorage.getItem('city')).name;
    fetchAndSendMap(city);
  } else { // Use current location if city is not enabled
    geolocation.getCurrentPosition(fetchAndSendMap, util.logError);
  }
}

// Send over new settings to watch when settings are changed
settingsStorage.onchange = evt => {
  switch (evt.key) {
    case 'timePlacement':
      let data = util.createData(evt.key, JSON.parse(evt.newValue));
      sendVal(data);
      break;
    case 'toggleCity':
      checkPositionAndFetch();
      break;
    case 'city':
      let city = JSON.parse(evt.newValue).name;
      fetchAndSendMap(city);
      break;
    case 'zoomLevel':
      checkPositionAndFetch();
      break;
    case 'palette':
      checkPositionAndFetch();
      break;
  }
};

// Restores settings on every new launch
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (!key) {
      continue;
    }

    if (key == 'city' && settingsStorage.getItem('toggleCity') !== 'true') {
      continue;
    }

    if (key == 'count') {
      continue;
    }

    let data = util.createData(key, JSON.parse(settingsStorage.getItem(key)));
    sendVal(data);
  }
}

// Send over settings on open since user may have changed them while app was closed
// Then fetch the new map
messaging.peerSocket.onopen = () => {
  restoreSettings();
  setTimeout(checkPositionAndFetch, 10000);
}

// Convenience functions
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}