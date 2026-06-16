import { Field, ObjectType } from "type-graphql"
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

import { E_AdminPermission } from "./admin.types"

@Entity("tbl_admin")
@ObjectType()
export class Admin extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ generated: "uuid" })
    token: string

    @Field()
    @Column({ unique: true })
    username: string

    @Field()
    @Column({ unique: true })
    fullname: string

    @Column()
    password: string

    @Field()
    @Column({ unique: true })
    phone_number: string

    @Column({ type: "enum", enum: E_AdminPermission, array: true })
    permissions: E_AdminPermission[]

    @Field()
    @Column({ default: true })
    is_active: boolean

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}

export const AdminRelations = []
