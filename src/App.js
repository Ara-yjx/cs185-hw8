import React, { Component } from 'react';
import './App.css';
import TabList from './TabList'
import Home from './Home'
import Projects from './Projects'
import Favorites from './Favorites'
import Gallery from './Gallery'
import Guestbook from './Guestbook'
import Movies from './Movies'
import Graph from './Graph'

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            'page': 'Graph', // change me for easier debug
            'overlay': 'hidden',
            'gototop': 'hidden',
            'overlayImg': require('./imgs/owls/img.gif'),
        };
    }


// Overlay
    showOverlay = function (img) {
        this.setState({'overlay': 'visible', 'overlayImg': img})
    }.bind(this)

    hideOverlay = function () {
        this.setState({'overlay': 'hidden'})
    }.bind(this)


// Go-to-top
    componentDidMount = () => {
        window.addEventListener('scroll', (e) => {
            // console.log(window.scrollY)
            var scrollrange = document.body.scrollHeight - window.innerHeight
            if(window.scrollY < scrollrange / 2) {
                this.setState({'gototop': 'hidden'})
            } else {
                this.setState({'gototop': 'visible'})
            }
        })
    }


// Tab
    tabPages = {
        Home: <Home/>,
        Projects: <Projects/>,
        Favorites: <Favorites onOverlayClick={this.showOverlay}/>,
        Gallery: <Gallery onOverlayClick={this.showOverlay}/>,
        Guestbook: <Guestbook/>,
        Movies: <Movies/>,
        Graph: <Graph/>,
    };

    onTabChange = function (tabName) {
        this.setState({page: this.tabPages[tabName] ? tabName : 'Home'});
    }.bind(this)



    render = function () {

        return (
        <div className="container-fluid page">
            <div className="row d-flex flex-column align-items-center">
                <div className="col-lg-9 col-12">
                    <div className="container-fluid page-center">

                        <div className="whitespace"></div>
                        <div className="row d-flex justify-content-center">
                            <h1 className="title">Jiaxi Ye</h1>
                        </div>
                        <div className="row d-flex justify-content-center">
                            <p className="caption">Coder. Artist. Owl lover.</p>
                        </div>

                        <TabList tabs={Object.keys(this.tabPages)} onTabChange={this.onTabChange}/>
                        
                        <div className="whitespace"></div>
                        
                        {this.tabPages[this.state.page]}

                    </div>
                </div>
            </div>

            <div id="overlay" className={ this.state.overlay + " d-flex justify-content-center align-items-center"}
                onClick={this.hideOverlay}>
                <img src={this.state.overlayImg}/>
            </div>
            <div id="gototop" className={this.state.gototop}>^ Top</div>
        </div>
        )
    }

        // <div onclick="gototop()" id="gototop" title="Go to top">^ Top</div>
    
}

