from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS

from functions.update_calidata import download_cali_data_to_latest

from routes.temporal_data import temporal_data_function



app = Flask(__name__)
CORS(app)

app.config['ENV'] = 'development' # 'production
app.config['DEBUG'] = True

# 配置数据库端口
mongodb_client = PyMongo(app, uri="mongodb://localhost:27017/QCVIS")
db = mongodb_client.db


# download_cali_data_to_latest()


@app.route('/')
def hello_world():
    return 'Hello World!'



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



@app.route('/temporal_data')
@app.route('/temporal_data/<string:backend>/<string:interval>')
def temporal_data(backend='ibmq_armonk', interval='1'): # 默认路由参数: interval：temporal view 的 时间间隔， 默认 1 天
    try:

        data = temporal_data_function(db, backend, interval)

        return 'success'

    except Exception as e:
        print(e)
        return 'error'


if __name__ == '__main__':
    app.run()
