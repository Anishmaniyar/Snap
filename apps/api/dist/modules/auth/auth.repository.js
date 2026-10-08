import { db } from "@snap/database";
export const findByEmail = async (email) => {
    return db.user.findUnique({ where: { email } });
};
export const findById = async (id) => {
    return db.user.findUnique({ where: { id } });
};
export const createUser = async (input) => {
    return db.user.create({ data: input });
};
//# sourceMappingURL=auth.repository.js.map