from SimSet import parse_combinations_from_file, SimSet
from SimPlot import plot
import random
import uuid
import copy
import pickle

def load_fr_combinations(filename):
    with open(filename, 'rb') as file:
        return pickle.load(file)


def print_subset(entry):
    t = {u: v for u, v in entry.items() if u in ['name', 'mean', 'mean_error', 'iterations']}
    print(t)

def print_data(data):
    for f in range(len(data)):
        for r in range(len(data[f])):
            print_subset(data[f][r])

def sims():
    combinations_1 = [parse_combinations_from_file(filename, SimSet.fixed_match) for filename in files]
    test = SimSet(run_sims=False)
    # test = SimSet()
    test.run_sims(uuid_1, combinations_1)
    data = test.collate_data()
    data = sum(data, [])
    transpose = {}
    [[transpose.setdefault(k, []).append(v) for k, v in u.items()] for u in data]
    fr_combinations = load_fr_combinations('cache/zzzzzzzzzzzzzzz/1/fr_combinations')
    for k in data:
        transpose.setdefault('random', []).append(random.random())
        transpose.setdefault('data', []).append(next((x['data'] for x in fr_combinations if x['name'] == k['name'])))
    # for k, v in transpose.items():
    #     print(k)
    #     for t in v:
    #         print(t)
    # print(uuid_1)
    # print_data(data)
    # plot(data[0])
    plot(transpose)

# uuid_1 = str(uuid.uuid4())

class SimParse:
    def __init__(self, uuids, files):
        self.data = []
        self.deltas = []
        self.uuids = uuids
        self.files = files
        self.sim_sets = [SimSet(run_sims=False) for _ in self.uuids]
        for sim, uuid in zip(self.sim_sets, self.uuids):
            combinations = [parse_combinations_from_file(filename, SimSet.fixed_match) for filename in self.files]
            sim.run_sims(uuid, combinations)
            self.data.append(sim.collate_data())
            print(uuid)
            print_data(self.data[-1:][0])
        # TODO: rework this for n>2 revisions
        for f_combination_u in self.data[0]:
            for fr_combination_u in f_combination_u:
                for f_combination_v in self.data[1]:
                    for fr_combination_v in f_combination_v:
                        if fr_combination_u['name'] == fr_combination_v['name']:
                            a = [copy.deepcopy(fr_combination_u), copy.deepcopy(fr_combination_v)]
                            self.deltas.append({'name': fr_combination_u['name'],
                                                'delta': fr_combination_v['mean'] - fr_combination_u['mean'],
                                                'data': a})



selector = 0
uuid_1 = 'zzzzzzzzzzzzzzz'
files = ['fixed.simc', 'talents.simc']
sims()
# # combinations_1 = [parse_combinations_from_file(filename, SimSet.fixed_match) for filename in files]
# # test = SimSet(run_sims=False)
# # # test = SimSet()
# # test.run_sims(uuid_1, combinations_1)
# # data = test.collate_data()
# # print(uuid_1)
# # print_data(data)


# uuid_1 = '280f9be9-45ec-45b3-aa0f-75fdf3441555'
# sims()

files = ['fixed.simc', 'talents.simc']
uuid_s = ['afc0ef8b-5a3e-4d2c-a320-4923e3eec676', '280f9be9-45ec-45b3-aa0f-75fdf3441555']

# uuid_1 = uuid_s[0]
# uuid_1 = uuid_s[1]
# sims()

# q = SimParse(uuid_s, files)
# for e in q.deltas:
#     print({k:v for k,v in e.items() if k in ['name', 'delta']})
#     print(list({k:v for k,v in u.items() if k in ['mean', 'mean_error', 'iterations']} for u in e['data']))


# sort pair deltas max to min
# remove things near mean_error?
# categorize each delta based on a single common talent
# sort categories based on fraction of total entries within a category is measurably +/- from pair
