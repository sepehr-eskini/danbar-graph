import type { BaseContext } from "@apollo/server"
import type { Admin } from "@database/entities"

export interface I_AppContext extends BaseContext {
    admin?: Admin
}
