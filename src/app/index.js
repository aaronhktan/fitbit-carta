import { me } from 'appbit';
import clock from 'clock';
import { HeartRateSensor } from 'heart-rate';
import { inbox } from 'file-transfer';
import * as messaging from 'messaging';
import { today } from 'user-activity';
import { preferences } from 'user-settings';
import * as util from './utils';

import UI from './ui'
import Settings from './settings'

// Update the clock every minute
clock.granularity = "minutes";

// Create heart rate sensor object
var hrm = new HeartRateSensor();
hrm.start();

// Create UI and settings object
var ui = new UI();
var settings = new Settings();

ui.backgroundImage.image = settings.lastFilename;

// Update the <text> element every tick with the current time
clock.ontick = evt => {
  let now = evt.date;
  let hours = now.getHours();
  if (preferences.clockDisplay === '12h') {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(now.getMinutes());
  ui.timeLabel.text = `${hours}:${mins}`;
  ui.setLocationLabelText(settings.state, settings.location, hrm.heartRate, today.local.steps, today.local.calories);
  ui.setTimeLabelLocation(settings.timeLabelOption);
}

// Save settings on unload
me.onunload = () => {
  settings.save();
};

ui.rectFull.onmousedown = () => {
  settings.incrementState();
  ui.setLocationLabelText(settings.state, settings.location, hrm.heartRate, today.local.steps, today.local.calories);
  ui.setTimeLabelLocation(settings.timeLabelOption);
}

// Update settings every time we receive a message
messaging.peerSocket.onmessage = evt => {
  if (evt.data.key == 'timePlacement') {
    let timePlacement = evt.data.data.values[0].value;
    console.log(`Received timePlacement: ${timePlacement}`);
    
    ui.setTimeLabelLocation(timePlacement);
    settings.timeLabelOption = timePlacement;
  } else if (evt.data.key == 'city') {
    let location = evt.data.data['name'];
    console.log(`Received location: ${location}`);
    
    settings.location = location;
    ui.setLocationLabelText(settings.state, settings.location, hrm.heartRate, today.local.steps, today.local.calories);
    ui.setTimeLabelLocation(settings.timeLabelOption);
  }
}

// Fires when clock receives an image from the companion
inbox.onnewfile = () => {
  let filename = '';
  do {
    filename = inbox.nextFile();
    if (filename) {
      let filepath = '/private/data/' + filename;
      console.log(`Received file: ${filepath}`);
      ui.backgroundImage.image = filepath;
      settings.lastFilename = filepath;
    }
  } while (filename);
};

// If there is a file, move it from staging into the application folder
// This happens if images are transferred while clock is closed on the watch
do {
  let filename = inbox.nextFile();
  if (filename) {
    let filepath = '/private/data/' + filename;
    console.log(`Received file: ${filepath}`);
    ui.backgroundImage.image = filepath;
    settings.lastFilename = filepath;
  }
} while (filename);