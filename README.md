# Fitbit Carta Watch Face
A map watch face for the Fitbit Ionic and Versa.

## Build and install

### In Fitbit Studio

- Create a new project in Fitbit Studio, then drag and drop the contents of `src` into the side bar.
- Connect to the Fitbit Developer Bridge from your phone (tap your watch, then developer menu, then toggle on Developer Bridge), and your watch (Settings app, scroll down, tap on Developer Bridge).
- Click the Build button to build and install.

### Using Command Line Tools

Prerequisite: You'll need NPM installed.

- In the src directory (`cd src`), run `npx fitbit-build` and `npx fitbit`.
- Connect to the Fitbit Developer Bridge from your phone (tap your watch, then developer menu, then toggle on Developer Bridge), and your watch (Settings app, scroll down, tap on Developer Bridge).
- Once both are connected, back to the computer. At the Fitbit prompt, run `connect phone`, `connect device`, then `install` to install the app on the Ionic, Versa, and companion on your phone.
- To build, run `build` at the Fitbit prompt.

## Gallery

![alt](/docs/screenshots/Carta-blue.png?raw=true)
![alt](/docs/screenshots/Carta-grey.png?raw=true)
![alt](/docs/screenshots/Carta-red.png?raw=true)
![alt](/docs/screenshots/Carta-yellow.png?raw=true)