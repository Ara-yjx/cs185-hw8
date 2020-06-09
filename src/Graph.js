import React, { Component } from 'react';
import firebase from 'firebase'
import DB from './Database'
import './Graph.css'
// import { forceManyBody } from 'd3';
const d3 = require('d3')

const WIDTH = 1080
const HEIGHT = 1080

export default class Graph extends Component {

    constructor(props) {
        super(props);
        DB.init();
        this.svgRef = React.createRef();
    }

    chart = function(nodes, links, patterns) {

        // Display
        const svg = d3.create('svg').attr('viewBox', [0,0,WIDTH,HEIGHT]);
        var pattern = svg.append('defs')
            .selectAll('pattern').data(patterns).join('pattern')
            .attr('id', d => d.imdbid)
            .attr('width', '1').attr('height', '1')
            .attr('patternUnits', "objectBoundingBox")
            .append('image')
            .attr('href', d => d.poster)
            .attr('width', '160')
            .attr('x', 0).attr('y', 0)
            
        var link = svg.append('g').attr('stroke', '#999')
            .selectAll('line').data(links).join('line')
            .attr('stroke-width', '4')

        var node = svg.append('g').attr('stroke', '#999')
            .selectAll('circle').data(nodes).join('circle')
            .attr('r', d => d.r)
            .attr('fill', d => d.imdbid ? 'url(#'+d.imdbid+')' : '#333')

        var text = svg.append('text').attr('id', 'svg-text')
            .attr('stroke', '#fff').attr('fill', '#000')

        // Force
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink().links(links).id(d => d.index).distance(300))
            .force('charge', d3.forceManyBody().strength(-100))
            .force('center', d3.forceCenter(WIDTH/2, HEIGHT/2))
        simulation.on('tick', () => {
            link.attr('x1', d=>d.source.x)
                .attr('y1', d=>d.source.y)
                .attr('x2', d=>d.target.x)
                .attr('y2', d=>d.target.y)
            node.attr('cx', d=>d.x)
                .attr('cy', d=>d.y)
        })
        // simulation.alphaTarget(0).restart();


        // Drag
        node = node.call(
            d3.drag()
            .on('start', d => {
                if(!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x
                d.fy = d.y
            })
            .on('drag', d => {
                d.fx = d3.event.x
                d.fy = d3.event.y
            })
            .on('end', d => {
                if(!d3.event.active) simulation.alphaTarget(0).restart();
                d.fx = null
                d.fy = null
            })
        )

        // Hover Display
        node.on('mouseover', d => {
            let {x, y, text} = d
            d3.select('#svg-text').text(text)
                .attr('x', x).attr('y', y)
        }).on('mouseout', d => {
            d3.select('#svg-text').text('')
        })

        return svg.node();
    }.bind(this)


    componentDidMount = function() {
        firebase.database().ref('movies').on('value', (snapshot)=>{
            let movies = snapshot.val()?.GraphViz
            movies = Object.values(movies)
            // break actors string into string list
            const merge = list => Array.from(new Set([].concat.apply([], list)))
            movies.forEach(e => e.ActorsList = merge(e.Actors?.replace(' ', '').split(',')));

            var titles = movies.map(e => e.Title)
            var actors = merge(movies.map(e => e.ActorsList))
            var patterns = movies.map(e => ({
                poster: e.Poster,
                imdbid: e.imdbID,
            }))
            // Nodes and links
            var nodes = movies.map(movie => ({
                text: movie.Title,
                imdbid: movie.imdbID,
                poster: movie.Poster,
                r: 80,
            })).concat(actors.map((name, i) => ({
                text:name, r:30
            })))
            var links = []
            for(let movie of movies) {
                for(let actor of movie.Actors?.replace(' ', '').split(',')) {
                    links.push({
                        source: titles.indexOf(movie.Title),
                        target: actors.indexOf(actor) + titles.length
                    })
                }
            }
            // Make SVG and attach
            if(this.svgRef.current)
                this.svgRef.current.appendChild(this.chart(nodes, links, patterns));
        })
    }


    render = function(){
        return <div ref={this.svgRef}></div>
    }

}
