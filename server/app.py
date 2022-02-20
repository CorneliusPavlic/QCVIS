from flask import Flask, request, session
from flask_pymongo import PyMongo
from flask_cors import CORS

import os

from functions.update_calidata import download_cali_data_to_latest

from routes.view1_api_func import temporal_data_function
from routes.view2_post_func import view2_post_func


app = Flask(__name__)
CORS(app)

app.config['ENV'] = 'development' # 'production
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = os.urandom(24)

# 配置数据库端口
mongodb_client = PyMongo(app, uri="mongodb://localhost:27017/QCVIS")
db = mongodb_client.db


# download_cali_data_to_latest()





@app.route('/add_one')
def hello():
    try:
        # db.test.insert_one({'_id':0,'title': "todo title", 'body': "todo body"})
        return 'hello'
    except:
        return 'error'



@app.route('/find')
def find():
    try:
        return [i for i in db.ibm_lagos.find()][0]

    except Exception as e:
        print(e)
        return 'error'

query_data = []

@app.route('/view1_api/')
@app.route('/view1_api/<int:timerange>/<int:interval>/<string:backends>') # e.g., localhost:5000/view1_api/1/ibm_lagos&ibmq_jakarta
def view1_api(timerange=30, interval=1, backends='ibm_lagos'):
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
        # return 'success'

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

            api_data = result[0]
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



@app.route('/')
def hello_world():
    return api_data


if __name__ == '__main__':
    app.run()





# class Shoe():
#     """ Creates a new shoe object from which cards are dealt
#     to the player and the dealer.
#
#     Input arguments:
#     decks :: the number of decks the player wishes to play with.
#     """
#
#     def __init__(self, decks=1):
#         self.cards_in_shoe = {}
#         self.total_cards = decks * 52
#
#
#     def get_random_card(self):
#
#         pass
#
#     def remaining_cards_in_shoe(self):
#         """ Returns the total number of cards remaining to be
#         drawn for both player and dealer.
#         """
#         return sum(len(v) for v in self.cards_in_shoe.itervalues())
#
# shoe = Shoe()
#
# print(shoe)
#
# session['name'] = shoe
#
# print(session.get('name'))