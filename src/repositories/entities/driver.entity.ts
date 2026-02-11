import { Prisma } from '@prisma/client';

export type CreateDriverData = Prisma.DriverCreateInput;
export type UpdateDriverData = Prisma.DriverUpdateInput;

export interface UpdateDriverParams {
  id: string;
  data: UpdateDriverData;
}

export interface FindManyDriversParams {
  where?: Prisma.DriverWhereInput;
  skip?: number;
  take?: number;
  orderBy?: Prisma.DriverOrderByWithRelationInput;
}
