import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { v4 as UuidV4 } from 'uuid';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma Client connected');
  }

  create(createProductDto: CreateProductDto) {
    createProductDto.id = UuidV4();
    return this.product.create({
      data: createProductDto
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const data = await this.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { available: true }
    });
    const totalPage = await this.product.count({
      where: { available: true }
    });
    const lastPage = Math.ceil(totalPage / limit);

    if(!data.length) {
      throw new NotFoundException('No products found');
    }

    return {
      data,
      meta: {
        total: totalPage,
        page: page,
        lastPage: lastPage,
      }
    };
  }

  async findOne(id: string) {
    try {
      const product = await this.product.findFirst({ where: { id, available: true } });
      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      return product;
    } catch (error) {
      this.logger.error(`Failed to find product with id ${id}`, error);
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
   try {
    if (!Object.keys(updateProductDto).length) {
      throw new NotFoundException('No data to update');
    }
    const { id: _, ...data } = updateProductDto;
    await this.findOne(id);
    await this.product.update({
      where: { id },
      data
    });
     
     return updateProductDto;
   } catch (error) {
     this.logger.error(`Failed to update product with id ${id}`, error);
     throw new NotFoundException(`Product with id ${id} not found`);
   }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      await this.product.delete({ where: { id } });
      return `Product with id ${id} deleted successfully`;
    } catch (error) {
      this.logger.error(`Failed to delete product with id ${id}`, error);
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }

  async softDelete(id: string) {
    try {
      await this.findOne(id);
      await this.product.update({
        where: { id },
        data: { available: false }
      });
      return `Product with id ${id} soft deleted successfully`;
    } catch (error) {
      this.logger.error(`Failed to soft delete product with id ${id}`, error);
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }
  async findDeleted(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const data = await this.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { available: false }
    });
    const totalPage = await this.product.count({
      where: { available: false }
    });
    const lastPage = Math.ceil(totalPage / limit);

    if (!data.length) {
      throw new NotFoundException('No deleted products found');
    }

    return {
      data,
      meta: {
        total: totalPage,
        page: page,
        lastPage: lastPage,
      }
    };
  }
}