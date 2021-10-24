import * as React from 'react';
import { useEffect, useRef } from 'react';
import MapView ,{Marker} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, Button, Modal, SafeAreaView} from 'react-native';
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
    this.state = {markers:{}, showThreatForm: false, lat:0, long:0, counter: 0, showModal:false, title: "", body: "", date:0, droppingPin: false};
  }

  componentDidMount() {
      const db = getDatabase(app);
      const reference = ref(db, 'Markers/');
      onValue(reference, (markers) => {
          const markersArr = markers.val();
          this.setState({markers: markersArr});
      })

      // register app for notifications
      registerForPushNotificationsAsync()

      const counterReference = ref(db, "counter");
      onValue(counterReference, (counter) => {
        this.setState({counter:counter.val()})
      })
  }

  renderDate =(minutes) => {
    if (minutes < 60) {
      return minutes +" minute(s) ago"
    } else if (minutes < 720) {
      return Math.round((minutes / 60)) + " hour(s) and " + (minutes%60) + " minute(s) ago"
    } else {
      return Math.round((minutes/ 720)) + " day(s) and " + Math.round(((minutes % 720 )/ 60)) + " hour(s) and " + ((minutes % 720 )% 60) + " minute(s) ago"
    }
  }


  render() {
    return(
      <SafeAreaView style={styles.container}>
        <View style={styles.reportButton}>
          {!this.state.droppingPin && <Button color='#f9232c' title='📢Report' onPress={(e) => {this.setState({droppingPin: true})}} />}
          {
            this.state.droppingPin 
            && <Button color='grey' title='Cancel' onPress={(e) => {this.setState({droppingPin: false})}} />
          }
        </View>
        {
          this.state.droppingPin &&
          <Text style={styles.pinDropPrompt}>Long hold on the location of the incident</Text>
        }
        {this.state.showThreatForm && <AddThreatForm setState={this.setState} counter={this.state.counter} lat={this.state.lat} long={this.state.long}></AddThreatForm> }
        
      <MapView style={styles.map} 
      initialRegion={{latitude: 47.6062, longitude: -122.3321, latitudeDelta:0.15, longitudeDelta:0.25}}
      onLongPress={(e) => {
            const lat = e.nativeEvent.coordinate.latitude;
            const long = e.nativeEvent.coordinate.longitude;
            this.setState({showThreatForm:true, lat, long})
      }}>
      {Object.keys(this.state.markers).map((key) => {
        const marker = this.state.markers[key];
        return (<Marker key = {key} 
        coordinate={{ latitude : marker["lat"], longitude : marker["long"] }} 
        
          onPress={() => {
            const today = new Date();
          const diffMs = today.getTime() - marker["date"];
          const diffMins = Math.round(diffMs/ 60000); // minutes
          this.setState({showModal:true, title: marker["title"], body: marker["body"], date: diffMins})
        }}
        />) 
      }) }
      </MapView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.showModal}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          this.setState({showModal:false})
        }}
      >
          <View style={styles.modal}>
              <Text style={{fontSize:40, textAlign:"center", color:"white"}}>{this.state.title}</Text>
            <Text style={{ marginBottom: 25, color: "white" }}>{ this.renderDate(this.state.date)}</Text>
              <Text style={{fontSize:20, textAlign:"center", color:"white"}}>{this.state.body}</Text>
              <Button title="Close" onPress={() => this.setState({showModal:false})}></Button>
          </View>
      </Modal>
    </SafeAreaView>
      )
    };
}

export default Map;

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
  }, modal:{
    bottom:0,
    position:"absolute",
    backgroundColor: "#D99DF5",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    height:"50%",
    width:"100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  reportButton: {
    position: 'absolute',
    bottom: 30
  },
  pinDropPrompt: {
    position: 'absolute',
    top: 75,
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#f9232c',
    padding: 10,
    color: 'white',
    borderRadius: 20,
  },
});