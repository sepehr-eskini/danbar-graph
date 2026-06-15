import type { I_AppContext } from "@core/context"
import { generateHttpError } from "@core/functions"
import type { MiddlewareInterface, NextFn, ResolverData } from "type-graphql"

export class AuthMiddleware implements MiddlewareInterface<I_AppContext> {
    use({ context }: ResolverData<I_AppContext>, next: NextFn) {
        if (!context.admin) throw generateHttpError("unauthorized")
        else return next()
    }
}
