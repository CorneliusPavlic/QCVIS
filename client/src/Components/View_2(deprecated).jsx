import React, {Component} from 'react';
import * as d3 from 'd3'
import axios from "axios";

import params from '../functions/preset_param'


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



                const {view23_svg_width, view23_svg_height} = params
                const {view2_padding_top, view2_padding_bottom, view2_padding_left, view2_padding_right} = params


                const theta2 = 1

                const view3_padding_top = view2_padding_top, view3_padding_bottom = view2_padding_bottom
                const view3_padding_left = 400, view3_padding_right = 50
                const view3_block_padding_left = 20, view3_block_padding_top = 20, view3_block_padding_height = 40
                const view3_block_width = 300, view3_block_height = 185

                const view3_rect_height = 15, view3_rect_individual_width =6, view3_barchart_height = 80, view3_rect_refLine_height = 16, view3_rect_padding_left = 8
                const view3_bar_width = 13, view3_barGap_width = 5



                /* 搭建View 2*/

                const theta = 1

                /*开始搭建d3*/

                d3.select('.view2_svg')
                    .remove('*')

                let svg = d3.select('#svg_container_2')
                    .append('svg')
                    .attr('class', 'view2_svg')
                    .attr('width', view23_svg_width * theta)
                    .attr('height', view23_svg_height* theta)


                // console.log(data)

                let gates_qual_extent = d3.extent(Object.values(data).map(d=>d['gates_quality']))

                let qubits_qual_extent = d3.extent(Object.values(data).map(d=>d['qubits_quality']))

                let depth_extent = d3.extent(Object.values(data).map(d=>d['depth']))

                let view2_chart_width = view23_svg_width - view2_padding_left - view2_padding_right

                let qubit_scale = d3.scaleLinear()
                    .domain(qubits_qual_extent)
                    .range([(view23_svg_height - view2_padding_top - view2_padding_bottom)* theta, 0 ])


                let depth_scale = d3.scaleLinear()
                    .domain(depth_extent)
                    .range([0, view2_chart_width * theta])


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
                let cube = chart
                    .selectAll('.view2_rect')
                    .data(Object.entries(data))
                    .join('rect')
                    .attr('class', 'view2_rect')
                    .attr('x', d=>depth_scale(d[1]['depth']))
                    .attr('y', d=>qubit_scale(d[1]['qubits_quality']))
                    .attr('width', 8* theta)
                    .attr('height', 8* theta)
                    .attr('fill', d=>gate_scale(d[1]['gates_quality']))
                    .each(d=>{console.log(d)})
                    .on('click', function(d, item){
                        let x0 = view2_padding_left + view2_chart_width + 15
                        let y0 = view2_padding_top + this.getBBox().y
                        let x1 = view3_padding_left
                        let y1 = +d3.selectAll('.linkpath23').size() * (view3_block_height + view3_block_padding_height) + view3_block_height/2

                        d3.select('.view2_svg')
                            .append('path')
                            .attr('class', 'linkpath23')
                            .attr("d", function(d) {
                            return "M" + x0 + "," + y0
                                + "C" + (x0 + 100) + "," + y0
                                + " " + (x1 - 100) + "," + y1
                                + " " + x1 + "," + y1;
                        })
                    })


                cube.append('title')
                    .text(d=>{
                        return `${d[0]}, q_qual: ${d[1]['qubits_quality']}, gate_qual: ${d[1]['gates_quality']}`
                    })


                let depth_arr = Object.values(data).map(d=>d['depth']).sort()



                /*画横向的坐标轴*/
                let bottom_axis = d3.axisBottom()
                    .scale(depth_scale)
                    .tickValues([ depth_arr[0], depth_arr[Math.round(depth_arr.length*(1/3))], depth_arr[Math.round(depth_arr.length*(2/3))], depth_arr[depth_arr.length-1]])

                let bottom_axis_g = svg.append('g')
                    .attr('transform', `translate(${view2_padding_left* theta}, ${(view23_svg_height - view2_padding_bottom + 10)* theta})`)
                    .call(bottom_axis)


                /*画纵向坐标轴*/
                let right_axis = d3.axisRight()
                    .scale(qubit_scale)

                let right_axis_g = svg.append('g')
                    .attr('transform', `translate(${(view23_svg_width - view2_padding_right + 15)* theta}, ${view2_padding_top* theta} )`)
                    .call(right_axis)






                /*搭建View 3*/


                const color_qubit_attr = ['#14b3ff', '#fe5e0f']
                const color_gate_error = ['#f0f0f0', '#44c45b']

                /*计算所有qubit出现次数最大最小值*/
                let qubit_times_arr = []
                Object.entries(data).forEach(trans=>{
                    let times_arr = Object.values(trans[1]['qubits']).map(q=>q['times'])
                    qubit_times_arr = qubit_times_arr.concat(times_arr)
                })

                let scale_qubits_times = d3.scaleLinear().domain(d3.extent(qubit_times_arr)).range([0, view3_block_width - 3*view3_rect_individual_width])

                /*计算一个scale来支持rect3 T1 的颜色的渐变*/
                let qubit_T1_arr = []
                Object.entries(data).forEach(trans=>{
                    let T1_arr = Object.values(trans[1]['qubits']).map(q=>q['T1'])
                    qubit_T1_arr = qubit_T1_arr.concat(T1_arr)
                })

                let scale_qubit_T1 = d3.scaleLinear().domain(d3.extent(qubit_T1_arr)).range(color_qubit_attr)



                /*计算一个scale来支持rect3 T2 的颜色的渐变*/
                let qubit_T2_arr = []
                Object.entries(data).forEach(trans=>{
                    let T2_arr = Object.values(trans[1]['qubits']).map(q=>q['T2'])
                    qubit_T2_arr = qubit_T2_arr.concat(T2_arr)
                })

                let scale_qubit_T2 = d3.scaleLinear().domain(d3.extent(qubit_T2_arr)).range(color_qubit_attr)




                /*计算一个scale来支持rect3 T2 的颜色的渐变*/
                let qubit_error_arr = []
                Object.entries(data).forEach(trans=>{
                    let error_arr = Object.values(trans[1]['qubits']).map(q=>q['readout_error'])
                    qubit_error_arr = qubit_error_arr.concat(error_arr)
                })

                let scale_qubit_error = d3.scaleLinear().domain(d3.extent(qubit_error_arr)).range(color_qubit_attr)


                /*计算所有gate出现次数最大最小值*/
                let gate_times_arr = []
                let gate_errorRate_arr = []
                Object.entries(data).forEach(trans=>{
                    let times_arr = Object.values(trans[1]['gates']).map(g=>g['times'])
                    let errorRate_arr = Object.values(trans[1]['gates']).map(g=>g['error_rate'])
                    gate_times_arr = gate_times_arr.concat(times_arr)
                    gate_errorRate_arr = gate_errorRate_arr.concat(errorRate_arr)
                })

                /*height*/
                let scale_gates_times = d3.scaleLinear().domain(d3.extent(gate_times_arr)).range([view3_barchart_height-15, 0])
                /*color*/
                let scale_gates_errorGate = d3.scaleLinear().domain(d3.extent(gate_errorRate_arr)).range(color_gate_error)


                let view3 = svg.append('g')
                    .attr('transform', `translate(${view3_padding_left}, ${view3_padding_top})`)
                    .attr('class', 'view3')


                let block = view3.selectAll('.view3_block')
                    .data(Object.values(data))
                    .join('g')
                    .attr('class', 'view3_block')
                    .attr('transform', (d, i)=>`translate(0, ${i * (view3_block_height + view3_block_padding_height)})`)


                /* 每个 rect3 之前的横线*/
                block.selectAll('.rect3_line')
                    .data(d=>Object.entries(d['qubits']))
                    .join('line')
                    .attr('x1', 0)
                    .attr('x2', (d, i)=>scale_qubits_times(d[1]['times']))
                    .attr('y1', (d, i)=>i * view3_rect_height + view3_barchart_height + view3_rect_height/2)
                    .attr('y2', (d, i)=>i * view3_rect_height + view3_barchart_height + view3_rect_height/2)
                    .attr('stroke', '#cccccc')



                /*画每个qubit代表的三个小方块，代表的三个参数*/
                let rect3 = block.selectAll('g')
                    .data(d=>Object.entries(d['qubits']))
                    .join('g')
                    .attr('transform', (d, i)=>`translate(${scale_qubits_times(d[1]['times'])}, ${i * view3_rect_height + view3_barchart_height})`)
                    .attr('class', 'rect3')



                /* 代表 T1 的第一个方块*/
                rect3.append('rect')
                    .attr('width', view3_rect_individual_width)
                    .attr('height', view3_rect_height)
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('fill', d=>scale_qubit_T1(d[1]['T1']))


                /* 代表 T2 的第er个方块*/
                rect3.append('rect')
                    .attr('width', view3_rect_individual_width)
                    .attr('height', view3_rect_height)
                    .attr('x', view3_rect_individual_width)
                    .attr('y', 0)
                    .attr('fill', d=>scale_qubit_T2(d[1]['T2']))


                /* 代表 error rate 的第三个方块*/
                rect3.append('rect')
                    .attr('width', view3_rect_individual_width)
                    .attr('height', view3_rect_height)
                    .attr('x', 2*view3_rect_individual_width)
                    .attr('y', 0)
                    .attr('fill', d=>scale_qubit_error(d[1]['T2']))




                /* 代表每个 qubit 使用次数 的 刻度的对齐竖线*/
                rect3.append('line')
                    .attr('x1', 0)
                    .attr('x2', 0)
                    .attr('y1', -4)
                    .attr('y2', view3_rect_height +4)
                    .attr('stroke', '#000')


                /* 左边的竖线*/
                block.append('line')
                    .attr('class', 'line_left')
                    .attr('x1', 0)
                    .attr('x2', 0)
                    .attr('y1', view3_barchart_height)
                    .attr('y2', d=>view3_barchart_height+ Object.values(d['qubits']).length * view3_rect_height + 10)
                    .attr('stroke', '#000')


                /* 下面的坐标轴*/
                block.append('g')
                    .call(d3.axisBottom(scale_qubits_times))
                    .attr('transform', d=>{
                        return `translate(0, ${Object.keys(d['qubits']).length * view3_rect_height + view3_barchart_height + 15})`
                    })


                /* 开始绘制 上方的代表 gate 状态的 柱状图 */
                let bar = block.selectAll('.bar_gate')
                    .data(d=>Object.entries(d['gates']))
                    .join('rect')
                    .attr('class', 'bar_gate')
                    .attr('width', view3_bar_width)
                    .attr('height', (d,i)=>view3_barchart_height - scale_gates_times(d[1]['times']))
                    .attr('x', (d, i)=>view3_rect_padding_left + i * (view3_bar_width + view3_barGap_width))
                    .attr('y', (d, i)=> scale_gates_times(d[1]['times']) - 5)
                    .attr('fill', d=>scale_gates_errorGate(d[1]['error_rate']))
                    .on('mouseover', (d, item)=>{
                        let gate = item[0]
                        d3.selectAll(`.${gate}`)
                            .style('display', 'block')

                        d3.selectAll(`.rect3`)
                            .style('display', 'none')
                    })
                    .on('mouseout', (d, item)=>{
                        let gate = item[0]
                        d3.selectAll(`.${gate}`)
                            .style('display', 'none')

                        d3.selectAll(`.rect3`)
                            .style('display', 'block')
                    })



                bar.append('title')
                    .text(d=>`${d[0]}, error rate:${d[1]['error_rate'].toFixed(2)}, times:${d[1]['times']}`)



                /*画分隔bar 和 rects 的一条线*/
                block.append('line')
                    .attr('x1', 0)
                    .attr('x2', view3_block_width)
                    .attr('y1', view3_barchart_height-5)
                    .attr('y2', view3_barchart_height-5)
                    .attr('stroke', '#000')
                    .attr('stroke-width', 0.5)


                /*画 bar 的左边的纵向坐标轴*/
                block.append('g')
                    .call(d3.axisLeft().scale(scale_gates_times).ticks(4))
                    .attr('transform', `translate(0, 8)`)


                /*加入 circuit 的名称*/
                block.append('text')
                    .text(d=>d['id'])
                    .attr('transform', `translate(${view3_block_width-50}, ${view3_barchart_height-10})`)


                /*画 legend*/
                /* legend 1*/
                let gradient1 = svg.append("defs")
                    .append("linearGradient")
                    .attr("id","gradient1")
                    .attr("x1", "0%").attr("y1", "0%")
                    .attr("x2", "100%").attr("y2", "0%");

                gradient1.append("stop")
                    .attr("offset", 0.2)
                    .attr("stop-color", '#f9f9f9')
                    .attr("stop-opacity", 1);

                gradient1.append("stop")
                    .attr("offset", 1)
                    .attr("stop-color", "#44c45b")
                    .attr("stop-opacity", 1);


                let gradient2 = svg.append("defs")
                    .append("linearGradient")
                    .attr("id","gradient2")
                    .attr("x1", "0%").attr("y1", "0%")
                    .attr("x2", "100%").attr("y2", "0%");

                gradient2.append("stop")
                    .attr("offset", 0.2)
                    .attr("stop-color", '#fe5e0f')
                    .attr("stop-opacity", 1);

                gradient2.append("stop")
                    .attr("offset", 0.5)
                    .attr("stop-color", "#ffffff")
                    .attr("stop-opacity", 1);

                gradient2.append("stop")
                    .attr("offset", 1)
                    .attr("stop-color", "#14b3ff")
                    .attr("stop-opacity", 1);

                let legend = svg.append('g')
                    .attr('class', 'view3_legend_1')
                    .attr('transform', `translate(${(view23_svg_width - 250)},5)`)

                legend.append('text')
                    .text('Gate Quality: good -> bad')
                    .attr('transform', `translate(7, 10)`)
                    .style('font-size', `0.7em`)

                legend.append('rect')
                    .attr('x', 145)
                    .attr('y', 5)
                    .attr('width', 100)
                    .attr('height', 15)
                    .attr('fill', 'url(#gradient1)')

                legend.append('text')
                    .text('Qubit Quality: good -> bad')
                    .attr('transform', `translate(7, 35)`)
                    .style('font-size', `0.7em`)

                legend.append('rect')
                    .attr('x', 145)
                    .attr('y', 25)
                    .attr('width', 100)
                    .attr('height', 15)
                    .attr('fill', 'url(#gradient2)')



                /* 画每个bar对应的gate的首尾*/
                block.selectAll('.lineSegment_gate')
                    .data(d=>Object.entries(d['gates']))
                    .join('line')
                    .attr('class', d=>`lineSegment_gate ${d[0]}`)
                    .attr('x1', (d, i)=>view3_rect_padding_left+ view3_bar_width/2 + i * (view3_bar_width + view3_barGap_width))
                    .attr('y1', d=>{
                        if(d[1]['source'].length){
                            return d[1]['source'].split('_')[1] * view3_rect_height  + view3_rect_height/2 + view3_barchart_height
                        }
                    })
                    .attr('x2', (d, i)=>view3_rect_padding_left + view3_bar_width/2 + i * (view3_bar_width + view3_barGap_width))
                    .attr('y2', d=>{
                        if(d[1]['target'].length){
                            return d[1]['target'].split('_')[1] * view3_rect_height  + view3_rect_height/2 + view3_barchart_height
                        }
                    })
                    .attr('stroke', '#4b4b4b')
                    .attr('stroke-width', 1)



                /*画每个gate首尾的两个圆点*/
                block.selectAll('.circle_gate_source')
                    .data(d=>Object.entries(d['gates']))
                    .join('circle')
                    .attr('class', d=>`circle_gate_source ${d[0]}`)
                    .attr('cx', (d, i)=>view3_rect_padding_left+ view3_bar_width/2 + i * (view3_bar_width + view3_barGap_width))
                    .attr('cy', d=> {
                        if(d[1]['source']){
                            return d[1]['source'].split('_')[1] * view3_rect_height  + view3_rect_height/2 + view3_barchart_height
                        }
                    })
                    .attr('r', d=>d[1]['source'] && d[1]['target']? 2:0)
                    .attr('fill', '#4b4b4b')


                block.selectAll('.circle_gate_target')
                    .data(d=>Object.entries(d['gates']))
                    .join('circle')
                    .attr('class', d=>`circle_gate_target ${d[0]}`)
                    .attr('cx', (d, i)=>view3_rect_padding_left+ view3_bar_width/2 + i * (view3_bar_width + view3_barGap_width))
                    .attr('cy', d=> {
                        if(d[1]['target']){
                            return d[1]['target'].split('_')[1] * view3_rect_height  + view3_rect_height/2 + view3_barchart_height
                        }
                    })
                    .attr('r', d=>d[1]['source'] && d[1]['target']? 2:0)
                    .attr('fill', '#4b4b4b')



                


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
