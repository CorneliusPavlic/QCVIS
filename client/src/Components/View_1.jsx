import React, {Component} from 'react';
import * as d3 from 'd3'
import axios from "axios";
import * as science from 'science'

import params from '../functions/preset_param'
import {kernelEpanechnikov, kernelDensityEstimator} from "../functions/kde";


class View_1 extends Component {
    constructor(props){
        super(props);
        this.render_view1 = this.render_view1.bind(this)
        this.state = {

        }
    }




    render_view1(){

        let select_computer = this.props.select_computer

        const _this = this


        // axios.get('/api/view1_api/30/7/ibm_lagos&ibm_perth&ibmq_belem&ibmq_bogota&ibmq_casablanca&ibmq_jakarta&ibmq_lima&ibmq_manila&ibmq_quito&ibmq_santiago&ibmq_armonk')
        axios.get('/api/view1_api/30/7/ibm_lagos&ibm_perth&ibmq_belem&ibmq_bogota&ibmq_casablanca&ibmq_jakarta&ibmq_lima&ibmq_manila&ibmq_quito&ibmq_armonk&ibmq_armonk')
            .then(d=>{

                const data = d.data['data']
                const ref_value = d.data['ref_value']

                // console.log(data)

                d3.select('.view1_svg')
                    .remove('*')


                const attr = _this.props.view1_attr || 'T1'

                const theta = 1

                /*size for View 1*/
                const {view1_width, view1_height, view1_computer_height, view1_computer_width, view1_computer_block_width, view1_computer_block_height, view1_qubitMaxRadius, view1_qubitHeight, view1_legend_height, view1_legend_width} = params
                const {view1_margin_top, view1_margin_left} = params
                const {view1_block_top, view1_qubit_padding_left} = params
                const view1_area_height = 12
                const view1_computerGap_height = 35



                /*qubit的位置字典*/
                const qubit_position_dict= {
                    'q_0': 0*2*view1_qubitMaxRadius,
                    'q_1': 1*2*view1_qubitMaxRadius,
                    'q_2': 2*2*view1_qubitMaxRadius,
                    'q_3': 3*2*view1_qubitMaxRadius,
                    'q_4': 4*2*view1_qubitMaxRadius,
                    'q_5': 5*2*view1_qubitMaxRadius,
                    'q_6': 6*2*view1_qubitMaxRadius
                }


                let qubit_attr_arr = []
                Object.values(data).map(d=>d.map(_d=>_d['qubit'])).map(d=>d.map(_d=>_d.map(__d=>__d[attr]))).forEach(d=>d.forEach(_d=>_d.forEach(__d=>qubit_attr_arr.push(Math.abs(__d - ref_value[attr])))))


                /*设置attr的比例尺，如果是error_rate的话，要单独设置，不然的话点太小了*/
                let scale_qubit_attr
                if(attr != 'error_rate'){
                    scale_qubit_attr = d3.scalePow()
                        .exponent(0.6)
                        .domain(d3.extent(qubit_attr_arr))
                        .range([0, params.view1_qubitMaxRadius])
                }else{
                    scale_qubit_attr = d3.scalePow()
                        .exponent(0.25)
                        .domain(d3.extent(qubit_attr_arr))
                        .range([0, params.view1_qubitMaxRadius])
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
                    .attr('transform', (d,i)=>{

                            let prev_height = 0
                            for(let _i in d3.range(i)){
                                let prev_num = computer_qubit_ref_line_data[_i].length
                                let computer_height = view1_block_top+prev_num*2*view1_qubitMaxRadius+view1_area_height+view1_computerGap_height
                                prev_height += computer_height
                            }

                            return `translate(0, ${view1_legend_height+prev_height})`

                    })

                ref_line.selectAll('line')
                    .data(d=>d)
                    .join('line')
                    .style('stroke', '#a3e1e8')
                    .style('stroke-width', 1* theta)
                    .attr('class', 'circuit_ref_line')
                    .attr('x1', view1_margin_left* theta)
                    .attr('x2', (view1_margin_left + view1_computer_width-20)* theta)
                    .attr('y1', d=>(view1_block_top + d*2*view1_qubitMaxRadius)*theta)
                    .attr('y2', d=>(view1_block_top + d*2*view1_qubitMaxRadius)*theta)

                let qcomputer_data = Object.entries(data).map(d=>{
                    let qcomputer_id = d[0]
                    return d[1].map(_d=> {return {"qcomputer": d[0], ..._d} || 'Q_X'})
                })


                /*开始画除了ref_line 之外的元素*/
                let qcomputer = view1.selectAll('.qcomputer')
                    .data(qcomputer_data)
                    .join('g')
                    .attr('class', d=>d[0]['qcomputer'])
                    .classed('qcomputer', true)
                    .attr('transform', (d,i)=>{

                            let prev_height = 0
                            for(let _i in d3.range(i)){
                                let prev_num = qcomputer_data[_i][0]['qubit'].length
                                let computer_height = view1_block_top+prev_num*2*view1_qubitMaxRadius+view1_area_height+view1_computerGap_height
                                prev_height += computer_height
                            }

                            return `translate(0, ${view1_legend_height+prev_height})`
                    })


                /*每个糖葫芦+电路线段组成的基本单位叫做一个 block*/
                let block = qcomputer.selectAll('g')
                    .data(d=>d)
                    .join('g')
                    .attr('transform', (_d,_i)=>`translate(${(view1_margin_left + _i*view1_computer_block_width)*theta},${view1_block_top*theta})`)

                /*画 block 中的串糖葫芦的棍*/
                block.append('line')
                    .style('stroke', '#d9d9d9')
                    .style('stroke-width', 2* theta)
                    .attr('x1', view1_qubit_padding_left*theta)
                    .attr('x2', view1_qubit_padding_left*theta)
                    .attr('y1', 0)
                    .attr('y2', d=>{
                        let height = (d['qubit'].length-1)*2*view1_qubitMaxRadius
                        return height* theta
                    })


                /*画一串一串糖葫芦*/
                block.selectAll('circle')
                    .data(d=>{return d['qubit']})
                    .join('circle')
                    .attr('class', 'view1_circle')
                    .attr('cx', view1_qubit_padding_left*theta)
                    .attr('cy', (d,i)=>(i*2*view1_qubitMaxRadius)*theta)
                    .attr('r', d=>scale_qubit_attr(Math.abs(d[attr] - ref_value[attr])))
                    .attr('fill', d=>{
                        if(attr != 'error_rate'){
                            return d[attr]>=ref_value[attr]? '#08AEFF':'#FF5C0F'
                        }else{
                            return d[attr]>=ref_value[attr]? '#FF5C0F':'#08AEFF'
                        }
                    })
                    .append('title')
                    .text(d=>`${attr}: ${d[attr].toFixed(4)}`)



                /*开始画每个 computer 头顶的长的坐标轴*/
                time_arr = Object.values(data).map(d=>{return d.map(_d=>{return _d['timestamp']})})

                let timeline_g = qcomputer.append('g')
                    .attr('transform', `translate(${view1_margin_left* theta}, 0)`)

                timeline_g.append('line')
                    .style('stroke', '#747474')
                    .style('stroke-width', 1)
                    .attr('x1', 0)
                    .attr('x2', d=>d.length*view1_computer_block_width* theta)
                    .attr('y1', 8)
                    .attr('y2', 8)

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
                        })
                    })
                }

                /*删掉最大的值，平衡scale*/
                arr.sort((x, y)=>{
                    return x-y
                }).pop()



                let extent = d3.extent(arr)/* 现在用所有computer的统一extent，以后考虑单独extent*/
                console.log(extent)


                let scale = d3.scaleLinear()
                    .domain([0, extent[1]])
                    .range([5, (view1_computer_block_width - view1_qubit_padding_left)* theta])


                let bottom_axis = d3.axisTop()
                    .scale(scale)
                    .tickValues([0, extent[1]]);/*TODO: 格式化*/

                let bottom_axis_g = block.append('g')
                    .attr('transform', d=>{
                        let height = d['qubit'].length* 2*view1_qubitMaxRadius + view1_area_height
                        return `translate(${view1_qubit_padding_left* theta},${height* theta})`
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
                    .style('stroke-width', 1* theta)
                    .attr('x1', d=>(scale(d['error_rate']*100)+view1_qubit_padding_left)* theta)
                    .attr('x2', d=>(scale(d['error_rate']*100)+view1_qubit_padding_left)* theta)
                    .attr('y1', d=>qubit_position_dict[d['source']]* theta)
                    .attr('y2', d=>qubit_position_dict[d['target']]* theta)
                    .append('title')
                    .text(d=>`${attr}: ${d['error_rate']*100}`)


                /*连接线的端点 - 起点*/
                block.selectAll('.source-dot')
                    .data(d=>d['gate'])
                    .join('circle')
                    .attr('class', 'source-dot')
                    .attr('cx', d=>(scale(d['error_rate']*100)+view1_qubit_padding_left)* theta)
                    .attr('cy', d=>qubit_position_dict[d['source']]* theta)
                    .attr('r', 2* theta)
                    .attr('fill', '#ababab')


                /*连接线的端点 - 终点*/
                block.selectAll('.target-dot')
                    .data(d=>d['gate'])
                    .join('circle')
                    .attr('class', 'target-dot')
                    .attr('cx', d=>(scale(d['error_rate']*100)+view1_qubit_padding_left)* theta)
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
                    .attr('class', 'view1_title')
                    .attr('transform', (d,i)=>{
                        let height = d[0]['qubit'].length * view1_qubitMaxRadius
                        return `translate(${(view1_margin_left/2-30)* theta}, ${height})`
                    })
                    .on('click', (d,item)=>{
                        select_computer(item[0]['qcomputer'])
                    })




                /*从这里开始画 填充折线图*/


                 // let example_data = [{'date':0, "value":0},{'date':4, "value":3},{'date':10, "value":1},{'date':13, "value":3}]


                let gradient = svg.append("defs")
                    .append("linearGradient")
                    .attr("id","gradient")
                    .attr("x1", "0%").attr("y1", "0%")
                    .attr("x2", "100%").attr("y2", "0%");

                gradient.append("stop")
                    .attr("offset", 0)
                    .attr("stop-color", "#08AEFF")
                    .attr("stop-opacity", 1);

                gradient.append("stop")
                    .attr("offset", 0.5)
                    .attr("stop-color", "#ffffff")
                    .attr("stop-opacity", 0.5);

                gradient.append("stop")
                    .attr("offset", 1)
                    .attr("stop-color", "#ff5c0f")
                    .attr("stop-opacity", 1);

                let gradient2 = svg.append("defs")
                    .append("linearGradient")
                    .attr("id","gradient2")
                    .attr("x1", "0%").attr("y1", "0%")
                    .attr("x2", "100%").attr("y2", "0%");

                gradient2.append("stop")
                    .attr("offset", 0)
                    .attr("stop-color", "#08AEFF")
                    .attr("stop-opacity", 1);

                gradient2.append("stop")
                    .attr("offset", 0.35)
                    .attr("stop-color", "#ffffff")
                    .attr("stop-opacity", 0.5);

                gradient2.append("stop")
                    .attr("offset", 1)
                    .attr("stop-color", "#ff1700")
                    .attr("stop-opacity", 1);



                let x = scale

                let y = d3.scalePow()
                    .exponent(0.6)
                    .domain([0, 0.2])
                    .range([view1_area_height, 0])



                /* kde */
                var kde = kernelDensityEstimator(kernelEpanechnikov(1), x.ticks(20))

                block.append("path")
                    .attr("class", "mypath")
                    .attr('transform', d=>{
                        let height = d['qubit'].length* 2*view1_qubitMaxRadius
                        return `translate(${view1_qubit_padding_left* theta},${height* theta})`
                    })
                    .datum(d=>{
                        return kde(d['gate'].map(_d=>+(_d['error_rate']*100).toFixed(2)))
                    })
                    .attr("fill", 'url(#gradient2)')
                    .attr("opacity", ".8")
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1)
                    .attr("stroke-linejoin", "round")
                    .attr("d", d3.area()
                            .curve(d3.curveBasis)
                            .x(function (d) { return x(d[0]); })
                            .y0(view1_area_height)
                            .y1(function (d) { return y(d[1]); })

                    )



                /* 在所有元素最上面的 view1_legend_height 空隙中， 画legend */
                let legend_1 = view1.append('g')
                    .attr('class', 'legend_1')
                    .attr('transform', `translate(${400* theta},0)`)

                legend_1.append('text')
                    .text('Bad Qubit Quality')
                    .attr('transform', `translate(${7* theta},${20* theta})`)
                    .style('font-size', `${0.7 * theta}em`)

                legend_1.append('text')
                    .text('Good Qubit Quality')
                    .attr('transform', `translate(${140* theta},${20* theta})`)
                    .style('font-size', `${0.7 * theta}em`)

                legend_1.append('rect')
                    .attr('fill', '#FF5C0F')
                    .attr('x', 105* theta)
                    .attr('y', 9* theta)
                    .attr('width', 15* theta)
                    .attr('height', 15* theta)

                legend_1.append('rect')
                    .attr('fill', '#08AEFF')
                    .attr('x', 230* theta)
                    .attr('y', 9* theta)
                    .attr('width', 15* theta)
                    .attr('height', 15* theta)

                /* legend 2*/
                let legend_2 = view1.append('g')
                    .attr('class', 'legend_2')
                    .attr('transform', `translate(${150* theta},0)`)

                legend_2.append('text')
                    .text('Gate Quality: good -> bad')
                    .attr('transform', `translate(${7* theta},${20* theta})`)
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


    componentDidUpdate(prevProps, prevStates) {

        console.log('view 1 updated')

        let _this = this


        /*情况1：控制view2 的 view2_attr 更新*/
        if(this.props.view1_attr && prevProps['view1_attr'] != this.props.view1_attr){
            axios.get('/api/view1_api/30/7/ibm_lagos&ibm_perth&ibmq_belem&ibmq_bogota&ibmq_casablanca&ibmq_jakarta&ibmq_lima&ibmq_manila&ibmq_quito&ibmq_armonk&ibmq_armonk')
                .then(d=>{
                    const data = d.data['data']
                    const ref_value = d.data['ref_value']


                    const attr = _this.props.view1_attr || 'T1'

                    let qubit_attr_arr = []
                    Object.values(data).map(d=>d.map(_d=>_d['qubit'])).map(d=>d.map(_d=>_d.map(__d=>__d[attr]))).forEach(d=>d.forEach(_d=>_d.forEach(__d=>qubit_attr_arr.push(Math.abs(__d - ref_value[attr])))))


                    /*设置attr的比例尺，如果是error_rate的话，要单独设置，不然的话点太小了*/
                    let scale_qubit_attr
                    if(attr != 'error_rate'){
                        scale_qubit_attr = d3.scalePow()
                            .exponent(0.6)
                            .domain(d3.extent(qubit_attr_arr))
                            .range([0, params.view1_qubitMaxRadius])
                    }else{
                        scale_qubit_attr = d3.scalePow()
                            .exponent(0.25)
                            .domain(d3.extent(qubit_attr_arr))
                            .range([0, params.view1_qubitMaxRadius])
                    }

                    d3.selectAll('.view1_circle')
                        .attr('r', d=>scale_qubit_attr(Math.abs(d[attr] - ref_value[attr])))
                        .attr('fill', d=>{
                            if(attr != 'error_rate'){
                                return d[attr]>=ref_value[attr]? '#08AEFF':'#FF5C0F'
                            }else{
                                return d[attr]>=ref_value[attr]? '#FF5C0F':'#08AEFF'
                            }
                        })
                        .select('title')
                        .text(d=>`${attr}: ${d[attr].toFixed(4)}`)


                })

        }
    }


    render(){

        return (
            <div id="svg_container_1"></div>
        );
    }
}

export default View_1;
