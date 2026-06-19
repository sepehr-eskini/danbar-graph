import { Field, ObjectType } from "type-graphql"
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity("tbl_time_period")
@ObjectType()
export class TimePeriod extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ generated: "uuid", unique: true })
    token: string

    @Field()
    @Column({ unique: true })
    title: string

    @Field()
    @Column({ type: "time" })
    from_time: string

    @Field()
    @Column({ type: "time" })
    to_time: string

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

export const TimePeriodRelations = []
