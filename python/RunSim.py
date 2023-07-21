from SimSet import parse_combinations_from_file, SimSet

def sims():
    uuid_1 = 'zzzzzzzzzzzzzzz'
    files = ['fixed.simc', 'talents.simc']
    combinations_1 = [parse_combinations_from_file(filename, SimSet.fixed_match) for filename in files]
    test = SimSet()
    test.run_sims(uuid_1, combinations_1)
    data = test.collate_data()

sims()
