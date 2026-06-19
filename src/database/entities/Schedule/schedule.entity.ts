import { Field, ObjectType } from "type-graphql"
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm"

import { Personnel } from "../Personnel/personnel.entity"
import { Register } from "../Register/register.entity"
import { Session } from "../Session/session.entity"
import { E_ScheduleStatus } from "./schedule.types"

@Entity("tbl_schedule")
@ObjectType()
export class Schedule extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Field()
    @Column({ type: "uuid", generated: "uuid", unique: true })
    token: string

    @Field()
    @Column({ type: "uuid" })
    register_token: string

    @Field(() => Register)
    @ManyToOne(() => Register, register => register.schedules)
    @JoinColumn({ name: "register_token", referencedColumnName: "token" })
    register: Register

    @Field()
    @Column({ type: "date" })
    submission_date: string

    @Field()
    @Column({ type: "uuid" })
    submission_session_token: string

    @Field(() => Session)
    @ManyToOne(() => Session, { eager: true })
    @JoinColumn({ name: "submission_session_token", referencedColumnName: "token" })
    submission_session: Session

    @Field()
    @Column({ type: "uuid" })
    submission_instructor_token: string

    @Field(() => Personnel)
    @ManyToOne(() => Personnel, { eager: true })
    @JoinColumn({ name: "submission_instructor_token", referencedColumnName: "token" })
    submission_instructor: Personnel

    @Field({ nullable: true })
    @Column({ type: "date", nullable: true })
    presence_date: string

    @Field({ nullable: true })
    @Column({ type: "uuid", nullable: true })
    presence_session_token: string

    @Field(() => Session, { nullable: true })
    @ManyToOne(() => Session, { nullable: true, eager: true })
    @JoinColumn({ name: "presence_session_token", referencedColumnName: "token" })
    presence_session: Session

    @Field({ nullable: true })
    @Column({ type: "uuid", nullable: true })
    presence_instructor_token: string

    @Field(() => Personnel, { nullable: true })
    @ManyToOne(() => Personnel, { nullable: true, eager: true })
    @JoinColumn({ name: "presence_instructor_token", referencedColumnName: "token" })
    presence_instructor: Personnel

    @Field(() => E_ScheduleStatus)
    @Column({ type: "enum", enum: E_ScheduleStatus, default: E_ScheduleStatus.UNSET })
    status: E_ScheduleStatus

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}

export const ScheduleRelations = [
    "register",
    "submission_session",
    "submission_instructor",
    "presence_session",
    "presence_instructor",
]
