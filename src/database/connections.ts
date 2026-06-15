import "reflect-metadata"

import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME } from "@core/utilities"
import { DataSource } from "typeorm"

import { DatabaseEntities } from "./entities"

if (!DB_HOST || !DB_PASSWORD || !DB_USERNAME || !DB_NAME || !DB_PORT)
    throw Error("Could not find environment variables")

const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    ssl: false,
    port: parseInt(DB_PORT, 10),
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    synchronize: true,
    logging: false,
    entities: DatabaseEntities,
    migrations: [],
    subscribers: [],
})

export { AppDataSource }
