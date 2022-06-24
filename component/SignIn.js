import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableHighlight, TextInput, ToastAndroid, Platform } from 'react-native';
import { StyleSheet } from 'react-native';
import sha256 from 'crypto-js/sha256';
import { getDoc, doc } from "firebase/firestore"
import { db } from '../firebase-config.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Main({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [t, setT] = useState('Sign In');
    useEffect(() => {
        async function getUserData() {
            var user = await AsyncStorage.getItem('@user');
            if(user) {
                user = JSON.parse(user);
                try{
                    const ref = doc(db, 'user', user.email);
                    const docSnap = await getDoc(ref);
                    if (docSnap.exists) {
                        const doc = docSnap.data();
                        if (doc.password == user.password) {
                            navigation.navigate('Home');
                            setT('Sign In')
                            return
                        }
                    }
                }
                catch(err){}
            }
        }
        getUserData();
    }
    , [])
    async function signIn() {
        if(username.length == 0 || password.length == 0){
            if(Platform.OS == 'android') ToastAndroid.show('Please enter username and password', ToastAndroid.SHORT);
            return;
        }
        setT('Signing in...');
        try{
            const hash = sha256(sha256(password).toString()).toString();
            const ref = doc(db, 'user', username);
            const docSnap = await getDoc(ref);
            if (docSnap.exists) {
                const doc = docSnap.data();
                if (doc.password == hash) {
                    await AsyncStorage.setItem('@user', JSON.stringify(doc));
                    navigation.navigate('Home');
                    setT('Sign In')
                    return
                }
            }
        }
        catch{
            if(Platform.OS == 'android') ToastAndroid.show('Please check your internet connection and try again', ToastAndroid.SHORT);
            setT('Sign In');
        }
        setT('Sign In');
        if(Platform.OS == 'android'){
            ToastAndroid.show('Username or password is incorrect', ToastAndroid.SHORT);
        }
    }
    return (
        <View style={styles.container0}>
            <View style={styles.container}>
                <Text style={styles.LogInLabel}>Sign In</Text>
                <TextInput style={styles.credInput} onChangeText={a => setUsername(a)} placeholder='E-mail'>
                </TextInput>
                <TextInput style={styles.credInput} onChangeText={a => setPassword(a)} placeholder='Password' secureTextEntry={true}>
                </TextInput>
                <TouchableHighlight style={styles.submitBtn} onPress={() => {signIn()}} underlayColor='#0390ad'>
                    <Text style={styles.submitBtnText}>{t}</Text>
                </TouchableHighlight>
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container0:{
        height:'100%',
    },
    container:{
        marginTop:'auto',
        marginBottom:40
    },
    credInput:{
        backgroundColor:'white',
        height:50,
        marginHorizontal:30,
        borderRadius:16,
        marginVertical:8,
        padding:15
    },
    submitBtn:{
        backgroundColor:'#00c0e8',
        height:50,
        marginHorizontal:30,
        borderRadius:16,
        marginVertical:8,
    },
    submitBtnText:{
        marginLeft:'auto',
        marginRight:'auto',
        marginTop:'auto',
        marginBottom:'auto',
        fontWeight:'bold',
        color:'white'
    },
    LogInLabel: {
        marginLeft: 30,
        fontWeight: 'bold',
        fontSize: 35,
        marginBottom: 10
    },
});

export default Main;