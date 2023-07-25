import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createPdf } from '@saemhco/nestjs-html-pdf';
import { join } from 'path';
import { FilterEquipmentDto } from 'src/project/dto/filter-equipment.dto';
import { ProjectService } from 'src/project/project.service';
import { PaginationParams } from 'src/utils/paginationParams';
import { FilterReportDto } from './dto/filter-report.dto';

@Injectable()
export class ReportsService {
  reportType = {};

  constructor(private projectService: ProjectService) {}

  getPdfHeader(filename = 'pdf', buffer) {
    return {
      // pdf
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${filename}.pdf`,
      // 'Content-Length': buffer.length,
      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
    };
  }

  // async getRoomList(
  //   filterEquipmentDto: FilterEquipmentDto,
  //   paginationParams: PaginationParams,
  // ) {
  //   const rooms = await this.projectService.getAllRooms(
  //     filterEquipmentDto,
  //     paginationParams,
  //   );
  //   console.log("romms >>",rooms);
  //   return rooms;
  // }

  secondExample() {
    const data = {
      title: 'My PDF file',
      status: 'paid',
      invoiceId: '#123-123',
      customerName: 'Saúl Escandón',
      customerAddress: '1234 Main St',
      customerCity: 'Huánuco',
      customerState: 'Huánuco',
      customerCountry: 'Perú',
      customerPhone: '555-555-5555',
      items: [
        {
          description: 'custom suit',
          detail: {
            color: 'blue',
            size: '42',
          },
          price: {
            price0: 1500.0,
            price: 1050.0,
            save: 25,
          },
          quantity: 1,
          image:
            'https://mdbcdn.b-cdn.net/img/Photos/Horizontal/E-commerce/new/img(4).webp',
        },
        {
          description: 'playstation 5',
          detail: {
            color: 'white',
            size: '45cmx45cm',
          },
          price: {
            price0: 500.0,
            price: 250.0,
            save: 50,
          },
          quantity: 2,
          image:
            'https://promart.vteximg.com.br/arquivos/ids/931599-1000-1000/image-b08a9ed36e114598bc56d7d4a5e7dd2d.jpg?v=637569550232800000',
        },
      ],
      subTotal: 1550.0,
      shipping: 15.0,
      total: 1565.0,
    };
    const options = {
      format: 'A4',
      displayHeaderFooter: true,
      margin: {
        left: '10mm',
        top: '25mm',
        right: '10mm',
        bottom: '15mm',
      },
      headerTemplate: `<div style="width: 100%; text-align: center;"><span style="font-size: 20px; color: #0d76ba;">Hanimeds</span><br><span class="date" style="font-size:15px"><span></div>`,
      footerTemplate:
        '<div style="width: 100%; text-align: center; font-size: 10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      landscape: true,
    };
    const filePath = join(process.cwd(), 'views/reports', 'pdf-invoice.hbs');
    return createPdf(filePath, options, data);
  }

  async getEquipmentList(
    paginationParams: PaginationParams,
    projectId: string,
  ) {
    const filterEquipmentDto: any = { projectId: [projectId] };
    const results = await this.projectService.getAllEquipments(
      filterEquipmentDto,
      paginationParams,
    );
    console.log('results', results.results[0].data);

    const data = results.results[0];
    // console.log(data);
    // return data;
    const options = {
      format: 'A4',
      displayHeaderFooter: true,
      margin: {
        left: '10mm',
        top: '25mm',
        right: '10mm',
        bottom: '15mm',
      },
      headerTemplate: `<div style="width: 100%; text-align: center;"><span style="font-size: 20px; color: #0d76ba;">Hanimeds</span><br><span class="date" style="font-size:15px"><span></div>`,
      footerTemplate:
        '<div style="width: 100%; text-align: center; font-size: 10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      landscape: true,
    };
    const filePath = join(
      process.cwd(),
      'views/reports',
      'eqp-list-report.hbs',
    );
    return createPdf(filePath, options, data);
  }

  async getEquipmentReports(filterReportDto: FilterReportDto) {
    let results: any;
    if (filterReportDto.reportType === 'equipment-location-listing') {
      const equipments = await this.getAllEqp(filterReportDto);
      // results = await this.projectService.getAllEquipmentsByLocation(
      //   filterReportDto,
      // );
      results = { equipments };
      // results = { equipments: ['test', 'ere', 'dfdf'] };
    } else {
      results = await this.projectService
        .findOne(filterReportDto.projectId)
        .lean();
    }
    // return;

    const data = results;
    const options = {
      format: 'A4',
      displayHeaderFooter: true,
      margin: {
        left: '10mm',
        top: '25mm',
        right: '10mm',
        bottom: '15mm',
      },
      headerTemplate: `<div style="width: 100%; text-align: center;"><span style="font-size: 20px; color: #0d76ba;">Hanimeds</span><br><span class="date" style="font-size:15px"><span></div>`,
      footerTemplate:
        '<div style="width: 100%; text-align: center; font-size: 10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      landscape: true,
    };
    const filePath = join(
      process.cwd(),
      'views/reports/common',
      `${filterReportDto.reportType}.hbs`,
    );
    console.log('data', data);

    return createPdf(filePath, options, data);
  }

  async getAllEqp(filterReportDto) {
    const results = await this.projectService.getAllEquipmentsByLocation(
      filterReportDto,
    );
    // console.log('results', results);
    // return results;
    const eqps = [];
    for (const element of results) {
      if (eqps[element._id] === undefined) {
        eqps[element._id] = [];
      }
      // console.log('ele', element);

      eqps[element._id].push(element);
    }
    console.log('eqps', typeof eqps);
    // console.log('eqps1', eqps.length);
    // console.log('eqps2', eqps);
    const lists = [];
    for (const element1 in eqps) {
      // console.log('element', element1);
      console.log('eqps[element1]', Object.keys(eqps[element1]));
      lists.push({
        project_name: eqps[element1][0].project_name,
        project_code: eqps[element1][0].project_code,
        eqp_code: eqps[element1][0].code,
        eqp_name: eqps[element1][0].name,
        locations: eqps[element1],
      });
    }

    // results.forEach((element) => {
    //   if (eqps[element._id] === undefined) {
    //     eqps[element._id] = [];
    //   }
    //   // console.log('ele', element);

    //   eqps[element._id].push(element);
    // });
    // eqps.forEach();
    return lists;
  }
}
