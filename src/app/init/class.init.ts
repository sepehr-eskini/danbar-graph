import { Class, type CreateClassRq, E_ClassType, E_PersonnelRole, Personnel, Session } from "@database/entities"

const DEFAULT_CLASSES: CreateClassRq[] = [
    {
        title: "بار ریفورمر",
        type: E_ClassType.GROUP,
        instructor_token: "",
        session_tokens: [],
    },
    {
        title: "بار ریفورمر",
        type: E_ClassType.SEMI_GROUP,
        instructor_token: "",
        session_tokens: [],
    },
    {
        title: "بار ریفورمر",
        type: E_ClassType.SEMI_PRIVATE,
        instructor_token: "",
        session_tokens: [],
    },
    {
        title: "بار ریفورمر",
        type: E_ClassType.PRIVATE,
        instructor_token: "",
        session_tokens: [],
    },
    {
        title: "رقص باله",
        type: E_ClassType.GROUP,
        instructor_token: "",
        session_tokens: [],
    },
    {
        title: "رقص هیلز",
        type: E_ClassType.GROUP,
        instructor_token: "",
        session_tokens: [],
    },
]

export const initClass = async () => {
    const classCount = await Class.count({})

    if (classCount === 0) {
        const instructors = await Personnel.find({ where: { role: E_PersonnelRole.INSTRUCTOR } })
        const sessions = await Session.find()

        const classPromises = DEFAULT_CLASSES.map(async (cls, idx) => {
            const selectedSessions = sessions.filter((_session, index) =>
                idx % 2 === 0 ? index % 2 === 0 : index % 2 !== 0,
            )

            const classInstance = Class.create({
                ...cls,
                sessions: selectedSessions,
                instructor_token: instructors[Math.floor(Math.random() * instructors.length)].token,
                admin_token: "system_initialization",
            })

            return classInstance.save()
        })

        await Promise.all(classPromises)
    }
}
