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

        const view1_width = 450
        const lin12_svg_width = 100

        let trans_times = Number(document.getElementById('view2-button').value)
        let backend_name = this.props.selected_computer

        const {circle_radius_max, view2_margin_top} = params

        d3.select('#link12')
            .style('left', view1_width + 'px')

        let svg = d3.select('#link12_svg_container')
            .append('svg')
            .attr('class', 'link12_svg')
            .attr('width', lin12_svg_width)
            .style('height', '100%')


        svg.append('path')
            .attr('class', 'link12')
            .attr("d", function(d, i){

                let x0 = 0
                let y0 = +d3.select(`.${backend_name}`).attr('transform').split(/[\s,()]+/)[2] + 200
                let x1 = lin12_svg_width
                let y1 = trans_times * circle_radius_max + view2_margin_top


                return "M" + x0 + "," + y0
                    + "C" + (x0+100) + "," + y0
                    + " " + (x1-100) + "," + y1
                    + " " + x1 + "," + y1;
            })
    }


    render(){
        return (
            <div id="link12_svg_container"></div>
        )
    }
}

export default Link12