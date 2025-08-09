import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/config/Database/Prisma.service'
import { CategoryDTO } from './DTO/category.dto'
import {
  CreateShopListDto,
  UpdateShopListDto,
} from './DTO/create-shop-list.dto'

@Injectable()
export class ListService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts({ category }: CategoryDTO) {
    return this.prisma.product.findMany({
      where: {
        category: category ? category : undefined,
      },
    })
  }

  async addProductsAtList(createShopListDto: CreateShopListDto) {
    const { userId, items, listId } = createShopListDto

    let existingList: {
      id: string
      name: string
      items: any
      userId: string
      createdAt: Date
    } | null = null

    if (listId) {
      existingList = await this.prisma.shoppingList.findUnique({
        where: {
          id: listId,
          userId,
        },
      })

      if (!existingList) {
        throw new NotFoundException(
          `Shopping list with ID "${listId}" not found for this user.`,
        )
      }
    }

    if (existingList) {
      let currentItems: Array<{ idProduct: string; quantity: number }> = []
      if (Array.isArray(existingList.items)) {
        currentItems = existingList.items as Array<{
          idProduct: string
          quantity: number
        }>
      } else if (typeof existingList.items === 'string') {
        try {
          const parsed = JSON.parse(existingList.items)
          if (Array.isArray(parsed)) {
            currentItems = parsed
          } else {
            throw new BadRequestException(
              'Existing shopping list items are in an unexpected format after parsing.',
            )
          }
        } catch (error) {
          throw new BadRequestException(
            'Existing shopping list items are corrupted or malformed JSON.',
          )
        }
      } else {
        throw new BadRequestException(
          'Existing shopping list items are in an unknown format.',
        )
      }

      const newItemsToAdd = items.map((item) => ({
        idProduct: item.idProduct,
        quantity: item.quantity,
      }))

      const updatedItemsMap = new Map()

      currentItems.forEach((item) => {
        updatedItemsMap.set(item.idProduct, {
          idProduct: item.idProduct,
          quantity: item.quantity,
        })
      })

      newItemsToAdd.forEach((newItem) => {
        updatedItemsMap.set(newItem.idProduct, {
          idProduct: newItem.idProduct,
          quantity: newItem.quantity,
        })
      })

      const combinedItems = Array.from(updatedItemsMap.values())

      const updatedList = await this.prisma.shoppingList.update({
        where: {
          id: existingList.id,
        },
        data: {
          items: combinedItems,
        },
        omit: {
          createdAt: true,
        },
      })

      return updatedList
    }

    const newItemsForCreation = items.map((item) => ({
      idProduct: item.idProduct,
      quantity: item.quantity,
    }))

    const newList = await this.prisma.shoppingList.create({
      data: {
        userId,
        items: newItemsForCreation,
        name: createShopListDto.name,
      },
    })

    return newList
  }

  async getShoppingList(userId: string) {
    const lists = await this.prisma.shoppingList.findMany({
      where: {
        userId,
      },
    })

    // Para cada lista, buscar detalhes dos produtos
    const listsWithProducts = await Promise.all(
      lists.map(async (list) => {
        let items: Array<{ idProduct: string; quantity: number }> = []

        if (Array.isArray(list.items)) {
          items = list.items as Array<{ idProduct: string; quantity: number }>
        } else if (typeof list.items === 'string') {
          try {
            const parsed = JSON.parse(list.items)
            if (Array.isArray(parsed)) {
              items = parsed
            }
          } catch {
            items = []
          }
        }

        // Buscar detalhes dos produtos
        const productIds = items.map((item) => item.idProduct)
        const products = productIds.length
          ? await this.prisma.product.findMany({
              where: { id: { in: productIds } },
            })
          : []

        return {
          ...list,
          items,
          Product: products,
        }
      }),
    )

    return listsWithProducts
  }

  async removeProductFromList(
    userId: string,
    updateShopListDto: UpdateShopListDto,
  ) {
    const { listId, productsIds } = updateShopListDto

    if (!productsIds || productsIds.length === 0) {
      throw new BadRequestException(
        'At least one product ID must be provided for removal.',
      )
    }

    const shoppingList = await this.prisma.shoppingList.findFirst({
      where: {
        userId,
        id: listId,
      },
    })

    if (!shoppingList) {
      throw new NotFoundException(
        `Shopping list with ID "${listId}" not found for the user.`,
      )
    }

    let currentItems: Array<{ idProduct: string; quantity: number }> = []
    if (Array.isArray(shoppingList.items)) {
      currentItems = shoppingList.items as Array<{
        idProduct: string
        quantity: number
      }>
    } else if (typeof shoppingList.items === 'string') {
      try {
        const parsedItems = JSON.parse(shoppingList.items)
        if (Array.isArray(parsedItems)) {
          currentItems = parsedItems
        } else {
          throw new BadRequestException(
            'Shopping list items are in an unexpected format after parsing.',
          )
        }
      } catch (error) {
        throw new BadRequestException(
          'Shopping list items are corrupted or malformed JSON.',
        )
      }
    } else {
      throw new BadRequestException(
        'Shopping list items are in an unknown format.',
      )
    }

    const updatedItems = currentItems.filter((item) => {
      if (!item || typeof item.idProduct !== 'string') {
        return true
      }
      return !productsIds.includes(item.idProduct)
    })
    await this.prisma.shoppingList.update({
      where: {
        id: shoppingList.id,
      },
      data: {
        items: updatedItems,
      },
    })

    return {
      message: 'Products removed from the shopping list successfully',
    }
  }
}
