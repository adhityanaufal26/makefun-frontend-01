# make.fun lean client

Fast, read-only make.fun frontend: static files, no build step, no framework.

- Board `#/`: live bounties, reward as live pot, entry fee, ticking time left, entries; sort, filter, search.
- Bounty `#/bounty/<slug>`: summary, rules, rewards table with live pot and fee share, dates, status by deadline.
- Leaderboard `#/bounty/<slug>/leaderboard`: rank, handle, win rate + 90% interval, valid, size.
- Profile `#/u/<handle>`: avatar, bio, record, solutions.

Data comes only from the make.fun public API (`https://make.fun/api`), GET, cached in memory + localStorage and revalidated with ETag / If-None-Match. One fetch per view; views update in place; one 1-second timer drives all countdowns.

Serve app/ with any static file server and open index.html.
