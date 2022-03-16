import React, {Component} from 'react';
import * as d3 from 'd3'

import params from '../functions/preset_param'
import {Divider, Select, Typography} from "antd";
const {Text} = Typography;




class View_counts extends Component {
    constructor(props){
        super(props);
        this.render_viewCounts = this.render_viewCounts.bind(this)
        this.render_viewFidelity = this.render_viewFidelity.bind(this)
        this.handle_circuitNum_change = this.handle_circuitNum_change.bind(this)
        this.state = {
            data: this.props.data,

            circuit_num: '',
            fidelity: 0
        }
    }

    render_viewFidelity(){
        let selected_circuit = this.props.selected_circuit
        let data = this.props.data


        data = Object.entries(data).map(d=>{
            return {
                "trans_name": d[0],
                "fidelity": d[1]['fidelity']
            }
        })


        const viewFidelity_svg_height = 160
        const viewFidelity_block_width = 280, viewFidelity_block_height = 140
        const viewFidelity_top_padding = 10,  viewFidelity_left_padding = 45
        const viewFidelity_maxNodeHeight = 130, viewFidelity_nodeHeight = 6, viewFidelity_nodeWidth = 12



        d3.select('.viewFidelity_svg')
            .remove('*')


        let svg = d3.select('#svg_container_fidelity')
            .append('svg')
            .attr('width', '100%')
            .attr('height', viewFidelity_svg_height)
            .attr('class', 'viewFidelity_svg')


        /*x 坐标*/
        let x = d3.scaleBand()
            .domain(data.map(d=>d['trans_name']))
            .range([0, viewFidelity_block_width])
            .padding(1)


        svg.append('g')
            .attr('transform', `translate(${viewFidelity_left_padding}, ${viewFidelity_top_padding+viewFidelity_block_height-10})`)
            .call(d3.axisBottom(x))


        /*y 坐标*/
        let y = d3.scaleLinear()
            .domain(d3.extent(data.map(d=>d['fidelity'])))
            .range([ viewFidelity_maxNodeHeight-10, 0 ]);
        svg.append("g")
            .attr('transform', `translate(${viewFidelity_left_padding}, ${viewFidelity_top_padding})`)
            .call(d3.axisLeft(y))


        svg.selectAll('.viewFidelity_line')
            .data(data)
            .join('line')
            .attr('x1', d=>x(d['trans_name'])+viewFidelity_left_padding)
            .attr('x2', d=>x(d['trans_name'])+viewFidelity_left_padding)
            .attr('y1', viewFidelity_maxNodeHeight+viewFidelity_top_padding)
            .attr('y2', viewFidelity_top_padding)
            .attr('stroke', '#121212')
        // .attr('stroke-width',1)


        svg.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('width', viewFidelity_nodeWidth)
            .attr('height', viewFidelity_nodeHeight)
            .attr('x', d=>x(d['trans_name'])+viewFidelity_left_padding-viewFidelity_nodeWidth/2)
            .attr('y', d=>y(d['fidelity'])+viewFidelity_top_padding)
            .attr('fill', d=>{
                if (selected_circuit.includes(d['trans_name'])){
                    return '#3a3a3a'
                }
                return '#b0b0b0'
            })



    }




    render_viewCounts(){

        const viewCounts_height = 135
        const viewCounts_padding_LR = 45,viewCounts_padding_TB = 18, viewCounts_block_width = 290, viewCounts_block_height = 100
        const viewCounts_barWidth = 9

        let _data = this.props.data


        let circuit = this.state.circuit_num
        let data = _data[circuit]['draw_data']



        d3.select('.viewCounts_svg')
            .remove('*')


        let svg = d3.select('#svg_container_counts')
            .append('svg')
            .attr('width', '100%')
            .attr('height', viewCounts_height)
            .attr('class', 'viewCounts_svg')

        /*x 坐标*/
        let x = d3.scaleBand()
            .domain(Object.keys(data))
            .range([0, viewCounts_block_width])
            .padding(0.4)


        svg.append('g')
            .attr('transform', `translate(${viewCounts_padding_LR}, ${viewCounts_padding_TB + viewCounts_block_height})`)
            .call(d3.axisBottom(x))




        /*y 坐标*/
        let y = d3.scaleLinear()
            .domain([0, d3.max(Object.values(data).map(d=>d3.max(d)))])
            .range([ viewCounts_block_height, 0 ]);
        svg.append("g")
            .attr('transform', `translate(${viewCounts_padding_LR}, ${viewCounts_padding_TB})`)
            .call(d3.axisLeft(y).ticks(5))

        let category = ['Noise-free', 'Experiment']
        const category_color = ['#08AEFF', '#FF5C0F']

        /*x 内部的比例尺*/
        let xSubgroup = d3.scaleBand()
            .domain(category)
            .range([0, x.bandwidth()])



        /*bar颜色比例尺*/
        let scale_color = d3.scaleOrdinal()
            .domain(category)
            .range(category_color)


        /*画柱状图*/
        let bars_g = svg.append('g')
            .selectAll('g')
            .data(Object.entries(data))
            .enter()
            .append('g')
            .attr('transform', d=>`translate(${viewCounts_padding_LR + x(d[0])}, 0)`)


        let bars = bars_g
            .selectAll('rect')
            .data(d=>{
                return d[1].map((_d, i)=>{
                    return {
                        "category": category[i],
                        "counts": _d
                    }
                })
            })
            .enter()
            .append('rect')
            .attr('x', d=>xSubgroup(d['category']))
            .attr('y', d=>y(d['counts'])+viewCounts_padding_TB)
            .attr('width', viewCounts_barWidth)
            .attr('height', d=>viewCounts_block_height - y(d['counts']))
            .attr('fill', d=>scale_color(d['category']))


        bars_g
            .selectAll('text')
            .data(d=>{
                return d[1].map((_d, i)=>{
                    return {
                        "category": category[i],
                        "counts": _d
                    }
                })
            })
            .enter()
            .append('text')
            .text(d=>d['counts'])
            .attr('x', d=>xSubgroup(d['category']))
            .attr('y', d=>y(d['counts'])+viewCounts_padding_TB)
            .attr("text-anchor", "middle")
            .attr('dx', 7)
            .attr('dy', -2)
            .attr("font-family", "sans-serif")
            .attr("font-size", "8px")
            .attr("fill", "#2f2f2f");


        /*画 legend'*/
        let legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(280,5)`)

        legend.append('text')
            .text(`${category[0]}`)
            .attr('transform', `translate(15, 10)`)
            .style('font-size', `${0.7}em`)


        legend.append('rect')
            .attr('fill', `${category_color[0]}`)
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 10)
            .attr('height', 10)

        legend.append('text')
            .text(`${category[1]}`)
            .attr('transform', `translate(15, 25)`)
            .style('font-size', `${0.7}em`)


        legend.append('rect')
            .attr('fill', `${category_color[1]}`)
            .attr('x', 0)
            .attr('y', 15)
            .attr('width', 10)
            .attr('height', 10)

    }


    handle_circuitNum_change(e){
        this.setState({
            circuit_num: e,
            fidelity: this.state.data[e]
        })

    }



    componentDidMount() {

        this.render_viewFidelity()

    }


    componentDidUpdate(prevProps, prevStates){

        console.log('viewCounts updated')

        this.render_viewCounts()


        /*情况1：控制view2 的 view2_attr 更新*/
        if(this.props.selected_circuit && prevProps['selected_circuit'] != this.props.selected_circuit){/*加this.props.view2_attr判断是因为避免由于未传参而触发这个条件的情况 */

            this.render_viewFidelity()

        }

    }


    render(){

        let data = this.props.data

        let selectList = Object.keys(data).map((d,i)=><Select.Option value={d} key={i}>{d}</Select.Option>)
        let fidelity = this.state.circuit_num ?  `${+data[this.state.circuit_num]['fidelity'].toFixed(3) *100}%` : ''

        return (
            <>
                <Divider style={{ backgroundColor: '#868686'}} plain><Text style={{fontSize: '0.8em', color: '#fff'}} strong>Fidelity Comparison</Text></Divider>

                <div id="svg_container_fidelity">

                </div>

                <Divider style={{ backgroundColor: '#868686'}} plain><Text style={{fontSize: '0.8em', color: '#fff'}} strong>Probability Distributions</Text></Divider>


                <div id="svg_container_counts">
                    <Select defaultValue={this.state.circuit_num} className={'viewCounts_select'} onChange={this.handle_circuitNum_change} >
                        {selectList}
                    </Select>
                    {fidelity}
                </div>
            </>
        );
    }
}

export default View_counts;
