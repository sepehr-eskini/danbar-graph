import { Field, ObjectType } from "type-graphql"
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm"

import { E_ClassType } from "./class.types"

@Entity("tbl_class")
@ObjectType()
@Unique(["title", "type", "sessions"])
export class Class extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ generated: "uuid" })
    token: string

    @Field()
    @Column()
    title: string

    @Field()
    @Column()
    sessions: number

    @Field()
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

export const ClassRelations = []
