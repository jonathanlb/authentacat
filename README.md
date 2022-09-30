# Authentacat Front End for Cat Wrangler

This project provides a web user interface for [CatWrangler (V2)](https://github.com/jonathanlb/cat-wrangler-v2).
Updates from the [initial version](https://github.com/jonathanlb/cat-wrangler) include

- Using [MUI Core web components](https://mui.com/), instead of home-rolled ones built on [yo-yo](https://github.com/maxogden/yo-yo).  The resulting product renders more consistently on smaller screens and conforms to wider usability and accessibility standards.
- Additional tools for users to filter events.
- Using TypeScript.

## Deployment

- Update `config.serverName' in [config.ts](src/config.ts) to point to an end point handled by [the Cat-Wrangler back end](https://github.com/jonathanlb/cat-wrangler-v2).
- Update/add the `homepage` field in [package.json](package.json) if the endpoint is not at the top-level.
- Run `npm run build` and copy or link the the contents of `build/` to your webserver.

### Ridesharing coordination
There is an optional feature to display participants who wish to carpool to events.
Enable the feature on the front end by setting `showRideShare` to `true` in
[src/index.tsx](src/index.tsx).

## Demo Mode

Whether you'd like to see what the front-end looks like for development or demonstration outside of the application data, Authentacat can be displayed by setting the `demoMode` variable in [`index.ts`](src/index.ts).
Then run `npm run start` and point your browser to [http://localhost:3000](https://localhost:3000).
