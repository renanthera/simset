import subprocess
import json
import shutil
import os
import copy
import re
import itertools
import pickle

def parse_combinations_from_list(lst, search, t):
    data = []
    packet = {'data': data, 'type': t, 'prefix': None}
    cmpl = re.compile(search, re.MULTILINE)
    for entry in lst:
        matches = re.findall(cmpl, entry)
        if matches:
            for match in matches:
                if packet['prefix'] is None:
                    packet['prefix'] = match[0]
                if match[1] not in data:
                    data.append(match[1])
    return packet

class Sim:

    def __init__(self, apl_components, sim_components):
        self.apl_components = copy.deepcopy(apl_components)
        self.sim_components = copy.deepcopy(sim_components)

        self.header = []
        self.combinations = []
        self.profilesets = []

        self.generate_header()
        self.generate_combinations()
        self.generate_profilesets()
        if self.sim_components['parameters']['run_sims']:
            self.write_sim()

    def generate_header(self):
        pattern = re.compile('^([^\s#=])+', re.MULTILINE)
        self.header = [entry for string in self.apl_components['strings'] for entry in string if entry != '']

        # replace apl parameters with value from dict. if parameter doesn't exist in apl, append
        used = []
        for line_number in range(len(self.header)):
            substr = pattern.match(self.header[line_number])
            for parameter in self.apl_components['parameters'].keys():
                if substr and substr.group() == parameter:
                    self.header[line_number] = parameter + '=' + str(self.apl_components['parameters'][parameter])
                    used.append(parameter)
            self.header[line_number] += '\n'
        for key, value in self.apl_components['parameters'].items():
            if key not in used:
                self.header.append(key + '=' + str(value) + '\n')

    # generate f .. f combinations as f'
    # maintain this list, as it is used when ranking, as selection is made from each f' combination
    # generate f' r .. r combinations
    # do not maintain this list, as these get sorted within a single f' combination
    def generate_combinations(self):
        self.combinations = []
        self.f_combinations = []
        self.r_combinations = []
        self.fr_combinations = []

        f_prime = [[lst['prefix'] + '=' + entry for entry in lst['data']] for lst in self.apl_components['combinations'] if lst['type'] == 'f']
        f_combinations = list(itertools.product(*f_prime))
        for index in range(len(f_combinations)):
            self.f_combinations.append({'name': str(index), 'data': f_combinations[index]})

        r_prime = [[lst['prefix'] + '=' + entry for entry in lst['data']] for lst in self.apl_components['combinations'] if lst['type'] == 'r']
        r_combinations = list(itertools.product(*r_prime))
        for index in range(len(r_combinations)):
            self.r_combinations.append({'name': str(index), 'data': r_combinations[index]})

        fr_combinations = list(itertools.product(*[self.f_combinations, self.r_combinations]))
        for e in fr_combinations:
            self.fr_combinations.append({'name':'-'.join([v['name'] for v in e]), 'data': list(itertools.chain(*[v['data'] for v in e]))})

    def generate_profilesets(self):
        self.profilesets = []
        for entry in self.fr_combinations:
            name = 'profileset.' + str(entry['name']) + '+='
            string = '\n'.join([name + value for value in entry['data']]) + '\n'
            self.profilesets.append(string)

    def write_sim(self):
        file_path = self.sim_components['parameters']['file_path']
        os.makedirs(file_path, exist_ok=True)
        with open(file_path + 'simulation.simc', 'w+') as file:
            file.writelines(self.header)
            file.writelines(self.profilesets)
        with open(file_path + 'f_combinations', 'wb') as file:
            pickle.dump(self.f_combinations, file)
        with open(file_path + 'r_combinations', 'wb') as file:
            pickle.dump(self.r_combinations, file)
        with open(file_path + 'fr_combinations', 'wb') as file:
            pickle.dump(self.fr_combinations, file)
        with open(self.sim_components['parameters']['uuid_index'], 'a+') as file:
            file.write(self.sim_components['parameters']['uuid'] + '\n')
        for v in self.sim_components['files_to_copy']:
            shutil.copy(v, file_path)

    # TODO: rework json parser
    def parse_json(self):
        data = [[] for _ in range(len(self.f_combinations))]
        with open(self.sim_components['parameters']['file_path'] + 'output.json') as file:
            contents = json.load(file)
        for entry in contents['sim']['profilesets']['results']:
            f_index = int(entry['name'].split('-')[0])
            data[f_index].append(entry)
        for d in range(len(data)):
            data[d].sort(key = lambda e: e['mean'], reverse=True)
        return data

    # TODO: rework json parser
    def compute_maximums(self, data):
        m = [{} for _ in range(len(self.f_combinations))]
        for f_index in range(len(data)):
            for entry in data[f_index]:
                if m[f_index] == {}:
                    m[f_index] = copy.deepcopy(entry)
                else:
                    for key in entry.keys():
                        m[f_index][key] = max(m[f_index][key], entry[key])
        return m

    def extract_profilesets(self):
        data = self.parse_json()
        maximums = self.compute_maximums(data)
        r = []
        r_test = []
        for f_index in range(len(data)):
            for entry in data[f_index]:
                if entry['mean'] >= maximums[f_index]['mean'] - maximums[f_index]['mean_error'] * 2:
                    r_index = int(entry['name'].split('-')[1])
                    if self.r_combinations[r_index]['data'] not in r_test:
                        r_test.append(self.r_combinations[r_index]['data'])
                        r.append(*self.r_combinations[r_index]['data'])
        return parse_combinations_from_list(r, '^(?![#])([^=]*)=(.*)$', 'r')

    def run_sim(self):
        subprocess.run(['./simc', self.sim_components['parameters']['file_path'] + 'simulation.simc'])
