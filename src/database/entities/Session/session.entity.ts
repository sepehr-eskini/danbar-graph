import { Field, ObjectType } from "type-graphql"
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"

import { TimePeriod } from "../TimePeriod/time-period.entity"
import { E_Day } from "./session.types"

@Entity("tbl_session")
@ObjectType()
export class Session extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ type: "uuid", generated: "uuid", unique: true })
    token: string

    @Field(() => E_Day)
    @Column({ type: "enum", enum: E_Day })
    day: E_Day

    @Field()
    @Column({ type: "uuid" })
    time_period_token: string

    @Field(() => TimePeriod)
    @ManyToOne(() => TimePeriod, { eager: true })
    @JoinColumn({ name: "time_period_token", referencedColumnName: "token" })
    time_period: TimePeriod

    @Field()
    @Column({ default: true })
    is_active: boolean

    @Field()
    @Column()
    admin_token: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}

export const SessionRelations = ["time_period"]
