import { ApiProperty } from '@nestjs/swagger';

export class ResponseWithoutData {
  @ApiProperty({ example: 200 })
  status: number;

  @ApiProperty({ example: 'Success' })
  message: string;
}

export class ResponseWithData<T = any> extends ResponseWithoutData {
  @ApiProperty()
  data: T;
}
