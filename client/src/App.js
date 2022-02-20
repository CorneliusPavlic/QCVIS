import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Layout, Breadcrumb, Row, Col} from 'antd';
import {Input} from 'antd';
import {Divider, Form, InputNumber, Button, Slider, Radio, Typography, Select} from 'antd';


const {Text} = Typography;
import {DeploymentUnitOutlined, HddOutlined} from '@ant-design/icons';
import axios from 'axios'
import * as d3 from "d3";


import './App.css'


import View_1 from './Components/View_1'
import View_2 from "./Components/View_2";
import Link12 from "./Components/Link12";


const {Header, Content} = Layout;


class App extends Component {

    constructor(props) {
        super(props);
        this.handle_View2_button = this.handle_View2_button.bind(this)
        this.select_computer = this.select_computer.bind(this)
        this.view2_gate_qual_extent = this.view2_gate_qual_extent.bind(this)
        this.view2_gate_qual_filter = this.view2_gate_qual_filter.bind(this)
        this.handle_view1_attr_change = this.handle_view1_attr_change.bind(this)
        this.handle_view2_attr_change = this.handle_view2_attr_change.bind(this)
        this.handle_view3_attr_change = this.handle_view3_attr_change.bind(this)
        this.handle_view2_algo_change = this.handle_view2_algo_change.bind(this)


        this.state = {

            selected_computer: '',

            view1_attr: 'T1',

            view2_algo: 'shor',
            view2_attr: 'gate',

            view3_attr: 'T1',

            view2_gate_qual_extent: [0, 0],
            view2_gate_qual_filter: [],

        }
    }


    view2_gate_qual_extent(extent) {
        this.setState({
            view2_gate_qual_extent: extent
        })
    }


    view2_gate_qual_filter(range) {
        this.setState({
            view2_gate_qual_filter: range
        })
    }


    select_computer(item) {
        this.setState({
            selected_computer: item
        })
    }


    handle_View2_button() {/* View 2是 点击Control Panel按钮 渲染*/


        /*测试有没有选 selected computer， 没有指定就提示要选，不然transpile个毛线*/
        if (!this.state.selected_computer) {
            alert('Please indicated the quantum computer')
            return
        }


        /*画link12*/
        ReactDOM.render(<Link12 selected_computer={this.state.selected_computer}/>, this.link_12)

        /*渲染 view2*/
        ReactDOM.render(<View_2 view3_attr={this.state.view3_attr}
                                view2_attr={this.state.view2_attr}
                                view2_algo={this.state.view2_algo}
                                view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                                view2_gate_qual_extent={this.view2_gate_qual_extent}
                                backend_name={this.state.selected_computer}/>,
            this.container_2);
    }


    handle_view1_attr_change(e) {

        let attr = e.target.value
        this.setState({view1_attr: attr})

    }


    handle_view2_attr_change(e) {

        let attr = e.target.value
        this.setState({view2_attr: attr})

    }


    handle_view3_attr_change(e) {

        let attr = e.target.value
        this.setState({view3_attr: attr})

    }

    handle_view2_algo_change(e){
        let algo = e.target.value
        this.setState({view2_algo: algo})
    }


    componentDidMount() {
        console.log('main mounted')

        this.container_1 = document.querySelector("#container_1");
        this.container_2 = document.querySelector("#container_2");
        this.link_12 = document.querySelector('#link12')

        /* View 1是Mount + Update渲染*/
        ReactDOM.render(<View_1 select_computer={this.select_computer}
                                view1_attr={this.state.view1_attr}
            />,
            this.container_1);
    }


    componentDidUpdate(prevProps, prevStates) {

        /*情况0：控制view1 的 view1_attr 更新*/
        if (prevStates['view1_attr'] != this.state.view1_attr) {
            if (d3.select('.view1_svg').size() == 0) {
                return
            }

            /*渲染 view2*/
            ReactDOM.render(<View_1 select_computer={this.select_computer}
                                    view1_attr={this.state.view1_attr}
                />,
                this.container_1);
        }

        /*情况1：控制view2 的 view2_attr 更新*/
        if (prevStates['view2_attr'] != this.state.view2_attr) {
            if (d3.select('.view2_svg').size() == 0) {
                return
            }

            /*渲染 view2*/
            ReactDOM.render(<View_2 view2_attr={this.state.view2_attr}
                                    view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                                    view2_gate_qual_extent={this.view2_gate_qual_extent}
                                    backend_name={this.state.selected_computer}/>,
                this.container_2);
        }


        /*情况2：控制 view2 的 view2_gate_qual_filter 更新*/
        if (prevStates['view2_gate_qual_filter'] != this.state.view2_gate_qual_filter) {
            if (d3.select('.view2_svg').size() == 0) {
                return
            }
            ReactDOM.render(<View_2 view2_attr={this.state.view2_attr}
                                    view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                                    backend_name={this.state.selected_computer}/>,
                this.container_2);

        }


        /*情况3：控制view3 的 view3_attr 更新*/
        if (prevStates['view3_attr'] != this.state.view3_attr) {
            if (d3.select('.view3').size() == 0) {
                return
            }

            ReactDOM.render(<View_2 view3_attr={this.state.view3_attr}/>,
                this.container_2);

        }

    }


    render() {

        let extraBreadcrumbItems = []
        if (document.getElementById('svg_container_2')) {
            extraBreadcrumbItems.push(<Breadcrumb.Item key={'quantum_circuit_overview'}>Quantum Circuit
                Overview</Breadcrumb.Item>)
        }
        let breadcrumbItems = [<Breadcrumb.Item key={'quantum_computer'}>Quantum
            Computer</Breadcrumb.Item>].concat(extraBreadcrumbItems)

        /*检查有没有 view2，没有的话禁用左边的控制模块*/
        let check1 = () => {
            if (d3.select('.view2_svg').size() == 0) {
                return true
            }
            return false
        }


        return (
            <Layout className="layout">
                <Header className="header" style={{height: '42px'}}>
                    <span><DeploymentUnitOutlined
                        style={{fontSize: '15px', color: '#d8d8d8', margin: '0 14px 0 0'}}/></span>
                    <p className="header-title">QCVIS</p>
                    <p className="paper-title">QuantVis: A Quality-Aware Visualization System for Noise Mitigation in
                        Quantum Computing</p>
                </Header>
                <Content style={{padding: '0 25px', backgroundColor: '#ffffff'}}>
                    <Breadcrumb separator=">" style={{margin: '4px 0'}}>
                        {breadcrumbItems}
                        {/*<Breadcrumb.Item>Quantum Computer</Breadcrumb.Item>
                    <Breadcrumb.Item>Quantum Circuit Overview</Breadcrumb.Item>
                    <Breadcrumb.Item>Quantum Circuit</Breadcrumb.Item>
                    <Breadcrumb.Item>Run</Breadcrumb.Item>*/}
                    </Breadcrumb>
                    <div className="view">
                        <Row gutter={5} style={{height: '100%'}}>
                            <Col className="gutter-row control-panel" span={4} style={{height: '100%'}}>
                                <div style={{background: "#ffffff"}}>
                                    <Form
                                        labelCol={{
                                            span: 9,
                                        }}
                                        /*wrapperCol={{
                                            span: 12,
                                        }}*/
                                        layout="horizontal"

                                    >
                                        <Divider plain style={{marginTop:'40px'}}><Text style={{fontSize: '0.8em'}} strong>Computer
                                            Selection</Text></Divider>

                                        <Form.Item label={'Select computer:'}>
                                            <Input style={{width: '180px'}} value={this.state.selected_computer}
                                                   placeholder="Selected Computer:" prefix={<HddOutlined/>}/>
                                        </Form.Item>
                                        <Form.Item label={"Qubit Attr.:"}>
                                            <Radio.Group value={this.state.view1_attr}
                                                         onChange={this.handle_view1_attr_change} buttonStyle="solid">
                                                <Radio.Button value="error_rate">Error Rate</Radio.Button>
                                                <Radio.Button value="T1">T1</Radio.Button>
                                                <Radio.Button value="T2">T2</Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>


                                        <Form.Item label={"Quantum Algo.:"}>
                                            <Select defaultValue={this.state.view2_algo} style={{width: '150px'}}>
                                                <Select.Option value="shor">Shor's Algorithm</Select.Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item label={"Transpile times"}>
                                            <InputNumber id={'view2-button'} defaultValue={10} min={10} max={100}
                                                         step={10}/>
                                        </Form.Item>

                                        <Form.Item wrapperCol={{offset: 9}}>
                                            <Button danger style={{width: '180px'}} onClick={this.handle_View2_button}>Launch
                                                Compilation</Button>
                                        </Form.Item>


                                        <Divider plain style={{marginTop:'40px'}}><Text style={{fontSize: '0.8em'}} strong>Circuit Overview</Text></Divider>


                                        <Form.Item label={"Building Block: "}>
                                            <Radio.Group value={this.state.view2_attr} defaultValue="gate"
                                                         onChange={this.handle_view2_attr_change} buttonStyle="solid"
                                                         disabled={check1()}>
                                                <Radio.Button value="gate">Gate</Radio.Button>
                                                <Radio.Button value="qubit">Qubit</Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>

                                        <Form.Item label="Quality filter">
                                            <Row>
                                                <Col span={7}>
                                                    <InputNumber
                                                        /*min={1}
                                                        max={20}*/
                                                        value={this.state.view2_gate_qual_filter[0]}
                                                        style={{width: '80%'}}
                                                        style={{width: '80%', padding: '0'}}
                                                        controls={false}
                                                    />
                                                </Col>
                                                <Col span={10}>
                                                    <Slider
                                                        range
                                                        step={0.01}
                                                        defaultValue={[0, 0]}
                                                        min={this.state.view2_gate_qual_extent[0]}
                                                        max={this.state.view2_gate_qual_extent[1]}
                                                        onAfterChange={this.view2_gate_qual_filter}
                                                        disabled={check1()}
                                                    />
                                                </Col>
                                                <Col span={7}>
                                                    <InputNumber
                                                        /*min={1}
                                                        max={20}*/
                                                        value={this.state.view2_gate_qual_filter[1]}
                                                        controls={false}
                                                        style={{width: '80%'}}
                                                    />
                                                </Col>
                                            </Row>
                                        </Form.Item>

                                        <Divider plain  style={{marginTop:'40px'}}><Text style={{fontSize: '0.8em'}} strong>Circuit Selection</Text></Divider>

                                        <Form.Item label={"Gate Attr.:"}>
                                            <Radio.Group defaultValue="gate" buttonStyle="solid" disabled={check1()}>
                                                <Radio.Button value="gate">Error Rate</Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>


                                        <Form.Item label={"Qubit Attr.:"}>
                                            <Radio.Group value={this.state.view3_attr}
                                                         onChange={this.handle_view3_attr_change} buttonStyle="solid"
                                                         disabled={check1()}>
                                                <Radio.Button value="T1">T1</Radio.Button>
                                                <Radio.Button value="T2">T2</Radio.Button>
                                                <Radio.Button value="error_rate">Error Rate</Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>
                                        <Divider plain><Text style={{fontSize: '0.8em'}}
                                                             strong>Execution</Text></Divider>


                                        <Form.Item wrapperCol={{offset: 1}}>
                                            <Button danger style={{width: '270px'}}
                                                    onClick={this.handle_View2_button}>Run</Button>
                                        </Form.Item>
                                    </Form>

                                </div>
                            </Col>
                            <Col className="gutter-row" span={18.5} style={{height: '100%'}}>
                                <div style={{background: "#fcfcfc", height: '100%'}}>
                                    <div id="container_1"></div>
                                    <div id="link12"></div>
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