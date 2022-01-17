from qiskit import *
from qiskit.visualization import plot_circuit_layout
import json
from datetime import datetime
from pprint import pprint

# #########################################
# A library for quantum computing development with Qiskit.
# Build date: 11/07/2021
# #########################################

# ######### Index ##########
# ibmq_load_account()
# get_backend_names()
# iterate_all_list_obj()
# get_dates()
# get_physical_qubit_mapping()['vqubit_to_phyqubit_mapping']
# get_physical_qubit_mapping()['instruction_and_qubit_data']
# get_physical_qubit_mapping()['text_figure']

def ibmq_load_account(hub_name='ibm-q-research'):
    '''
    # load 'ibm-q-research' account and return a provider
    :param hub_name:
    :return:
    '''
    IBMQ.load_account()
    provider = IBMQ.get_provider(hub=hub_name)

    return provider



def get_backend_names(provider, not_simulator=True):
    '''
    return all names of available backends (Default: not including simulator)
    :param provider:
    :param not_simulator: True
    :return: all names of available backends
    '''
    backends = []
    if not_simulator:
        backends = provider.backends(filters=lambda x: not x.configuration().simulator)
    else:
        backends = provider.backends()
    backend_names = [item.name() for item in backends]
    backend_configuration = [item.configuration().to_dict() for item in backends]

    return backend_names



def iterate_all_list_obj(student):
    '''
    iterate all leaf node value of a dict or list, mainly to process backend.properties()
    :param student:
    :return:
    '''
    # if not isinstance(student, list):
    #     raise ValueError("shaolun: Object is not a list instance")
    if isinstance(student, dict):
        for i,d in student.items():
            if isinstance(d, (dict,list)):
                iterate_all_list_obj(d)
            else:
                # Here for processing function
                if isinstance(d, datetime):
                    student[i] = "{year}-{month}-{day}".format(year=d.year, month=d.month, day=d.day)
    if isinstance(student, list):
        for i,d in enumerate(student):
            if isinstance(d, (dict,list)):
                iterate_all_list_obj(d)
            else:
                # Here for processing function
                if isinstance(d, datetime):
                    student[i] = "{year}-{month}-{day}".format(year=d.year, month=d.month, day=d.day)
    return student


####################################


def get_dates(sdate, edate):
    '''
    get every day's datetime between 2 dates, including the end-datetime, return datetime date
    :param sdate: starting date
    :param edate: end date
    :return: datetime date list
    '''
    from datetime import datetime, timedelta, date
    sdate = date(sdate[0], sdate[1], sdate[2])
    edate = date(edate[0], edate[1], edate[2])
    delta = edate - sdate

    days = [sdate + timedelta(days=i) for i in range(delta.days + 1)]

    return days

################################

def get_physical_qubit_mapping(qc, backend, optim_level, save_fig=False):
    '''
    Return a dict for virtual qubits: physical qubits
    :param qc: QuantumCircuit
    :param backend: backend name
    :param optim_level: 0-4, note that 0,1 is in a q_i -> Q_i manner
    :param save_fig: None, if need save the physical or virtual layout mapping figure
    :return:    data['vqubit_to_phyqubit_mapping'] = mapping,
                data['instruction_and_qubit_data'] = instruction_data,
                data['text_figure'] = physical circuit figure in text.
    '''
    if qc==None or backend==None or optim_level==None:
        raise ValueError('shaolun: missing parameter')

    qc_comp = transpile(qc, backend=backend, optimization_level=optim_level)

    # qc_comp._layout get qubit mapping (virtual -> physical)
    layout = qc_comp._layout
    physical_layout = layout.get_physical_bits()
    mapping = dict((v, k) for k, v in physical_layout.items())

    # qu_comp._data: get the tuple consists of instruction and physical qubit
    instruction_data = qc_comp._data

    # qc_comp.draw(): get the text figure
    text_figure = qc_comp.draw()

    data = {}

    data['vqubit_to_phyqubit_mapping'] = mapping
    data['instruction_and_qubit_data'] = instruction_data
    data['text_figure'] = text_figure

    if save_fig:
        for view in ['physical','virtual']:
            plot_circuit_layout(qc_comp, backend, view=view).savefig(
                '/home/shaolun2/PYTHON/qiskit/fig/transpile/{backend}_{view}_O{level}.jpg'
                    .format(backend=backend, view=view, level=optim_level))

    return data
