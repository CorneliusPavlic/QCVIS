# define the function when call '/temporal_data' route
# 2 parameters required:
#   backend: e.g.: "ibm_perth" # indicate which device to get data
#   interval: e.g.: 7 # indicate the date interval (timeslicing)

from pprint import pprint


def temporal_data_function(db, backend, interval):

    if (not backend):
        print("no 'backend' parameter passed")
        return 'Err' # fix this, add a default json data

    if (not interval):
        print("no 'interval' parameter passed")
        return 'Err'# fix this, add a default json data

    # 查找时的格式: '2022-1-11', 而不是 '2022-01-11'
    date_arr = ['2021-10-10', '2021-10-11'] # TODO: 生成timeslicing的数组， 并且是01=>1, 并且使cx4_3 == cx3_4

    alltime_calidata = db[backend].find({'last_update_date': {'$in': date_arr}}, {'_id':0, 'backend_name': 1, 'last_update_date': 1, 'qubits': 1, "gates": 1})

    calidata_arr = {} # 重构所有查找的返回结果，格式化
    for i,item in enumerate(alltime_calidata):
        obj = {}
        obj['backend_name'] = item['backend_name']
        obj['qubits'] = []
        obj['gates'] = []
        for d in item['qubits']:
            d = [d_ for d_ in d if d_['name'] in ['T1', 'T2', 'readout_error']] or []
            obj['qubits'].append(d)
        for d in item['gates']:
            if d['gate'] in ['cx']:
                obj['gates'].append(d)


        calidata_arr[item['last_update_date']] = obj

    pprint(calidata_arr)


    # return 'default'









# {'2021-10-10': {'backend_name': 'ibm_lagos',


#                 'gates': [{'gate': 'cx',
#                            'name': 'cx5_4',
#                            'parameters': [{'date': '2021-10-10',
#                                            'name': 'gate_error',
#                                            'unit': '',
#                                            'value': 0.005223420684094232},
#                                           {'date': '2021-10-7',
#                                            'name': 'gate_length',
#                                            'unit': 'ns',
#                                            'value': 327.1111111111111}],
#                            'qubits': [5, 4]},

#                           {'gate': 'cx',
#                            'name': 'cx4_5',
#                            'parameters': [{'date': '2021-10-10',
#                                            'name': 'gate_error',
#                                            'unit': '',
#                                            'value': 0.005223420684094232},
#                                           {'date': '2021-10-7',
#                                            'name': 'gate_length',
#                                            'unit': 'ns',
#                                            'value': 362.66666666666663}],
#                            'qubits': [4, 5]},

#                           {'gate': 'cx',
#                            'name': 'cx3_1',
#                            'parameters': [{'date': '2021-10-10',
#                                            'name': 'gate_error',
#                                            'unit': '',
#                                            'value': 0.00707366382954866},
#                                           {'date': '2021-10-7',
#                                            'name': 'gate_length',
#                                            'unit': 'ns',
#                                            'value': 298.66666666666663}],
#                            'qubits': [3, 1]},

#                           {'gate': 'cx',
#                            'name': 'cx1_3',
#                            'parameters': [{'date': '2021-10-10',
#                                            'name': 'gate_error',
#                                            'unit': '',
#                                            'value': 0.00707366382954866},
#                                           {'date': '2021-10-7',
#                                            'name': 'gate_length',
#                                            'unit': 'ns',
#                                            'value': 334.22222222222223}],
#                            'qubits': [1, 3]},

#                           {'gate': 'cx',
#                            'name': 'cx5_6',
#                            'parameters': [{'date': '2021-10-10',
#                                            'name': 'gate_error',
#                                            'unit': '',
#                                            'value': 0.006031152424555236},
#                                           {'date': '2021-10-7',
#                                            'name': 'gate_length',
#                                            'unit': 'ns',
#                                            'value': 256}],
#                            'qubits': [5, 6]}],


#                 'qubits': [[{'date': '2021-10-10',
#                              'name': 'T1',
#                              'unit': 'us',
#                              'value': 140.18198898231785},
#                             {'date': '2021-10-10',
#                              'name': 'T2',
#                              'unit': 'us',
#                              'value': 35.884458559832865},
#                             {'date': '2021-10-10',
#                              'name': 'readout_error',
#                              'unit': '',
#                              'value': 0.019600000000000062}],

#                            [{'date': '2021-10-10',
#                              'name': 'T1',
#                              'unit': 'us',
#                              'value': 83.30849920573898},
#                             {'date': '2021-10-10',
#                              'name': 'T2',
#                              'unit': 'us',
#                              'value': 123.80916926316486},
#                             {'date': '2021-10-10',
#                              'name': 'readout_error',
#                              'unit': '',
#                              'value': 0.01200000000000001}]]},

# '2021-10-10': {'backend_name': 'ibm_lagos',


#                 'gates': [{'gate': 'cx',
#                            'name': 'cx5_4',
#                            'parameters': [{'date': '2021-10-10',
#                                            'name': 'gate_error',
#                                            'unit': '',
#                                            'value': 0.005223420684094232},
#                                           {'date': '2021-10-7',
#                                            'name': 'gate_length',
#                                            'unit': 'ns',
#                                            'value': 327.1111111111111}],
#                            'qubits': [5, 4]},

#                           {'gate': 'cx',
#                            'name': 'cx4_5',
#                            'parameters': [{'date': '2021-10-10',
#                                            'name': 'gate_error',
#                                            'unit': '',
#                                            'value': 0.005223420684094232},
#                                           {'date': '2021-10-7',
#                                            'name': 'gate_length',
#                                            'unit': 'ns',
#                                            'value': 362.66666666666663}],
#                            'qubits': [4, 5]},

#                           {'gate': 'cx',
#                            'name': 'cx3_1',
#                            'parameters': [{'date': '2021-10-10',
#                                            'name': 'gate_error',
#                                            'unit': '',
#                                            'value': 0.00707366382954866},
#                                           {'date': '2021-10-7',
#                                            'name': 'gate_length',
#                                            'unit': 'ns',
#                                            'value': 298.66666666666663}],
#                            'qubits': [3, 1]},

#                           {'gate': 'cx',
#                            'name': 'cx1_3',
#                            'parameters': [{'date': '2021-10-10',
#                                            'name': 'gate_error',
#                                            'unit': '',
#                                            'value': 0.00707366382954866},
#                                           {'date': '2021-10-7',
#                                            'name': 'gate_length',
#                                            'unit': 'ns',
#                                            'value': 334.22222222222223}],
#                            'qubits': [1, 3]},

#                           {'gate': 'cx',
#                            'name': 'cx5_6',
#                            'parameters': [{'date': '2021-10-10',
#                                            'name': 'gate_error',
#                                            'unit': '',
#                                            'value': 0.006031152424555236},
#                                           {'date': '2021-10-7',
#                                            'name': 'gate_length',
#                                            'unit': 'ns',
#                                            'value': 256}],
#                            'qubits': [5, 6]}],


#                 'qubits': [[{'date': '2021-10-10',
#                              'name': 'T1',
#                              'unit': 'us',
#                              'value': 140.18198898231785},
#                             {'date': '2021-10-10',
#                              'name': 'T2',
#                              'unit': 'us',
#                              'value': 35.884458559832865},
#                             {'date': '2021-10-10',
#                              'name': 'readout_error',
#                              'unit': '',
#                              'value': 0.019600000000000062}],

#                            [{'date': '2021-10-10',
#                              'name': 'T1',
#                              'unit': 'us',
#                              'value': 83.30849920573898},
#                             {'date': '2021-10-10',
#                              'name': 'T2',
#                              'unit': 'us',
#                              'value': 123.80916926316486},
#                             {'date': '2021-10-10',
#                              'name': 'readout_error',
#                              'unit': '',
#                              'value': 0.01200000000000001}]]}