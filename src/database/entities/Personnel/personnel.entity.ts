import { Field, ObjectType } from "type-graphql"
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

import { E_PersonnelRole } from "./personnel.types"

@Entity("tbl_personnel")
@ObjectType()
export class Personnel extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ type: "uuid", generated: "uuid", unique: true })
    token: string

    @Field()
    @Column({ unique: true })
    full_name: string

    @Field()
    @Column({ unique: true })
    phone_number: string

    @Field()
    @Column({ default: 0, type: "numeric" })
    income_percentage: number

    @Field()
    @Column({ default: 0, type: "numeric" })
    fixed_income_price: number

    @Field()
    @Column({ type: "enum", enum: E_PersonnelRole })
    role: E_PersonnelRole

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

export const PersonnelRelations = []
