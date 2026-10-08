import { db } from "@snap/database";

export const findByEmail = async (email: string) => {
  return db.user.findUnique({ where: { email } });
};

export const findById = async (id: string) => {
  return db.user.findUnique({ where: { id } });
};

export const createUser = async (input: {
  name: string;
  email: string;
  passwordHash: string;
}) => {
  return db.user.create({ data: input });
};
