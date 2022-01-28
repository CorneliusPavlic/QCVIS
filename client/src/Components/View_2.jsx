import React, {Component} from 'react';
import * as d3 from 'd3'
import axios from "axios";


class View_2 extends Component {
    constructor(props){
        super(props);
        this.render_view2 = this.render_view2.bind(this)
        this.state = {
            radius: this.props.radius,
        }
    }




    render_view2(){

        /*更改gate_qual extent 的函数*/
        let view2_gate_qual_extent = this.props.view2_gate_qual_extent
        /*更改qubit_qual extent 的函数*/
        let view2_qubit_qual_extent = this.props.view2_qubit_qual_extent



        let trans_times = Number(document.getElementById('view2-button').value)
        let backend_name = this.props.backend_name
        axios.post(`/api/view2_api/`, {'trans_times': trans_times, 'backend_name': backend_name})
            .then(function(res){
                let data = res.data

                const view2_svg_width = 300, view2_svg_height = 1050

                const view2_padding_top = 50, view2_padding_bottom = 50, view2_padding_left = 50, view2_padding_right = 50

                const theta = 1

                /*开始搭建d3*/

                d3.select('.view2_svg')
                    .remove('*')

                let svg = d3.select('#svg_container_2')
                    .append('svg')
                    .attr('class', 'view2_svg')
                    .attr('width', view2_svg_width * theta)
                    .attr('height', view2_svg_height* theta)


                console.log(data)

                let gates_qual_extent = d3.extent(Object.values(data).map(d=>d['gates_quality']))

                let qubits_qual_extent = d3.extent(Object.values(data).map(d=>d['qubits_quality']))

                let depth_extent = d3.extent(Object.values(data).map(d=>d['depth']))

                let qubit_scale = d3.scaleLinear()
                    .domain(qubits_qual_extent)
                    .range([(view2_svg_height - view2_padding_top - view2_padding_bottom)* theta, 0 ])


                let depth_scale = d3.scaleLinear()
                    .domain(depth_extent)
                    .range([0, (view2_svg_width - view2_padding_left - view2_padding_right)* theta])


                let gate_scale = d3.scaleLinear()
                    .domain(gates_qual_extent)
                    .range(['#bed1e4', '#73a2b9'])

                /**/
                view2_gate_qual_extent(gates_qual_extent)
                view2_qubit_qual_extent(qubits_qual_extent)


                let chart = d3.select('.view2_svg')
                    .append('g')
                    .attr('transform', `translate(${view2_padding_left* theta}, ${view2_padding_top* theta})`)


                /*画每个circuit代表的方形*/
                chart
                    .selectAll('.view2_rect')
                    .data(Object.entries(data))
                    .join('rect')
                    .attr('class', 'view2_rect')
                    .attr('x', d=>depth_scale(d[1]['depth']))
                    .attr('y', d=>qubit_scale(d[1]['qubits_quality']))
                    .attr('width', 8* theta)
                    .attr('height', 8* theta)
                    .attr('fill', d=>gate_scale(d[1]['gates_quality']))
                    .append('title')
                    .text(d=>{
                        return `${d[0]}, q_qual: ${d[1]['qubits_quality']}, gate_qual: ${d[1]['gates_quality']}`
                    })


                let depth_arr = Object.values(data).map(d=>d['depth']).sort()



                /*画横向的坐标轴*/
                let bottom_axis = d3.axisBottom()
                    .scale(depth_scale)
                    .tickValues([ depth_arr[0], depth_arr[Math.round(depth_arr.length*(1/3))], depth_arr[Math.round(depth_arr.length*(2/3))], depth_arr[depth_arr.length-1]])

                let bottom_axis_g = svg.append('g')
                    .attr('transform', `translate(${view2_padding_left* theta}, ${(view2_svg_height - view2_padding_bottom + 10)* theta})`)
                    .call(bottom_axis)


                /*画纵向坐标轴*/
                let right_axis = d3.axisRight()
                    .scale(qubit_scale)

                let right_axis_g = svg.append('g')
                    .attr('transform', `translate(${(view2_svg_width - view2_padding_right + 15)* theta}, ${view2_padding_top* theta} )`)
                    .call(right_axis)





            })



    }

    componentDidMount() {

        this.render_view2()
    }


    componentDidUpdate() {

        console.log('view 2 updated')


        /*更改gate_qual 所选范围 的 []*/
        let view2_gate_qual_filter = this.props.view2_gate_qual_filter
        /*更改qubit_qual 所选范围 的 []*/
        let view2_qubit_qual_filter = this.props.view2_qubit_qual_filter


        d3.selectAll('.view2_rect')
            .attr('class', d=>{
                if(view2_gate_qual_filter.length && view2_qubit_qual_filter.length){
                    if((d[1]['gates_quality'] > view2_gate_qual_filter[1] || d[1]['gates_quality'] < view2_gate_qual_filter[0])
                        ||
                        (d[1]['qubits_quality'] > view2_qubit_qual_filter[1] || d[1]['qubits_quality'] < view2_qubit_qual_filter[0])
                    ){
                        return 'view2_rect display-none'
                    }else{
                        return 'view2_rect'
                    }
                }
                if(view2_gate_qual_filter.length){
                    if(d[1]['gates_quality'] > view2_gate_qual_filter[1] || d[1]['gates_quality'] < view2_gate_qual_filter[0]
                    ){
                        return 'view2_rect display-none'
                    }else{
                        return 'view2_rect'
                    }
                }
                if(view2_qubit_qual_filter.length){
                    if(d[1]['qubits_quality'] > view2_qubit_qual_filter[1] || d[1]['qubits_quality'] < view2_qubit_qual_filter[0]){
                        return 'view2_rect display-none'
                    }else{
                        return 'view2_rect'
                    }
                }

            })
    }


    render(){

        return (
            <div id="svg_container_2"></div>
        );
    }
}

export default View_2;
