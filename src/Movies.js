import React, { Component, createRef } from 'react';
import { Button, DropdownButton, Dropdown, Form, FormControl } from 'react-bootstrap';
import axios from 'axios';
import firebase from 'firebase'
import config from './config'
import loadingImg from './imgs/iphone-spinner-2.gif'
import MOVIEIDS from './MovieIds'
import './Movies.css';
import MovieOverlays from './MovieOverlay'

// Firebase format
// In ref('movies'):
// movies: {
//     listname: { 
//        id: {movieData}
//     } || 0
// }



const APIKEY = '9adc9a37'
// https://www.omdbapi.com/?i=tt3896198&apikey=9adc9a37

export default class Movies extends Component {

    constructor(props) {
        super(props);
        this.state = { 
            loading: true, 
            overlay: 'hidden', overlayData:{}, 
            movies:[], currentList:'All',
            showDropdown: false,
            searchText: "",
            page: 1,
        };
        // Init firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(config)
            console.log('firebase init')
        } 
        // Control Panel Reference
        this.addMovieInputRef = createRef();
        this.addListInputRef = createRef();
        this.searchInputRef = createRef();
    }

    async componentDidMount() {
        // Scrolling control
        window.addEventListener('wheel', this.scrollLock, { passive: false }); // modern desktop
        window.addEventListener('mousewheel', this.scrollLock, { passive: false }); // modern desktop
        window.addEventListener('touchmove', this.scrollLock, { passive: false }); // mobile
        // window.addEventListener('keydown', this.scrollLock, false);

        // Fetch data from API
        // for (let id of MOVIEIDS) {
        //     var response = await axios.get(`https://www.omdbapi.com/?i=${id}&apikey=${APIKEY}`);
        //     this.movieData[id] = response.data;   
        // }
        this.setState({ loading: false });

        // Firebase onValue
        firebase.database().ref('movies').on('value', (snapshot)=>{
            console.log('movies onvalue')
            console.log(snapshot.val())
            this.setState({ movies: snapshot.val(), loading: false }, console.log)
        })
    }
    
    scrollLock = function (e) {
        if(this.state.overlay === 'visible'){
            e.preventDefault();
        }
        return false;
    }.bind(this)



    // Movie Control
    addMovie = async function (event) {
        // event.preventDefault();
        // event.stopPropagation();

        const form = event.currentTarget; // form == [ nameField, ...

        let id = this.addMovieInputRef.current.value;
    
        var response = await axios.get(`https://www.omdbapi.com/?i=${id}&apikey=${APIKEY}`);
        var movieData = response.data;
        console.log(movieData.Response)
        if(movieData.Response === "False") {
            window.alert("Incorrect movie id.")
            return;
        }
        console.log(movieData)
        // filter
        var filteredData = {
            imdbID: movieData.imdbID,
            Title: movieData.Title,
            Director: movieData.Director,
            imdbRating: movieData.imdbRating,
            Genre: movieData.Genre,
            Poster: movieData.Poster,
            // Actors: movieData.Actors,
        }
        let moviesState = this.state.movies;
        moviesState['All'][filteredData.imdbID] = filteredData;
        firebase.database().ref('movies').set(moviesState);
        // refresh
    }.bind(this);


    deleteMovie = function(id) {
        console.log(id)
        var moviesState = this.state.movies;
        for(let listName in moviesState) {
            delete moviesState[listName][id]
        }
        firebase.database().ref('movies').set(moviesState);
    }.bind(this)


    addList = function(e) {
        console.log("addList")
        // this.setState({showDropdown:false})
        let newListName = this.addListInputRef.current.value;
        let moviesState = this.state.movies;
        if(newListName in moviesState) { 
            window.alert(`List "${newListName}" already exists.`);
        } else {
            moviesState[newListName] = 0;
            firebase.database().ref('movies').set(moviesState);
        }
    }.bind(this);


    switchList = function(listName) {
        this.setState({currentList: listName})
    }.bind(this);


    addToList = function(listName) {
        let id = this.state.overlayData.imdbID;
        let moviesState = this.state.movies;
        console.log(id)
        // solve empty list
        if(moviesState[listName] === 0) moviesState[listName] = {}
        moviesState[listName][id] = moviesState['All'][id];
        console.log(moviesState)
        firebase.database().ref('movies').set(moviesState);
    }.bind(this)


    searchChange = function(e) {
        this.setState({searchText: this.searchInputRef.current.value});
    }.bind(this)


    displayMore = function() {
        this.setState({page: this.state.page + 1})
    }.bind(this)


    // Overlay control
    showOverlay = function (data) {
        this.setState({overlay: 'visible', overlayData: data})
    }.bind(this)

    hideOverlay = function () {
        this.setState({overlay: 'hidden'})
    }.bind(this)


    render = function () {

        var movies = this.state.movies;
        var lists = Object.keys(movies);

        // Control Panel        
        var addListDiv = React.forwardRef((props, ref) => (
            <div className={props.className+" d-flex"} ref={ref}>
                <Form.Control className="w-auto mr-1"
                    placeholder="+ Create new list"
                    ref={this.addListInputRef}
                />
                <Button type="submit" variant="outline-primary" onClick={this.addList}>Create</Button>
            </div>
        ));

        var panelDiv = 
        <div className="d-flex flex-wrap justify-content-between p-3 mb-3 w-100 -shadow">
            <Dropdown onSelect={this.switchList}>
                <Dropdown.Toggle variant="outline-primary" className="toggle">
                    List: {this.state.currentList}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    { lists.map(listName =>
                        <Dropdown.Item eventKey={listName} active={listName==this.state.currentList} key={listName}>
                            {listName}
                        </Dropdown.Item>                
                    )}
                    <Dropdown.Divider/>
                    <Dropdown.Item as={addListDiv} onClick={e=>e.preventDefault()}></Dropdown.Item>         
                </Dropdown.Menu>
            </Dropdown>
            <div className="d-flex">
                <input placeholder="Add by IMDB ID" className="mr-1" ref={this.addMovieInputRef}></input>
                <Button type="submit" variant="outline-primary" onClick={this.addMovie}>Add movie</Button>
            </div>
            <input placeholder="🔍 Search title" ref={this.searchInputRef} onChange={this.searchChange} className="justify-self-end"></input>
        </div>

        // Posters
        var posterDivs = 
        <div className="w-100 p-5 d-flex flex-column align-items-center">
            <img src={loadingImg} alt="loading"></img>
        </div>
        if(!this.state.loading) {
            var moviesInList = movies[this.state.currentList] ?? {};
            var moviesArray = Object.values(moviesInList);
            // filter
            if(this.state.searchText.length > 0) {
                moviesArray = moviesArray.filter(movie => 
                    movie.Title.toLowerCase().includes(this.state.searchText.toLowerCase())
                )
            }
            // paginate
            if(8 * this.state.page < moviesArray.length) {
                moviesArray = moviesArray.slice(0, 8 * this.state.page);
                var paginated = true;
            }
            // 
            posterDivs = moviesArray.map(data => 
                <div className="m-2 -shadow poster-container" key={data.imdbID}>
                    <img src={data.Poster} className="poster"
                    onClick={()=>this.showOverlay(data)}></img>
                </div>
            )
        }

        
        // listNotIn prop for overlay
        var listNotIn = [];
        for(let listName of lists) {
            // solve empty list "movies[listName] == 0"
            if(movies[listName] == 0) {
                listNotIn.push(listName);
            // solve initially "state.overlayData.imdbID == undefine" 
            } else if(this.state.overlayData.imdbID) {
                if(!(this.state.overlayData.imdbID in movies[listName])) {
                    listNotIn.push(listName);
                }
            }
        }

        // Assemble
        return (
        <div className="row main">
            {panelDiv}
            <div className="w-100 h-100 d-flex flex-wrap justify-content-center align-items-center">
                {posterDivs}
            </div>
            {
            paginated ?
            <div className="d-flex w-100 justify-content-center m-2" onClick={this.displayMore}>
                <Button>More...</Button>
            </div> : ''
            }
            <MovieOverlays 
                data={this.state.overlayData} 
                visibility={this.state.overlay} 
                hideOverlay={this.hideOverlay}
                deleteMovie={this.deleteMovie}
                addToList={this.addToList}
                listNotIn={listNotIn}/>
        </div>
        )
    }
}