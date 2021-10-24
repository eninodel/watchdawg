import React, {useState} from "react"
import { StyleSheet, Text, View, Button, TextInput, Alert } from "react-native"
import RadioGroup from 'react-native-radio-buttons-group';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set,} from 'firebase/database';
import firebaseconfig from "./Secrets"

export default function AddThreatForm({setState, counter, lat, long}){
    const [form, setForm] = useState({title:"", body:"", threatLevel:""})
    const radioButtonsData = [{
        id: '1', // acts as primary key, should be unique and non-empty string
        label: 'Moderate',
        value: 'moderate'
    }, {
        id: '2',
        label: 'High',
        value: 'high'
    }, {
        id: '3',
        label: 'Severe',
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
        setState({showThreatForm: false})
    }
    return (
        <View style={styles.container}>
            <Text>Add a New Threat</Text>
            <TextInput style={styles.input} placeholder="Title of Threat" onChangeText={text => setForm({...form,title:text})}></TextInput>
            <TextInput style={styles.input} placeholder="Description of Threat" onChangeText={text => setForm({...form,body:text})}></TextInput>
            <Text>Select Threat Level</Text>
            <RadioGroup 
            layout='row'
            radioButtons={radioButtons} 
            onPress={onPressRadioButton} 
        />
            <Button style={styles.button} title="Submit"  onPress={() => handleSubmit()}></Button>
            <Button title="go back" onPress={() => setState({showThreatForm: false})}></Button>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      height:"100%",
      width:"100%",
      zIndex:3,
      position: "absolute",
    }, input:{
        height:50,
        width:"80%",
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 5,
    }, button:{
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 5,
        color:"white",
        backgroundColor:"black"

    }
  });