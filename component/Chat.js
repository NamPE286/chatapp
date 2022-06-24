import { View, Text, Image, TouchableHighlight, TextInput, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { getDoc, doc, query, orderBy, limit, collection, getDocs, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from '../firebase-config.js';

function Main({ route, navigation }) {
    const { userData, chatroomData, id } = route.params;
    const [m, setM] = useState([])
    const [isEnd, setIsEnd] = useState(true)
    const [currentMessage, setCurrentMessage] = useState('')
    const svRef = useRef(ScrollView)
    useEffect(() => {
        async function getMessage(){
            const ref = collection(db, 'chatroom', id, 'messages')
            const q = query(ref, orderBy('timestamp', 'desc'), limit('20'));
            const querySnapshot = await getDocs(q)
            var msg = []
            querySnapshot.forEach((doc) => {
                msg.unshift(doc.data())
            })
            msg.pop()
            
            const q1 = query(ref, orderBy('timestamp', 'desc'), limit('1'));
            onSnapshot(q1, (snap) => {
                snap.forEach((doc) => {
                    const data = doc.data()
                    if(data.timestamp != null){
                        try{
                            if(msg[msg.length - 1].status == 'sending') msg.pop()
                        }
                        catch{}
                        msg.push(data)
                        setM(msg)
                        setCurrentMessage('a')
                        setCurrentMessage('')
                    }
                })
            })

        }
        getMessage()

    }, [])
    function outMessage(msg, i) {
        const styles1 = StyleSheet.create({
            message: {
                backgroundColor: '#00c0e8',
                height: 'auto',
                marginLeft: 'auto',
                marginRight: 12,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 21,
                shadowColor: 'black',
                shadowOpacity: 1,
                elevation: 5,
                marginBottom:5,
                maxWidth:'70%'
            }
        })
        return (
            <View style={styles1.message} key={i}>
                <Text style={{
                    marginVertical: 12,
                    marginHorizontal: 15,
                    fontSize: 16,
                    color: 'white'
                }}>{msg.content}</Text>
            </View>
        )
    }
    function outMessagePending(msg, i) {
        const styles1 = StyleSheet.create({
            message: {
                backgroundColor: 'gray',
                height: 'auto',
                marginLeft: 'auto',
                marginRight: 12,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 21,
                shadowColor: 'black',
                shadowOpacity: 1,
                elevation: 5,
                marginBottom:5,
                maxWidth:'70%'
            }
        })
        return (
            <View style={styles1.message} key={i}>
                <Text style={{
                    marginVertical: 12,
                    marginHorizontal: 15,
                    fontSize: 16,
                    color: 'white'
                }}>{msg.content}</Text>
            </View>
        )
    }

    function inMessage(msg, i) {
        const styles1 = StyleSheet.create({
            message: {
                backgroundColor: 'white',
                height: 'auto',
                marginRight: 'auto',
                marginLeft: 12,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 21,
                shadowColor: 'black',
                shadowOpacity: 1,
                elevation: 5,
                marginBottom: 5,
                maxWidth:'70%'
            }
        })
        return (
            <View style={styles1.message} key={i}>
                <Text style={{
                    marginTop: 12,
                    marginBottom: 12,
                    marginLeft: 15,
                    marginRight: 15,
                    fontSize: 16
                }}>{msg.content}</Text>
            </View>
        )
    }
    async function sendMessage(msg) {
        msg['timestamp'] = serverTimestamp()
        var id1 = new Date().getTime();
        id1 = Math.floor(id1 / 1000);
        id1 = id1.toString()
        var msg1 = JSON.parse(JSON.stringify(msg))
        msg1['status'] = 'sending'
        m.push(msg1)
        setM(m)
        await setDoc(doc(db, 'chatroom', id, 'messages', id1), msg)
    }
    function getDisplayName() {
        if(chatroomData.members.length == 2){
            if(chatroomData.members[0].email != userData.email){
                return chatroomData.members[0].name
            }
            else{
                return chatroomData.members[1].name
            }

        }
    }
    function getDisplayAvatar(){
        if(chatroomData.members.length == 2){
            if(chatroomData.members[0].email != userData.email){
                return chatroomData.members[0].avatar
            }
            else{
                return chatroomData.members[1].avatar
            }

        }
    }
    return (
        <View style={styles.container0}>
            <View style={styles.container} >
                <View style={styles.menuBar}>
                    <TouchableHighlight onPress={() => navigation.goBack()} underlayColor='#00'>
                        <Image style={styles.back} source={require('../assets/line-angle-left.png')}></Image>
                    </TouchableHighlight>
                    <View style={styles.avatar}>
                        <Image source={{ uri: getDisplayAvatar() }} style={{ width: '100%', height: '100%', borderRadius: 50 }}></Image>
                    </View>
                    <View style={styles.infoBar}>
                        <View style={styles.info}>
                            <Text style={styles.username}>{getDisplayName()}</Text>
                            <Text>Active Now</Text>
                        </View>
                        <Image style={styles.tripleDot} source={require('../assets/tripleDot.png')}></Image>
                    </View>
                </View>
            </View>
            <View style={styles.messageContainer}>
                <ScrollView ref={svRef} onLayout={() => {svRef.current.scrollToEnd({animated:false})}} onMomentumScrollEnd={(e) =>{
                    if(Math.ceil(e.nativeEvent.contentOffset.y) == Math.ceil(e.nativeEvent.contentSize.height - e.nativeEvent.layoutMeasurement.height)){
                        setIsEnd(true)
                    }
                    else{
                        setIsEnd(false)
                    }
                }} onContentSizeChange={() => {
                    if(isEnd){
                        svRef.current.scrollToEnd({animated:true})
                    }
                }}>
                    <View style={{height:190}}>
                    </View>
                    <View style={{ marginBottom: 32 }}>
                        {m.map((msg, i) => {
                            if (msg.author === userData.email) {
                                if(msg.status == 'sending'){
                                    return outMessagePending(msg,i)
                                }
                                return outMessage(msg, i)
                            } else {
                                return inMessage(msg, i)
                            }
                        })}
                    </View>
                </ScrollView>

                <View style={styles.messageBox}>
                    <TextInput style={styles.messageInput} onChangeText={newText => setCurrentMessage(newText)} placeholder={'Type something'} value={currentMessage} onKeyPress={(e) => {
                        if(e.nativeEvent.key === 'Enter' && currentMessage.length > 0) {
                            sendMessage({
                                'author': userData.email,
                                'content': currentMessage
                            })
                            setCurrentMessage('')
                        }
                    }} ref={input => input && input.focus()}></TextInput>
                    <TouchableHighlight onPress={() => {
                        if(currentMessage.length > 0) {
                            sendMessage({
                                'author': userData.email,
                                'content': currentMessage,
                            })
                            setCurrentMessage("")
                            svRef.current.scrollToEnd({animated:true})
                        }
                    }
                    } style={{ borderRadius: 16, marginLeft:'auto', marginRight:'auto', width:50}} underlayColor='#c2c2c2'>
                        <Image style={styles.sendIcon} source={require('../assets/right-arrow.png')}></Image>
                    </TouchableHighlight>
                </View>
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container0: {
        height: '100%',
    },
    container: {
        padding: 10
    },
    menuBar: {
        height: 60,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop:30,
        zIndex: 1,
    },
    avatar: {
        backgroundColor: 'black',
        width: 55,
        height: 55,
        borderRadius: 50,
        shadowColor: 'black',
        shadowOpacity: 1,
        elevation: 20,
        marginTop: 'auto',
        marginBottom: 'auto',
        marginLeft: 'auto',
    },
    infoBar: {
        backgroundColor: 'white',
        width: "72%",
        height: 60,
        borderRadius: 16,
        marginLeft: 'auto',
        shadowColor: 'black',
        shadowOpacity: 1,
        elevation: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16
    },
    info: {
        marginVertical: 'auto',
        marginLeft: 21
    },
    tripleDot: {
        height: 25,
        width: 25,
        marginLeft: 'auto',
        marginRight: 21
    },
    messageContainer: {
        marginTop: 'auto',
    },
    messageBox: {
        width: '94%',
        padding: 10,
        borderRadius: 14,
        shadowColor: 'black',
        shadowOpacity: 1,
        elevation: 20,
        backgroundColor: 'white',
        height: 60,
        marginLeft: '3%',
        marginBottom: 12,
        display: 'flex',
        flexDirection: 'row',
        zIndex:1
    },
    sendIcon: {
        width: 25,
        height: 25,
        marginTop: 'auto',
        marginBottom: 'auto',
        marginLeft:'auto',
        marginRight: "auto"
    },
    messageInput: {
        width: '80%',
        height:'auto',
        marginLeft: 12,
        fontSize: 16,
    },
    back: {
        height: 26,
        width: 14,
        marginBottom: 'auto',
        marginTop: 'auto',
        marginLeft: 12,
    }
});

export default Main;