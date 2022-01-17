import qiskit
from qiskit import IBMQ
from datetime import datetime

obj = {'name': 'shaolun', "age": 12}
ele = obj.pop('ae', None)
print(obj)
exit()

print(datetime.today().year)
exit()

print((2021,8,25) if 'ibm_erth' == 'ibm_perth' else (2021,7,7))
exit()

if([item['name'] for item in [{"age":12}]]):
    print('kong')
else:
    print('you')
exit()

print(datetime.now().hour, datetime.now().minute)

exit()

for i in []:
    print(i)

str = 'abcdefg'
print(str[:-3])
# exit()

# print("Import Successful")

# IBMQ.save_account("ed5414db4e4c40cb23ed88635d48fc4b7b1eb9b91429ff60c8d43e5bff498ee6cfb8b69bbe8e5cc0bdc897456c48f4783f80b1263e22f2cce0137d8aecb0ee7a",overwrite=True)
IBMQ.load_account()
provider = IBMQ.get_provider(hub='ibm-q-research')
print(provider)