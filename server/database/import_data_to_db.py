
# 已废弃，已将功能加到temporal_data.py 函数中，不再读取本地数据文件，而是直接下载IBMQ数据

import pymongo
import os
import json
from datetime import datetime, date




folder = "D:/Research/My_Research/QCVIS/Data/IBMQ_calibration_data/"
subfolder_list = ['ibmq_armonk', 'ibmq_santiago', 'ibmq_bogota', 'ibmq_casablanca', 'ibmq_lima', 'ibmq_belem', 'ibmq_quito', 'ibmq_jakarta', 'ibmq_manila', 'ibm_lagos', 'ibm_perth']

my_client = pymongo.MongoClient("mongodb://localhost:27017/")
my_db = my_client["QCVIS"]

# subfolder = "ibm_lagos/"
# file = "2021-07-07.json"

for subfolder in subfolder_list:

    my_collection = my_db[subfolder]
    file_list = os.listdir(folder+subfolder)

    # read file
    for file in file_list:
        with open(folder + subfolder + "/" + file, 'r') as myfile:
            data = myfile.read()
            myfile.close()


        # parse file
        obj = json.loads(data)
        obj['_id'] = subfolder + '_' + file[:-5]
        obj['download_date'] = '2022-1-12'
        # obj['download_date'] = '{year}-{month}-{day}'.format(year=date.today().year, month=date.today().month, day=date.today().day)
        # exit()

        x = my_collection.insert_one(obj)
        print(file, x.inserted_id)



# for _ in range(3):
#     mydict = { "_id":str(_)+"123", "name": "John", "address": "Highway 37" }
#     x = my_collection.insert_one(mydict)
#     print(x.inserted_id)

