import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Layout, Row, Col, InputNumber, Divider, Form, Button, Select, Switch, Typography } from 'antd';
import { DeploymentUnitOutlined } from '@ant-design/icons';
import axios from 'axios';

import './App.css';
import QuantumCircuit from './Components/newView'; // Replace with correct import path for QuantumCircuit
import TransDataView from './Components/TransDataView';

const { Header, Content } = Layout;
const { Text } = Typography;

const App = () => {
    const [selectedComputer, setSelectedComputer] = useState('ibm_brisbane');
    const [view1Attr, setView1Attr] = useState('error_rate');
    const [view2Algo, setView2Algo] = useState('shor');
    const [viewToggle, setViewToggle] = useState(true); // Toggle between QuantumCircuit and TransDataView
    const container1Ref = useRef(null);

    const handleView2Button = () => {
        if (!selectedComputer) {
            alert('Please indicate the quantum computer');
            return;
        }
        ReactDOM.unmountComponentAtNode(container1Ref.current);
        ReactDOM.render(
            <TransDataView backendName={selectedComputer} />,
            container1Ref.current
        );
    };

    useEffect(() => {
        console.log('main mounted');
        container1Ref.current = document.querySelector('#container_1');

        const timeRange = Number(document.getElementById('time_range')?.value) || 30;
        const interval = Number(document.getElementById('interval')?.value) || 7;

        ReactDOM.render(
            <QuantumCircuit
                select_computer={setSelectedComputer}
                backend={selectedComputer}
                view1_attr={view1Attr}
                clear_state={() => {}}
                time_range={timeRange}
                interval={interval}
            />,
            container1Ref.current
        );
    }, []);

    return (
        <Layout className="layout">
            <Header className="header" style={{ height: '42px' }}>
                <DeploymentUnitOutlined style={{ fontSize: '1.6em', color: '#d8d8d8', margin: '10px 10px 0 0' }} />
                <p className="header-title">QUIET</p>
                <p className="paper-title">A Quality-Aware Visualization System for Noise Mitigation in Quantum Computing</p>
            </Header>
            <Content style={{ padding: '0 5px', backgroundColor: '#ffffff', marginTop: '10px' }}>
                <div className="view">
                    <Row gutter={0} style={{ height: '100%' }}>
                        <Col className="gutter-row" span={19} style={{ height: '100%' }}>
                            <div style={{ background: '#fcfcfc', height: '100%' }}>
                                <div id="container_1"></div>
                            </div>
                        </Col>
                            <div style={{ background: '#ffffff' }}>
                            Switch between QuantumCircuit and TransDataView
                            <Switch
                                checked={viewToggle}
                                onChange={(checked) => {
                                    setViewToggle(checked);
                                    ReactDOM.unmountComponentAtNode(container1Ref.current);
                                    if (checked) {
                                        ReactDOM.render(
                                            <QuantumCircuit
                                                select_computer={setSelectedComputer}
                                                view1_attr={view1Attr}
                                                clear_state={() => {}}
                                                time_range={30}
                                                backend={selectedComputer}
                                                interval={7}
                                            />,
                                            container1Ref.current
                                        );
                                    } else {
                                        ReactDOM.render(
                                            <TransDataView backendName={selectedComputer} />,
                                            container1Ref.current
                                        );
                                    }
                                }}
                            />
                            </div>
                    </Row>
                </div>
            </Content>
        </Layout>
    );
};

export default App;
