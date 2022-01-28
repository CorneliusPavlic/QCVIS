from random import randrange, uniform
from time import time
from qiskit import *
from functions.my_module_QC import ibmq_load_account
from functions.quantum_algos import Shors_algo, example_algo

def view2_post_func(trans_times, backend_name):


    provider = ibmq_load_account()
    backend = provider.get_backend(backend_name)

    shot = 1000

    # build a quantum circuit

    qc = Shors_algo()



    # 用来存放 transpiled circuit 的 list
    trans_arr = []

    time1 = time()
    for _ in range(trans_times):
        qc_comp = transpile(qc, backend=backend)
        trans_arr.append(qc_comp)

    time2 = time()
    duration = time2 - time1
    print(duration)

    data = {}

    # 用来搭建前端的假数据
    for d in range(trans_times):
        data["trans_{}".format(d)] = {
            "times": d,
            "depth": randrange(500, 600),
            "qubits_quality": uniform(0, 10),
            "gates_quality": uniform(0, 10),
        }


    # 左边返回的是用来响应POST请求的数据， 右边的是编译得到的 circuit 数组
    return [data, trans_arr]
    # return data