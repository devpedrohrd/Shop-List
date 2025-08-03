import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { ProductCategory } from 'generated/prisma'

export class CategoryDTO {
  @IsEnum(ProductCategory)
  @IsOptional()
  @ApiProperty({
    description: 'Category of the product',
    enum: ProductCategory,
    required: false,
    example: ProductCategory.fruits,
  })
  category: ProductCategory
}
