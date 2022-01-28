import React, {Component} from 'react';
import * as d3 from 'd3'
import axios from "axios";

import scales from '../functions/scales'
import params from '../functions/preset_param'


class View_1 extends Component {
    constructor(props){
        super(props);
        this.render_view1 = this.render_view1.bind(this)
        this.state = {
            radius: this.props.radius
        }
    }




    render_view1(){

        // const {radius} = this.props
        let select_computer = this.props.select_computer


        // axios.get('/api/view1_api/30/7/ibm_lagos&ibm_perth&ibmq_belem&ibmq_bogota&ibmq_casablanca&ibmq_jakarta&ibmq_lima&ibmq_manila&ibmq_quito&ibmq_santiago&ibmq_armonk')
        axios.get('/api/view1_api/30/7/ibm_lagos&ibm_perth&ibmq_belem&ibmq_bogota&ibmq_casablanca&ibmq_jakarta&ibmq_lima&ibmq_manila&ibmq_quito&ibmq_armonk&ibmq_armonk')
            .then(d=>{

                const data = d.data

                // console.log(data)

                d3.select('.view1_svg')
                    .remove('*')

                const ref_value = 120

                const attr = 'T1'

                const theta =0.8

                /*size for View 1*/
                const {view1_width, view1_height, view1_computer_height, view1_computer_width, view1_computer_block_width, view1_computer_block_height, view1_qubitMaxRadius, view1_qubitHeight, view1_legend_height, view1_legend_width} = params
                const {view1_padding_top, view1_padding_bottom, view1_padding_left, view1_padding_right} = params
                const {view1_block_top, view1_qubit_padding_left} = params



                /*qubit的位置字典*/
                const qubit_position_dict= {
                    'q_0': view1_block_top + 0*2*view1_qubitMaxRadius,
                    'q_1': view1_block_top + 1*2*view1_qubitMaxRadius,
                    'q_2': view1_block_top + 2*2*view1_qubitMaxRadius,
                    'q_3': view1_block_top + 3*2*view1_qubitMaxRadius,
                    'q_4': view1_block_top + 4*2*view1_qubitMaxRadius,
                    'q_5': view1_block_top + 5*2*view1_qubitMaxRadius,
                    'q_6': view1_block_top + 6*2*view1_qubitMaxRadius
                }


                let svg = d3.select('#svg_container_1')
                    .append('svg')
                    .attr('class', 'view1_svg')
                    .attr('width', view1_width * theta)
                    .attr('height', view1_height * theta)


                let view1 = svg.append('g')
                    .attr('class', 'view1')
                    .attr('transform', `translate(0,0)`)


                /*!* 先画qubit对齐线, 因为在最下面 */
                let time_arr = Object.values(data).map(d=>{return d.map(_d=>{return _d['timestamp']})})

                let computer_qubit_ref_line_data = Object.values(data).map(d=>{return d[0]['qubit'].length}).map(d=>{return d3.range(d)})

                let ref_line = view1.selectAll('g')
                    .data(computer_qubit_ref_line_data)
                    .join('g')
                    .attr('class', 'ref_line')
                    .attr('transform', (d,i)=>`translate(0,${(view1_legend_height * theta + i*(view1_computer_height+10))*theta})`)

                ref_line.selectAll('line')
                    .data(d=>d)
                    .join('line')
                    .style('stroke', '#a3e1e8')
                    .style('stroke-width', 1* theta)
                    .attr('class', 'circuit_ref_line')
                    .attr('x1', view1_padding_left* theta)
                    .attr('x2', (view1_padding_left + view1_computer_width-20)* theta)
                    .attr('y1', d=>(view1_padding_top + view1_block_top + d*2*view1_qubitMaxRadius)*theta)
                    .attr('y2', d=>(view1_padding_top + view1_block_top + d*2*view1_qubitMaxRadius)*theta)



                /*开始画除了ref_line 之外的元素*/
                let qcomputer = view1.selectAll('.qcomputer')
                    .data(Object.entries(data).map(d=>{
                        let qcomputer_id = d[0]
                        return d[1].map(_d=> {return {"qcomputer": d[0], ..._d} || 'Q_X'})
                    }))
                    .join('g')
                    .attr('class', `qcomputer`)
                    .attr('transform', (d,i)=>`translate(0,${(view1_legend_height * theta + i*(view1_computer_height+10))*theta})`)

                /*每个糖葫芦+电路线段组成的基本单位叫做一个 block*/
                let block = qcomputer.selectAll('g')
                    .data(d=>d)
                    .join('g')
                    .attr('transform', (_d,_i)=>`translate(${(view1_padding_left + _i*view1_computer_block_width)*theta},${view1_padding_top*theta})`)


                /*画 block 中的串糖葫芦的棍*/
                block.append('line')
                    .style('stroke', '#d9d9d9')
                    .style('stroke-width', 2* theta)
                    .attr('x1', view1_qubit_padding_left*theta)
                    .attr('x2', view1_qubit_padding_left*theta)
                    .attr('y1', view1_block_top* theta)
                    .attr('y2', (view1_block_top + view1_qubitHeight-10)* theta)


                /*画一串一串糖葫芦*/
                block.selectAll('circle')
                    .data(d=>{return d['qubit']})
                    .join('circle')
                    .attr('cx', view1_qubit_padding_left*theta)
                    .attr('cy', (d,i)=>(view1_block_top + i*2*view1_qubitMaxRadius)*theta)
                    .attr('r', d=>{
                        let radius = scales['view1'][d['computer_id']][attr](Math.abs(d[attr] - ref_value))
                        return radius*theta
                    })
                    .attr('fill', d=>d[attr]>=ref_value? '#90ce90':'#e18c8f')
                    .append('title')
                    .text(d=>`${attr}: ${d[attr].toFixed(2)}`)



                /*开始画每个 computer 头顶的长的坐标轴*/
                time_arr = Object.values(data).map(d=>{return d.map(_d=>{return _d['timestamp']})})

                let timeline_g = qcomputer.append('g')
                    .attr('transform', `translate(${view1_padding_left* theta}, ${(view1_padding_top+15)* theta})`)

                timeline_g.append('line')
                    .style('stroke', '#747474')
                    .style('stroke-width', 1)
                    .attr('x1', 0)
                    .attr('x2', d=>d.length*view1_computer_block_width* theta)
                    .attr('y1', 8* theta)
                    .attr('y2', 8* theta)

                timeline_g.selectAll('text')
                    .data(d=>{return d.map(_d=>_d['timestamp'])})
                    .join('text')
                    .text(d=>d)
                    .attr('transform', (d,i)=>`translate(${i*view1_computer_block_width* theta}, ${4 * theta})`)
                    .style('font-size', '0.7em')



                /*开始画每个 block 的坐标轴*/
                let arr = []
                let a = Object.values(data)
                for (let i in a){
                    a[i].forEach(d=>{
                        d['gate'].forEach(_d=>{
                            arr.push(_d['error_rate'] * 100)
                            if(_d['error_rate'] * 100 >=100){
                                // console.log(_d)
                            }
                        })
                    })
                }

                // console.log(arr)


                let extent = d3.extent(arr)/* 现在用所有computer的统一extent，以后考虑单独extent*/
                // console.log(extent)

                let scale = d3.scaleLinear()
                    .domain([0, extent[1]])
                    .range([5, (view1_computer_block_width - view1_qubit_padding_left)* theta])


                let bottom_axis = d3.axisTop()
                    .scale(scale)
                    .tickValues([0, extent[1]]);/*TODO: 格式化*/

                let bottom_axis_g = block.append('g')
                    .attr('transform', d=>{
                        if(d['qubit'].length == 7){
                            return `translate(${view1_qubit_padding_left* theta},${(view1_block_top + view1_computer_block_height+25)* theta})`
                        }
                        return `translate(${view1_qubit_padding_left* theta},${(view1_block_top + view1_computer_block_height)* theta})`
                    })
                    .call(bottom_axis)

                bottom_axis_g.selectAll('text')
                    .attr('dy', "20px")
                    .attr('dx', d=>d==0?'2px':"-7px")/*不容易*/





                /*开始搞gate的连接的线*/
                block.selectAll('.gate')
                    .data(d=>d['gate'])
                    .join('line')
                    .attr('class', 'gate')
                    // .attr('transform', `translate(60, 0)`)
                    .style('stroke', '#ababab')
                    .style('stroke-width', 1.5* theta)
                    .attr('x1', d=>(scale(d['error_rate']*100)+view1_qubit_padding_left+15)* theta)
                    .attr('x2', d=>(scale(d['error_rate']*100)+view1_qubit_padding_left+15)* theta)
                    .attr('y1', d=>qubit_position_dict[d['source']]* theta)
                    .attr('y2', d=>qubit_position_dict[d['target']]* theta)
                    .append('title')
                    .text(d=>`${attr}: ${d['error_rate']*100}`)


                /*连接线的端点 - 起点*/
                block.selectAll('.source-dot')
                    .data(d=>d['gate'])
                    .join('circle')
                    .attr('class', 'source-dot')
                    .attr('cx', d=>(scale(d['error_rate']*100)+view1_qubit_padding_left+15)* theta)
                    .attr('cy', d=>qubit_position_dict[d['source']]* theta)
                    .attr('r', 2* theta)
                    .attr('fill', '#ababab')


                /*连接线的端点 - 终点*/
                block.selectAll('.target-dot')
                    .data(d=>d['gate'])
                    .join('circle')
                    .attr('class', 'target-dot')
                    .attr('cx', d=>(scale(d['error_rate']*100)+view1_qubit_padding_left+15)* theta)
                    .attr('cy', d=>qubit_position_dict[d['target']]* theta)
                    .attr('r', 2* theta)
                    .attr('fill', '#ababab')


                /* 现在给每个 qcomputer 里面画一个代表 computer 编号的字母 */
                qcomputer
                    .append('text')
                    .text(d=>{
                        let arr = d[0]['qcomputer'].split('_')
                        return `${arr[0]}\n${arr[1]}`
                    })
                    .attr('transform', (d,i)=>`translate(${(view1_padding_left/2-15)* theta}, ${(view1_computer_height/2+20)* theta})`)
                    .style('font-size', '0.9em')
                    .on('click', (d,item)=>{
                        console.log(item)
                        select_computer(item[0]['qcomputer'])
                    })




                /*从这里开始画 填充折线图*/
                /* let example_data = [{'date':0, "value":0},{'date':4, "value":3},{'date':10, "value":1},{'date':13, "value":3}]


                 let gradient = view1.append("defs")
                     .append("linearGradient")
                     .attr("id","gradient")
                     .attr("x1", "0%").attr("y1", "0%")
                     .attr("x2", "100%").attr("y2", "0%");

                 gradient.append("stop")
                     .attr("offset", 0.2)
                     .attr("stop-color", '#ffffff')
                     .attr("stop-opacity", 1);

                 gradient.append("stop")
                     .attr("offset", 1)
                     .attr("stop-color", "#eb8589")
                     .attr("stop-opacity", 1);


                 let scale_y_dist = d3.scaleLinear()
                     .domain([0,4])
                     .range([18, 0])

                 block.append('g')
                     .attr('transform', d=>{
                         if(d['qubit'].length == 7){
                             return `translate(${view1_qubit_padding_left},${view1_block_top + view1_computer_block_height + 5})`
                         }
                         return `translate(${view1_qubit_padding_left},${view1_block_top + view1_computer_block_height - 20})`
                     })
                     .append('path')
                     .datum(example_data)
                     .attr("stroke-width", 1)
                     .attr('fill', 'url(#gradient)')
                     .attr('d', d3.area()
                         .x(function(d){return scale(d['date'])})
                         .y0(18)
                         .y1(function(d){return scale_y_dist(d['value'])})
                     )
         */



                /* 在所有元素最上面的 view1_legend_height 空隙中， 画legend */
                let legend_1 = view1.append('g')
                    .attr('class', 'legend_1')
                    .attr('transform', `translate(${(view1_computer_width - view1_legend_width)* theta},0)`)

                legend_1.append('text')
                    .text('Good Qubit Quality')
                    .attr('transform', `translate(${7* theta},${20* theta})`)
                    .style('font-size', `${0.7 * theta}em`)

                legend_1.append('text')
                    .text('Bad Qubit Quality')
                    .attr('transform', `translate(${140* theta},${20* theta})`)
                    .style('font-size', `${0.7 * theta}em`)

                legend_1.append('rect')
                    .attr('fill', '#90ce90')
                    .attr('x', 105* theta)
                    .attr('y', 9* theta)
                    .attr('width', 15* theta)
                    .attr('height', 15* theta)

                legend_1.append('rect')
                    .attr('fill', '#e18c8f')
                    .attr('x', 230* theta)
                    .attr('y', 9* theta)
                    .attr('width', 15* theta)
                    .attr('height', 15* theta)

                /* legend 2*/
                let legend_2 = view1.append('g')
                    .attr('class', 'legend_2')
                    .attr('transform', `translate(${(view1_computer_width - view1_legend_width)* theta},${35 * theta})`)

                legend_2.append('text')
                    .text('Gate Quality: good -> bad')
                    .attr('transform', `translate(${7* theta},${10* theta})`)
                    .style('font-size', `${0.7 * theta}em`)

                legend_2.append('rect')
                    .attr('x', 145* theta)
                    .attr('y', 0)
                    .attr('width', 100* theta)
                    .attr('height', 15* theta)
                    .attr('fill', 'url(#gradient)')


            })





    }

    componentDidMount() {

        this.render_view1()
    }


    componentDidUpdate() {

        console.log('view 1 updated')

        this.render_view1()
    }


    render(){
        const {radius} = this.props

        return (
            <div id="svg_container_1"></div>
        );
    }
}

export default View_1;
