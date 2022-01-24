import axios from 'axios'
import * as d3 from 'd3'
import params from './preset_param'

const scales = {
    'view1':{
        'ibm_lagos':{
            'T1': d3.scalePow()
                .exponent(0.6)
                .domain([0,100])
                .range([0, params.view1_qubitMaxRadius])
        },
        'ibm_perth':{
            'T1': d3.scalePow()
                .exponent(0.6)
                .domain([0,100])
                .range([0, params.view1_qubitMaxRadius])
        },
        'ibmq_belem':{
            'T1': d3.scalePow()
                .exponent(0.6)
                .domain([0,100])
                .range([0, params.view1_qubitMaxRadius])
        },
        'ibmq_bogota':{
            'T1': d3.scalePow()
                .exponent(0.6)
                .domain([0,100])
                .range([0, params.view1_qubitMaxRadius])
        },
        'ibmq_casablanca':{
            'T1': d3.scalePow()
                .exponent(0.6)
                .domain([0,100])
                .range([0, params.view1_qubitMaxRadius])
        },
        'ibmq_jakarta':{
            'T1': d3.scalePow()
                .exponent(0.6)
                .domain([0,100])
                .range([0, params.view1_qubitMaxRadius])
        },
        'ibmq_lima':{
            'T1': d3.scalePow()
                .exponent(0.6)
                .domain([0,100])
                .range([0, params.view1_qubitMaxRadius])
        },
        'ibmq_manila':{
            'T1': d3.scalePow()
                .exponent(0.6)
                .domain([0,100])
                .range([0, params.view1_qubitMaxRadius])
        },
        'ibmq_quito':{
            'T1': d3.scalePow()
                .exponent(0.6)
                .domain([0,100])
                .range([0, params.view1_qubitMaxRadius])
        },
        'ibmq_santiago':{
            'T1': d3.scalePow()
                .exponent(0.6)
                .domain([0,100])
                .range([0, params.view1_qubitMaxRadius])
        },
        'ibmq_armonk':{
            'T1': d3.scalePow()
                .exponent(0.6)
                .domain([0,100])
                .range([0, params.view1_qubitMaxRadius])
        },
    }
}




export default scales