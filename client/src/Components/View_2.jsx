import React, {Component} from 'react';
import * as d3 from 'd3'


class View_2 extends Component {
    constructor(props){
        super(props);
        this.render_view2 = this.render_view2.bind(this)
        this.state = {
            radius: this.props.radius
        }
    }




    render_view2(){




        let svg = d3.select('#svg_container_2')
            .append('svg')
            .attr('width', 300)
            .attr('height', 300)

        svg.append('circle')
            .attr('cx', 30)
            .attr('cy', 30)
            .attr('r', 10)



    }

    componentDidMount() {

        this.render_view2()
    }


    componentDidUpdate() {
        // console.log('view 1 will update!')

        this.render_view2()
    }


    render(){

        return (
            <div id="svg_container_2"></div>
        );
    }
}

export default View_2;
