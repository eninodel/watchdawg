import * as React from 'react';
import { useEffect } from 'react';
import MapView ,{Marker} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import firebaseConfig from "./Secrets"
import AddThreatForm from './AddThreatForm';


const app = initializeApp(firebaseConfig);

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.setState = this.setState.bind(this);
    this.state = {markers:[], showThreatForm: false, lat:0, long:0};
  }

  componentDidMount() {
      const db = getDatabase(app);
      const reference = ref(db, 'Markers/');
      onValue(reference, (markers) => {
          const markersArr = markers.val();
          this.setState({markers: markersArr});
      })
  }



    _onOpenActionSheet = (title, body) => {
        // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
        const options = ['Delete', 'Save', 'Cancel'];
        const destructiveButtonIndex = 0;
        const cancelButtonIndex = 2;
      
        this.props.showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex,
            destructiveButtonIndex,
            title: title,
            message: body,
          },
          (buttonIndex) => {
            // Do something here depending on the button index selected
          }
        );
      };

  render() {
    return(

      <View style={styles.container}>
        {this.state.showThreatForm && <AddThreatForm setState={this.setState} lat={this.state.lat} long={this.state.long}></AddThreatForm> }
      <MapView style={styles.map} 
      onLongPress={(e) => {
            const lat = e.nativeEvent.coordinate.latitude;
            const long = e.nativeEvent.coordinate.longitude;
            console.log(long)
            this.setState({showThreatForm:true, lat, long})
      }}>
        {this.state.markers.map((marker) => {
          return (<Marker key = {marker["lat"]} 
                        coordinate={{ latitude : marker["lat"], longitude : marker["long"] }} 
                        // title={marker["title"]} 
                        // description={marker["body"]}
                        onPress={() => this._onOpenActionSheet(marker["title"], marker["body"])}
                        />)
          })}
      </MapView>
    </View>
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