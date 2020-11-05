# NestJs Chat

A simple real time group chat developed using `NestJS`, `GraphQL` and `MongoDB`!

This is the ``API`` for the [nestjs-chat-front](https://github.com/guiquintelas/nestjs-chat-front) repo

### Running
``` sh
git clone https://github.com/guiquintelas/nestjs-chat-api.git
cd nestjs-chat-api
cp .env-example .env
docker-compose up -d
yarn && yarn start:dev

# access the GraphQL Playground at http://localhost:3000/graphql
```

### Testing
``` sh
# all tests
yarn test:e2e

# single module test
yarn test:e2e -t test_name
```

### Debugging
``` sh
# debug application
yarn start:debug

# debug tests
yarn test:debug

# debug single test
yarn test:debug -t test_name
```

### Debugging Tips
Using vscode you can use the `.vscode/launch.json` config to attach a debugger using both `yarn test:debug` and `yarn start:debug` commands

if you're not on **windows** and getting some error running the `yarn test:debug` command try `yarn test:debug-alter` instead


# ⚙️ Technologies
  - NestJS
  - GraphQL
  - MongoDB
  - TypeORM
  - Prettier
  - Redis
  - Docker


# 🚧 Roadmap
  - Features
    - Track online users (users listening for new messages)
    - Multiple group chats
    - Message Pagination
    - Refactor both repos to one monorepo
  - Technical Debt
    - Use a dedicated database for testing, or setup a mongo memory mock db
    - Setup a testing redis instance
    - Refactor some code duplication between tests

