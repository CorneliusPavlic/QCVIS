from flask import Flask, request
from flask_pymongo import PyMongo
from flask_cors import CORS

from functions.update_calidata import download_cali_data_to_latest

from routes.view1_api_func import temporal_data_function
from routes.view2_api_func import view2_api_func
from routes.view2_post_func import view2_post_func



app = Flask(__name__)
CORS(app)

app.config['ENV'] = 'development' # 'production
app.config['DEBUG'] = True

# 配置数据库端口
mongodb_client = PyMongo(app, uri="mongodb://localhost:27017/QCVIS")
db = mongodb_client.db


# download_cali_data_to_latest()


# @app.route('/')
# def hello_world():
#     return 'Hello World!'



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



@app.route('/view1_api/')
@app.route('/view1_api/<int:timerange>/<int:interval>/<string:backends>') # e.g., localhost:5000/view1_api/1/ibm_lagos&ibmq_jakarta
def view1_api(timerange=30, interval=1, backends='ibm_lagos'): # 默认路由参数: interval：temporal view 的 时间间隔， 默认 1 天
    try:

        # get all backends from url
        # backends = [value for (key, value) in {**request.args}.items()] # 获取所有backend
        backends = backends.split('&')

        data = temporal_data_function(db, backends, interval, timerange)

        return data
        # return 'success'

    except Exception as e:
        print(e)
        return 'error'


@app.route('/view2_api/', methods = ['GET', 'POST'])
@app.route('/view2_api/<int:trans_times>/', methods = ['GET', 'POST'])
def view2_api(trans_times=10):
    try:
        if request.method == "POST":
            trans_times = request.get_json()['trans_times']
            view2_post_func(trans_times)

        data = view2_api_func(db, trans_times)

        # return data
        return 'success'

    except Exception as e:
        print(e)
        return 'error'





if __name__ == '__main__':
    app.run()

