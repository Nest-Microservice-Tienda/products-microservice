import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v4 as UuidV4 } from 'uuid';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma Client connected');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw new RpcException({
        message: 'Database connection failed',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }

  async create(createProductDto: CreateProductDto) {
    try {
      createProductDto.id = UuidV4();
      const product = await this.product.create({
        data: createProductDto
      });
      return {
        data: product,
        message: 'Product created successfully',
        status: HttpStatus.CREATED
      };
    } catch (error) {
      this.logger.error('Failed to create product', error);
      throw new RpcException({
        message: 'Failed to create product',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 10 } = paginationDto;
      
      const [data, totalPage] = await Promise.all([
        this.product.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: { available: true }
        }),
        this.product.count({ where: { available: true } })
      ]);

      if (!data.length) {
        throw new RpcException({
          message: 'No products found',
          status: HttpStatus.NOT_FOUND
        });
      }

      return {
        data,
        meta: {
          total: totalPage,
          page,
          lastPage: Math.ceil(totalPage / limit),
        }
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      
      this.logger.error('Failed to retrieve products', error);
      throw new RpcException({
        message: 'Failed to retrieve products',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.product.findFirst({
        where: { id, available: true }
      });

      if (!product) {
        throw new RpcException({
          message: `Product with id ${id} not found`,
          status: HttpStatus.NOT_FOUND
        });
      }

      return {
        data: product,
        message: 'Product found successfully',
        status: HttpStatus.OK
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      
      this.logger.error(`Failed to find product with id ${id}`, error);
      throw new RpcException({
        message: 'Failed to retrieve product',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      if (!Object.keys(updateProductDto).length) {
        throw new RpcException({
          message: 'No data provided for update',
          status: HttpStatus.BAD_REQUEST
        });
      }

      // Verificar que el producto existe
      await this.findOne(id);

      const { id: _, ...data } = updateProductDto;
      const productUpdate = await this.product.update({
        where: { id },
        data
      });

      return {
        data: productUpdate,
        message: 'Product updated successfully',
        status: HttpStatus.OK
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      
      this.logger.error(`Failed to update product with id ${id}`, error);
      throw new RpcException({
        message: 'Failed to update product',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      await this.product.delete({ where: { id } });
      
      return {
        message: `Product with id ${id} deleted successfully`,
        status: HttpStatus.OK
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      
      this.logger.error(`Failed to delete product with id ${id}`, error);
      throw new RpcException({
        message: 'Failed to delete product',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }

  async softDelete(id: string) {
    try {
      await this.findOne(id);
      await this.product.update({
        where: { id },
        data: { available: false }
      });

      return {
        message: `Product with id ${id} soft deleted successfully`,
        status: HttpStatus.OK
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      
      this.logger.error(`Failed to soft delete product with id ${id}`, error);
      throw new RpcException({
        message: 'Failed to soft delete product',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }

  async findDeleted(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 10 } = paginationDto;

      const [data, totalPage] = await Promise.all([
        this.product.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: { available: false }
        }),
        this.product.count({ where: { available: false } })
      ]);

      if (!data.length) {
        throw new RpcException({
          message: 'No deleted products found',
          status: HttpStatus.NOT_FOUND
        });
      }

      return {
        data,
        meta: {
          total: totalPage,
          page,
          lastPage: Math.ceil(totalPage / limit),
        }
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      
      this.logger.error('Failed to retrieve deleted products', error);
      throw new RpcException({
        message: 'Failed to retrieve deleted products',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }

  async validateProducts(productsIds: string[]) {
    try {

      //TODO: Eliminar ids duplicados
      productsIds = Array.from(new Set(productsIds));

      const products = await this.product.findMany({
        where: {
          id: { in: productsIds },
          available: true
        }
      });

      if (products.length !== productsIds.length) {
        throw new RpcException({
          message: 'Some products are not available',
          status: HttpStatus.NOT_FOUND
        });
      }
      return products;
    } catch (error) {
      if (error instanceof RpcException) throw error;

      this.logger.error('Failed to validate products', error);
      throw new RpcException({
        message: 'Failed to validate products',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }
}