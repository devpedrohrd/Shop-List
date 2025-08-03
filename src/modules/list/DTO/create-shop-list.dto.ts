import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

export class CreateShopListDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Unique identifier for the shopping list',
    required: false,
    example: 'list_12345',
  })
  id: string
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'User ID associated with the shopping list',
    example: 'user_12345',
    required: true,
  })
  userId: string
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Identifier for the shopping list',
    example: 'shopping_list_12345',
    required: true,
  })
  listId: string
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemJson)
  @ApiProperty({
    description: 'List of items in the shopping list',
    required: true,
    example: ['product_12345', 'product_67890'],
  })
  items: ItemJson[]
  @IsOptional()
  @IsDate()
  createdAt: Date
}

export class ItemJson {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Product ID of the item',
    example: 'product_12345',
    required: true,
  })
  idProduct: string

  @IsNotEmpty()
  @ApiProperty({
    description: 'Quantity of the product in the shopping list',
    example: 2,
    required: true,
  })
  @IsNumber()
  quantity: number
}

export class UpdateShopListDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the shopping list to update',
    example: 'list_12345',
    required: true,
  })
  listId: string

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'List of product IDs to update',
    example: ['product_12345', 'product_67890'],
    required: true,
  })
  productsIds: string[]
}
