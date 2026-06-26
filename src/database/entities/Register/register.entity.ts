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
    UpdateDateColumn,
} from "typeorm"

import { Class } from "../Class/class.entity"
import { Price } from "../Price/price.entity"
import { Schedule } from "../Schedule/schedule.entity"
import { User } from "../User/user.entity"
import { E_RegisterStatus } from "./register.types"

@Entity("tbl_register")
@ObjectType()
export class Register extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ type: "uuid", generated: "uuid", unique: true })
    token: string

    @Column({ type: "uuid" })
    user_token: string

    @Field(() => User)
    @ManyToOne(() => User)
    @JoinColumn({ name: "user_token", referencedColumnName: "token" })
    user: User

    @Column({ type: "uuid" })
    class_token: string

    @Field(() => Class)
    @ManyToOne(() => Class)
    @JoinColumn({ name: "class_token", referencedColumnName: "token" })
    class: Class

    @Column({ type: "uuid" })
    price_token: string

    @Field(() => Price)
    @ManyToOne(() => Price)
    @JoinColumn({ name: "price_token", referencedColumnName: "token" })
    price: Price

    @Field()
    @Column({ type: "numeric" })
    class_price: number

    @Field()
    @Column()
    admin_token: string

    @Field()
    @Column({ type: "date" })
    payment_date: string

    @Field()
    @Column({ type: "numeric" })
    payment_price: number

    @Field()
    @Column({ type: "numeric", default: 0 })
    discount_price: number

    @Field()
    @Column({ type: "numeric", default: 0 })
    return_price: number

    @Field()
    @Column()
    calendar_image_url: string

    @Field(() => [Schedule])
    @OneToMany(() => Schedule, schedule => schedule.register)
    schedules: Schedule[]

    @Field({ nullable: true })
    @Column({ type: "date", nullable: true })
    last_schedule_date: string | null

    @Field(() => E_RegisterStatus)
    @Column({ type: "enum", enum: E_RegisterStatus, default: E_RegisterStatus.ACTIVE })
    status: E_RegisterStatus

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}

export const RegisterRelations = ["user", "class", "price", "schedules"]
