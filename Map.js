import * as React from 'react';
import MapView ,{Marker} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, Button, Modal, TextInput, Image} from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import firebaseconfig from "./Secrets"
import AddThreatForm from './AddThreatForm';
import { registerForPushNotificationsAsync } from './Notifications';


const app = initializeApp(firebaseconfig);
const UW_LAT = 47.65537844011764;
const UW_LONG = -122.30325168060438;

const currentLocationIcon = <Image style={{height:35, width:35}} source={require('./assets/current-location.jpg')}/>
const red_marker = <Image style={{height:75, width:75}} source={require('./assets/red-marker.png')}/>
const orange_marker = <Image style={{height:75, width:75}} source={require('./assets/orange-marker.png')}/>
const yellow_marker = <Image style={{height:75, width:75}} source={require('./assets/yellow-marker.png')}/>

let startingMarkers = {}

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.setState = this.setState.bind(this);
    this.filterMarkers = this.filterMarkers.bind(this);
    this.state = { markers: {}, showThreatForm: false, lat: UW_LAT, long: UW_LONG,latDel : 0.03, longDel: 0.05, counter: 0, showModal: false, title: "", body: "", date: 0, droppingPin: false, showFilters: false };
    this.region = React.createRef()
  }
  
  componentDidMount() {
    const db = getDatabase(app);
    const reference = ref(db, 'Markers/');
    onValue(reference, (markers) => {
      const markersArr = markers.val();
      // this.startingMarkers.current = markersArr;
      startingMarkers = markersArr
      this.setState({ markers: markersArr });
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
  
  filterMarkers(minutes) {
    let store = {}
    Object.keys(startingMarkers).map((key) => {
      const currMarker = startingMarkers[key];
      const today = new Date();
      const diffMs = today.getTime() - currMarker["date"];
      const diffMins = Math.round(diffMs/ 60000); 
      if (diffMins < minutes) {
        store[key] = currMarker
      }
    })
    this.setState({markers: store, lat: this.region.current.latitude + 0, long: this.region.current.longitude, latDel: this.region.current.latitudeDelta, longDel: this.region.current.longitudeDelta})
  }
  
  render() {
    var markersToRender = Object.keys(this.state.markers).map((key) => {
      if (key == 1000000 && !this.state.droppingPin) return;
      const marker = this.state.markers[key];
      var markerIcon = null
      var color = 'red'
      if (marker["threatLevel"] === 'pending') {
        color = 'green'
      } else if (marker["threatLevel"] === "moderate") {
        markerIcon = yellow_marker
      } else if (marker["threatLevel"] === "high") {
        markerIcon = orange_marker
      } else if (marker["threatLevel"] === "severe") {
        markerIcon = red_marker
      }
      return (<Marker key = {key} 
      coordinate={{ latitude : marker["lat"], longitude : marker["long"] }} 
      
        onPress={() => {
          const today = new Date();
        const diffMs = today.getTime() - marker["date"];
        const diffMins = Math.round(diffMs/ 60000); // minutes
        this.setState({showModal:true, title: marker["title"], body: marker["body"], date: diffMins, lat:marker["lat"], long: marker["long"] })
      }}

      pinColor={color}
      >{markerIcon}</Marker>) 
    })
    const locationMarker = <Marker key={1000001} coordinate={{latitude: UW_LAT - 0.0015, longitude: UW_LONG - 0.01}}>{currentLocationIcon}</Marker>;
    markersToRender.push(locationMarker);
    return(
      <View style={styles.container}>
        <View style={{
          position: "absolute",
          top: 50,
          left:30,
        }}>
            <Button title="🕰 Filter" onPress={() => {
                this.setState(prevState => ({ showFilters: !prevState.showFilters, lat: this.region.current.latitude + 0, long: this.region.current.longitude, latDel: this.region.current.latitudeDelta, longDel: this.region.current.longitudeDelta }));
            }}></Button>
        </View>
        {this.state.showFilters &&
        <View style={{
          width: "30%",
          height: 100,
          position: "absolute",
          display: "flex",
          flexDirection: "column"
        }}>
          <Button title="🕚 Past Hour" onPress={()=> this.filterMarkers(60) }></Button>
          <Button title = "🕕 Past 6 Hours" onPress = {() => this.filterMarkers(360)}></Button>
          <Button title="Clear Filter" onPress={() => { this.setState({ markers: startingMarkers, lat: this.region.current.latitude + 0, long: this.region.current.longitude, latDel: this.region.current.latitudeDelta, longDel: this.region.current.longitudeDelta }) }}></Button>
        </View>}
        <View style={styles.reportButton}>
          {!this.state.showThreatForm && !this.state.droppingPin && <Button color='#f9232c' title='📢Report' onPress={(e) => {this.setState({droppingPin: true, lat: this.region.current.latitude, long: this.region.current.longitude, latDel: this.region.current.latitudeDelta, longDel: this.region.current.longitudeDelta})}} />}
          {
            this.state.droppingPin && !this.state.showThreatForm
            && <Button color='grey' title='Cancel' onPress={(e) => {this.setState({droppingPin: false, lat: this.region.current.latitude + 0, long: this.region.current.longitude, latDel: this.region.current.latitudeDelta, longDel: this.region.current.longitudeDelta})}} />
          }
        </View>
        {
          this.state.droppingPin &&
          <Text style={styles.pinDropPrompt}>Long hold to select the location of the incident</Text>
        }
        {this.state.showThreatForm && <AddThreatForm setState={this.setState} counter={this.state.counter} lat={this.state.lat} long={this.state.long} droppingPin={this.state.droppingPin} region={this.region}></AddThreatForm> }
        
        <MapView style={styles.map} 
          onRegionChange={(Region) => {
            this.region.current = Region;
          }}
      onLongPress={(e) => {
            if (!this.state.droppingPin) {
              // don't allow long presses if we aren't in ping dropping mode
              return
        }
            const lat = e.nativeEvent.coordinate.latitude;
            const long = e.nativeEvent.coordinate.longitude;
            // add a green marker that will be our preliminary incident report
            const tempMarker = {title: 'pending', body: 'pending', lat, long, upvotes: 0, threatLevel: 'pending', date: new Date().getTime()};
            this.setState(prevState => ({showThreatForm:true, lat: lat - this.region.current.latitudeDelta / 4, long: long, latDel: this.region.latDel, longDel: this.region.longDel, markers: {...this.state.markers, 1000000: tempMarker}}));
      }}
      // adjust latitude by a little when displaying to center the selected target
      region={{latitude: this.state.lat, longitude: this.state.long, latitudeDelta: this.state.latDel, longitudeDelta: this.state.longDel}}>
        {markersToRender}
      </MapView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.showModal}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          this.setState({showModal:false, latDel: this.region.latitudeDelta, longDel: this.region.longitudeDelta})
        }}
      >
          <View style={styles.modal}>
            <View style={{ width:"90%", backgroundColor:"#EAF0F0", borderRadius:20, marginTop:15, display: "flex", flexDirection:"column", alignItems:"center" }}>
              <Text style={{color: 'red', marginTop: 5}}>ALERT!</Text>
              <Text style={{fontSize:30, textAlign:"center", color:"black"}}>{this.state.title}</Text>
              <Text style={{ color: "black", fontStyle: 'italic'}}>{ this.renderDate(this.state.date)}</Text>
              <Text style={{fontSize:15, textAlign:"center", color:"black"}}>{this.state.body}</Text>
              <View style={styles.reactions}>
                <Image style={{height:50, width:50}} source={require('./assets/empty-upvote.png') } />
                <Image style={{height:50, width:50, position: 'absolute', right: 5}} source={require('./assets/flag.png')} />
              </View>
            </View>
            <View style = {{paddingBottom:10, width:"100%", display: "flex", flexDirection:"column", alignItems: "center", }}>

            <TextInput style={{
              height: 50,
              backgroundColor: "#EAF0F0",
                color: "black",
                paddingLeft:10,
              width: "90%",
                borderRadius: 20,
              margin: 10
            }} placeholder='Add Comment Here' ></TextInput>
              <Button color='gray' title="Close" onPress={() => this.setState({showModal:false})}></Button>
            </View>
          </View>
      </Modal>
    </View>
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
  },
  modal: {
    margin:0,
    bottom:0,
    position:"absolute",
    backgroundColor: "#E9BBFF",
    borderRadius: 20,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    height:"60%",
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
    top: 100,
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#f9232c',
    padding: 10,
    color: 'white',
    borderRadius: 20,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: "100%",
  }
});