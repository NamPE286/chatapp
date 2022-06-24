import { useState, useEffect } from 'react';
import { getDoc, doc, query, orderBy, limit, collection, getDocs, onSnapshot } from "firebase/firestore"
import { db } from '../firebase-config.js';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Main({ navigation }) {
    const [mode, setMode] = useState(0)
    const [userData, setUserData] = useState()
    const [chatroomData, setChatroomData] = useState({})
    const [currentChatroomData, setCurrentChatroomData] = useState()
    useEffect(() => {
        async function getUserData() {
            var user = await AsyncStorage.getItem('@user');
            if (user) {
                user = JSON.parse(user);
                try {
                    const ref = doc(db, 'user', user.email);
                    const docSnap = await getDoc(ref);
                    if (docSnap.exists) {
                        const doc = docSnap.data();
                        if (doc.password == user.password) {
                            setUserData(doc);
                            return
                        }
                    }
                    else navigation.navigate('SignIn');
                }
                catch (err) {
                    if (err == 'Error: Network Error') navigation.navigate('SignIn');
                    console.error(err)
                    console.log('error')
                }
            }
        }
        getUserData();
    }, [])
    function homeOrSetting() {
        async function getChatroomData(i) {
            const ref = doc(db, 'chatroom', i);
            onSnapshot(ref, async (docSnap) => {
                if (docSnap.exists) {
                    const doc = docSnap.data();
                    chatroomData[i] = doc;
                    setChatroomData(chatroomData);
                    const ref1 = collection(db, 'chatroom', i, 'messages');
                    const querySnap = query(ref1, orderBy('timestamp', 'desc'), limit(1));
                    onSnapshot(querySnap, (querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            chatroomData[i].lastMessage = doc.data();
                            setCurrentChatroomData(doc);
                        });
                    })
                }
            })
        }
        function card(i, index) {
            if (currentChatroomData) {
                function getDisplayName() {
                    if(chatroomData[i].members.length == 2){
                        if(chatroomData[i].members[0].email != userData.email){
                            return chatroomData[i].members[0].name
                        }
                        else{
                            return chatroomData[i].members[1].name
                        }

                    }
                }
                function getDisplayAvatar(){
                    if(chatroomData[i].members.length == 2){
                        if(chatroomData[i].members[0].email != userData.email){
                            return chatroomData[i].members[0].avatar
                        }
                        else{
                            return chatroomData[i].members[1].avatar
                        }

                    }
                }
                function getLastMessage(){
                    if(chatroomData[i].lastMessage) {
                        var lm = chatroomData[i].lastMessage.content
                        if(lm.length > 25) return lm.substring(0, 25) + '...'
                        return lm
                    }
                }
                function getLastMessageTime(){
                    try{
                        if(chatroomData[i].lastMessage){
                            var currentTime = new Date().getTime();
                            currentTime = Math.floor(currentTime / 1000);
                            var diff = currentTime - chatroomData[i].lastMessage.timestamp.seconds;
                            diff = Math.floor(diff / 60);
                            if(diff <= 1) return "Just now"
                            if(diff > 60){
                                diff = Math.floor(diff / 60);
                                if(diff == 1) return "1 hour ago"
                                if(diff > 24){
                                    diff = Math.floor(diff / 24);
                                    if(diff == 1) return "1 day ago"
                                    return diff + " days ago"
                                }
                                else{
                                    return diff + " hours ago"
                                }
                            }
                            else{
                                return diff + " minutes ago"
                            }
                        }
                    }
                    catch(err){
                        console.log(chatroomData[i].lastMessage)
                        return "Just now"
                    }

                }
                return (
                    <TouchableHighlight onPress={() => navigation.navigate('Chat', {
                        'userData': userData,
                        'chatroomData':chatroomData[i],
                        'id':i
                        })} style={{ borderRadius: 16 }} underlayColor='#c2c2c2' key={index}>
                        <View style={styles.people}>
                            <View style={styles.avatar}>
                                <Image source={{ uri: getDisplayAvatar() }} style={{ width: '100%', height: '100%', borderRadius: 50 }}></Image>
                            </View>
                            <View style={styles.info}>
                                <Text style={styles.userName}>{getDisplayName()}</Text>
                                <Text>{getLastMessage()} - {getLastMessageTime()}</Text>
                            </View>
                        </View>
                    </TouchableHighlight>
                )
            }
            else getChatroomData(i);
        }
        function getChatroom() {
            if (userData == undefined) return null;
            try {
                return (
                    <View style={styles.chatroom}>
                        {userData.joinedRoom.map((i, index) => {
                            return card(i, index)
                        })}
                    </View>
                )
            }
            catch (err) {
                console.error(err)
            }
        }
        if (mode == 0) {
            return (
                <View>
                    <View style={styles.horizontalLine}></View>
                    <Text style={styles.chatsLabel}>Chats</Text>
                    {getChatroom()}
                </View>
            )
        }
        else if (mode == 1) {
            async function signOut(){
                await AsyncStorage.removeItem('@user')
                navigation.navigate('SignIn')
            }
            return (
                <View>
                    <View style={styles.horizontalLine}></View>
                    <Text style={styles.chatsLabel}>Settings</Text>
                    <View style={{marginHorizontal:16}}>
                        <View style={styles.userProfile}>
                            <Image source={{uri: userData.avatar}} style={styles.settingProfileAvatar} />
                            <View style={styles.userProfileInfo}>
                                <Text style={{
                                    fontWeight:'bold',
                                    fontSize:20
                                }}>Signed In as {userData.username}</Text>
                                <Text style={{color:'gray'}}>{userData.email}</Text>
                            </View>
                        </View>
                        <TouchableHighlight onPress={signOut} style={{ borderRadius: 16 }} underlayColor='gray'>
                            <View style={styles.signOutButton}>
                                <Text style={styles.signOutText}>Sign Out</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                </View>
            )
        }
    }
    return (
        <View style={styles.container0}>
            <View style={styles.container} >
                {homeOrSetting()}
                <View style={styles.menuBar}>
                    <TouchableHighlight onPress={() => setMode(0)} style={styles.menuIconBackground} underlayColor='#c2c2c2'>
                        <Image style={styles.menuIcon} source={require('../assets/home-icon.png')}></Image>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => setMode(1)} style={styles.menuIconBackground} underlayColor='#c2c2c2'>
                        <Image style={styles.menuIcon} source={require('../assets/settings.png')}></Image>
                    </TouchableHighlight>
                </View>
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container0: {
        height: '100%',
        display: 'flex',
    },
    container: {
        width: '100%',
        padding: 10,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: 'black',
        shadowOpacity: 1,
        elevation: 20,
        backgroundColor: 'white',
        marginTop: 'auto'
    },
    horizontalLine: {
        backgroundColor: 'gray',
        height: 2,
        width: 50,
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 1,
        marginBottom: 20
    },
    chatsLabel: {
        marginLeft: 10,
        fontWeight: 'bold',
        fontSize: 35,
        marginBottom: 10
    },
    avatar: {
        height: 75,
        width: 75,
        backgroundColor: 'black',
        borderRadius: 50,
    },
    people: {
        padding: 10,
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'row'
    },
    peoplePress: {
        padding: 10,
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'row'
    },
    info: {
        marginLeft: 10,
        marginTop: 'auto',
        marginBottom: 'auto'
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 3,
    },
    menuBar: {
        width: '80%',
        height: 50,
        borderRadius: 16,
        marginTop: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        shadowColor: 'black',
        shadowOpacity: 1,
        elevation: 20,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'white'
    },
    menuIcon: {
        width: 22,
        height: 22,
        marginTop: 'auto',
        marginBottom: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    menuIconBackground: {
        width: '48%',
        height: '80%',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 'auto',
        marginBottom: 'auto',
        borderRadius: 12
    },
    signOutButton:{
        backgroundColor:'red',
        height:50,
        borderRadius:16,
    },
    signOutText:{
        marginLeft:'auto',
        marginRight:'auto',
        marginBottom:'auto',
        marginTop:'auto',
        fontWeight:'bold',
        color:'white',
    },
    userProfile:{
        height:80,
        display:'flex',
        flexDirection:'row',
        borderRadius:12,
        marginBottom:12
    },
    settingProfileAvatar:{
        backgroundColor:'black',
        height:80,
        width:80,
        borderRadius:50,
    },
    userProfileInfo:{
        marginTop:'auto',
        marginBottom:'auto',
        marginLeft:12,
    }
});

export default Main;