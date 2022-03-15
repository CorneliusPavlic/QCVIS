import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Layout, Row, Col} from 'antd';
import {Input} from 'antd';
import {Divider, Form, InputNumber, Button, Slider, Radio, Typography, Select, Switch } from 'antd';


const {Text} = Typography;
import {DeploymentUnitOutlined, HddOutlined} from '@ant-design/icons';
import axios from 'axios'
import * as d3 from "d3";


import './App.css'


import View_1 from './Components/View_1'
import View_2 from "./Components/View_2";
import Link12 from "./Components/Link12";
import View_counts from "./Components/View_counts";


const {Header, Content} = Layout;


class App extends Component {

    constructor(props) {
        super(props);
        this.handle_View2_button = this.handle_View2_button.bind(this)
        this.select_computer = this.select_computer.bind(this)
        this.select_circuit = this.select_circuit.bind(this)
        this.view2_qual_extent = this.view2_qual_extent.bind(this)
        this.view2_gate_qual_filter = this.view2_gate_qual_filter.bind(this)
        this.handle_view1_attr_change = this.handle_view1_attr_change.bind(this)
        this.handle_view2_attr_change = this.handle_view2_attr_change.bind(this)
        this.handle_view3_attr_change = this.handle_view3_attr_change.bind(this)
        this.handle_view2_algo_change = this.handle_view2_algo_change.bind(this)
        this.handle_view1_timerange = this.handle_view1_timerange.bind(this)
        this.handle_view1_interval = this.handle_view1_interval.bind(this)
        this.handleSort = this.handleSort.bind(this)
        this.handleSortByDepth = this.handleSortByDepth.bind(this)
        this.get_all_circuits = this.get_all_circuits.bind(this)
        this.handle_execution = this.handle_execution.bind(this)


        this.state = {

            selected_computer: '',
            selected_circuit: [],
            all_circuits: [],

            view1_attr: 'error_rate',

            view2_algo: 'shor',
            view2_attr: 'gate',
            view2_sort: false,
            view2_sortByDepth: false,

            view3_attr: 'error_rate',

            view2_qual_extent: [0, 0],
            view2_gate_qual_filter: [],

        }
    }


    view2_qual_extent(extent) {
        this.setState({
            view2_qual_extent: extent
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


    select_circuit(item) {
        this.setState({
            selected_circuit: [...this.state.selected_circuit, item]
        })
    }

    get_all_circuits(item){
        this.setState({
            all_circuits: [...this.state.all_circuits, item]
        })
    }


    handle_View2_button() {/* View 2是 点击Control Panel按钮 渲染*/


        /*测试有没有选 selected computer， 没有指定就提示要选，不然transpile个毛线*/
        if (!this.state.selected_computer) {
            alert('Please indicated the quantum computer')
            return
        }


        /*渲染 view2*/
        ReactDOM.render(<View_2 view3_attr={this.state.view3_attr}
                                view2_attr={this.state.view2_attr}
                                view2_algo={this.state.view2_algo}
                                view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                                view2_qual_extent={this.view2_qual_extent}
                                backend_name={this.state.selected_computer}
                                select_circuit={this.select_circuit}
                                get_all_circuits={this.get_all_circuits}
                                view2_sort={this.state.view2_sort}
                                view2_sortByDepth={this.state.view2_sortByDepth}/>,
            this.container_2);


        /*画link12*/
        ReactDOM.render(<Link12 selected_computer={this.state.selected_computer}/>, this.link_12)


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

        this.setState({view2_algo: e})
    }

    handleSort(checked){
        this.setState({view2_sort: checked})
    }

    handle_view1_interval(e){
        if(e.key == 'Enter'){

            let interval = Number(document.getElementById('interval').value) || 7

            ReactDOM.render(<View_1 select_computer={this.select_computer}
                                    view1_attr={this.state.view1_attr}
                                    interval={interval}
                />,
                this.container_1);
        }
    }


    handle_view1_timerange(e){
        if(e.key == 'Enter'){

            let time_range = Number(document.getElementById('time_range').value) ||30
            let interval = Number(document.getElementById('interval').value) || 7

            ReactDOM.render(<View_1 select_computer={this.select_computer}
                                    view1_attr={this.state.view1_attr}
                                    time_range={time_range}
                                    interval={interval}
                />,
                this.container_1);
        }
    }

    handleSortByDepth(checked){
        this.setState({view2_sortByDepth: checked})

    }


    handle_execution(){

/*        let data = {
            'trans_0':{ "00 00": [ 40, 33 ], "01 00": [ 200, 180 ], "10 00": [ 1000, 931 ], "11 00": [ 0, 28 ] },
            'trans_1':{ "00 00": [ 40, 33 ], "01 00": [ 200, 180 ], "10 00": [ 500, 931 ], "11 00": [ 0, 28 ] },
            'trans_2':{ "00 00": [ 40, 33 ], "01 00": [ 200, 180 ], "10 00": [ 1000, 931 ], "11 00": [ 0, 28 ] },

        }

        ReactDOM.render(<View_counts data={data}
            />,
            this.container_counts);*/


        // 如果啥都没选，run 个毛线
        if(!this.state.selected_circuit || !this.state.selected_computer){
            alert('Please select a backend and circuit before RUN')
        }

        axios.post(`/api/execution_api_datafile/`, {'backend': this.state.selected_computer, 'algo': this.state.view2_algo, 'circuit': this.state.all_circuits})
            .then(res=>{
                let data = res['data']



                ReactDOM.render(<View_counts
                        data={data}
                        selected_circuit={this.state.selected_circuit}
                    />,
                    this.container_counts);
            })
    }



    componentDidMount() {
        console.log('main mounted')

        this.container_1 = document.querySelector("#container_1");
        this.container_2 = document.querySelector("#container_2");
        this.link_12 = document.querySelector('#link12')
        this.container_counts = document.querySelector('#container_counts')


        let time_range = Number(document.getElementById('time_range').value) ||30
        let interval = Number(document.getElementById('interval').value) || 7

        /* View 1是Mount + 改变时间参数 渲染*/
        ReactDOM.render(<View_1 select_computer={this.select_computer}
                                view1_attr={this.state.view1_attr}
                                time_range={time_range}
                                interval={interval}
            />,
            this.container_1);
    }


    componentDidUpdate(prevProps, prevStates) {

        /*情况0：控制view1 的 view1_attr 更新*/
        if (prevStates['view1_attr'] != this.state.view1_attr) {
            if (d3.select('.view1_svg').size() == 0) {
                return
            }


            let time_range = this.props.time_range || Number(document.getElementById('time_range').value)
            let interval = this.props.interval|| Number(document.getElementById('interval').value)

            /*渲染 view2*/
            ReactDOM.render(<View_1 select_computer={this.select_computer}
                                    view1_attr={this.state.view1_attr}
                                    time_range={time_range}
                                    interval={interval}
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
                                    view3_attr={this.state.view3_attr}
                                    view2_algo={this.state.view2_algo}
                                    view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                                    view2_qual_extent={this.view2_qual_extent}
                                    backend_name={this.state.selected_computer}
                                    select_circuit={this.select_circuit}
                                    get_all_circuits={this.get_all_circuits}
                                    view2_sort={this.state.view2_sort}
                                    view2_sortByDepth={this.state.view2_sortByDepth}/>,
                this.container_2);
        }


        /*情况2：控制 view2 的 view2_gate_qual_filter 更新*/
        if (prevStates['view2_gate_qual_filter'] != this.state.view2_gate_qual_filter) {
            if (d3.select('.view2_svg').size() == 0) {
                return
            }
            ReactDOM.render(<View_2 view2_attr={this.state.view2_attr}
                                    view3_attr={this.state.view3_attr}
                                    view2_algo={this.state.view2_algo}
                                    view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                                    backend_name={this.state.selected_computer}
                                    select_circuit={this.select_circuit}
                                    get_all_circuits={this.get_all_circuits}
                                    view2_sort={this.state.view2_sort}
                                    view2_sortByDepth={this.state.view2_sortByDepth}/>,
                this.container_2);

        }


        /*情况3：控制 view2 的数据是否进行sorting*/
        if (prevStates['view2_sort'] != this.state.view2_sort){
            if (d3.select('.view2_svg').size() == 0) {
                return
            }


            if(this.state.view2_sortByDepth == true && this.state.view2_sort == true){
                this.setState({view2_sortByDepth: false})
            }


            ReactDOM.render(<View_2 view2_attr={this.state.view2_attr}
                                    view3_attr={this.state.view3_attr}
                                    backend_name={this.state.selected_computer}
                                    select_circuit={this.select_circuit}
                                    get_all_circuits={this.get_all_circuits}
                                    view2_sort={this.state.view2_sort}
                                    view2_sortByDepth={this.state.view2_sortByDepth}
                                    view2_algo={this.state.view2_algo}
                                    view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                                    view2_qual_extent={this.view2_qual_extent}/>,
                this.container_2);
        }


        /*情况3.1：控制 view2 的数据是否进行sortingByDepth*/
        if (prevStates['view2_sortByDepth'] != this.state.view2_sortByDepth){
            if (d3.select('.view2_svg').size() == 0) {
                return
            }



            if(this.state.view2_sort == true && this.state.view2_sortByDepth==true){
                this.setState({view2_sort: false})
            }


            ReactDOM.render(<View_2 view2_attr={this.state.view2_attr}
                                    view3_attr={this.state.view3_attr}
                                    backend_name={this.state.selected_computer}
                                    select_circuit={this.select_circuit}
                                    get_all_circuits={this.get_all_circuits}
                                    view2_sort={this.state.view2_sort}
                                    view2_sortByDepth={this.state.view2_sortByDepth}
                                    view2_algo={this.state.view2_algo}
                                    view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                                    view2_qual_extent={this.view2_qual_extent}/>,
                this.container_2);
        }


        /*情况4：控制view3 的 view3_attr 更新*/
        if (prevStates['view3_attr'] != this.state.view3_attr) {
            if (d3.select('.view3').size() == 0) {
                return
            }

            ReactDOM.render(<View_2 view3_attr={this.state.view3_attr}
                                    select_circuit={this.select_circuit}
                                    get_all_circuits={this.get_all_circuits}
                                    view2_algo={this.state.view2_algo}
                                    view2_sortByDepth={this.state.view2_sortByDepth}
                                    backend_name={this.state.selected_computer}
                />,
                this.container_2);

        }




    }


    render() {


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
                    <p className="header-title">QUIET</p>
                    <p className="paper-title">A Quality-Aware Visualization System for Noise Mitigation in
                        Quantum Computing</p>
                </Header>
                <Content style={{padding: '0 75px', backgroundColor: '#ffffff', marginTop: '10px'}}>
                    <div className="view">
                        <Row gutter={0} style={{height: '100%'}}>
                            <Col className="gutter-row" span={19} style={{height: '100%'}}>
                                <div style={{background: "#fcfcfc", height: '100%'}}>
                                    <div id="container_1"></div>
                                    <div id="link12"></div>
                                    <div id="container_2"></div>
                                </div>
                            </Col>
                            <Col className="gutter-row control-panel" span={5} style={{height: '100%'}}>
                                <div style={{background: "#ffffff"}}>
                                    <Form
                                        className={'control-panel-form'}
                                        labelCol={{
                                            span: 9,
                                        }}
                                        /*wrapperCol={{
                                            span: 12,
                                        }}*/
                                        layout="horizontal"

                                    >
                                        <Divider plain><Text style={{fontSize: '0.8em'}} strong>Computer
                                            Selection</Text></Divider>

                                        <Form.Item label={'Time Range'}>
                                            <InputNumber id={'time_range'} defaultValue={10} min={3} max={90}
                                                         step={1}
                                                         onKeyDown={this.handle_view1_timerange}
                                                         controls={false}
                                            />
                                            <span style={{marginLeft: '15px'}}>Interval: </span>
                                            <InputNumber style={{width: '50px'}} id={'interval'} defaultValue={1} min={1} max={90}
                                                         step={1}
                                                         onKeyDown={this.handle_view1_interval}
                                                         controls={false}
                                            />
                                        </Form.Item>
                                        <Form.Item label={"Qubit Attr.:"}>
                                            <Radio.Group value={this.state.view1_attr}
                                                         onChange={this.handle_view1_attr_change} buttonStyle="solid">
                                                <Radio.Button value="error_rate">Readout Error</Radio.Button>
                                                <Radio.Button value="T1">T1</Radio.Button>
                                                <Radio.Button value="T2">T2</Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>



                                        <Form.Item label={"Quantum Algo.:"}>
                                            <Select className={'view2_algo'} defaultValue={this.state.view2_algo} onChange={this.handle_view2_algo_change} style={{width: '150px'}}>
                                                <Select.Option value="shor">Shor's Algorithm</Select.Option>
                                                <Select.Option value="two">Example Algorithm</Select.Option>
                                                <Select.Option value="QFT">QFT Algorithm</Select.Option>
                                                <Select.Option value="BV">Bernstein-Vazirani Algorithm</Select.Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item label={"Compilation Times"}>
                                            <InputNumber id={'view2-button'} defaultValue={50} min={3} max={100}
                                                         step={10}/>
                                            <Button danger style={{width: '120px', marginLeft: "10px"}} onClick={this.handle_View2_button}>
                                                Compile</Button>
                                        </Form.Item>

                                        {/*<Form.Item wrapperCol={{offset: 9}}>*/}
                                        {/*    <Button danger style={{width: '180px'}} onClick={this.handle_View2_button}>Launch*/}
                                        {/*        Compilation</Button>*/}
                                        {/*</Form.Item>*/}


                                        <Divider plain><Text style={{fontSize: '0.8em'}} strong>Circuit Overview</Text></Divider>


                                        <Form.Item label={"Building Block: "}>
                                            <Radio.Group value={this.state.view2_attr} defaultValue="gate"
                                                         onChange={this.handle_view2_attr_change} buttonStyle="solid"
                                                         disabled={check1()}>
                                                <Radio.Button value="gate">Gate Score</Radio.Button>
                                                <Radio.Button value="qubit">Qubit Score</Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>

                                        <Form.Item label="Quality Filter">
                                            <Row>
                                                <Col span={7}>
                                                    <InputNumber
                                                        /*min={1}
                                                        max={20}*/
                                                        value={this.state.view2_gate_qual_filter[0]}
                                                        style={{width: '80%', padding: '0'}}
                                                        controls={false}
                                                    />
                                                </Col>
                                                <Col span={10}>
                                                    <Slider
                                                        range
                                                        step={0.01}
                                                        defaultValue={[0, 0]}
                                                        min={this.state.view2_qual_extent[0]}
                                                        max={this.state.view2_qual_extent[1]}
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

                                        <Form.Item label={'Sorting by attr.'}>
                                            <Switch onChange={this.handleSort} checked={this.state.view2_sort}></Switch>
                                            &nbsp;&nbsp;
                                            &nbsp;
                                            <span>Sorting by depth: </span>
                                            <Switch onChange={this.handleSortByDepth} checked={this.state.view2_sortByDepth}></Switch>
                                        </Form.Item>

                                        <Divider plain ><Text style={{fontSize: '0.8em'}} strong>Circuit Selection</Text></Divider>

                                        <Form.Item label={"Gate Attr.:"}>
                                            <Radio.Group defaultValue="gate" buttonStyle="solid" disabled={check1()}>
                                                <Radio.Button value="gate">Error Rate</Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>


                                        <Form.Item label={"Qubit Attr.:"}>
                                            <Radio.Group value={this.state.view3_attr}
                                                         onChange={this.handle_view3_attr_change} buttonStyle="solid"
                                                         disabled={check1()}>
                                                <Radio.Button value="error_rate">Error Rate</Radio.Button>
                                                <Radio.Button value="T1">T1</Radio.Button>
                                                <Radio.Button value="T2">T2</Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>
                                        <Divider plain><Text style={{fontSize: '0.8em'}}
                                                             strong>Execution</Text></Divider>

                                        <Form.Item label={'Selected computer:'}>
                                            <Input style={{width: '180px'}} value={this.state.selected_computer}
                                                   placeholder="Selected Computer:" prefix={<HddOutlined/>}/>
                                        </Form.Item>
                                        <Form.Item label={'Selected circuit:'}>
                                            <Input style={{width: '180px'}} value={this.state.selected_circuit}
                                                   placeholder="Selected Circuit:" prefix={<HddOutlined/>}/>
                                        </Form.Item>

                                        <Form.Item wrapperCol={{offset: 2}}>
                                            <Button danger style={{width: '300px'}}
                                                    onClick={this.handle_execution}>Run</Button>
                                        </Form.Item>
                                    </Form>
                                    <Divider plain><Text style={{fontSize: '0.8em'}} strong>Fidelity Comparison</Text></Divider>

                                    <div id="container_counts"></div>


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