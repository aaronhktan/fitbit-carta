function mySettings(props) {
  return (
    <Page>
      <Section
        description={<Text> Your changes make take a few seconds to be sent over to your watch. </Text>}
        title={<Text bold align="center">Clock options</Text>}>
        <Select
          title="Time placement"
          label="Time placement"
          settingsKey="timePlacement"
          options={[
            {name:"Top left", value:0},
            {name:"Top Right", value:1},
            {name:"Bottom Left", value:2},
            {name:"Bottom Right", value:3}
          ]}
        />
        <Toggle
          label="Use set location?"
          settingsKey="toggleCity"
        />
        <TextInput
          title="City"
          label="City"
          placeholder="e.g. Hong Kong"
          settingsKey="city"
          disabled={!(props.settings.toggleCity === "true")}
        />
        <Select
          title="Zoom Level"
          label="Zoom Level"
          settingsKey="zoomLevel"
          options={[
            {name:"8 - Large city", value:8},
            {name:"9", value:9},
            {name:"10", value:10},
            {name:"11", value:11},
            {name:"12", value:12},
            {name:"13 - Neighbourhood", value:13}
          ]}
        />
        <ColorSelect
          settingsKey="palette"
          colors={[
            {color: '#afafaf', value: 'grey'},
            {color: '#ff7276', value: 'red'},
            {color: '#ffa07a', value: 'lightsalmon'},
            {color: '#ffcc33', value: 'peach'},
            {color: '#e4fa3c', value: 'yellow'},
            {color: '#5be37d', value: 'lime'},
            {color: '#00ffff', value: 'teal'},
            {color: '#14d3f5', value: 'cyan'},
            {color: '#da70d6', value: 'orchid'},
            {color: '#e572af', value: 'pink'}
          ]}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);