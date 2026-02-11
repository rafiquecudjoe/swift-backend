import { Prisma } from '@prisma/client';

export type CreateUserData = Prisma.UserCreateInput;
export type UpdateUserData = Prisma.UserUpdateInput;

export interface UpdateUserParams {
  id: string;
  data: UpdateUserData;
}

export interface FindManyUsersParams {
  where?: Prisma.UserWhereInput;
  skip?: number;
  take?: number;
  orderBy?: Prisma.UserOrderByWithRelationInput;
}
