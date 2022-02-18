import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import { Layout, Breadcrumb, Row, Col } from 'antd';
import { Input } from 'antd';
import { Divider, Form, InputNumber, Button, Slider, Radio, Typography } from 'antd';
const { Text } = Typography;
import { DeploymentUnitOutlined, HddOutlined } from '@ant-design/icons';
import axios from 'axios'
import * as d3 from "d3";


import './App.css'


import View_1 from './Components/View_1'
import View_2 from "./Components/View_2";
import Link12 from "./Components/Link12";

const { Header, Content } = Layout;


class App extends Component {

    constructor(props) {
        super(props);
        this.handle_View2_button = this.handle_View2_button.bind(this)
        this.select_computer = this.select_computer.bind(this)
        this.view2_gate_qual_extent = this.view2_gate_qual_extent.bind(this)
        this.view2_gate_qual_filter = this.view2_gate_qual_filter.bind(this)
        this.handle_view2_attr_change = this.handle_view2_attr_change.bind(this)
        this.handle_view3_attr_change = this.handle_view3_attr_change.bind(this)


        this.state = {

            selected_computer: '',

            view2_attr : 'gate',

            view3_attr: 'T1',

            view2_gate_qual_extent: [0, 0],
            view2_gate_qual_filter: [],

        }
    }

    view2_gate_qual_extent(extent){
        this.setState({
            view2_gate_qual_extent: extent
        })
    }



    view2_gate_qual_filter(range){
        this.setState({
            view2_gate_qual_filter: range
        })
    }



    select_computer(item){
        this.setState({
            selected_computer: item
        })
    }


    handle_View2_button(){/* View 2是 点击Control Panel按钮 渲染*/


        /*测试有没有选 selected computer， 没有指定就提示要选，不然transpile个毛线*/
        if(!this.state.selected_computer){
            alert('Please indicated the quantum computer')
            return
        }


        /*画link12*/
        ReactDOM.render(<Link12 selected_computer={this.state.selected_computer}/>, this.link_12)

        /*渲染 view2*/
        ReactDOM.render(<View_2 view3_attr={this.state.view3_attr}
                                view2_attr={this.state.view2_attr}
                                view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                                view2_gate_qual_extent={this.view2_gate_qual_extent}
                                backend_name={this.state.selected_computer}/>,
            this.container_2);
    }


    handle_view2_attr_change(e){

        let attr = e.target.value
        this.setState({view2_attr: attr})

    }


    handle_view3_attr_change(e){

        let attr = e.target.value
        this.setState({view3_attr: attr})

    }




    componentDidMount() {
        console.log('main mounted')

        this.container_1 = document.querySelector("#container_1");
        this.container_2 = document.querySelector("#container_2");
        this.link_12 = document.querySelector('#link12')

        /* View 1是Mount + Update渲染*/
        ReactDOM.render(<View_1 select_computer={this.select_computer}/>, this.container_1);
    }



    componentDidUpdate(prevProps, prevStates) {

        /*情况1：控制view2 的 view2_attr 更新*/
        if(prevStates['view2_attr'] != this.state.view2_attr ){
            if(d3.select('.view2_svg').size() == 0){
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
        if(prevStates['view2_gate_qual_filter'] != this.state.view2_gate_qual_filter){
            if(d3.select('.view2_svg').size() == 0){
                return
            }
                ReactDOM.render(<View_2 view2_attr={this.state.view2_attr}
                            view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                            backend_name={this.state.selected_computer}/>,
                this.container_2);

        }


        /*情况3：控制view3 的 view3_attr 更新*/
        if(prevStates['view3_attr'] != this.state.view3_attr){
            if(d3.select('.view3').size() == 0){
                return
            }

            ReactDOM.render(<View_2 view3_attr={this.state.view3_attr}/>,
                this.container_2);

        }

    }



    render(){

        let extraBreadcrumbItems = []
        if(document.getElementById('svg_container_2')){
            extraBreadcrumbItems.push(<Breadcrumb.Item key={'quantum_circuit_overview'}>Quantum Circuit Overview</Breadcrumb.Item>)
        }
        let breadcrumbItems = [<Breadcrumb.Item key={'quantum_computer'}>Quantum Computer</Breadcrumb.Item>].concat(extraBreadcrumbItems)

        /*检查有没有 view2，没有的话禁用左边的控制模块*/
        let check1=()=>{
            if(d3.select('.view2_svg').size()==0){
                return true
            }
            return false
        }


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
                        <Col className="gutter-row control-panel" span={5} style={{height: '100%'}}>
                            <div style={{ background: "#ffffff" }}>

                                <Divider plain><Text style={{fontSize: '1em'}} strong>Computer Selection</Text></Divider>
                                <span className="ant-form-text">Select your preferred computer:</span>
                                <Input value={this.state.selected_computer} placeholder="Selected Computer" prefix={ <HddOutlined /> }  style={{margin:'0 0 10px 0'}}/>
                                <Divider plain><Text style={{fontSize: '1em'}} strong>Circuit Overview</Text></Divider>

                                <Form>
                                        <Form.Item label="Transpile times" >
                                            {/*<InputNumber id={'view2-button'} defaultValue={100} min={100} max={1000} step={100}/>*/}
                                            <InputNumber id={'view2-button'} defaultValue={3} min={3} max={10} step={1}/>
                                            <Button  style={{margin:'5px'}} onClick={this.handle_View2_button}>Launch Transpilation</Button>
                                        </Form.Item>

                                    <Text>Building Block:  </Text>
                                    <Radio.Group value={this.state.view2_attr}  defaultValue="gate" onChange={this.handle_view2_attr_change} style={{marginLeft: '20px'}} buttonStyle="solid" disabled={check1()}>
                                        <Radio.Button value="gate">Gate</Radio.Button>
                                        <Radio.Button value="qubit">Qubit</Radio.Button>
                                    </Radio.Group>

                                    <Form.Item  label="Quality Filter" style={{margin: '10px 0'}}>
                                        <Slider
                                            range
                                            step={0.01}
                                            defaultValue={[0, 0]}
                                            min={this.state.view2_gate_qual_extent[0]}
                                            max={this.state.view2_gate_qual_extent[1]}
                                            onAfterChange={this.view2_gate_qual_filter}
                                            disabled={check1()}
                                        />
                                    </Form.Item>

                                </Form>

                                <Divider plain><Text style={{fontSize: '1em'}} strong>Circuit Selection</Text></Divider>
                                <Text>Gate Attr.:  </Text>
                                <Radio.Group  defaultValue="gate"  style={{marginLeft: '27px'}} buttonStyle="solid" disabled={check1()}>
                                    <Radio.Button value="gate">Error Rate</Radio.Button>
                                </Radio.Group>
                                <br/>
                                <br/>
                                <Text>Qubit Attr.: </Text>
                                <Radio.Group value={this.state.view3_attr} onChange={this.handle_view3_attr_change} style={{marginLeft: '20px'}} buttonStyle="solid" disabled={check1()}>
                                    <Radio.Button value="T1">T1</Radio.Button>
                                    <Radio.Button value="T2">T2</Radio.Button>
                                    <Radio.Button value="readout_error">Error Rate</Radio.Button>
                                </Radio.Group>

                            </div>
                        </Col>
                        <Col className="gutter-row" span={18.5} style={{height: '100%'}}>
                            <div style={{ background: "#fcfcfc",  height: '100%' }}>
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