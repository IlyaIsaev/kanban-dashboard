# Kanban Dashboard

A React dashboard for managing tasks on a Kanban board (To Do, In Progress, Review, Done). Tasks can be created, edited, deleted, dragged between columns, searched by description or date, and highlighted when overdue.

Working example: https://ilyaisaev.github.io/kanban-dashboard/

## Libraries

These libraries were chosen to work with Node.js 18.18.0.

- [React](https://react.dev/) — UI
- [Reatom](https://reatom.dev/) (`@reatom/core`, `@reatom/react`) — state, forms, and routing
- [Zod](https://zod.dev/) — task schema and form validation
- [dnd kit](https://dndkit.com/) (`@dnd-kit/react`) — drag and drop between columns
- [Emotion](https://emotion.sh/) (`@emotion/css`) — styling
- [Base UI](https://base-ui.com/) — buttons, forms, and dialogs
- [Cloudflare Kumo](https://www.npmjs.com/package/@cloudflare/kumo) — date picker and search field
- [@react-input/mask](https://www.npmjs.com/package/@react-input/mask) — date input mask
- [es-toolkit](https://es-toolkit.dev/) — grouping and sorting tasks
- [Webpack](https://webpack.js.org/) — bundler
- [TypeScript](https://www.typescriptlang.org/) — types
- [Jest](https://jestjs.io/) — unit tests
- [Biome](https://biomejs.dev/) — lint and format

## Commands

```sh
npm install          # install dependencies
npm start            # start the development server
npm run build        # build the production bundle
npm run test         # run unit tests
npm run typecheck    # type-check the project
npm run check        # lint and format-check with Biome
npm run format       # format files with Biome
```

## Tests

Path to the unit tests for overdue-task detection (`isTaskOverdue`):

`src/modules/tasks/tests/isTaskOverdue.test.ts`
