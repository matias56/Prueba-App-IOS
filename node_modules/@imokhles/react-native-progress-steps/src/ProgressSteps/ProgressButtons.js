import React from 'react';
import { View } from 'react-native';

const ProgressButtons = props => (
  <View style={[{ flexDirection: 'row', marginTop: 90 }, props.mainButtonsStyle]}>
      {props.hidePreviousButton ? null : <View style={[{ position: 'absolute', left: 60, bottom: 40 }, props.previousButtonLayoutStyle]}>{props.renderPreviousButton()}</View>}
      {props.hideNextButton ? null : <View style={[{ position: 'absolute', right: 60, bottom: 40 }, props.nextButtonLayoutStyle]}>{props.renderNextButton()}</View>}
  </View>
);

export default ProgressButtons;
