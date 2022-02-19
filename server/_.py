
import qiskit
from qiskit import IBMQ
from datetime import datetime

print(sum([1,2,3,4,5]))
exit()

print('hello'[1])
exit()

for a, b in enumerate([10, 20, 30]):
    print(a, b)

exit()

if 'nam' in {"name":'shaolun'}:
    print(1)

exit()

def mapfunc(i):
    return i[0]
arr = [1,2,4,6]
print(list(map(mapfunc, enumerate(arr))))
exit()


obj1 = {'name':'s'}
obj2 = {'name':'l'}
list = [obj1, obj2]
list.remove(obj1)
print(list)
exit()

print('yes' if set([1,2]) in [set([2,1]), set([3,4])] else 'no')

exit()

obj = {'name': 'shaolun', "age": 12}

for (k,v) in obj.items():
    print(k,v)

exit()

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