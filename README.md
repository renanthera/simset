these methods may not be optimal, I'm still figuring it out :P

uses editorconfig, so please use that!

## SIMVIEW WEB SERVER

configure login information for postgresql server in `simview/.env`
```
DATABASE_URL="postgresql://user:pass@ip:port/table_name"
```

usage for dev:
```
$ <init corepack>
$ corepack yarn install
$ corepack yarn pnpify prisma db push                 # if db is not initialized
$ corepack yarn dev
```

add contents of [this page](https://www.raidbots.com/static/data/live/talents.json) into `simview/src/utils/talentData.ts` as `export const talentData`

this process will get automated eventually, but it's hard, and downloading a
single file occasionally is not.


## PERSISTENT WORKER

symlink or move a simc binary to this level of the repository

usage for dev:
```
$ <init corepack>
$ corepack yarn install
$ corepack yarn dev
```


## TODO (no particular order):
* filter data by talent tree selections
* draw icons on talent trees
* support choice ndoes on talent trees
* persistent worker needs to be able to accept no F-combinations or no R-combinations. currently, processing fails.
* improve performance of charts
* support multiple talent tree versions simultaneously
* improve performance across the board by limiting tasks performed by webserver
* limit unnecessary component renders in the current composite bar chart state model
* use binned bar charts instead of scatter plot
* merge Results[] for Sims[] into Results[] for Set and expire the Results[] for Sims[]

## Cool possibilities:
* would replacing the charts with some wasm system be more performant?
* dynamic workers, where a worker spawns a processes which is single task or a queue of tasks and then despawns
* good :tm: talent tree generation that supports the current input model better
