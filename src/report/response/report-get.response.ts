import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CountAndPercentage {
  @ApiProperty()
  @Expose()
  count: number;

  @ApiProperty()
  @Expose()
  percentage: string;
}

export class Count {
  @ApiProperty()
  @Expose()
  count: number;
}

export class NotDeleted {
  @ApiProperty({ type: CountAndPercentage })
  @Expose()
  withPrice: CountAndPercentage;

  @ApiProperty({ type: CountAndPercentage })
  @Expose()
  withoutPrice: CountAndPercentage;
}

export class Range extends CountAndPercentage {
  @ApiProperty()
  @Expose()
  from: Date;

  @ApiProperty()
  @Expose()
  to: Date;
}

export class Category {
  @ApiProperty()
  @Expose()
  category: string;

  @ApiProperty()
  @Expose()
  count: number;
}

export class ReportGetDataResponse {
  @ApiProperty({ type: Count })
  @Expose()
  products: Count;

  @ApiProperty({ type: CountAndPercentage })
  @Expose()
  productsDeleted: CountAndPercentage;

  @ApiProperty({ type: NotDeleted })
  @Expose()
  productsNonDeleted: NotDeleted;

  @ApiPropertyOptional({ type: Range })
  @Expose()
  productsInRange?: Range;

  @ApiProperty({ type: Category, isArray: true })
  @Expose()
  categories: Category[];
}

export class ReportGetResponse {
  @ApiProperty()
  @Expose()
  status: boolean;

  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  data: ReportGetDataResponse;
}
