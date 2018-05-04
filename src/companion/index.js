import * as fs from 'fs';
import { outbox } from 'file-transfer';
import { geolocation } from 'geolocation';
import * as messaging from 'messaging';
import { device } from 'peer';
import { settingsStorage } from 'settings';

if (!device.screen) device.screen = { width: 348, height: 250 };

var palettes = {
  'grey':           {roadColor: '0xafafaf',
                     waterColor: '0x444444'},
  'red':            {roadColor: '0xff91a4',
                     waterColor: '0x51090b'},
  'lightsalmon':    {roadColor: '0xffa07a',
                     waterColor: '0x882d17'},
  'peach':          {roadColor: '0xffcc33',
                     waterColor: '0x6d560f'},
  'yellow':         {roadColor: '0xfff55e',
                     waterColor: '0xB8860B'},
  'lime':           {roadColor: '0x5be37d',
                     waterColor: '0x013220'},
  'teal':           {roadColor: '0x00ffff',
                     waterColor: '0x0d7c7c'},
  'cyan':           {roadColor: '0x14d3f5',
                     waterColor: '0x095a68'},
  'orchid':         {roadColor: '0xda70d6',
                     waterColor: '0x70396e'},
  'pink':           {roadColor: '0xe572af',
                     waterColor: '0x5e122d'},
};
var imageCount = 0;
if (settingsStorage.getItem('count') != null) {
  var lastCount = settingsStorage.getItem('count');
}

// Uses fetch() API to get data from the Internet
function fetchURL(url) {
  console.log(`URL requested is ${url}`);
  return fetch(url)
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

// Gets a map
function getMap(position) {
  let url = 'https://maps.googleapis.com/maps/api/staticmap?';
  
  // Build some parameters
  let params = ['format=jpg-baseline',
                'key=AIzaSyCZUysMzO0r0_TkCHAbai0Yn9ap8PFMekQ',
                'style=feature:poi|visibility:off',
                'style=feature:administrative|element:geometry.fill|visibility:off',
                'style=feature:administrative|element:geometry.stroke|visibility:off',
                'style=feature:landscape|element:geometry.fill|color:0x000000',
                'style=feature:transit|visibility:off'];

  let palette = 'grey';
  if (settingsStorage.getItem('palette') !== null) {
    palette = stripQuotes(settingsStorage.getItem('palette'));
  }
  let roadColor = palettes[palette].roadColor;
  let waterColor = palettes[palette].waterColor;
  params.push(`style=feature:road|color:${roadColor}|lightness:-25|visibility:simplified`);
  params.push(`style=feature:road.local|color:${roadColor}|lightness:-50|visibility:on`);
  params.push(`style=feature:water|color:${waterColor}`);
  params.push(`style=feature:all|element:labels|visibility:off`); // Order matters! Always put labels last
  
  if (device.screen.width == 348) {
    params.push('size=348x270');
  } else {
    params.push('size=300x320');
  }
  
  let zoomLevel = '10';
  if (settingsStorage.getItem('zoomLevel') !== null) {
    zoomLevel = JSON.stringify(JSON.parse(settingsStorage.getItem('zoomLevel')).values[0].value);
  }
  params.push('zoom=' + zoomLevel);
  
  let location = '';
  try {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    console.log(`Latitude: ${latitude}`, `Longitude: ${longitude}`);
    location = '"' + [latitude, longitude].join(', ') + '"';
    // location = '"31.230390, 121.473702"'; // For testing
    console.log(`Final location is ${location}`);
    let cityValue = JSON.stringify({'name': `${Math.abs(latitude.toFixed(2))}°${latitude >= 0 ? 'N' : 'S'}, `
                                   + `${Math.abs(longitude.toFixed(2))}°${longitude >= 0 ? 'E' : 'W'}`});
    let data = {
      key: 'city',
      newValue: cityValue
    };
    sendVal(data);
  } catch (e) {
    location = position;
  }
  params.push('center=' + location);
  
  // Construct url and fetch image
  fetchURL(url + params.join('&')).then((data) => {
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

// Logs errors
function logError(error) {
  console.log(`Error: ${error.code}`,
              `Message: ${error.message}`);
}

// Send over new settings to watch when settings are changed
settingsStorage.onchange = evt => {
  if (evt.key == 'timePlacement') { // Send over where the time should be located
    console.log(`New timeLocation is ${evt.newValue}`)
    let data = {
      key: evt.key,
      newValue: evt.newValue
    };
    sendVal(data);
  } else if (evt.key == 'toggleCity') {
    if (evt.newValue === 'true') { // Fetch new image if cities are enabled
      if (settingsStorage.getItem('city') !== null) { // Make sure there is a city first!
        let city = JSON.parse(settingsStorage.getItem('city')).name;
        getMap(city);
        
        let city = JSON.parse(settingsStorage.getItem('city')).name;
        let cityValue = JSON.stringify({'name': city});
        let data = {
          key: 'city',
          newValue: cityValue
        };
        sendVal(data);
      }
    } else { // Use current location if city is not enabled
      geolocation.getCurrentPosition(getMap, logError);
    }
  } else if (evt.key == 'city') { // Fetch new image if city is changed
    let city = JSON.parse(evt.newValue).name;
    console.log(`New city is: ${city}`);
    getMap(city);
    let data = {
      key: evt.key,
      newValue: evt.newValue
    };
    sendVal(data);
  } else if (evt.key == 'zoomLevel') {
    if (settingsStorage.getItem('toggleCity') === 'true' // Fetch new image if cities are enabled
        && settingsStorage.getItem('city') != null) { // Make sure there is a city first!
      let city = JSON.parse(settingsStorage.getItem('city')).name;
      getMap(city);
    } else { // Use current location if city is not enabled
      geolocation.getCurrentPosition(getMap, logError);
    }
  } else if (evt.key == 'palette') {
    if (settingsStorage.getItem('toggleCity') === 'true'
        && settingsStorage.getItem('city') !== null) {
      let city = JSON.parse(settingsStorage.getItem('city')).name;
      getMap(city);
    } else { // Use current location if city is not enabled
      geolocation.getCurrentPosition(getMap, logError);
    }
  }
};

// Restores settings on every new launch
function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key) {
      if (key == 'city' && settingsStorage.getItem('toggleCity') !== 'true') {
        continue;
      }
      let data = {
        key: key,
        newValue: settingsStorage.getItem(key)
      };
      sendVal(data);
    }
  }
}

// Send over settings on open since user may have changed them while app was closed
messaging.peerSocket.onopen = () => {
  restoreSettings();
  if (settingsStorage.getItem('city') !== null
      && settingsStorage.getItem('toggleCity') === 'true') {
    let city = JSON.parse(settingsStorage.getItem('city')).name;
    getMap(city);
  } else {
    geolocation.getCurrentPosition(getMap, logError);
  }
}

// Convenience functions
function sendVal(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

function stripQuotes(str) {
  return str ? str.replace(/"/g, "") : "";
}