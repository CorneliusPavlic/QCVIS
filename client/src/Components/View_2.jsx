import React, {Component} from 'react';
import * as d3 from 'd3'
import axios from "axios";

import params from '../functions/preset_param'
import ReactDOM from "react-dom";


class View_2 extends Component {
    constructor(props){
        super(props);
        this.render_view2 = this.render_view2.bind(this)
        this.append_block = this.append_block.bind(this)


        this.state = {
            gates_qual_extent: [],
            qubits_qual_extent: []
        }
    }




    render_view2(){

        /*更改gate_qual extent 的函数*/
        let view2_qual_extent = this.props.view2_qual_extent



        let trans_times = Number(document.getElementById('view2-button').value) || 10
        let backend_name = this.props.backend_name || 'ibm_lagos'
        let view2_attr = this.props.view2_attr || 'gate'
        let view2_algo = this.props.view2_algo || 'shor'




        const _this = this

        // axios.post(`/api/view2_api/`, {'view2_algo':view2_algo, 'trans_times': trans_times, 'backend_name': backend_name})
        axios.get('/data/view23_mock.json') // TODO: fake data without compilation
            .then(function(res){
                let data = res.data['data']


                let qual_avg = {
                    "qubit_qual_avg": res.data['ref_value']['qubit_qual_avg'],
                    "gate_qual_avg": res.data['ref_value']['gate_qual_avg']
                }


                /*如果 view2_sort 为true, 对data进行排序*/
                if(_this.props.view2_sort){
                    console.log('sorting')
                    data = Object.fromEntries(Object.entries(data).sort((x, y)=>{
                        return +y[1][`${view2_attr}s_quality`] - +x[1][`${view2_attr}s_quality`]
                    }))
                }




                const {view23_svg_width, view23_svg_height} = params
                const {view2_margin_top, view2_padding_bottom, view2_margin_left, view2_margin_right} = params
                const {circle_radius_min, circle_radius_max, view2_block_text_width} = params
                const view3_block_padding_height = view2_margin_top, view2_block_height = circle_radius_max * 2


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



                let gates_qual_extent = d3.extent(Object.values(data).map(d=>d['gates_quality']))

                let qual_extent = d3.extent(Object.values(data).map(d=>Math.abs(d[`${view2_attr}s_quality`] - qual_avg[`${view2_attr}_qual_avg`])))

                let qubits_qual_extent = d3.extent(Object.values(data).map(d=>d['qubits_quality']))

                let depth_extent = d3.extent(Object.values(data).map(d=>d['depth']))

                let view2_chart_width = view23_svg_width - view2_margin_left - view2_margin_right

/*                let qubit_scale = d3.scaleLinear()
                    .domain(qubits_qual_extent)
                    .range(color_view2_circle)*/


                let depth_scale = d3.scaleLinear()
                    .domain(depth_extent)
                    .range([0, view2_chart_width * theta])


                let qual_scale = d3.scaleLinear()
                    .domain(qual_extent)
                    .range([circle_radius_min, circle_radius_max])



                _this.setState({
                    gates_qual_extent: gates_qual_extent.map(d=>+d.toFixed(2)),
                    qubits_qual_extent: qubits_qual_extent.map(d=>+d.toFixed(2))
                })


                /*更改control panel里面的range control slider*/
                view2_qual_extent(_this.state[`${_this.props.view2_attr}s_qual_extent`])



                let chart = d3.select('.view2_svg')
                    .append('g')
                    .attr('transform', `translate(${view2_margin_left* theta}, ${view2_margin_top* theta})`)


                /*画每个circuit代表的 g*/
                let block = chart
                    .selectAll('.view2_block')
                    .data(Object.entries(data))
                    .join('g')
                    .attr('class', 'view2_block')
                    .attr('transform', (d, i)=>`translate(0, ${i * view2_block_height})`)


                /*画 从左边指到circle的线*/
                block.append('line')
                    .attr('x1',  view2_block_text_width)
                    .attr('y1', view2_block_height/2)
                    .attr('x2', d=>depth_scale(d[1]['depth']) + view2_block_text_width)
                    .attr('y2', view2_block_height/2)
                    .attr('stroke', '#a0a0a0')


                /*画 left-border的线*/
                block.append('line')
                    .attr('x1',  view2_block_text_width)
                    .attr('y1', 2)
                    .attr('x2',  view2_block_text_width)
                    .attr('y2', view2_block_height - 2)
                    .attr('stroke', '#a0a0a0')


                /*画 right-border的线*/
                block.append('line')
                    .attr('x1',  view2_chart_width + view2_block_text_width)
                    .attr('y1', 1)
                    .attr('x2',  view2_chart_width + view2_block_text_width)
                    .attr('y2', view2_block_height - 1)
                    .attr('stroke', '#a0a0a0')


                /*画 代表circuit的circle*/
                block.append('circle')
                    .attr('class', 'view2_circle')
                    .attr('cx', d=>depth_scale(d[1]['depth']) + view2_block_text_width)
                    .attr('cy', view2_block_height/2)
                    .attr('r', d=>qual_scale(Math.abs(d[1][`${view2_attr}s_quality`] - qual_avg[`${view2_attr}_qual_avg`])))
                    .attr('fill', d=>d[1][`${view2_attr}s_quality`] > qual_avg[`${view2_attr}_qual_avg`]? "#08AEFF":'#FF5C0F')
                    .on('click', function(d, item){
                        let x0 = view2_block_text_width + view2_margin_left + view2_chart_width + 15
                        let y0 = view2_margin_top + +d3.select(this.parentNode).attr('transform').split(/[\s,()]+/)[2] + view2_block_height/2
                        let x1 = view3_margin_left+30
                        let y1 = +d3.selectAll('.linkpath23').size() * (view3_block_height) + (view3_block_height/2 + view3_block_padding_height/2)

                        d3.select('.view2_svg')
                            .append('path')
                            .attr('class', 'linkpath23')
                            .attr("d", function(d) {
                                return "M" + x0 + "," + y0
                                    + "C" + (x0 + 80) + "," + y0
                                    + " " + (x1 - 80) + "," + y1
                                    + " " + x1 + "," + y1;
                            })
                            .style('stroke', d=>d3.select(this).attr('fill'))

                        /*给 view3 增加一个 block*/
                        _this.append_block(data, item)
                    })


                /*画每个block之前的名称*/
                block.append('text')
                    .text(d=>d[1]['id'])
                    .attr('transform', `translate(0, ${view2_block_height/2})`)


                block.append('title')
                    .text(d=>{
                        return `${d[0]}, qubit_qual: ${d[1]['qubits_quality'].toFixed(4)}, gate_qual: ${d[1]['gates_quality'].toFixed(4)}`
                    })


                let depth_arr = Object.values(data).map(d=>d['depth']).sort()



                /*画横向的坐标轴*/
                let bottom_axis = d3.axisBottom()
                    .scale(depth_scale)
                    .tickValues([ depth_arr[0], depth_arr[Math.round(depth_arr.length*(1/3))], depth_arr[Math.round(depth_arr.length*(2/3))], depth_arr[depth_arr.length-1]])

                let bottom_axis_g = svg.append('g')
                    .attr('transform', `translate(${view2_margin_left + view2_block_text_width}, ${d3.selectAll('.view2_block').size()*view2_block_height + view2_margin_top  + 10})`)
                    .call(bottom_axis)


                /* 在所有元素最上面的 view1_legend_height 空隙中， 画legend */
                let legend_1 = svg.append('g')
                    .attr('class', 'legend_1')
                    .attr('transform', `translate(${50* theta},20)`)

                legend_1.append('text')
                    .text('Bad Quality')
                    .attr('transform', `translate(${25* theta},0)`)
                    .style('font-size', `${1 * theta}em`)

                legend_1.append('text')
                    .text('Good Quality')
                    .attr('transform', `translate(${140* theta},0)`)
                    .style('font-size', `${1 * theta}em`)

                legend_1.append('rect')
                    .attr('fill', '#FF5C0F')
                    .attr('x', 105* theta)
                    .attr('y', -10)
                    .attr('width', 15* theta)
                    .attr('height', 15* theta)

                legend_1.append('rect')
                    .attr('fill', '#08AEFF')
                    .attr('x', 230* theta)
                    .attr('y', -10)
                    .attr('width', 15* theta)
                    .attr('height', 15* theta)







                /**********************/

                /*搭建View 3*/


                const theta2 = 1

                const view3_margin_top = view2_margin_top, view3_margin_left = 420
                const view3_padding_left = 50
                const view3_block_height = 185
                const view3_bar_height_max = 60

                const view3_bar_width = 13, view3_barGap_width = 3, view3_gap_height = 20



                /*画 legend*/
                /* legend 1*/
                let gradient1 = svg.append("defs")
                    .append("linearGradient")
                    .attr("id","gradient1")
                    .attr("x1", "0%").attr("y1", "0%")
                    .attr("x2", "100%").attr("y2", "0%");

                gradient1.append("stop")
                    .attr("offset", 0)
                    .attr("stop-color", '#FF5C0F')
                    .attr("stop-opacity", 1);

                gradient1.append("stop")
                    .attr("offset", 0.5)
                    .attr("stop-color", "#fff")
                    .attr("stop-opacity", 1);

                gradient1.append("stop")
                    .attr("offset", 1)
                    .attr("stop-color", "#08AEFF")
                    .attr("stop-opacity", 1);




                let legend = svg.append('g')
                    .attr('class', 'view3_legend_1')
                    .attr('transform', `translate(${(view23_svg_width - 300)},20)`)

                legend.append('rect')
                    .attr('x', 0)
                    .attr('y', -10)
                    .attr('width', 100)
                    .attr('height', 15)
                    .attr('fill', 'url(#gradient1)')

                legend.append('text')
                    .text('Bad Quality')
                    .attr('transform', `translate(-40, 20)`)
                    .style('font-size', `1em`)

                legend.append('text')
                    .text('Good Quality')
                    .attr('transform', `translate(70, 20)`)
                    .style('font-size', `1em`)



            })



    }



    append_block(data, item){


        const _this = this


            let block_data = data[item[0]]
            let index = d3.selectAll('.view3_block').size()


            const view3_margin_top = params['view2_margin_top'], view3_margin_left = 420
            const view3_padding_left = 50
            const view3_block_height = 185
            const view3_bar_height_max = 60

            const view3_bar_width = 13, view3_barGap_width = 3, view3_gap_height = 20


            const color_qubit_attr = ['#08AEFF', '#fff', '#FF5C0F']
            const color_gate_error = ['#08AEFF', '#fff', '#FF5C0F']



            /*构造一个对象，用来装 gate qubit均值的假数据*/
            const ref_value = {
                'gates_times_avg': {
                    'cx0_1': 110,
                    'cx1_2': 110,
                    'cx1_3': 110,
                    'cx3_5': 110,
                    'cx4_5': 110,
                    'cx5_6': 110,
                    'rz': 110,
                    'sx': 110,
                },
                'qubits_times_avg': {
                    'q_0': 130,
                    'q_1': 130,
                    'q_2': 130,
                    'q_3': 130,
                    'q_4': 130,
                    'q_5': 130,
                    'q_6': 130
                }
            }


            /*获取view3的attr (T1, T2, error_rate)*/
            let view3_attr = this.props.view3_attr

            /*计算所有qubit出现次数最大最小值*/
            let qubit_times_arr = []
            Object.entries(data).forEach(trans=>{
                let times_arr = Object.values(trans[1]['qubits']).map(q=>q['times'])
                qubit_times_arr = qubit_times_arr.concat(times_arr)
            })

            let scale_qubits_times = d3.scaleLinear().domain(d3.extent(qubit_times_arr)).range([view3_bar_height_max, 0])


            /*计算一个scale来支持qubit bar的 attr 的颜色的渐变*/
            let qubit_attr_arr = []
            Object.entries(data).forEach(trans=>{
                let T1_arr = Object.values(trans[1]['qubits']).map(q=>q[view3_attr])
                qubit_attr_arr = qubit_attr_arr.concat(T1_arr)
            })

            let qubit_attr_sort = qubit_attr_arr.sort((x,y)=>x-y)
            let scale_qubit_attr = d3.scaleLinear().domain([qubit_attr_sort[0], qubit_attr_sort[Math.round(qubit_attr_sort.length / 2)], qubit_attr_sort[qubit_attr_sort.length-1]]).range(color_qubit_attr)





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
            let scale_gates_times = d3.scaleLinear().domain(d3.extent(gate_times_arr)).range([view3_bar_height_max, 0])
            /*color*/
            let gate_errorRate_sort = gate_errorRate_arr.sort((x,y)=>x-y)
            let scale_gates_errorGate = d3.scaleLinear().domain([gate_errorRate_sort[0], gate_errorRate_sort[Math.round(gate_errorRate_sort.length / 2)], gate_errorRate_sort[gate_errorRate_sort.length-1]]).range(color_gate_error)


            let view3 = d3.select('.view2_svg')
                .append('g')
                .attr('transform', `translate(${view3_margin_left}, ${view3_margin_top})`)
                .attr('class', 'view3')



            /*将 block data 排序，使纵向的bar都位置一样*/
            block_data['gates'] = Object.fromEntries(Object.entries(block_data['gates']).sort((x,y)=>{
                if (Math.min(+x[0][2], +x[0][4]) > Math.min(+y[0][2], +y[0][4])) return 1
                if (Math.min(+x[0][2], +x[0][4]) < Math.min(+y[0][2], +y[0][4])) return -1

                if (Math.max(+x[0][2], +x[0][4]) > Math.max(+y[0][2], +y[0][4])) return 1
                if (Math.max(+x[0][2], +x[0][4]) < Math.max(+y[0][2], +y[0][4])) return -1

            }))



            /*view3 的每个 block*/
            let block3 = d3.select('.view3')
                .datum(block_data)
                .append('g')
                .attr('class', 'view3_block')
                .attr('transform', `translate(0, ${index * view3_block_height})`)

            /*画view3 每一个block的边框*/
            block3.append('rect')
                .attr('x', 40)
                .attr('y', -10)
                .attr('width', d=>Math.max(Object.keys(d['gates']).length, Object.keys(d['qubits']).length) * (view3_bar_width+view3_barGap_width) + 20)
                .attr('height', 2*view3_bar_height_max + view3_gap_height+20)
                .attr('fill', 'none')
                .attr('stroke', '#9d9d9d')
                .attr('stroke-width', 2)



            /*为每个block 添加bar， 一个bar用一个 g 元素实现*/
            let bar_g = block3.selectAll('.each_bars')
                .data(d=>Object.entries(d.gates))
                .join('g')
                .attr('class', 'each_bars')
                .attr('transform', (d, i)=>`translate(${view3_padding_left + i*(view3_bar_width+view3_barGap_width)}, 0)`)


            /*TODO: 待确定 画 gate 高出来的一截 代表平均值的 没颜色的 bar*/
            /*                    bar_g.append('rect')
                                    .attr('x', 0)
                                    .attr('y', d=>scale_gates_times(ref_value['gates_times_avg'][d[0]]))
                                    .attr('width', view3_bar_width)
                                    .attr('height', d=>ref_value['gates_times_avg'][d[0]] > d[1]['times']?view3_bar_height_max - scale_gates_times(ref_value['gates_times_avg'][d[0]]):null)
                                    .attr('fill', d=>ref_value['gates_times_avg'][d[0]] > d[1]['times']? '#d6d6d6': null)*/


            /*画 gate 本身实际值的 有颜色的bar*/
            bar_g.append('rect')
                .attr('x', 0)
                .attr('y', d=>scale_gates_times(d[1]['times']))
                .attr('width', view3_bar_width)
                .attr('height', d=>view3_bar_height_max - scale_gates_times(d[1]['times']))
                .attr('fill', d=>scale_gates_errorGate(d[1]['error_rate']))
                .attr('class', 'view3_gate_bar')
                .attr('stroke', '#474747')
                .attr('stroke-width', 2)
                .append('title')
                .text(d=>`${d[0]}  Error:${d[1]['error_rate']}  times:${d[1]['times']}`)

            /*画 代表ref-value的虚线*/
            bar_g
                .append('line')
                .attr('x1', 0)
                .attr('class', 'ref_line')
                .attr('y1', d=>scale_gates_times(ref_value['gates_times_avg'][d[0]]))
                .attr('x2', view3_bar_width)
                .attr('y2', d=>scale_gates_times(ref_value['gates_times_avg'][d[0]]))


            /*TODO: 待确定 画 gate 矮的一截 代表平均值的 没颜色的 bar*/
            /*                    bar_g.append('rect')
                                    .attr('x', 1)
                                    .attr('y', d=>scale_gates_times(ref_value['gates_times_avg'][d[0]]))
                                    .attr('width', view3_bar_width-2)
                                    .attr('height', d=>ref_value['gates_times_avg'][d[0]] <= d[1]['times']?view3_bar_height_max - scale_gates_times(ref_value['gates_times_avg'][d[0]]):null)
                                    .attr('fill', d=>ref_value['gates_times_avg'][d[0]] <= d[1]['times']? '#d6d6d6': null)*/





            /*为每个block 添加bar， 一个bar用一个 g 元素实现*/
            let bar_g2 = block3.selectAll('.each_bars2')
                .data(d=>Object.entries(d['qubits']))
                .join('g')
                .attr('transform', (d, i)=>`translate(${view3_padding_left + i*(view3_bar_width+view3_barGap_width)}, ${view3_bar_height_max+view3_gap_height})`)
                .attr('class', d=>`trans_${index+1}_${d[0]}`)

            /*画 gate 高出来的一截 代表平均值的 没颜色的 bar*/
            /*                    bar_g2.append('rect')
                                    .attr('x', 0)
                                    .attr('y', 0)
                                    .attr('width', view3_bar_width)
                                    .attr('height', d=>ref_value['qubits_times_avg'][d[0]] > d[1]['times']?view3_bar_height_max - scale_qubits_times(ref_value['qubits_times_avg'][d[0]]): null)
                                    .attr('fill', d=> '#d6d6d6')*/



            /*TODO: 待确定 画 qubit 本身实际值的 有颜色的bar*/
            bar_g2.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', view3_bar_width)
                .attr('height', d=>view3_bar_height_max - scale_qubits_times(d[1]['times']))
                .attr('fill', d=>{
                    return scale_qubit_attr(d[1][view3_attr])
                })
                .attr('class', 'view3_qubit_bar')
                .attr('stroke', '#474747')
                .attr('stroke-width', 2)
                .append('title')
                .text(d=>`${d[0]}  ${view3_attr}:${d[1][view3_attr]}  times:${d[1]['times']}`)


            /*画 代表ref-value的虚线*/
            bar_g2.append('line')
                .attr('x1', 0)
                .attr('class', 'ref_line')
                .attr('y1', d=>scale_gates_times(ref_value['qubits_times_avg'][d[0]]))
                .attr('x2', view3_bar_width)
                .attr('y2', d=>scale_gates_times(ref_value['qubits_times_avg'][d[0]]))


            /*TODO: 待确定 画 gate 高出来的一截 代表平均值的 没颜色的 bar*/
            /*
                                bar_g2.append('rect')
                                    .attr('x', 1)
                                    .attr('y', 0)
                                    .attr('width', view3_bar_width-2)
                                    .attr('height', d=>ref_value['qubits_times_avg'][d[0]] <= d[1]['times']?view3_bar_height_max - scale_qubits_times(ref_value['qubits_times_avg'][d[0]]): null)
                                    .attr('fill', d=> '#d6d6d6')
            */



            /*画上下bars之间的，用来连接gate所属qubit的曲线*/
            let link_g = block3.selectAll('.link_g')
                .data(d=>Object.entries(d['gates']))
                .join('g')
                .attr('class', 'link_g')
                .attr('transform', `translate(0, ${view3_bar_height_max})`)


            link_g.append('path')
                .attr('class', 'linkpath_vert')
                .attr("d", function(d, i) {
                    let x0, y0, x1, y1

                    x0 = view3_padding_left + i*(view3_bar_width+view3_barGap_width) + view3_bar_width/2
                    y0 = 0

                    /*source qubit 的 x位置*/
                    if (!d3.select(`.trans_${index+1}_${d[1]['source']}`).empty()){
                        x1 = +d3.select(`.trans_${index+1}_${d[1]['source']}`).attr('transform').split(/[\s,()]+/)[1] + view3_bar_width/2
                        y1 = view3_gap_height
                    }else{
                        return
                    }


                    return "M" + x0 + "," + y0
                        + "C" + x0 + "," + (y0+10)
                        + " " + x1 + "," + (y1-10)
                        + " " + x1 + "," + y1;
                })


            link_g.append('path')
                .attr('class', 'linkpath_vert')
                .attr("d", function(d, i) {
                    let x0, y0, x2, y2

                    x0 = view3_padding_left + i*(view3_bar_width+view3_barGap_width) + view3_bar_width/2
                    y0 = 0


                    /*target qubit 的 x位置*/
                    if (!d3.select(`.trans_${index+1}_${d[1]['target']}`).empty()) {
                        x2 = +d3.select(`.trans_${index + 1}_${d[1]['target']}`).attr('transform').split(/[\s,()]+/)[1] + view3_bar_width/2
                        y2 = view3_gap_height
                    }else{
                        return
                    }


                    return "M" + x0 + "," + y0
                        + "C" + x0 + "," + (y0+10)
                        + " " + x2 + "," + (y2-10)
                        + " " + x2 + "," + y2;
                })





    }

    componentDidMount() {

        this.render_view2()
    }


    componentDidUpdate(prevProps, prevStates) {

        console.log('view 2 updated')




        /*情况1：控制view2 的 view2_attr 更新*/
        if(this.props.view2_attr && prevProps['view2_attr'] != this.props.view2_attr){/*加this.props.view2_attr判断是因为避免由于未传参而触发这个条件的情况 */

            this.render_view2()

        }




        /*情况2：控制 view2 的 view2_gate_qual_filter 更新*/
        if(this.props.view2_gate_qual_filter && prevProps['view2_gate_qual_filter'] != this.props.view2_gate_qual_filter){
            /*更改gate_qual 所选范围 的 []*/
            let view2_gate_qual_filter = this.props.view2_gate_qual_filter

            let attr = this.props.view2_attr


            d3.selectAll('.view2_circle')
                .each(function(d){
                    if(d[1][`${attr}s_quality`].toFixed(2) >= view2_gate_qual_filter[0] && d[1][`${attr}s_quality`].toFixed(2) <= view2_gate_qual_filter[1]){
                        d3.select(this)
                            .classed('display-none', false)
                    }else{
                        d3.select(this)
                            .classed('display-none', true)
                    }

                })

        }


        /*情况3：控制 view2 的数据是否进行sorting*/
        if(this.props.view2_sort != undefined &&  prevProps['view2_sort'] != this.props.view2_sort){

            this.render_view2()
            

        }


        /*情况3：控制view3 的 view3_attr 更新*/
        if(this.props.view3_attr && prevProps['view3_attr'] != this.props.view3_attr){
            let view3_attr = this.props.view3_attr

            // axios.get(`/api/view2_api/`)
            axios.get('/data/view23_mock.json') // TODO: fake data without compilation
                .then(function(res) {
                    let data = res.data['data']


                    const color_qubit_attr = ['#08AEFF', '#fff', '#FF5C0F']

                    /*计算一个scale来支持qubit bar的 attr 的颜色的渐变*/
                    let qubit_attr_arr = []
                    Object.entries(data).forEach(trans=>{
                        let T1_arr = Object.values(trans[1]['qubits']).map(q=>q[view3_attr])
                        qubit_attr_arr = qubit_attr_arr.concat(T1_arr)
                    })


                    let qubit_attr_sort = qubit_attr_arr.sort((x,y)=>x-y)
                    let scale_qubit_attr
                    if(view3_attr == 'error_rate'){
                        scale_qubit_attr = d3.scaleLinear().domain([qubit_attr_sort[0], qubit_attr_sort[Math.round(qubit_attr_sort.length / 2)],qubit_attr_sort[qubit_attr_sort.length-1]]).range(color_qubit_attr)
                    }else{
                        scale_qubit_attr = d3.scaleLinear().domain([qubit_attr_sort[qubit_attr_sort.length-1], qubit_attr_sort[Math.round(qubit_attr_sort.length / 2)],qubit_attr_sort[0]]).range(color_qubit_attr)
                    }



                    /*画 qubit 本身实际值的 有颜色的bar*/
                    d3.selectAll('.view3_qubit_bar')
                        .attr('fill', d=>scale_qubit_attr(d[1][view3_attr]))
                        .select('title')
                        .text(d=>`${d[0]}  ${view3_attr}:${d[1][view3_attr]}  times:${d[1]['times']}`)


                })

        }


    }


    render(){

        return (
            <div id="svg_container_2"></div>
        );
    }
}

export default View_2;
