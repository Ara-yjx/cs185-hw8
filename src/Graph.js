import React, {Component} from 'react';
import firebase from 'firebase'
import DB from './Database'
const d3 = require('d3')


export default class Graph extends Component {

    constructor(props) {
        super(props)
        
        this.state = { messages: [], loading:true, first:true }
        DB.init();

        console.log(d3)
    }




    render = function(){
        return <div id='graph'>Graph</div>

    }

}
