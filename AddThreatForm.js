import React, {useState, useEffect, useRef} from "react"
import { StyleSheet, Text, View, Button, TextInput, Alert } from "react-native"
import RadioGroup from 'react-native-radio-buttons-group';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set,} from 'firebase/database';
import firebaseconfig from "./Secrets"
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { schedulePushNotification, registerForPushNotificationsAsync } from "./Notifications";

export default function AddThreatForm({setState, counter, lat, long, droppingPin, region}){
    // Notifications related stuff
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();
  
    useEffect(() => {
      registerForPushNotificationsAsync()
  
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });
  
      // Use this to redirect to the appropriate react screen when the notification is tapped
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });
  
      return () => {
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }, []);

    const [form, setForm] = useState({title:"", body:"", threatLevel:""})
    const radioButtonsData = [{
        id: '1', // acts as primary key, should be unique and non-empty string
        label: '😬 Moderate',
        value: 'moderate'
    }, {
        id: '2',
        label: '🚨 High',
        value: 'high'
    }, {
        id: '3',
        label: '💣 Severe',
        value: 'severe'    
    }]
    const [radioButtons, setRadioButtons] = useState(radioButtonsData)

    function onPressRadioButton(radioButtonsArray) {
        setRadioButtons(radioButtonsArray);
        radioButtons.map((data) =>{
            if (data.selected === true){
                console.log(data)
                setForm({...form, threatLevel:data.value})
            }
        })
    }

    async function handleSubmit(){
        const app = initializeApp(firebaseconfig);
        const db = getDatabase(app);
        const reference = ref(db, "Markers/" + counter )
        if (!form.body || !form.title || !form.threatLevel){
            Alert.alert(
                "Please fill out all the fields"
              );
            return;
        }
        const today = new Date().getTime()
        const counterReference = ref(db, "counter");
        set(counterReference, counter + 1)
        set(reference, {title: form.title, body: form.body, upvotes: 0, lat, long, threatLevel: form.threatLevel, date: today})
        setState({showThreatForm: false, droppingPin: false})

        // send a notification
        color = null
        if (form.threatLevel === 'moderate') {
            color = '​​😬'
        } else if (form.threatLevel === 'high') {
            color = '​​​🚨'
        } else if (form.threatLevel === 'severe') {
            color = '💣'
        }
        schedulePushNotification(`​${color} ${form.threatLevel.toUpperCase()} ALERT REPORTED: ${form.title}`, `${form.body}`, null) // delay is 1s to make the notification seen more real
    }

    return (
        <View style={styles.container}>
            <Text style={{
                fontSize:25,
                margin: 10
            }}>Report a New Threat</Text>
            <TextInput style={styles.input} placeholder="What happened?" onChangeText={text => setForm({...form,title:text})}></TextInput>
            <TextInput style={styles.input} multiline={true} placeholder="Tell us more about what's going on" onChangeText={text => setForm({...form,body:text})}></TextInput>
            <Text>Select Threat Level</Text>
            <RadioGroup 
            layout='row'
            radioButtons={radioButtons} 
            onPress={onPressRadioButton} 
        />
            <View style={styles.buttons}>
                <Button color='green' title="Submit"  onPress={() => handleSubmit()}></Button>
                <Button color='grey' title="Cancel" onPress={() => setState({
            showThreatForm: false, droppingPin: false
        })}></Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding:0,
      backgroundColor: '#E9BBFF',
      alignItems: 'center',
      justifyContent: 'center',
      height:"50%",
      width:"100%",
      zIndex:3,
      position: "absolute",
      bottom: 0
    }, input: {
        paddingLeft:10,
        height:50,
        width:"80%",
        borderRadius: 20,
        backgroundColor: "white",
        marginBottom:10,
    },
    buttons:{
        flexDirection: "row",
        justifyContent: "space-between"
    }
  });