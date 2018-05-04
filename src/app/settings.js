import { me as device } from 'device';
import * as fs from 'fs';

if (!device.screen) device.screen = { width: 348, height: 250 };

export default class Settings {
  _timeLabelOption;
  _location;
  _lastFilename;
  _state = 0;
  _currentSettingsVersion = 1;
  
  constructor() {
    try {
      var savedSettings = fs.readFileSync('settings.txt', 'cbor');
      if (savedSettings) {
        if (savedSettings.timeLabelOption !== undefined) {
          this._timeLabelOption = parseInt(savedSettings.timeLabelOption);
        }
        if (savedSettings.location !== undefined) {
          this._location = savedSettings.location
        }
        if (savedSettings.lastFilename !== undefined) {
          this._lastFilename = savedSettings.lastFilename;
        }
        if (savedSettings.state !== undefined) {
          this._state = savedSettings.state;
        }
      }
    } catch (e) {
      console.log('Settings not found; defaulting to presets.');
    }
  }

  save() {
    let json_data = {
      'timeLabelOption': this._timeLabelOption,
      'location': this._location,
      'lastFilename': this._lastFilename,
      'state': this._state,
      'version': this._currentSettingsVersion
    }
    fs.writeFileSync('settings.txt', json_data, 'cbor');
  }

  get timeLabelOption() {
    if (this._timeLabelOption === undefined) return 2;
    return this._timeLabelOption;
  }

  set timeLabelOption(option) {
    if (option == 0 || option == 1 || option == 2 || option == 3) {
      this._timeLabelOption = option;
    } else {
      this._timeLabelOption = 2;
    }
    this.save();
  }

  get location() {
    if (this._location === undefined) return '';
    return this._location;
  }

  set location(data) {
    this._location = data;
    this.save();
  } 

  get lastFilename() {
    if (this._lastFilename === undefined) {
      if (device.screen.width == 300) {
        return './resources/hong_kong.png';
      } else {
        return './resources/hong_kong.png';
      }
    }
    return this._lastFilename;
  }

  set lastFilename(filename) {
    this._lastFilename = filename;
    this.save();
  }

  get state() {
    if (this._state === undefined) {
      return 0;
    }
    return this._state;
  }

  incrementState() {
    if (this._state == 5) {
      this._state = 0;
    } else {
     this._state++;
    }
    this.save();
  }
}