import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationParams } from 'src/utils/paginationParams';
import { FilterEquipmentDto } from 'src/project/dto/filter-equipment.dto';

@Controller('reports')
@ApiTags('Reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('getAllRooms')
  @ApiOperation({ summary: 'Get All Rooms' })
  async getAllRooms(
    @Query() paginationParams: PaginationParams,
    @Query() filterEquipmentDto: FilterEquipmentDto,
    @Res() res,
  ) {
    const buffer = await this.reportsService.getRoomList(
      filterEquipmentDto,
      paginationParams,
    );
    return buffer;
    res.set({
      // pdf
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=pdf.pdf`,
      // 'Content-Length': buffer.length,
      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
    });
    res.end(buffer);
  }

  @Get('pdf')
  @ApiOperation({ summary: 'pdf example' })
  async generatePdf2(@Res() res) {
    const buffer = await this.reportsService.secondExample();
    res.set(this.reportsService.getPdfHeader('test', buffer));
    res.end(buffer);
  }
}
