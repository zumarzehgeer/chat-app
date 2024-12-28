import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
// import { startStandaloneServer } from '@apollo/server/standalone';
import { PrismaClient } from "@prisma/client";
import { resolvers } from "@graphql/resolvers";
import { typeDefs } from "@graphql/schema";
const app = express();
const httpServer = http.createServer(app);
// for prisma
const prisma = new PrismaClient();
async function main() {
    // ... you will write your Prisma Client queries here
    // await prisma.user.create({
    //   data: {
    //     name: 'Alice',
    //     email: 'alice1@prisma.io',
    //     posts: {
    //       create: { title: 'Hello World' },
    //     },
    //     profile: {
    //       create: { bio: 'I like turtles' },
    //     },
    //   },
    // });
    const allUsers = await prisma.user.findMany({
        include: {
            posts: true,
            profile: true,
        },
    });
    console.dir(allUsers, { depth: null });
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
// TODO: For GRAPHQL
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();
app.use("/graphql", cors(), express.json(), express.urlencoded({ extended: true }), expressMiddleware(server, {
    context: async ({ req }) => {
        return { token: req.headers.token };
    },
}));
// TODO: not to use StandAloneServer
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
// const { url } = await startStandaloneServer(server, {
//   listen: { port: 4000 },
// });
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀  Server ready at: 4000`);
