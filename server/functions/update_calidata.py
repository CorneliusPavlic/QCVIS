# Download the caliration data automatically
# download will launch when run the `app.py`

from datetime import datetime, date, timedelta
import pymongo
import os

from functions.my_module_QC import ibmq_load_account, iterate_all_list_obj, get_backend_names, get_dates



def download_cali_data_to_latest():

    provider = ibmq_load_account()
    backend_names = get_backend_names(provider)

    my_client = pymongo.MongoClient("mongodb://localhost:27017/")
    my_db = my_client["QCVIS"]

    # backend_name_list = ['ibmq_armonk', 'ibmq_santiago', 'ibmq_bogota', 'ibmq_casablanca', 'ibmq_lima', 'ibmq_belem', 'ibmq_quito', 'ibmq_jakarta', 'ibmq_manila', 'ibm_lagos', 'ibm_perth']

    if len(backend_names) == 0:
        print("no backends to use")
        return

    # backend_name = backend_names[0] # 'ibmq_armonk'
    for backend_name in backend_names:
    # for backend_name in ['ibm_lagos']:

        my_collection = my_db[backend_name]

        backend = provider.get_backend(backend_name)

        # date_list = [item['download_date'] for item in my_collection.find({}, {"_id":0, "download_date":1})]
        arr_tem = [item for item in my_collection.find({}, {"_id":0, "download_date":1})]

        # if the list is empty, no record exists
        if len(arr_tem) == 0:
            print('{} no calibration data found\ndownloading...'.format(backend_name))
            start_date = (2021,8,25) if backend_name == 'ibm_perth' else (2021,7,8)
            cur_date = (datetime.today().year, datetime.today().month, datetime.today().day)
            for date_ in get_dates(start_date, cur_date):
                property = backend.properties(
                    datetime=datetime(year=date_.year, month=date_.month, day=date_.day)).to_dict()
                property = iterate_all_list_obj(property)
                property['_id'] = backend_name + '_' + '{year}-{month}-{day}'.format(year=date_.year, month=date_.month, day=date_.day)
                property['download_date'] = '{year}-{month}-{day}'.format(year=date_.today().year,
                                                                          month=date_.today().month,
                                                                          day=date_.today().day)
                x = my_collection.insert_one(property)
                print('{} successfully download'.format(x.inserted_id))


        # if the list is not empty, just update to the latest
        else:
            date_list = [item['download_date'] for item in arr_tem]

            for i, date_str in enumerate(date_list):
                date_list[i] = datetime.strptime(date_str, "%Y-%m-%d")

            oldest_date = max(date_list)
            # oldest_date += timedelta(days=1)
            oldest_date = oldest_date.date()  # 因为qiskit的性能数据延迟一天，比如：12日下载的是11日的数据
            cur_date = date.today()
            delta = cur_date - oldest_date  # N days
            if delta.days == 0:
                print('{} calibration data up-to-date'.format(backend_name))
            else:
                print("---{} downloading...---".format(backend_name))
                # print(cur_date, oldest_date, delta)
                date_arr = []
                # print('old', oldest_date)
                for i in range(delta.days + 1):
                    day = oldest_date + timedelta(days=i)
                    date_arr.append(day)
                date_arr = date_arr[1:]  # date_arr to download

                # date_str = date_arr[0]
                for date_str in date_arr:
                    # property = backend.properties(datetime = datetime(year=2022, month=1, day=13)).to_dict()
                    property = backend.properties(
                        datetime=datetime(year=date_str.year, month=date_str.month, day=date_str.day)).to_dict()
                    property = iterate_all_list_obj(property)  # convert all datatime to string for file saving

                    property['_id'] = backend_name + '_' + '{year}-{month}-{day}'.format(year=date_str.year,
                                                                              month=date_str.month,
                                                                              day=date_str.day)
                    property['download_date'] = '{year}-{month}-{day}'.format(year=date.today().year,
                                                                              month=date.today().month,
                                                                              day=date.today().day)
                    x = my_collection.insert_one(property)
                    print('{} successfully download'.format(x.inserted_id))

    # print('calibration data up-to-date')

