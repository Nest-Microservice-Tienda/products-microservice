import {
  Controller,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  //@Post()
  @MessagePattern({ cmd: 'create_product' })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  //@Get()
  @MessagePattern({ cmd: 'find_all_products' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  //@Get(':id')
  @MessagePattern({ cmd: 'find_one_product' })
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  //@Patch(':id')
  @MessagePattern({ cmd: 'update_product' })
  update(
    // @Param('id', ParseUUIDPipe) id: string,
    // @Payload() updateProductDto: UpdateProductDto,
    @Payload() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  //@Delete(':id')
  @MessagePattern({ cmd: 'delete_product' })
  remove(@Payload('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  //@Delete(':id/soft-delete')
  @MessagePattern({ cmd: 'soft_delete_product' })
  softDelete(@Payload('id', ParseUUIDPipe) id: string) {
    return this.productsService.softDelete(id);
  }

  //@Get('deleted')
  @MessagePattern({ cmd: 'find_deleted_products' })
  findDeleted(@Payload() paginationDto: PaginationDto) {
    return this.productsService.findDeleted(paginationDto);
  }

  @MessagePattern({ cmd: 'validate_products' })
  validateProducts(@Payload() productsIds: string[]) {
    return this.productsService.validateProducts(productsIds);
  }

}
