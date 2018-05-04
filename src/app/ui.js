import { me as device } from 'device';
import document from 'document';

if (!device.screen) device.screen = { width: 348, height: 250 };

var weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export default class UI {
  _mask;
  _rectFull;
  _timeLabel;
  _locationLabel;
  _backgroundImage;
  
  constructor() {
    this._mask = document.getElementById('mask');
    this._rectFull = document.getElementById('rectFull');
    this._timeLabel = document.getElementById('timeLabel');
    this._locationLabel = document.getElementById('locationLabel');
    this._backgroundImage = document.getElementById('backgroundImage');
    
    this._circleTL = this._mask.getElementById('circleTL');
    this._circleTR = this._mask.getElementById('circleTR');
    this._circleBL = this._mask.getElementById('circleBL');
    this._circleBR = this._mask.getElementById('circleBR');
    this._rectTop = this._mask.getElementById('rectTop');
    this._rectBottom = this._mask.getElementById('rectBottom');
    if (device.screen.width == 348) {
      this._circleTL.cx = 0.07 * device.screen.width;
      this._circleTR.cx = 0.93 * device.screen.width;
      this._circleBL.cx = 0.07 * device.screen.width;
      this._circleBR.cx = 0.93 * device.screen.width;
      this._rectTop.x = 0.07 * device.screen.width;
      this._rectTop.width = 0.86 * device.screen.width;
      this._rectBottom.x = 0.07 * device.screen.width;
      this._rectBottom.width = 0.86 * device.screen.width;
    }
  }
  
  setTimeLabelLocation(option) {
    let locationOption = parseInt(option);
    switch(locationOption) {
      case 0:
        this._timeLabel.x = 0.05 * device.screen.width;
        this._timeLabel.y = 0.25 * device.screen.height;
        this._locationLabel.x = 0.07 * device.screen.width;
        if (device.screen.height == 250) {
          this._locationLabel.y = 0.36 * device.screen.height;
        } else {
          this._locationLabel.y = 0.34 * device.screen.height;
        }
        break;
      case 1:
        this._timeLabel.x = 0.95 * device.screen.width - this._timeLabel.getBBox().width;
        this._timeLabel.y = 0.25 * device.screen.height;
        this._locationLabel.x = 0.93 * device.screen.width - this._locationLabel.getBBox().width;
        if (device.screen.height == 250) {
          this._locationLabel.y = 0.36 * device.screen.height;
        } else {
          this._locationLabel.y = 0.34 * device.screen.height;
        }
        break;
      case 2:
        this._timeLabel.x = 0.05 * device.screen.width;
        this._timeLabel.y = 0.95 * device.screen.height;
        this._locationLabel.x = 0.07 * device.screen.width;
        if (device.screen.height == 250) {
          this._locationLabel.y = 0.73 * device.screen.height;
        } else {
          this._locationLabel.y = 0.75 * device.screen.height;
        }
        break;
      case 3:
        this._timeLabel.x = 0.95 * device.screen.width - this._timeLabel.getBBox().width;
        this._timeLabel.y = 0.95 * device.screen.height;
        this._locationLabel.x = 0.93 * device.screen.width - this._locationLabel.getBBox().width;
        if (device.screen.height == 250) {
          this._locationLabel.y = 0.73 * device.screen.height;
        } else {
          this._locationLabel.y = 0.75 * device.screen.height;
        }
        break;
      default:
        console.log(`Uh oh! ${locationOption} is an invalid option`);
    }
    this._timeLabel.style.display = 'inline';
    this._locationLabel.style.display = 'inline';
  }
  
  setLocationLabelText(option, location, heartRate, steps, cals) {
    switch(option) {
      case 0:
        this._locationLabel.text = '';
        break;
      case 1:
        this._locationLabel.text = `${location == '' ? '---' : location}`;
        break;
      case 2:
        let today = new Date();
        this._locationLabel.text = `${weekdays[today.getDay()]} ${today.getDate()} ${months[today.getMonth()]}`;
        break;
      case 3:
        this._locationLabel.text = `${heartRate === null ? '---' : heartRate} BPM`;
        break;
      case 4:
        this._locationLabel.text = `${steps === undefined ? '0' : steps} ${steps == 1 ? 'step' : 'steps'}`;
        break;
      case 5:
        this._locationLabel.text = `${cals === undefined ? '0' : cals} cals`;
        break;
      default:
        break;
    }
  }
  
  get rectFull() {
    return this._rectFull;
  }
  
  get timeLabel() {
    return this._timeLabel;
  }
  
  get locationLabel() {
    return this._locationLabel;
  }
  
  get backgroundImage() {
    return this._backgroundImage;
  }
}