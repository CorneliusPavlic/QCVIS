from qiskit import *
from datetime import datetime, timedelta
from functions.my_module_QC import ibmq_load_account
from functions.quantum_algos import Shors_algo, scaleable_Shors_algo, QFT, BV, two_qubit_algo
from qiskit.providers.ibmq.job.exceptions import IBMQJobApiError
from qiskit.quantum_info.analysis import hellinger_fidelity

from flask import Flask, request, session, jsonify, json
from flask_pymongo import PyMongo
import json
import random
import requests
import re
from pprint import pprint


############# view_1 数据

def download_view1_data(timerange=90,interval=1):

    backends = requests.get("https://api.quantum.ibm.com/api/users/backends").json()
    backends = [backend['name'] for backend in backends]
    # 配置数据库端口
    app = Flask(__name__)

    # final data
    data = {}

    # 根据时间区间生成时间数组
    day = datetime.today() # -1 天是因为当天的数据永远不存在，因为ibmq延时一天更新

    # fial date arr
    date_arr = ['{year}-{month}-{day}'.format(year=day.year, month=day.month, day=day.day)]

    while day >= datetime(2021, 7, 8):
        if day < datetime.today() - timedelta(days=timerange):
            break
        day = day - timedelta(days=int(interval))
        date_arr.append('{year}-{month}-{day}'.format(year=day.year, month=day.month, day=day.day))

    # 查找时的格式: '2022-1-11', 而不是 '2022-01-11'
    # date_arr = ['2021-10-10', '2021-10-11', '2021-10-12', '2021-10-13', '2021-10-14', '2021-10-15'] # TODO: 生成timeslicing的数组， 并且是01=>1, 并且使cx4_3 == cx3_4

    for backend in backends:
        # Fetch the calibration data for the backend
        alltime_calidata = requests.get(f"https://api.quantum.ibm.com/api/backends/{backend}/properties").json()

        calidata_arr = {}  # Reconstruct the response in the desired format

        # Check if alltime_calidata is a dictionary and contains 'qubits' and 'gates'
        if isinstance(alltime_calidata, dict):
            obj = {}
            obj['backend_name'] = alltime_calidata.get('backend_name', 'unknown')
            obj['qubits'] = []
            obj['gates'] = []

            # Process qubit data
            for qubit in alltime_calidata.get('qubits', []):
                qubit_data = [d for d in qubit if d['name'] in ['T1', 'T2', 'readout_error']]
                obj['qubits'].append(qubit_data)

            # Process gate data
            for gate in alltime_calidata.get('gates', []):
                if gate['gate'] == 'cz' or gate['gate'] == 'ecr':  # Check if the gate is 'cx'
                    gate['qubit_set'] = set(gate['qubits'])
                    obj['gates'].append(gate)

            # Use 'last_update_date' as a key if available
            last_update_date = alltime_calidata.get('last_update_date', 'unknown')
            calidata_arr[last_update_date] = obj

        # 将gate中的重复的值删掉 (cx4_5, cx5_4)
        for (key, value) in calidata_arr.items():
            gate_dup_arr = []
            new_gate_arr = []
            for gate in value['gates']:
                if gate['qubit_set'] not in gate_dup_arr:
                    gate_dup_arr.append(gate['qubit_set'])
                    new_gate_arr.append(gate)
            value['gates'] = new_gate_arr

        computer_arr = []
        backend_name = ''
        for (key, value) in calidata_arr.items():
            computer_arr.append({
                'timestamp': key,
                'gate': list(map(lambda obj: {
                    'computer_id': value['backend_name'],
                    'gate_name': obj['name'],
                    'source': 'q_{}'.format(obj['qubits'][0]),
                    'target': 'q_{}'.format(obj['qubits'][1]),
                    'error_rate': round(obj['parameters'][0]['value'], 4)
                }, value['gates'])),
                'qubit': list(map(lambda arr: {
                    'computer_id': value['backend_name'],
                    'qubit_id': 'q_{}'.format(arr[0]),
                    'T1': round(arr[1][0]['value'], 2) if arr[1][0]['name'] == 'T1' else 0,
                    'T2': round(arr[1][1]['value'], 2) if arr[1][1]['name'] == 'T2' else 0,
                    'error_rate': round(arr[1][2]['value'], 4) if arr[1][2]['name'] == 'readout_error' else 0.02,
                }
                                  , enumerate(value['qubits'])))
            })
            if not backend_name:
                backend_name = value['backend_name']

            data[backend_name] = computer_arr

    # print(data)
    with open('database/view1_data/data.json', 'w') as fp:
        json.dump(data, fp)
        fp.close()





    T1_arr = []
    T2_arr = []
    error_rate_arr = []

    ref_value = {
        'T1': 0,
        'T2': 0,
        'error_rate': 0,
    }

    # 计算 平均值
    for key, qcomputer in data.items():
        for date in qcomputer:
            for qubit in date['qubit']:
                T1_arr.append(qubit['T1'])
                T2_arr.append(qubit['T2'])
                error_rate_arr.append(qubit['error_rate'])

    ref_value['T1'] = cal_average(T1_arr)
    ref_value['T2'] = cal_average(T2_arr)
    ref_value['error_rate'] = cal_average(error_rate_arr)

    with open('database/view1_data/ref_value.json', 'w') as fp:
        json.dump(ref_value, fp)
        fp.close()



############# view_2 & 3数据
def download_view23_data():
    # backends = ['ibm_lagos', 'ibm_perth', 'ibmq_belem', 'ibmq_bogota', 'ibmq_jakarta', 'ibmq_lima', 'ibmq_manila',
    #             'ibmq_quito', 'ibmq_armonk', 'ibmq_santiago']
    backend5_names = ['ibmq_belem', 'ibmq_bogota', 'ibmq_lima', 'ibmq_manila', 'ibmq_quito']
    backend7_names = ['ibm_perth', 'ibmq_jakarta', 'ibm_lagos']
    algos = [QFT(), BV(), two_qubit_algo()]
    trans_times = 60

    backends = requests.get("https://api.quantum.ibm.com/api/users/backends").json()
    backends = [backend['name'] for backend in backends]
    
    for backend_name in backends:
        qc = BV()

        mappings = [[0,1], [1,2], [1,3], [3,5], [4,5], [5,6]]

        # 配置数据库端口
        app = Flask(__name__)
        mongodb_client = PyMongo(app, uri="mongodb://localhost:27017/QCVIS")
        db = mongodb_client.db

        query_data = {}

        with open('database/view1_data/data.json') as json_file:
            query_data = json.load(json_file)
            json_file.close()

        # 每种 qubit 的T1，T2， error rate的平均值是多少
        backend_data = query_data[backend_name]  # list

        # 这次写数据，不是算error rate的平均值了，而是直接算当前最新日期的 error rate (2022-3-5)
        backend_qubit_avg = {
            'T1': {},
            'T2': {},
            'error_rate': {}
        }

        for date in backend_data:
            for i, d in enumerate(date['qubit']):
                if 'q_{}'.format(i) not in backend_qubit_avg['T1']:
                    backend_qubit_avg['T1']['q_{}'.format(i)] = 0  # 看看有哪些qubit T1，并创建
                if 'q_{}'.format(i) not in backend_qubit_avg['T2']:
                    backend_qubit_avg['T2']['q_{}'.format(i)] = 0  # 看看有哪些qubit T2，并创建
                if 'q_{}'.format(i) not in backend_qubit_avg['error_rate']:
                    backend_qubit_avg['error_rate']['q_{}'.format(i)] = 0  # 看看有哪些qubit error_rate，并创建

        for attr in ['T1', 'T2', 'error_rate']:
            for qubit, _ in backend_qubit_avg[attr].items():
                i = int(qubit.split('_')[1])
                for date in backend_data:
                        backend_qubit_avg[attr][qubit] = date['qubit'][i][attr]

        # 每种 gate 的error rate的平均值是多少
        backend_gate_avg = {
            'error_rate': {}
        }

        for date in backend_data:
            for i, d in enumerate(date['gate']):
                if d['gate_name'] not in backend_gate_avg['error_rate']:
                    backend_gate_avg['error_rate'][d['gate_name']] = 0  # 看看有哪些 gate，并创建

        for gate, _ in backend_gate_avg['error_rate'].items():
            temp_arr = []
            for date in backend_data:
                    for _gate in date['gate']:
                        if _gate['gate_name'] == gate:
                            backend_gate_avg['error_rate'][gate] = _gate['error_rate']
        print(f"{backend_gate_avg} \n\n\n\n")
        backend = requests.get(f"https://api.quantum.ibm.com/api/backends/{backend_name}/properties").json()
        config = requests.get("https://api.quantum.ibm.com/api/users/backends").json()
        for conf in config:
            if conf['name'] == backend_name:
                backend["configuration"] = conf
                break
        shots = 1000

        # qc = scaleable_Shors_algo()

        # 用来存放 transpiled circuit 的 list, 最后 execute 用的 e.g., {'trans_1': qc.class}
        trans_data = {}
        circuit_data = {}

        for i in range(trans_times):
            qc_comp = transpile(qc , coupling_map=backend['configuration']["couplingMap"], basis_gates=backend['configuration']["basisGates"], optimization_level=3)
            trans_data['trans_{}'.format(i)] = qc_comp._data
            circuit_data['trans_{}'.format(i)] = qc_comp


        # 用来生成画图用的数据
        data = {}

        # 开始构造 data
        for trans_name, qc in trans_data.items():

            # 每种qubit被用了多少次
            # 每种 gate 被用了多少次
            # pprint(qc)

            qubit_count = {}
            gate_count = {}

            for inst in qc:
                if inst[0].name == 'cz' or inst[0].name == 'ecr':  # 先暂时只考虑 cx gate
                    q_src = inst[1][0].index
                    q_tgt = inst[1][1].index
                    gate = 'cx{}_{}'.format(q_src, q_tgt)

                    # 判断 q_src 在不在qubit_count 里
                    if q_src not in qubit_count:
                        qubit_count[q_src] = 1
                    else:
                        qubit_count[q_src] += 1

                    # 判断 q_tgt 在不在qubit_count 里
                    if q_tgt not in qubit_count:
                        qubit_count[q_tgt] = 1
                    else:
                        qubit_count[q_tgt] += 1

                    # # 判断 gate 在不在 gate_count 里
                    if gate in gate_count:
                        gate_count[gate] += 1
                    elif 'cx{}_{}'.format(q_tgt, q_src) in gate_count:
                        gate_count['cx{}_{}'.format(q_tgt, q_src)] += 1
                    else:
                        gate_count[gate] = 1

            # print(backend_qubit_avg)
            # print(backend_gate_avg)
            # print(qubit_count)
            # print(gate_count)

            # 准备好 均值 和 次数，开始构造 qubit 数组
            q = {}
            for name, times in qubit_count.items():
                name = 'q_{}'.format(name)
                q[name] = {
                    'times': times,
                    'T1': backend_qubit_avg['T1'][name],
                    'T2': backend_qubit_avg['T2'][name],
                    'error_rate': backend_qubit_avg['error_rate'][name],
                }

            # 准备好 均值 和 次数，开始构造 gate 数组
        g = {}
        for name, times in gate_count.items():
            numbers = list(map(int, re.findall(r'\d+', name)))
            source, target = numbers[0], numbers[1]
            error_rate = 0  # Default error rate if none is found
            
            # Try various gate formats for both source-target and target-source combinations
            possible_keys = [
                f'cx{source}_{target}', f'ecr{source}_{target}', f'cz{source}_{target}',
                f'cx{target}_{source}', f'ecr{target}_{source}', f'cz{target}_{source}'
            ]
            
            # Find the first available error rate from possible keys
            for key in possible_keys:
                if key in backend_gate_avg['error_rate']:
                    error_rate = backend_gate_avg['error_rate'][key]
                    break
            
            # Assign values to the output dictionary
            g[name] = {
                'times': times,
                'source': f'q_{source}',
                'target': f'q_{target}',
                'error_rate': error_rate
            }

            trans = {}
            trans['id'] = trans_name
            trans['depth'] = len(qc)
            trans['qubits_quality'] = cal_overall_qubit_quality(q)
            trans['gates_quality'] = cal_overall_gate_quality(g)
            trans['qubits'] = q
            trans['gates'] = g

            data[trans_name] = trans

        with open('database/view2_data/{}_BV.json'.format(backend_name), 'w') as fp:
            print('Saving /view2_data/{}_BV.json'.format(backend_name))
            json.dump(data, fp)
            print('Saving completed')
            fp.close()

        # 开始构造 ref_value ，用来计算每个transpile circuit的qubit quality和gate quality的均值
        ref_value = {}

        qubit_qual_arr = []
        gate_qual_arr = []

        for _, trans in data.items():
            qubit_qual_arr.append(trans['qubits_quality'])
            gate_qual_arr.append(trans['gates_quality'])

        ref_value['qubit_qual_avg'] = cal_average(qubit_qual_arr)
        ref_value['gate_qual_avg'] = cal_average(gate_qual_arr)

        # 开始计算每一个 qubit, gate 在所有compiled circuit中的平均使用次数
        qubit_times_arr = {}
        gate_times_arr = {}

        for _, trans in data.items():
            # qubit
            for qname, qubit in trans['qubits'].items():
                if qname not in qubit_times_arr:
                    qubit_times_arr[qname] = []
                    qubit_times_arr[qname].append(qubit['times'])
                else:
                    qubit_times_arr[qname].append(qubit['times'])
            # gate
            for gname, gate in trans['gates'].items():
                numbers = list(map(int, re.findall(r'\d+', gname)))
                src = int(numbers[0])
                tgt = int(numbers[1])

                if gname in gate_times_arr:
                    gate_times_arr[gname].append(gate['times'])
                elif 'cx{}_{}'.format(tgt, src) in gate_times_arr:
                    gate_times_arr['cx{}_{}'.format(tgt, src)].append(gate['times'])
                else:
                    gate_times_arr[gname] = []
                    gate_times_arr[gname].append(gate['times'])

        # 根据 gname 求平均数
        for gname, arr in gate_times_arr.items():
            gate_times_arr[gname] = cal_average(arr)

        # 根据 qname 求平均数
        for qname, arr in qubit_times_arr.items():
            qubit_times_arr[qname] = cal_average(arr)

        ref_value['qubit_times_avg'] = qubit_times_arr
        ref_value['gate_times_avg'] = gate_times_arr

        with open('database/view2_data/{}_BV_ref_value.json'.format(backend_name), 'w') as fp:
            print('Saving /view2_data/{}_BV_ref_value.json'.format(backend_name))
            json.dump(ref_value, fp)
            print('Saving completed')
            fp.close()

        #   存完了开始 execute 电路
        # pprint(circuit_data)
        # setup a simulator
        backend_sim = Aer.get_backend('qasm_simulator')
        #print(backend)

        #     返回的data
        data = {}

        qc_list = []
        for _, qc in circuit_data.items():
            qc_list.append(qc)

        job_sim = execute(qc, backend_sim, shots=shots)
        # print('distribution_sim', job_sim.result().get_counts())

        try:
            print('Executing.')
            job = execute(qc_list, backend_sim, shots=shots)
            print('distribution', job.result().get_counts())
        except IBMQJobApiError as ex:
            print("Something wrong happened!: {}".format(ex))

        circuit = []
        for name, _ in circuit_data.items():
            circuit.append(name)

        data = {}
        for i, circuit_name in enumerate(circuit):
            fidelity = hellinger_fidelity(job.result().get_counts()[i], job_sim.result().get_counts())
            # print(fidelity)
            draw_data = merge_result_counts(job_sim.result().get_counts(), job.result().get_counts()[i])
            data[circuit_name] = {
                'fidelity': fidelity,
                'draw_data': draw_data
            }

        # print(data)
        with open('database/view3_data/{}_BV.json'.format(backend_name), 'w') as fp:
            print('Saving {}_BV.json'.format(backend_name))
            json.dump(data, fp)
            print('Completed')
            fp.close()


# 内部函数，用来计算一个数组的均值
def cal_average(num):
    sum_num = 0
    for t in num:
        sum_num = sum_num + t

    if len(num) != 0:
        avg = sum_num / len(num)
    else:
        avg = 0
    return round(avg, 6)


# 内部函数，计算一个 circuit 的 overall qubit quality
def cal_overall_qubit_quality(q):
    num = 0
    summary = []
    for _, qubit in q.items():
        num += qubit['times']
        summary.append(qubit['error_rate'] * qubit['times'])

    if num != 0 and sum(summary)!=0:
        overall_qubit_qual = 1/(sum(summary)/num)
    else:
        overall_qubit_qual = 0

    return overall_qubit_qual

# 内部函数，计算一个 circuit 的 overall gate quality
def cal_overall_gate_quality(g):
    num = 0
    summary = []
    for _, gate in g.items():
        num += gate['times']
        summary.append(gate['error_rate'] * gate['times'])

    if num != 0 and sum(summary) != 0:
        overall_gate_qual = 1/(sum(summary)/num)
    else:
        overall_gate_qual = 0

    return overall_gate_qual

# 内部函数
def merge_result_counts(c1, c2):

    key_arr = list(set(list(c1.keys()) + list(c2.keys())))

    merge_dict = {}

    for key in key_arr:
        merge_dict[key] = []
        for d in (c1, c2):
            if key not in d:
                merge_dict[key].append(0)
            else:
                merge_dict[key].append(d[key])

    return merge_dict

#download_view23_data()

if __name__ == '__main__':
    download_view1_data()
    download_view23_data()
    
    print('Data downloaded successfully')