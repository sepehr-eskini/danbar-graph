import { Field, ObjectType } from "type-graphql"
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from "typeorm"

import { Class } from "../Class/class.entity"

@Entity("tbl_price")
@ObjectType()
@Unique(["sessions_count", "price", "class_token"])
export class Price extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ type: "uuid", generated: "uuid", unique: true })
    token: string

    @Field()
    @Column({ type: "uuid" })
    class_token: string

    @Field(() => Class)
    @ManyToOne(() => Class, { eager: true })
    @JoinColumn({ name: "class_token", referencedColumnName: "token" })
    class: Class

    @Field()
    @Column({ type: "integer" })
    sessions_count: number

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

export const PriceRelations = ["class"]
