import axios from 'axios';
import firebase from 'firebase'
import config from './config'

const APIKEY = '9adc9a37'


function init() {    
    if (!firebase.apps.length) {
        firebase.initializeApp(config)
        console.log('firebase init')
    } 
}
init();


// function onValue(callback) {
//     let ref = firebase.database().ref('guestbook')
//     ref.on('value', callback)
// }




    
// https://www.omdbapi.com/?i=tt3896198&apikey=9adc9a37
export default { init, }