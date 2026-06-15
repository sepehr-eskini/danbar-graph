import { Field, ObjectType } from "type-graphql"
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity("tbl_user")
@ObjectType()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ generated: "uuid" })
    token: string

    @Field()
    @Column()
    fullname: string

    @Field()
    @Column({ unique: true })
    phone_number: string

    @Field()
    @Column({ default: true })
    is_active: boolean

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}

export const UserRelations = []
