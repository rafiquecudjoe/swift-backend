import { Prisma } from '@prisma/client';

export type CreateAssignmentData = Prisma.VehicleAssignmentCreateInput;
export type UpdateAssignmentData = Prisma.VehicleAssignmentUpdateInput;

export interface UpdateAssignmentParams {
  id: string;
  data: UpdateAssignmentData;
}

export interface FindManyAssignmentsParams {
  where?: Prisma.VehicleAssignmentWhereInput;
  skip?: number;
  take?: number;
  orderBy?: Prisma.VehicleAssignmentOrderByWithRelationInput;
  include?: Prisma.VehicleAssignmentInclude;
}
