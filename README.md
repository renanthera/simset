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
