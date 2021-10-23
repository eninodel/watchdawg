import React, {useState} from "react"
import { StyleSheet, Text, View, Button, TextInput } from "react-native"


export default function AddThreatForm({setState, lat, long}){
    const [form, setForm] = useState({title:"", body:"", threatType:""})
    return (
        <View style={styles.container}>
            <Text>Add a New Threat</Text>
            <TextInput style={styles.input} placeholder="Title of Threat" onChangeText={text => setForm({...form,title:text})}></TextInput>
            <TextInput style={styles.input} placeholder="Description of Threat" onChangeText={text => setForm({...form,body:text})}></TextInput>
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
    }
  });