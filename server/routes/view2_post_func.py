from random import randrange, uniform
from time import time
from qiskit import *
from functions.my_module_QC import ibmq_load_account
from functions.quantum_algos import Shors_algo, example_algo

def view2_post_func(trans_times, backend_name):


    # provider = ibmq_load_account()
    # backend = provider.get_backend(backend_name)
    #
    # shot = 1000
    #
    # # build a quantum circuit
    #
    # qc = Shors_algo()



    # 用来存放 transpiled circuit 的 list, 最后 execute 用的 e.g., {'trans_1': qc.class}
    trans_data = {}


############ 画图时注释掉下面的代码 ###########33333
#     for i in range(trans_times):
#         qc_comp = transpile(qc, backend=backend)
#         trans_data['trans_{}'.format(i)] = qc_comp
#
#     # {'trans_1': qc.class, 'trans_2': qc.class,}
#
#
#
#     # 用来生成画图用的数据
#     data = {}
#
#     for key, qc in trans_data.items():
#         obj = {}
#         obj['id'] = key
#         obj['depth'] = len(qc._data)
#         obj['qubits_quality'] = uniform(0, 10)
#         obj['gates_quality'] = uniform(0, 10)
#
#         # 下面生成每个qubit gate的数据
#         pass
#
#         data[key] = obj
#
# # data 举例：
# #         {
# #             "trans_0": {
# #                 "id": "trans_0",
# #                 "depth": 1648,
# #                 "qubits_quality": (7.689898855127465,),
# #                 "gates_quality": (8.777990411216695,),
# #
# #             }
# #         }
#
################################

    data = {
        "trans_0": {
            "id": "trans_0",
            "depth": 1648,
            "qubits_quality": round(uniform(0, 10),2),
            "gates_quality": round(uniform(0, 10),2),

            "qubits": {
                'q_0': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_1': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_2': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_3': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_4': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_5': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_6': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
            },
            "gates": {
                'cx0_1': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_0',
                    "target": 'q_1'
                },
                'cx1_2': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_1',
                    "target": 'q_2'
                },
                'cx1_3': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_1',
                    "target": 'q_3'
                },
                'cx3_5': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_3',
                    "target": 'q_5'
                },
                'cx4_5': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_4',
                    "target": 'q_5'
                },
                'cx5_6': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_5',
                    "target": 'q_6'
                },
                'sx':{
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": '',
                    "target": ''
                },
                'rz':{
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": '',
                    "target": ''
                }
            }
        },
        "trans_1": {
            "id": "trans_1",
            "depth": 1608,
            "qubits_quality": round(uniform(0, 10),2),
            "gates_quality": round(uniform(0, 10),2),

            "qubits": {
                'q_0': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_1': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_2': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_3': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_4': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_5': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_6': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
            },
            "gates": {
                'cx0_1': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_0',
                    "target": 'q_1'
                },
                'cx1_2': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_1',
                    "target": 'q_2'
                },
                'cx1_3': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_1',
                    "target": 'q_3'
                },
                'cx3_5': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_3',
                    "target": 'q_5'
                },
                'cx4_5': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_4',
                    "target": 'q_5'
                },
                'cx5_6': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_5',
                    "target": 'q_6'
                },
                'sx': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": '',
                    "target": ''
                },
                'rz': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": '',
                    "target": ''
                }
            }
        },
        "trans_2": {
            "id": "trans_2",
            "depth": 1699,
            "qubits_quality": round(uniform(0, 10),2),
            "gates_quality": round(uniform(0, 10),2),

            "qubits": {
                'q_0': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_1': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_2': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_3': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                },
                'q_4': {
                    "T1": randrange(50, 200),
                    "T2": randrange(50, 200),
                    "readout_error": uniform(0, 100),
                    "times": randrange(0, 400)
                }
            },
            "gates": {
                'cx0_1': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_0',
                    "target": 'q_1'
                },
                'cx1_2': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_1',
                    "target": 'q_2'
                },
                'cx1_3': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_1',
                    "target": 'q_3'
                },
                'cx3_5': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": 'q_3',
                    "target": 'q_5'
                },
                'sx': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": '',
                    "target": ''
                },
                'rz': {
                    "error_rate": uniform(0, 100),
                    "times": randrange(50, 200),
                    "source": '',
                    "target": ''
                }
            }
        }
    }



    # 左边返回的是用来响应 POST 请求的数据 画图用的， 右边的是编译得到的 circuit 数组, 最后 execute 用的
    return [data, trans_data]
    # return data