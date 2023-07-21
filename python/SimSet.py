#!/bin/python
import re

from Sim import Sim

def parse_strings_from_file(filename, search):
    data = []
    with open(filename) as file:
        contents = file.read()
    matches = re.findall(search, contents, re.MULTILINE)
    if matches:
        for match in matches:
            if match not in data:
                data.append(match)
    return data

def parse_combinations_from_file(filename, search):
    data = []
    packet = {'data': data, 'type': None, 'prefix': None}
    with open(filename) as file:
        contents = file.read()
    matches = re.findall(search, contents, re.MULTILINE)
    if matches:
        if matches[0][0] == 'type':
            packet['type'] = str(matches[0][1])
        for match in matches[1:]:
            if packet['prefix'] is None:
                packet['prefix'] = match[0]
            if match[1] not in data:
                data.append(match[1])
    return packet

class SimSet:

    apl_header_match = '^(?![\s#]|\$\(name\)|html).*$'
    apl_match        = '^(?![\s#]|\$\(name\)|html).*$'
    fixed_match      = '^(?![#])([^=]*)=(.*)$'
    talents_match    = '^(?![\s#]).*talents=(.*)$'
    write_dir = 'cache/'
    uuid_index = 'uuid-index'

    def __init__(self, run_sims=True):
        self.sims = []
        self.compute = run_sims
        self.sim_iter = iter(self.sims)

    def create_sim(self, uuid, combinations, target_error):
        index = str(len(self.sims) + 1)

        sim_components = {
            'files_to_copy': [
                'brm.simc',
                'apl.simc',
                'fixed.simc',
                'talents.simc'
            ],
            'parameters': {
                'uuid': uuid,
                'index': index,
                'file_path': self.write_dir + uuid + '/' + index + '/',
                'uuid_index': self.write_dir + self.uuid_index,
                'run_sims': self.compute
            }
        }
        apl_components = {
            'strings': [
                  parse_strings_from_file('brm.simc', self.apl_header_match),
                  parse_strings_from_file('apl.simc', self.apl_match)
            ],
            'combinations': combinations,
            'parameters': {
                'output': '/dev/null',
                'target_error': target_error,
                'json2': sim_components['parameters']['file_path'] + 'output.json',
            }
        }
        self.sims.append(Sim(apl_components, sim_components))

    def run_sim(self):
        try:
            self.current_sim = next(self.sim_iter)
        except StopIteration:
            print('no sim prepared, canceling')
            return
        if self.compute:
            self.current_sim.run_sim()

    def run_sims(self, uuid, combinations):
        z = [5, 1, 0.5, 0.1]
        for t in z:
            self.create_sim(uuid, combinations, t)
            self.run_sim()
            combinations = [c for c in combinations if c['type'] == 'f'] + [self.current_sim.extract_profilesets()]

    def update_data(self, sim_data):
        for f_combination in sim_data:
            for fr_combination in f_combination:
                for u in range(len(self.data)):
                    for v in range(len(self.data[u])):
                        if self.data[u][v]['name'] == fr_combination['name']:
                            self.data[u][v] = fr_combination

    def collate_data(self):
        self.data = self.sims[0].parse_json()
        for sim_data in (sim.parse_json() for sim in self.sims[1:]):
            self.update_data(sim_data)
        return self.data
