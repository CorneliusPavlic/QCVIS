from qiskit import *
from datetime import datetime
from qiskit.providers.jobstatus import JobStatus
from qiskit.providers.ibmq.job.exceptions import IBMQJobApiError
from qiskit.quantum_info.analysis import hellinger_fidelity

from pprint import pprint

def execution_func(_backend, circuit, transpiled_data):


    # seed_transpiler = None
    # seed = 1234

    # 在view2中已经load过account，所以直接省去 load_account()
    provider = IBMQ.get_provider(hub='ibm-q-research')


    # setup a simulator
    backend_sim = Aer.get_backend('aer_simulator')

    backend = provider.get_backend(_backend)


    # 返回的 data
    data = {}

    qc_list = []
    for circuit_name in circuit:
        #qc
        qc = transpiled_data[circuit_name]
        qc_list.append(qc)
        # pprint(qc._data)
        # pprint(len(qc._data))


    job_sim = execute(qc_list, backend_sim, shots=1000)
    print('distribution_sim', job_sim.result().get_counts())


    try:
        print('Executing.'.format(circuit_name))
        job = execute(qc_list, backend, shots=1000)
        print('time taken', job.result().time_taken)
        print('distribution', job.result().get_counts())
    except IBMQJobApiError as ex:
        print("Something wrong happened!: {}".format(ex))


    data = {}
    for i, circuit_name in enumerate(circuit):
        fidelity = hellinger_fidelity(job.result().get_counts()[i], job_sim.result().get_counts()[i])
        print(fidelity)
        draw_data = merge_result_counts(job_sim.result().get_counts()[i], job.result().get_counts()[i])
        data[circuit_name] = {
            'fidelity': fidelity,
            'draw_data': draw_data
        }


    return data




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