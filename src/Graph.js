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

    chart = function(nodes, links) {

        // Display
        const svg = d3.create('svg').attr('viewBox', [0,0,WIDTH,HEIGHT]);
        var link = svg.append('g').attr('stroke', '#999')
            .selectAll('line').data(links).join('line')
            .attr('stroke-width', '10')
        var node = svg.append('g').attr('stroke', '#999')
            .selectAll('circle').data(nodes).join('circle')
            .attr('fill', '#333')
            .attr('r', d => d.r)
            .attr('id', d => d.id)
        console.log(d3.selectAll('circle'))
        var text = svg.append('text').attr('id', 'svg-text')
            .attr('stroke', '#333').attr('fill', '#fff')
            // .attr('x', 1000).attr('y', 1000)

        // Force
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink().links(links).id(d => d.index).distance(300))
            .force('charge', d3.forceManyBody().strength(-1000))
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
            let {x, y, id, text} = d
            console.log(d3.select('#'+d.id))
            d3.select('#svg-text').text(text)
                .attr('x', x).attr('y', y)
        }).on('mouseout', d => {
            console.log(d)
            console.log('out')
        })

        return svg.node();
    }.bind(this)


    componentDidMount = function() {
        firebase.database().ref('movies').on('value', (snapshot)=>{
            let movies = snapshot.val()['GraphViz']
            movies = [
                {Title: 'AAA', Actors:['a','b','c']},
                {Title: 'BBB', Actors:['b','c']},
                {Title: 'CCC', Actors:['c']},
            ]
            // Array of titles and actors text
            var titles = movies.map(e => e.Title)
            var actors = Array.from(new Set([].concat.apply([], movies.map(e => e.Actors))))
            // Nodes and links
            var nodes = titles.map((name, i) => ({text:name, r:100, id:'node-t-'+i}))
                .concat(actors.map((name, i) => ({text:name, r:50, id:'node-a-'+i})))
            var links = []
            for(let movie of movies) {
                for(let actor of movie.Actors) {
                    links.push({
                        source: titles.indexOf(movie.Title),
                        target: actors.indexOf(actor) + titles.length
                    })
                }
            }
            // Make SVG and attach
            this.svgRef.current.appendChild(this.chart(nodes, links));
        })
    }


    render = function(){
        return <div ref={this.svgRef}></div>
    }

}
