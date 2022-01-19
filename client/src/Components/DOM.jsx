/*
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
        <title>Title</title>
</head>
<body>
<div id="view"></div>
</body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.3.0/d3.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.25.0/axios.min.js"></script>
<script>

    const data =
    {
        'Q_0': [
    {
        'timestamp': 1000,
        'qubit': [
    {
        'qubit_id': 'q_0',
        'T1': 125
    },
    {
        'qubit_id': 'q_1',
        'T1': 110
    },
    {
        'qubit_id': 'q_2',
        'T1': 164
    },
    {
        'qubit_id': 'q_3',
        'T1': 135
    },
    {
        'qubit_id': 'q_4',
        'T1': 120
    },
        ],
        'gate': [
    {
        'source': 'q_0',
        'target': 'q_1',
        'error_rate': 0.024
    }
        ]
    },
    {
        'timestamp': 1100,
        'qubit': [
    {
        'qubit_id': 'q_0',
        'T1': 164
    },
    {
        'qubit_id': 'q_1',
        'T1': 100
    },
    {
        'qubit_id': 'q_2',
        'T1': 137
    },
    {
        'qubit_id': 'q_3',
        'T1': 125
    },
    {
        'qubit_id': 'q_4',
        'T1': 120
    },
        ],
        'gate': [
    {
        'source': 'q_0',
        'target': 'q_1',
        'error_rate': 0.024
    }
        ]
    },
    {
        'timestamp': 1200,
        'qubit': [
    {
        'qubit_id': 'q_0',
        'T1': 127
    },
    {
        'qubit_id': 'q_1',
        'T1': 132
    },
    {
        'qubit_id': 'q_2',
        'T1': 160
    },
    {
        'qubit_id': 'q_3',
        'T1': 123
    },
    {
        'qubit_id': 'q_4',
        'T1': 145
    },
        ],
        'gate': [
    {
        'source': 'q_0',
        'target': 'q_1',
        'error_rate': 0.024
    }
        ]
    },
    {
        'timestamp': 1300,
        'qubit': [
    {
        'qubit_id': 'q_0',
        'T1': 125
    },
    {
        'qubit_id': 'q_1',
        'T1': 110
    },
    {
        'qubit_id': 'q_2',
        'T1': 164
    },
    {
        'qubit_id': 'q_3',
        'T1': 135
    },
    {
        'qubit_id': 'q_4',
        'T1': 120
    },
        ],
        'gate': [
    {
        'source': 'q_0',
        'target': 'q_1',
        'error_rate': 0.024
    }
        ]
    },
    {
        'timestamp': 1400,
        'qubit': [
    {
        'qubit_id': 'q_0',
        'T1': 164
    },
    {
        'qubit_id': 'q_1',
        'T1': 100
    },
    {
        'qubit_id': 'q_2',
        'T1': 137
    },
    {
        'qubit_id': 'q_3',
        'T1': 125
    },
    {
        'qubit_id': 'q_4',
        'T1': 120
    },
        ],
        'gate': [
    {
        'source': 'q_0',
        'target': 'q_1',
        'error_rate': 0.024
    }
        ]
    }
        ],
        'Q_1': [
    {
        'timestamp': 1000,
        'qubit': [
    {
        'qubit_id': 'q_0',
        'T1': 125
    },
    {
        'qubit_id': 'q_1',
        'T1': 110
    },
    {
        'qubit_id': 'q_2',
        'T1': 164
    },
    {
        'qubit_id': 'q_3',
        'T1': 135
    },
    {
        'qubit_id': 'q_4',
        'T1': 120
    },
        ],
        'gate': [
    {
        'source': 'q_0',
        'target': 'q_1',
        'error_rate': 0.024
    }
        ]
    },
    {
        'timestamp': 1100,
        'qubit': [
    {
        'qubit_id': 'q_0',
        'T1': 164
    },
    {
        'qubit_id': 'q_1',
        'T1': 100
    },
    {
        'qubit_id': 'q_2',
        'T1': 137
    },
    {
        'qubit_id': 'q_3',
        'T1': 125
    },
    {
        'qubit_id': 'q_4',
        'T1': 120
    },
        ],
        'gate': [
    {
        'source': 'q_0',
        'target': 'q_1',
        'error_rate': 0.024
    }
        ]
    },
    {
        'timestamp': 1200,
        'qubit': [
    {
        'qubit_id': 'q_0',
        'T1': 127
    },
    {
        'qubit_id': 'q_1',
        'T1': 132
    },
    {
        'qubit_id': 'q_2',
        'T1': 160
    },
    {
        'qubit_id': 'q_3',
        'T1': 123
    },
    {
        'qubit_id': 'q_4',
        'T1': 145
    },
        ],
        'gate': [
    {
        'source': 'q_0',
        'target': 'q_1',
        'error_rate': 0.024
    }
        ]
    },
    {
        'timestamp': 1300,
        'qubit': [
    {
        'qubit_id': 'q_0',
        'T1': 125
    },
    {
        'qubit_id': 'q_1',
        'T1': 110
    },
    {
        'qubit_id': 'q_2',
        'T1': 164
    },
    {
        'qubit_id': 'q_3',
        'T1': 135
    },
    {
        'qubit_id': 'q_4',
        'T1': 120
    },
        ],
        'gate': [
    {
        'source': 'q_0',
        'target': 'q_1',
        'error_rate': 0.024
    }
        ]
    },
    {
        'timestamp': 1400,
        'qubit': [
    {
        'qubit_id': 'q_0',
        'T1': 164
    },
    {
        'qubit_id': 'q_1',
        'T1': 100
    },
    {
        'qubit_id': 'q_2',
        'T1': 137
    },
    {
        'qubit_id': 'q_3',
        'T1': 125
    },
    {
        'qubit_id': 'q_4',
        'T1': 120
    },
        ],
        'gate': [
    {
        'source': 'q_0',
        'target': 'q_1',
        'error_rate': 0.024
    }
        ]
    },
    {
        'timestamp': 1500,
        'qubit': [
    {
        'qubit_id': 'q_0',
        'T1': 127
    },
    {
        'qubit_id': 'q_1',
        'T1': 132
    },
    {
        'qubit_id': 'q_2',
        'T1': 160
    },
    {
        'qubit_id': 'q_3',
        'T1': 123
    },
    {
        'qubit_id': 'q_4',
        'T1': 145
    },
        ],
        'gate': [
    {
        'source': 'q_0',
        'target': 'q_1',
        'error_rate': 0.024
    }
        ]
    },
        ]
    }

    const ref_value = 130

    const attr = 'T1'

    /!*size for View 1*!/
    const view1_computer_height = 130
    const view1_computer_width= 500
    const view1_computer_timestamp_width = 80
    const view1_qubitMaxRadius = 9
    const view1_qubitHeight = 100

    const view1_padding_top = 20, view1_padding_bottom = 40, view1_padding_left = 40, view1_padding_right = 10
    const view1_qubit_padding_top = 15, view1_qubit_padding_left = 20

    const theta = 1

    let svg = d3.select('#view')
    .append('svg')
    .attr('width', 600)
    .attr('height', 600)


    let view1 = svg.append('g')
    .attr('class', 'view1')
    .attr('transform', `translate(0,0)`)


    /!*!* 先画qubit对齐线, 因为在最下面 *!/
    let computer_qubit_ref_line_data = Object.values(data).map(d=>{return d[0]['qubit'].length}).map(d=>{return d3.range(d)})

    let ref_line = view1.selectAll('g')
    .data(computer_qubit_ref_line_data)
    .join('g')
    .attr('class', 'ref_line')
    .attr('transform', (d,i)=>`translate(0,${i*view1_computer_height*theta})`)

    ref_line.selectAll('line')
    .data(d=>d)

    .style('stroke', '#a3e1e8')
    .style('stroke-width', 1)
    .attr('class', 'circuit_ref_line')
    .attr('x1', view1_padding_left)
    .attr('x2', view1_padding_left + view1_computer_width)
    .attr('y1', view1_padding_top + view1_qubit_padding_top + 2*view1_qubitMaxRadius*theta)
    .attr('y2', view1_padding_top + view1_qubit_padding_top + 2*view1_qubitMaxRadius*theta)



    /!*    let qcomputer = view1.selectAll('g')
    .data(Object.values(data))
    .join('g')
    .attr('class', d=>`${d}`)
    .attr('transform', (d,i)=>`translate(0,${i*view1_computer_height*theta})`)


    qcomputer.selectAll('g')
    .data(d=>d)
    .join('g')
    .attr('transform', (_d,_i)=>`translate(${view1_padding_left + _i*view1_computer_timestamp_width*theta},${view1_padding_top*theta})`)


    let data_k_v = Object.entries(data)

    let qubit_max_num = d3.max(data_k_v.map(d=>{return d[1][0]['qubit'].length}))*!/


    /!*    /!* 先画qubit对齐线, 因为在最下面 *!/!*!/
    /!*    for (let _ in d3.range(qubit_max_num)){

    qcomputer.append('line')
        .style('stroke', '#a3e1e8')
        .style('stroke-width', 1)
        .each(d=>{console.log(d)})
        .attr('class', 'circuit_ref_line')
        .attr('x1', view1_padding_left)
        .attr('x2', view1_padding_left + view1_computer_width)
        .attr('y1', view1_padding_top + view1_qubit_padding_top + 2*view1_qubitMaxRadius*theta)
        .attr('y2', view1_padding_top + view1_qubit_padding_top + 2*view1_qubitMaxRadius*theta)

}*!/



    /!*
    let qcomputer = view1.selectAll('g')
    .data(Object.keys(data))
    .join('g')
    .attr('class', d=>`${d}`)
    .attr('transform', (d,i)=>`translate(0,${i*view1_computer_height*theta})`)

    qcomputer.each(function(d,i){
    d3.select(this)
        .selectAll('g')
        .data(data[d])
        .join('g')
        .attr('class', _d=>`${d}-${_d['timestamp']}`)
        .attr('transform', (_d,_i)=>`translate(${view1_padding_left + _i*view1_computer_timestamp_width*theta},${view1_padding_top*theta})`)
})
    *!/



    /!*    let data_k_v = Object.entries(data)

    let qubit_max_num = d3.max(data_k_v.map(d=>{return d[1][0]['qubit'].length}))


    /!* 先画qubit对齐线, 因为在最下面 *!/
    for (let _ in d3.range(qubit_max_num)){

    qcomputer.append('line')
        .style('stroke', '#a3e1e8')
        .style('stroke-width', 1)
        .attr('class', 'circuit_ref_line')
        .attr('x1', view1_padding_left)
        .attr('x2', view1_padding_left + view1_computer_width)
        .attr('y1', view1_padding_top + view1_qubit_padding_top + _*2*view1_qubitMaxRadius*theta)
        .attr('y2', view1_padding_top + view1_qubit_padding_top + _*2*view1_qubitMaxRadius*theta)


}


    for (let index in data_k_v){

    let computer_id = data_k_v[index][0]


    for (let timestamp of data_k_v[index][1]){

    /!*画串糖葫芦的线*!/
    d3.select(`.${computer_id}-${timestamp['timestamp']}`)
    .append('line')
    .style('stroke', '#d9d9d9')
    .style('stroke-width', 2)
    .attr('x1', view1_qubit_padding_left*theta)
    .attr('x2', view1_qubit_padding_left*theta)
    .attr('y1', 0)
    .attr('y2', view1_qubitHeight*theta)

    /!*画qubit的糖葫芦*!/
    d3.select(`.${computer_id}-${timestamp['timestamp']}`)
    // .each(d=>{console.log(d)})
    .selectAll('circle')
    .data(d=>{return d['qubit'].map(_d=>{return {'computer':computer_id, 'timestamp': timestamp['timestamp'], ..._d}})})
    .join('circle')
    // .each(d=>{console.log(d)})
    .attr('cx', view1_qubit_padding_left*theta)
    .attr('cy', (d,i)=>view1_qubit_padding_top + i*2*view1_qubitMaxRadius*theta)
    .attr('r', d=>d['T1']*0.04*theta)
    .attr('fill', d=>d['T1']>=ref_value? '#90ce90':'#e18c8f')


}

}*!/





    /!*    svg.append('circle')
    .attr('class', 'Q_0')
    .node()
    .classList
    .add('q_1')*!/





    // console.log(d3.selectAll(`.q_1`).node())








</script>
<style>
    .circuit_ref_line{
    z-index: 0
}
</style>
</html>


/!*!/!*!/!*!/!*!/!*!/!*!/!*!/!*!/!*!/!*!/!**!/!*!/!*!/!*!/!*!/!*!/!*!/!*!/!*!/!*!/!*!/!*!/
*/
