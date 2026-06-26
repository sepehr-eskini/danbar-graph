import { Field, ObjectType } from "type-graphql"
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"

import { Register } from "../Register"

@Entity("tbl_user")
@ObjectType()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ type: "uuid", generated: "uuid", unique: true })
    token: string

    @Field()
    @Column({ unique: true })
    full_name: string

    @Field({ nullable: true })
    @Column({ unique: true, nullable: true })
    phone_number: string

    @Field()
    @Column({ default: true })
    is_active: boolean

    @Field(() => [Register], { nullable: true })
    @OneToMany(() => Register, register => register.user)
    registers: Register[]

    @Field()
    @Column()
    admin_token: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}

export const UserRelations = []
