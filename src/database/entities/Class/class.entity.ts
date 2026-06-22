import { Field, ObjectType } from "type-graphql"
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from "typeorm"

import { Personnel } from "../Personnel/personnel.entity"
import { Price } from "../Price/price.entity"
import { E_ClassType } from "./class.types"

@Entity("tbl_class")
@ObjectType()
@Unique(["title", "type", "instructor_token"])
export class Class extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ type: "uuid", generated: "uuid", unique: true })
    token: string

    @Field()
    @Column()
    title: string

    @Field(() => [String])
    @Column({ array: true })
    session_tokens: string[]

    @Field(() => E_ClassType)
    @Column({ type: "enum", enum: E_ClassType })
    type: E_ClassType

    @Field()
    @Column({ type: "uuid" })
    instructor_token: string

    @Field(() => Personnel)
    @ManyToOne(() => Personnel, { eager: true })
    @JoinColumn({ name: "instructor_token", referencedColumnName: "token" })
    instructor: Personnel

    @Field(() => [Price])
    @OneToMany(() => Price, price => price.class)
    prices: Price[]

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

export const ClassRelations = ["sessions", "instructor", "prices"]
