import { Field, ObjectType } from "type-graphql"
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm"

@Entity("tbl_register")
@ObjectType()
@Unique(["user_token", "class_token", "instructor_token", "payment_date", "payment_price"])
export class Register extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ generated: "uuid" })
    token: string

    @Field()
    @Column()
    user_token: string

    @Field()
    @Column()
    class_token: string

    @Field()
    @Column()
    instructor_token: string

    @Field()
    @Column({ type: "date" })
    payment_date: string

    @Field()
    @Column({ type: "numeric" })
    payment_price: number

    @Field()
    @Column({ type: "numeric" })
    class_price: number

    @Field()
    @Column()
    calendar_image_url: string

    @Field()
    @Column()
    admin_token: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}

export const RegisterRelations = ["user", "class", "instructor"]
