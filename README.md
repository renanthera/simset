At this point, this project is abandoned.
It served its purpose as a personal introduction to nodejs/react/typescript, but would require significant website reworks to be adaptable to fit the design requirements.

I'm definitely interested in coming back to this project with fresh eyes and a broader set of skills at some point in the future.

## SIMVIEW WEB SERVER

might not work on anything beyond nodejs v20.5.1. had issues with the initial
v20.6.1 release

configure login information for postgresql server in `simview/.env`
```
DATABASE_URL="postgresql://user:pass@ip:port/table_name"
```

usage for dev:
```
$ <init corepack>
$ corepack yarn install
$ corepack yarn pnpify prisma db push # if db is not initialized
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

## Features
* End-to-end sim generation and execution via Create
* Crude sim result visualizations with talent-based filtering options in
Single Sim
* All Sims scatter plot for all data in the Set/Sim/F-Combination selection.
* Selected Sims scatter plot for all data in selected mean dps interval on All
Sims chart.
* Text info on selected points for All Sims/Selected Sims selections
* Top 12 Talent Trees in Selected Sims selection
* Hamburger Menu Talent Tree filter shows only sims with talent x if blue, and
without talent x if red. Requires reselecting the Sim Selection to update filter.

## Issues
* It's just really slow
* A lot of first-time code
* Likely scales poorly to different display sizes.

## Things I Like
* the talent tree charts are AWESOME and very pretty (have some other things i'd
like to add to them though)
* end-to-end running sims works pretty well
* good learning experience, javascript is kinda horrible, and I only really used
Typescript capabilities toward the end for View and derived classes
* the scatter plots look pretty ok
* oh the capability to write static pages in markdown is kinda cool as well

## Things I Don't Like
* its slow
* it feels like i was just writing so many map, reduce and filter callbacks.
* probably do more data transformation on the worker to save client and server
time, at the cost of more code on the worker (boo)
* worker too big, so writing a different worker would SUCK
* the scatter plots aren't very useful
* i ignored a lot of useful tools while early on in js/ts/react growing pains

## TODO (no particular order):
* draw icons on talent trees
* support choice ndoes on talent trees
* persistent worker needs to be able to accept no F-combinations or no R-
combinations. currently, processing fails.
* improve performance of charts
* support multiple talent tree versions simultaneously
* improve performance across the board by limiting tasks performed by webserver
* limit unnecessary component renders in the current composite bar chart state
model
* use binned bar charts instead of scatter plot
* merge Results[] for Sims[] into Results[] for Set and expire the Results[] for
Sims[]

## Cool possibilities:
* would replacing the charts with some wasm system be more performant?
* dynamic workers, where a worker spawns a processes which is single task or a
queue of tasks and then despawns
* good :tm: talent tree generation that supports the current input model better
* multi-sim view that supports n>1 selections of sims with equivalent fr-
combinations and performs run-to-run analysis
