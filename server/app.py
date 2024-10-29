from flask import Flask, request, session, jsonify, json
from flask_pymongo import PyMongo
from flask_cors import CORS
import os
import json
from datetime import datetime, timedelta
import requests
from functions.update_calidata import download_cali_data_to_latest

from routes.view1_api_func import temporal_data_function
from routes.view2_post_func import view2_post_func
from routes.execution_func import execution_func


app = Flask(__name__)
CORS(app)

app.config['ENV'] = 'development' # 'production
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = os.urandom(24)

# 配置数据库端口
mongodb_client = PyMongo(app, uri="mongodb://localhost:27017/QCVIS")
db = mongodb_client.db


# download_cali_data_to_latest()

@app.route('/')
def root():
    try:
        # db.test.insert_one({'_id':0,'title': "todo title", 'body': "todo body"})
        return 'hello'
    except:
        return 'error'

@app.route('/add_one')
def hello():
    try:
        # db.test.insert_one({'_id':0,'title': "todo title", 'body': "todo body"})
        return 'hello'
    except:
        return 'error'

@app.route('/pending_jobs')
def get_pending_jobs():
    try:
        response = requests.get('https://api.quantum.ibm.com/api/users/backends')
        print({backend.get('name'): backend.get('queueLength', 1) for backend in response.json()})
        return {backend.get('name'): backend.get('queueLength', 1) for backend in response.json()}
    except requests.RequestException as e:
        print(f"Error fetching backends: {e}")
        return None
    
@app.route('/find')
def find():
    try:
        return [i for i in db.ibm_lagos.find()][0]

    except Exception as e:
        print(e)
        return 'error'

query_data = []


@app.route('/view1_api/<int:timerange>/<int:interval>/<string:backends>') # e.g., localhost:5000/view1_api/1/ibm_lagos&ibmq_jakarta
def view1_api(timerange=30, interval=7, backends='ibm_lagos'):
    # 默认路由参数: interval：temporal view 的 时间间隔， 默认 1 天

    global query_data
    try:

        # get all backends from url
        # backends = [value for (key, value) in {**request.args}.items()] # 获取所有backend
        backends = backends.split('&')

        result = temporal_data_function(db, backends, interval, timerange)

        data = {
            'data': result[0],
            'ref_value': result[1]
        }

        query_data = data # 将查找所得的数据传给query_data，用来在view_2中的计算attr的均值提供数据源


        return data



    except Exception as e:
        print(e)
        return 'error'



api_data = 'apiData_TBD'
transpiled_data = 'transData_TBD'

@app.route('/view2_api/', methods = ['GET', 'POST'])
def view2_api():
    try:
        global transpiled_data, api_data

        if request.method == 'POST':
            if not request.data:
                print('No request body found')
                return 'No request body found'

            # 获取请求体 Request Body
            algo = request.get_json()['view2_algo'] or 'shor'
            trans_times = request.get_json()['trans_times'] or 10
            backend_name = request.get_json()['backend_name'] or 'ibmq_jakarta' # 如果没有指定，默认用 ibmq_jakarta 来执行


            result = view2_post_func(algo, trans_times, backend_name, query_data)

            api_data = {
                'data': result[0],
                'ref_value': result[2]
            }
            transpiled_data = result[1]

    
            return api_data


        if request.method == 'GET':


            # 这种情况是已经 通过post请求修改了transpiled_data, 所以类型不再是‘transData_TBD’的 str, 所以可以开始处理而生成 View 3
            if not isinstance(transpiled_data, str):

                return api_data

            # 没有修改 api_data 的情况，直接返回原始数值 ‘api_data_TBD’
            return api_data



    except Exception as e:
        print(e)
        return 'error'



@app.route('/execution_api/', methods=['GET', 'POST'])
def execution_api():
    try:
        global transpiled_data, api_data

        if request.method == 'POST':

            backend = request.get_json()['backend'] or 'ibm_perth'
            circuit = request.get_json()['circuit'] or [['trans_0']]

            if(isinstance(transpiled_data, str)):
                print('Not transpiled yet')
                return

            result = execution_func(backend, circuit, transpiled_data)

            return result

        if request.method == 'GET':


            return 'success'


    except Exception as e:
        print(e)
        return 'error'




@app.route('/view1_api_datafile/<int:timerange>/<int:interval>/')
def view1_api_datafile(timerange=30, interval=7):
    # 默认路由参数: interval：temporal view 的 时间间隔， 默认 1 天
    print("hello")

    global query_data
    try:

        data = {}

        with open('database/view1_data/data.json') as json_file:
            data['data'] = json.load(json_file)
            json_file.close()

        with open('database/view1_data/ref_value.json') as json_file:
            data['ref_value'] = json.load(json_file)
            json_file.close()

        # 生成过滤数组 
        day = datetime(2024, 10, 23) # -1 天是因为当天的数据永远不存在，因为ibmq延时一天更新

        # fial date arr
        date_arr = ['{year}-{month}-{day}'.format(year=day.year, month=day.month, day=day.day)]

        while day >= datetime(2021, 7, 8):
            if day < datetime(2024, 10, 23) - timedelta(days=timerange):
                break
            day = day - timedelta(days=int(interval))
            date_arr.append('{year}-{month}-{day}'.format(year=day.year, month=day.month, day=day.day))

        print(date_arr)

        for computer_name, arr in data['data'].items():
            new_arr = []
            for i, date_data in enumerate(arr):
                timestamp_date = date_data['timestamp'].split('T')[0]
                if timestamp_date in date_arr:
                    new_arr.append(date_data)
            data['data'][computer_name] = new_arr


        query_data = data['data']
        print(data)
        return data



    except Exception as e:
        print(e)
        return 'error'



@app.route('/view2_api_datafile/', methods = ['GET', 'POST'])
def view2_api_datafile():
    try:
        global transpiled_data, api_data

        if request.method == 'POST':
            if not request.data:
                print('No request body found')
                return 'No request body found'

            # 获取请求体 Request Body
            algo = request.get_json()['view2_algo'] or 'shor'
            trans_times = request.get_json()['trans_times'] or 10
            backend_name = request.get_json()['backend_name'] or 'ibmq_jakarta'  # 如果没有指定，默认用 ibmq_jakarta 来执行

            data = {}
            with open('database/view2_data/{}_{}.json'.format(backend_name, algo)) as json_file:
                data['data'] = json.load(json_file)
                json_file.close()

            with open('database/view2_data/{}_{}_ref_value.json'.format(backend_name, algo)) as json_file:
                data['ref_value'] = json.load(json_file)
                json_file.close()


            return data


    except Exception as e:
        print(e)




@app.route('/execution_api_datafile/', methods=['GET', 'POST'])
def execution_api_datafile():
    try:
        global transpiled_data, api_data

        if request.method == 'POST':

            backend = request.get_json()['backend'] or 'ibm_perth'
            algo = request.get_json()['algo'] or 'shor'
            circuits = request.get_json()['circuit'] or [['trans_0']]


            data = {}
            with open('database/view3_data/{}_{}.json'.format(backend, algo)) as json_file:
                data = json.load(json_file)
                json_file.close()

            for key in list(data.keys()):
                if key not in circuits:
                    data.pop(key)


            return data

        if request.method == 'GET':


            return 'success'


    except Exception as e:
        print(e)
        return 'error'



if __name__ == '__main__':
    app.run(port=5000)





