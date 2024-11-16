import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Layout, Row, Col, Input, Divider, Form, InputNumber, Button, Slider, Radio, Typography, Select, Switch } from 'antd';
import { DeploymentUnitOutlined, HddOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as d3 from 'd3';

import './App.css';
import QuantumCircuit from './Components/newView'; // Replace with correct import path for QuantumCircuit
import View_2 from './Components/View_2';
import Link12 from './Components/Link12';
import View_counts from './Components/View_counts';

const { Header, Content } = Layout;
const { Text } = Typography;

class App extends Component {
    constructor(props) {
        super(props);
        this.handle_View2_button = this.handle_View2_button.bind(this);
        this.select_computer = this.select_computer.bind(this);
        this.select_circuit = this.select_circuit.bind(this);
        this.clear_state = this.clear_state.bind(this);
        this.clear_state2 = this.clear_state2.bind(this);
        this.view2_qual_extent = this.view2_qual_extent.bind(this);
        this.view2_gate_qual_filter = this.view2_gate_qual_filter.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.init_view2 = this.init_view2.bind(this);
        this.handleSortByDepth = this.handleSortByDepth.bind(this);
        this.get_all_circuits = this.get_all_circuits.bind(this);
        this.handle_execution = this.handle_execution.bind(this);

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
        };
    }


    view2_qual_extent(extent) {
        this.setState({
            view2_qual_extent: extent,
        });
    }

    view2_gate_qual_filter(range) {
        this.setState({
            view2_gate_qual_filter: range,
        });
    }

    select_computer(item) {
        this.setState({
            selected_computer: item,
        });
    }

    select_circuit(item) {
        this.setState({
            selected_circuit: [...this.state.selected_circuit, item],
        });
    }

    clear_state() {
        this.setState({
            selected_circuit: [],
            all_circuits: [],
            view1_attr: 'error_rate',
            view2_attr: 'gate',
            view2_sort: false,
            view2_sortByDepth: false,
            view3_attr: 'error_rate',
            view2_qual_extent: [0, 0],
            view2_gate_qual_filter: [],
        });
    }

    clear_state2() {
        this.setState({
            selected_circuit: [],
            all_circuits: [],
        });
    }

    get_all_circuits(item) {
        this.setState({
            all_circuits: [...this.state.all_circuits, item],
        });
    }

    init_view2() {
        ReactDOM.unmountComponentAtNode(document.getElementById('link12'));
        ReactDOM.unmountComponentAtNode(document.getElementById('container_2'));
        ReactDOM.unmountComponentAtNode(document.getElementById('container_counts'));

        this.setState({
            selected_circuit: [],
            all_circuits: [],
            view1_attr: 'error_rate',
            view2_attr: 'gate',
            view2_sort: false,
            view2_sortByDepth: false,
            view3_attr: 'error_rate',
            view2_qual_extent: [0, 0],
            view2_gate_qual_filter: [],
        });
    }

    handle_View2_button() {
        if (!this.state.selected_computer) {
            alert('Please indicate the quantum computer');
            return;
        }

        this.init_view2();

        ReactDOM.render(
            <View_2
                view3_attr={this.state.view3_attr}
                view2_attr={this.state.view2_attr}
                view2_algo={this.state.view2_algo}
                view2_gate_qual_filter={this.state.view2_gate_qual_filter}
                view2_qual_extent={this.view2_qual_extent}
                backend_name={this.state.selected_computer}
                clear_state2={this.clear_state2}
                select_circuit={this.select_circuit}
                get_all_circuits={this.get_all_circuits}
                view2_sort={this.state.view2_sort}
                view2_sortByDepth={this.state.view2_sortByDepth}
            />,
            this.container_2
        );

        ReactDOM.render(<Link12 selected_computer={this.state.selected_computer} />, this.link_12);
    }

    handleSort(checked) {
        this.setState({ view2_sort: checked });
    }

    handleSortByDepth(checked) {
        this.setState({ view2_sortByDepth: checked });
    }

    handle_execution() {
        if (d3.select('#container_counts').size() !== 0) {
            ReactDOM.unmountComponentAtNode(document.getElementById('container_counts'));
        }

        if (!this.state.selected_circuit || !this.state.selected_computer) {
            alert('Please select a backend and circuit before RUN');
            return;
        }

        axios
            .post(`/api/execution_api_datafile/`, {
                backend: this.state.selected_computer,
                algo: this.state.view2_algo,
                circuit: this.state.all_circuits,
            })
            .then((res) => {
                const data = res['data'];
                ReactDOM.render(
                    <View_counts data={data} selected_circuit={this.state.selected_circuit} />,
                    this.container_counts
                );
            });
    }

    componentDidMount() {
        console.log('main mounted');
        this.container_1 = document.querySelector('#container_1');
        this.container_2 = document.querySelector('#container_2');
        this.link_12 = document.querySelector('#link12');
        this.container_counts = document.querySelector('#container_counts');

        let time_range = Number(document.getElementById('time_range').value) || 30;
        let interval = Number(document.getElementById('interval').value) || 7;

        // Render QuantumCircuit in place of View_1
        ReactDOM.render(
            <QuantumCircuit
                select_computer={this.select_computer}
                view1_attr={this.state.view1_attr}
                clear_state={this.clear_state}
                time_range={time_range}
                interval={interval}
            />,
            this.container_1
        );
    }

    render() {
        return (
            <Layout className="layout">
                <Header className="header" style={{ height: '42px' }}>
                    <span>
                        <DeploymentUnitOutlined style={{ fontSize: '1.6em', color: '#d8d8d8', margin: '10px 10px 0 0' }} />
                    </span>
                    <p className="header-title">QUIET</p>
                    <p className="paper-title">A Quality-Aware Visualization System for Noise Mitigation in Quantum Computing</p>
                </Header>
                <Content style={{ padding: '0 75px', backgroundColor: '#ffffff', marginTop: '10px' }}>
                    <div className="view">
                        <Row gutter={0} style={{ height: '100%' }}>
                            <Col className="gutter-row" span={19} style={{ height: '100%' }}>
                                <div style={{ background: '#fcfcfc', height: '100%' }}>
                                    <div id="container_1"></div>
                                    <div id="link12"></div>
                                    <div id="container_2"></div>
                                </div>
                            </Col>
                            <Col className="gutter-row control-panel" span={5} style={{ height: '100%' }}>
                                <div style={{ background: '#ffffff' }}>
                                    <Form className={'control-panel-form'} layout="horizontal">
                                        <Divider plain>
                                            <Text style={{ fontSize: '0.8em' }} strong>
                                                Computer Selection
                                            </Text>
                                        </Divider>
                                        <Form.Item label={'Time Range'}>
                                            <InputNumber id={'time_range'} defaultValue={10} min={3} max={90} step={1} controls={false} />
                                            <span style={{ marginLeft: '15px' }}>Interval: </span>
                                            <InputNumber
                                                style={{ width: '50px' }}
                                                id={'interval'}
                                                defaultValue={1}
                                                min={1}
                                                max={90}
                                                step={1}
                                                controls={false}
                                            />
                                        </Form.Item>
                                        <Form.Item label={'Quantum Algo.:'}>
                                            <Select
                                                className={'view2_algo'}
                                                defaultValue={this.state.view2_algo}
                                                onChange={(e) => this.setState({ view2_algo: e })}
                                                style={{ width: '150px' }}
                                            >
                                                <Select.Option value="two">Example Algorithm</Select.Option>
                                                <Select.Option value="QFT">QFT Algorithm</Select.Option>
                                                <Select.Option value="BV">Bernstein-Vazirani Algorithm</Select.Option>
                                                <Select.Option value="shor">Shor's Algorithm</Select.Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item label={'Compilation Times'}>
                                            <InputNumber id={'view2-button'} defaultValue={60} min={60} max={60} step={10} />
                                            <Button danger style={{ width: '120px', marginLeft: '10px' }} onClick={this.handle_View2_button}>
                                                Compile
                                            </Button>
                                        </Form.Item>
                                        <Divider plain>
                                            <Text style={{ fontSize: '0.8em' }} strong>
                                                Circuit Overview
                                            </Text>
                                        </Divider>
                                        <Form.Item label={'Sorting by attr.'}>
                                            <Switch onChange={this.handleSort} checked={this.state.view2_sort} />
                                            <span>Sorting by depth: </span>
                                            <Switch onChange={this.handleSortByDepth} checked={this.state.view2_sortByDepth} />
                                        </Form.Item>
                                        <Form.Item wrapperCol={{ offset: 2 }}>
                                            <Button danger style={{ width: '300px' }} onClick={this.handle_execution}>
                                                Run
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                    <div id="container_counts"></div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Content>
            </Layout>
        );
    }
}

export default App;
