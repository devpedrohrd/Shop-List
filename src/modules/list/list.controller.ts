import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ListService } from './list.service'
import { CategoryDTO } from './DTO/category.dto'
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  CreateShopListDto,
  UpdateShopListDto,
} from './DTO/create-shop-list.dto'
import { Request } from 'express'
import { JwtAuthGuard } from '../auth/guard/jwt.guard'

@Controller('list')
@ApiTags('list')
@UseGuards(JwtAuthGuard)
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get('categories')
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'No products found for the given category',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter products by category',
    type: CategoryDTO.name,
  })
  async getProducts(@Query() category: CategoryDTO) {
    return this.listService.getProducts(category)
  }

  @Post('add')
  @ApiResponse({
    status: 201,
    description: 'Products added to the shopping list successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'Shopping list not found',
  })
  async addProductsAtList(
    @Body() createShopListDto: CreateShopListDto,
    @Req() req: Request,
  ) {
    createShopListDto.userId = req['user'].id // Descomentar se o userId não for passado no corpo da requisição
    return this.listService.addProductsAtList(createShopListDto)
  }

  @Post('remove-product')
  @ApiResponse({
    status: 200,
    description: 'Product removed from the shopping list successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'Shopping list not found for the given user',
  })
  async removeProductFromList(
    @Body() removeProducts: UpdateShopListDto,
    @Req() req: Request
  ) {
    return this.listService.removeProductFromList(req['user'].id, removeProducts)
  }

  @Get('my-lists')
  @ApiResponse({
    status: 200,
    description: 'User shopping lists retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'No shopping lists found for the user',
  })
  async getMyLists(@Req() req: Request) {
    return this.listService.getShoppingList(req['user'].id)
  }
}
