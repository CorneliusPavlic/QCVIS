import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { Layout, Breadcrumb, Row, Col } from 'antd';
import { Input } from 'antd';
import { Divider, Form, InputNumber, Button, Slider } from 'antd';
import { DeploymentUnitOutlined, HddOutlined } from '@ant-design/icons';
import axios from 'axios'


import './App.css'

import View_1 from './Components/View_1'
import View_2 from "./Components/View_2";
import * as d3 from "d3";

const { Header, Content } = Layout;


class App extends Component {

    constructor(props) {
        super(props);
        this.handle_radius = this.handle_radius.bind(this)
        this.handle_View2_button = this.handle_View2_button.bind(this)
        this.select_computer = this.select_computer.bind(this)
        this.view2_gate_qual_extent = this.view2_gate_qual_extent.bind(this)
        this.view2_qubit_qual_extent = this.view2_qubit_qual_extent.bind(this)
        this.view2_gate_qual_filter = this.view2_gate_qual_filter.bind(this)
        this.view2_qubit_qual_filter = this.view2_qubit_qual_filter.bind(this)
        this.state = {
            radius: 50,

            selected_computer: '',

            view2_gate_qual_extent: [0, 0],
            view2_gate_qual_filter: [],
            view2_qubit_qual_extent: [0, 0],
            view2_qubit_qual_filter: [],

        }
    }

    view2_gate_qual_extent(extent){
        this.setState({
            view2_gate_qual_extent: extent
        })
    }

    view2_qubit_qual_extent(extent){
        this.setState({
            view2_qubit_qual_extent: extent
        })
    }


    view2_gate_qual_filter(range){
        this.setState({
            view2_gate_qual_filter: range
        }, ()=>{
            ReactDOM.render(<View_2 view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                                    view2_gate_qual_extent={this.view2_gate_qual_extent}
                                    view2_qubit_qual_filter={this.state.view2_qubit_qual_filter}
                                    view2_qubit_qual_extent={this.view2_qubit_qual_extent}
                                    backend_name={this.state.selected_computer}
                                    radius={this.state.radius}/>,
                this.container_2);
        })
    }

    view2_qubit_qual_filter(range){
        this.setState({
            view2_qubit_qual_filter: range
        }, ()=>{
            ReactDOM.render(<View_2 view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                                    view2_gate_qual_extent={this.view2_gate_qual_extent}
                                    view2_qubit_qual_filter={this.state.view2_qubit_qual_filter}
                                    view2_qubit_qual_extent={this.view2_qubit_qual_extent}
                                    backend_name={this.state.selected_computer}
                                    radius={this.state.radius}/>,
                this.container_2);
        })
    }


    select_computer(item){
        this.setState({
            selected_computer: item
        })
    }


    handle_View2_button(){/* View 2是 点击Control Panel按钮 渲染*/

        ReactDOM.render(<View_2 view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                                view2_gate_qual_extent={this.view2_gate_qual_extent}
                                view2_qubit_qual_filter={this.state.view2_qubit_qual_filter}
                                view2_qubit_qual_extent={this.view2_qubit_qual_extent}
                                backend_name={this.state.selected_computer}
                                radius={this.state.radius}/>,
            this.container_2);
    }


    handle_radius() {
        this.setState({
            radius: this.state.radius - 10
        })

    }


    componentDidMount() {
        console.log('main mounted')

        this.container_1 = document.querySelector("#container_1");
        this.container_2 = document.querySelector("#container_2");

        /* View 1是Mount + Update渲染*/
        ReactDOM.render(<View_1 select_computer={this.select_computer}/>, this.container_1);
    }



    componentDidUpdate() {

        /* View 1是Mount + Update渲染*/
        // ReactDOM.render(<View_1 select_computer={this.select_computer}/>, this.container_1);
    }



    render(){

        let extraBreadcrumbItems = []
        if(document.getElementById('svg_container_2')){
            extraBreadcrumbItems.push(<Breadcrumb.Item key={'quantum_circuit_overview'}>Quantum Circuit Overview</Breadcrumb.Item>)
        }
        let breadcrumbItems = [<Breadcrumb.Item key={'quantum_computer'}>Quantum Computer</Breadcrumb.Item>].concat(extraBreadcrumbItems)

    return(
        <Layout className="layout">
            <Header className = "header" style={{ height: '50px' }}>
                <span><DeploymentUnitOutlined style={{ fontSize: '20px', color: '#d8d8d8',  margin: '0 14px 0 0' }} /></span>
                <p className="header-title">QCVIS</p>
                <p className="paper-title">The title of the IEEE VIS'22 paper</p>
            </Header>
            <Content style={{ padding: '0 50px', backgroundColor:'#ffffff' }}>
                <Breadcrumb  separator=">" style={{ margin: '16px 0' }}>
                    {breadcrumbItems}
                    {/*<Breadcrumb.Item>Quantum Computer</Breadcrumb.Item>
                    <Breadcrumb.Item>Quantum Circuit Overview</Breadcrumb.Item>
                    <Breadcrumb.Item>Quantum Circuit</Breadcrumb.Item>
                    <Breadcrumb.Item>Run</Breadcrumb.Item>*/}
                </Breadcrumb>
                <div className="view">
                    <Row gutter={10} style={{height: '100%'}}>
                        <Col className="gutter-row" span={5} style={{height: '100%'}}>
                            <div style={{ background: "#ffffff" }}>
                                <Divider plain><span style={{fontSize: '0.8em'}}>Computer Selection</span></Divider>
                                <span className="ant-form-text">Select your preferred computer:</span>
                                <Input value={this.state.selected_computer} placeholder="Selected Computer" prefix={ <HddOutlined /> }  style={{margin:'0 0 10px 0'}}/>
                                <button onClick={this.handle_radius}>Render</button>
                                <Divider plain><span style={{fontSize: '0.8em'}}>Circuit Overview</span></Divider>

                                <Form>
                                        <Form.Item label="Transpile times" >
                                            <InputNumber id={'view2-button'} defaultValue={100} min={100} max={1000} step={100}/>
                                            <Button  style={{margin:'5px'}} onClick={this.handle_View2_button}>Launch Transpilation</Button>
                                        </Form.Item>
                                    <Form.Item  label="Gate Qual. Filter">
                                        <Slider
                                            range
                                            step={0.01}
                                            defaultValue={[0, 0]}
                                            min={this.state.view2_gate_qual_extent[0]}
                                            max={this.state.view2_gate_qual_extent[1]}
                                            onAfterChange={this.view2_gate_qual_filter}
                                            tooltipVisible
                                        />
                                    </Form.Item>
                                    <Form.Item  label="Qubit Qual. Filter">
                                        <Slider
                                            range
                                            step={0.01}
                                            defaultValue={[0, 0]}
                                            min={this.state.view2_qubit_qual_extent[0]}
                                            max={this.state.view2_qubit_qual_extent[1]}
                                            onAfterChange={this.view2_qubit_qual_filter}
                                            tooltipVisible
                                        />
                                    </Form.Item>
                                </Form>

                            </div>
                        </Col>
                        <Col className="gutter-row" span={19} style={{height: '100%'}}>
                            <div style={{ background: "#fcfcfc",  height: '100%' }}>
                                <div id="container_1"></div>
                                <div id="container_2"></div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>


    )
  }
}

export default App;