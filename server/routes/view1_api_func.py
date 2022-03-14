# define the function when call '/temporal_data' route
# 2 parameters required:
#   backend: e.g.: "ibm_perth" # indicate which device to get data
#   interval: e.g.: 7 # indicate the date interval (timeslicing)

from pprint import pprint
from flask import request
from datetime import datetime, timedelta


def temporal_data_function(db, backends, interval, timerange):
    '''

    :param db: 传入的db对象，用来查找item
    :param backends: 用来储存所请求的backend对象
    :param interval: 要观察的时间区间，e.g., 7 => every 7 days
    :return: 最终要传入React的数据
    '''

    # final data
    data = {}


    if (not backends):
        print("no 'backend' parameter passed")
        return 'Err' # fix this, add a default json data

    if (not interval):
        print("no 'interval' parameter passed")
        return 'Err'# fix this, add a default json data

    # 根据时间区间生成时间数组
    day = datetime.today() - timedelta(days=1) # -1 天是因为当天的数据永远不存在，因为ibmq延时一天更新

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
        alltime_calidata = db[backend].find({'last_update_date': {'$in': date_arr}},
                                            {'_id': 0, 'backend_name': 1, 'last_update_date': 1, 'qubits': 1,
                                             "gates": 1})

        calidata_arr = {}  # 重构所有查找的返回结果，格式化
        for i, item in enumerate(alltime_calidata):
            obj = {}
            obj['backend_name'] = item['backend_name'] or 'unknown'
            obj['qubits'] = []
            obj['gates'] = []
            for d in item['qubits']:
                d = [d_ for d_ in d if d_['name'] in ['T1', 'T2', 'readout_error']] or []
                obj['qubits'].append(d)
            for d in item['gates']:
                if d['gate'] in ['cx']:
                    d['qubit_set'] = set(d['qubits'])
                    obj['gates'].append(d)

            calidata_arr[item['last_update_date']] = obj

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


    T1_arr = []
    T2_arr = []
    error_rate_arr = []

    ref_value={
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


    return [data, ref_value]


# 内部函数，用来计算一个数组的均值
def cal_average(num):
    sum_num = 0
    for t in num:
        sum_num = sum_num + t

    avg = sum_num / len(num)
    return round(avg, 6)



