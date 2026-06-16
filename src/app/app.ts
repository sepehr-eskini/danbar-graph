/* eslint-disable no-console */
import type { BaseContext } from "@apollo/server"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { formatError } from "@core/functions"
import { APP_PORT, DB_HOST, DB_PORT, jobScheduler } from "@core/utilities"
import { AppDataSource } from "@database/connections"
import { AdminResolver, PersonnelResolver, UserResolver } from "@database/entities"
import { TimePeriodResolver } from "@database/entities/TimePeriod"
import cors from "cors"
import express from "express"
import { createServer } from "http"
import { buildSchema } from "type-graphql"

import { databaseInitialization } from "./init"
import { ErrorRouter, GraphqlRouter } from "./routers"

interface I_ApolloContext extends BaseContext {}

export const startServer = async () => {
    await AppDataSource.initialize()
        .then(async () => {
            console.log(`${new Date().toString()}: Connected to DB successfully on ${DB_HOST}:${DB_PORT}`)
            await databaseInitialization()
            console.log(`${new Date().toString()}: DB initialized successfully`)
        })
        .catch(err => console.log(`${new Date().toString()}: Error connecting to DB:`, err))

    const schema = await buildSchema({
        resolvers: [AdminResolver, UserResolver, PersonnelResolver, TimePeriodResolver],
        validate: { forbidUnknownValues: false },
    })

    const app = express()
    const httpServer = createServer(app)

    // TODO: Uncomment this before production
    // const apollosServerPlugins = []
    // if (NODE_ENV === "production") apollosServerPlugins.push(ApolloServerPluginLandingPageDisabled())

    const server = new ApolloServer<I_ApolloContext>({
        schema,
        formatError,
    })

    await server.start()

    app.use(cors())
    app.use(express.json({ limit: "100mb" }))
    app.use(express.static("uploads/"))
    jobScheduler()
    app.use("/graphql", expressMiddleware(server, { context: GraphqlRouter }))
    app.use("/errors", ErrorRouter)

    httpServer.listen(APP_PORT, () => console.log(`Started server at ${APP_PORT}`))
}

startServer()
