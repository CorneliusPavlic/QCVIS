import React, {Component} from 'react';
import * as d3 from 'd3'

import params from '../functions/preset_param'


class Link12 extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }


    componentDidMount() {

        d3.select('.link12_svg')
            .remove()


        const lin12_svg_width = 130

        let trans_times = Number(document.getElementById('view2-button').value)
        let backend_name = this.props.selected_computer

        const {circle_radius_max, view2_margin_top} = params


        let svg = d3.select('#link12_svg_container')
            .append('svg')
            .attr('class', 'link12_svg')
            .attr('width', lin12_svg_width)
            .style('height', '100%')


        let x2_position = lin12_svg_width-20

        svg.append('path')
            .attr('class', 'link12')
            .attr("d", function(d, i){

                let x0 = 0
                let y0 = +d3.select(`.${backend_name}`).attr('transform').split(/[\s,()]+/)[2] + 70
                let x1 = x2_position
                // let y1 = d3.selectAll('.view2_block').size() * circle_radius_max + view2_margin_top
                let y1 = 500


                return "M" + x0 + "," + y0
                    + "C" + (x0+100) + "," + y0
                    + " " + (x1-100) + "," + y1
                    + " " + x1 + "," + y1;
            })



        svg.append('line')
            .attr('x1', 2)
            .attr('x2', 2)
            .attr('y1', +d3.select(`.${backend_name}`).attr('transform').split(/[\s,()]+/)[2] + 10)
            .attr('y2', +d3.select(`.${backend_name}`).attr('transform').split(/[\s,()]+/)[2] + 130)
            .attr('stroke', 'rgba(0, 233, 191, 0.67)')
            .attr('stroke-width', '3px')
            .style('stroke-linecap', 'round')


        svg.append('line')
            .attr('x1', x2_position)
            .attr('x2', x2_position)
            .attr('y1', 65)
            .attr('y2', '100%')
            .attr('stroke', 'rgba(0, 233, 191, 0.67)')
            .attr('stroke-width', '3px')
            .style('stroke-linecap', 'round')

    }


    render(){
        return (
            <div id="link12_svg_container"></div>
        )
    }
    }



export default Link12