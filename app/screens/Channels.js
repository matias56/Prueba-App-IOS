import React from "react";
import {View, Text, StyleSheet} from "react-native";

export default function Channels() {
    return(
    <View style={styles.container}>
        <Text>Channels...</Text>
    </View>
)
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      backgroundColor: "#422c5e" ,
    },
    title: {
        fontSize: 20,
        color:"#ffffff",
        marginBottom:10,
    },
  });
