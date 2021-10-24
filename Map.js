import * as React from 'react';
import { useEffect, useRef } from 'react';
import MapView ,{Marker} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, Button, SafeAreaView } from 'react-native';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import firebaseconfig from "./Secrets"
import AddThreatForm from './AddThreatForm';
import { registerForPushNotificationsAsync } from './Notifications';


const app = initializeApp(firebaseconfig);

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.setState = this.setState.bind(this);
    this.state = {markers:{}, showThreatForm: false, lat:0, long:0, counter: 0};
  }

  componentDidMount() {
      const db = getDatabase(app);
      const reference = ref(db, 'Markers/');
      onValue(reference, (markers) => {
          const markersArr = markers.val();
          console.log(markersArr);
          this.setState({markers: markersArr});
      })

      // register app for notifications
      registerForPushNotificationsAsync()

      const counterReference = ref(db, "counter");
      onValue(counterReference, (counter) => {
        this.setState({counter:counter.val()})
      })
  }

  _onOpenActionSheet = (title, body, time) => {
    const options = ['Delete', 'Save', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;
    const diffMs = time - new Date().getTime();
    console.log(diffMs)
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        title: title,
        message: body + diffMins + " minutes ago",
      },
      (buttonIndex) => {
        // Do something here depending on the button index selected
      }
    );
  };

  render() {
    return(
        <SafeAreaView style={styles.container}>
          {this.state.showThreatForm && <AddThreatForm setState={this.setState} counter={this.state.counter} lat={this.state.lat} long={this.state.long}></AddThreatForm> }
        <MapView style={styles.map} 
          region={{latitude: 47.6062, longitude: -122.3321, latitudeDelta:0.15, longitudeDelta:0.25}}
          onLongPress={(e) => {
                const lat = e.nativeEvent.coordinate.latitude;
                const long = e.nativeEvent.coordinate.longitude;
                this.setState({showThreatForm:true, lat, long})
          }}>
          {Object.keys(this.state.markers).map((key) => {
            const marker = this.state.markers[key];
            return (<Marker key = {marker["lat"]} 
            coordinate={{ latitude : marker["lat"], longitude : marker["long"] }} 
            title={marker["title"]} 
            description={marker["body"]}
            onPress={() => {
              this._onOpenActionSheet(marker["title"], marker["body"], marker['date']);
              console.log(marker['date'])
            }}
            />) 
          }) }
        </MapView>
        </SafeAreaView>
    )
  };
}

const ConnectedApp = connectActionSheet(Map);
export default ConnectedApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    zIndex:-1,
  },
});