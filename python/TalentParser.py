from requests import get
import json
import copy

def download(url):
    flavor = url.split('/')[5]
    print(flavor)
    with open('cache/' + flavor + '-talents.json', 'wb') as file:
        response = get(url)
        file.write(response.content)

def load_talents(flavor):
    with open('cache/' + flavor + '-talents.json', 'rb') as file:
        return json.load(file)

class TalentString:
    base64_char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    LOADOUT_SERIALIZATION_VERSION = 1
    version_bits = 8      # serialization version
    spec_bits = 16     # specialization id
    tree_bits = 128    # C_Traits.GetTreeHash(), optionally can be 0-filled
    rank_bits = 6      # ranks purchased if node is partially filled
    choice_bits = 2      # choice index, 0-based
    byte_size = 6

    def __init__(self, talent_str, flavor):
        self.talent_str = talent_str
        self.flavor = flavor
        self.allocated_talents = self.decode_talent_str()

    def get_bits(self, bits):
        val = 0
        for i in range(bits):
            bit = self.head % self.byte_size
            self.head += 1
            val += (self.byte >> bit & 0b1) << min(i, 63)
            if bit == self.byte_size - 1:
                if self.head // self.byte_size >= len(self.talent_str):
                    self.byte = 0
                else:
                    self.byte = self.base64_char.find(self.talent_str[self.head//self.byte_size])
        return val

    def find_talents_for_spec(self):
        talents = load_talents(self.flavor)
        self.node_dict = {}
        for k in talents:
            if k['specId'] == self.spec_id:
                self.nodes = k['classNodes'] + k['specNodes']
                self.nodeOrder = k['fullNodeOrder']
                for node in self.nodes:
                    self.node_dict[node['id']] = node
                return k

    def decode_talent_str(self):
        data = []
        self.head = 0
        self.byte = self.base64_char.find(self.talent_str[0])
        version_id = self.get_bits(self.version_bits)
        self.spec_id = self.get_bits(self.spec_bits)
        tree = self.get_bits(self.tree_bits)
        self.find_talents_for_spec()
        print(version_id, self.spec_id, tree)
        for node in self.nodeOrder:
            if self.get_bits(1):
                self.node_dict[node]['entries'].sort(key=lambda entry: entry['index'])
                trait = self.node_dict[node]['entries'][0]
                rank = trait['maxRanks']
                if self.get_bits(1):
                    rank = self.get_bits(self.rank_bits)
                if self.get_bits(1):
                    index = self.get_bits(self.choice_bits)
                    trait = self.node_dict[node]['entries'][index]
                trait_copy = copy.deepcopy(trait)
                trait_copy['ranks'] = rank
                data.append(trait_copy)
        return data

# talent_url = "https://www.raidbots.com/static/data/live/talents.json"
# download(talent_url)

sample = "BwQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAgkS0kkEIJp1IAAAApkgEJSoVkkUSSKJAtGRapVCB"
asdf = TalentString(sample, 'live')
for t in asdf.allocated_talents:
    print(t)
