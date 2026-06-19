import { Field, ObjectType } from "type-graphql"
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from "typeorm"

import { Session } from "../Session/session.entity"
import { E_ClassType } from "./class.types"

@Entity("tbl_class")
@ObjectType()
@Unique(["title", "type"])
export class Class extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ type: "uuid", generated: "uuid", unique: true })
    token: string

    @Field()
    @Column()
    title: string

    @Field(() => [Session])
    @ManyToMany(() => Session, { eager: true })
    @JoinTable({
        name: "tbl_class_sessions",
        joinColumn: { name: "class_token", referencedColumnName: "token" },
        inverseJoinColumn: { name: "session_token", referencedColumnName: "token" },
    })
    sessions: Session[]

    @Field(() => E_ClassType)
    @Column({ type: "enum", enum: E_ClassType })
    type: E_ClassType

    @Field()
    @Column({ type: "numeric" })
    price: number

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

export const ClassRelations = ["sessions"]
