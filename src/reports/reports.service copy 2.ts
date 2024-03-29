import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createPdf } from '@saemhco/nestjs-html-pdf';
import path, { join, resolve } from 'path';
import { FilterEquipmentDto } from 'src/project/dto/filter-equipment.dto';
import { ProjectService } from 'src/project/project.service';
import { PaginationParams } from 'src/utils/paginationParams';
import { FilterReportDto } from './dto/filter-report.dto';
import Excel, { Workbook } from 'exceljs';
import * as tmp from 'tmp';
import { writeFile } from 'fs/promises';
import { rejects } from 'assert';

import * as fs from 'fs';
import { ProjectEquipmentService } from 'src/project/project-equipment.service';
interface WeeklySalesNumbers {
  product: string;
  week1: number;
  week2: number;
  week3: number;
}
@Injectable()
export class ReportsService {
  reportType = {};
  workbook: Excel.Workbook;
  worksheet: Excel.Worksheet;

  constructor(
    private projectService: ProjectService,
    private projectEquipmentService: ProjectEquipmentService,
  ) {}

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
        top: '32mm',
        right: '10mm',
        bottom: '15mm',
      },
      headerTemplate: `
      <div style="width: 96%; display: flex; flex-direction: column;">
        <div style="font-size: 10px; text-align: right; color: #1cabb1;">
          <i>Page <span class="pageNumber"></span> of <span class="totalPages"></span></i> 
        </div>
        <div style="color: #0d76ba; text-align: center; text-transform:uppercase;">
          <p style="font-size: 13px; font-weight:600; margin-bottom:5px;">Mne Solutions</p>
          <p style="font-size: 10px; margin-bottom:0px; margin-top: 0px;">Medical Equipment Consultancy Service</p>
        </div>
        <div style="padding-left:35px;">
          <p style='color: #304f4f; font-size: 12px; margin-bottom: 5px; margin-top: 0px;'><b>Project Name : <span class="text-uppercase">{{equipments.0.project_name}}</span></b></p>
          <p style='color: #304f4f; font-size: 10px; margin-top: 0px; margin-bottom: 5px;'>Revision No: 5.001* <span style="margin-left:35px;">Date: {{currentDateVV}}</span></p>
          <p style='color: #304f4f; font-size: 12px; margin-top: 0px; margin-bottom: 0px;'><b>Equipment Location Listing  <span style="margin-left:35px;">Qty : Total Quantity</span></b></p>   
        </div>
      </div>       
      `,
      footerTemplate:
        '<div style="width: 100%; text-align: center; font-size: 10px; display: none;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
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

    const data = results.results[0];

    const options = {
      format: 'A4',
      displayHeaderFooter: true,
      margin: {
        left: '10mm',
        top: '32mm',
        right: '10mm',
        bottom: '15mm',
      },
      headerTemplate: `
      <div style="width: 96%; display: flex; flex-direction: column;">
        <div style="font-size: 10px; text-align: right; color: #1cabb1;">
          <i>Page <span class="pageNumber"></span> of <span class="totalPages"></span></i> 
        </div>
        <div style="color: #0d76ba; text-align: center; text-transform:uppercase;">
          <p style="font-size: 13px; font-weight:600; margin-bottom:5px;">Mne Solutions</p>
          <p style="font-size: 10px; margin-bottom:0px; margin-top: 0px;">Medical Equipment Consultancy Service</p>
        </div>
        <div style="padding-left:35px;">
          <p style='color: #304f4f; font-size: 12px; margin-bottom: 5px; margin-top: 0px;'><b>Project Name : <span class="text-uppercase">{{equipments.0.project_name}}</span></b></p>
          <p style='color: #304f4f; font-size: 10px; margin-top: 0px; margin-bottom: 5px;'>Revision No: 5.001* <span style="margin-left:35px;">Date: {{currentDateVV}}</span></p>
          <p style='color: #304f4f; font-size: 12px; margin-top: 0px; margin-bottom: 0px;'><b>Equipment Location Listing  <span style="margin-left:35px;">Qty : Total Quantity</span></b></p>   
        </div>
      </div>`,
      footerTemplate:
        '<div style="width: 100%; text-align: center; font-size: 10px; display: none;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
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
    const results = await this.getQueryData(filterReportDto);
    const data: any = results;
    console.log('results : ', results);
    let project_nam;
    if (results.pname) {
      project_nam = results.pname;
    } else if (results.name) {
      project_nam = results.name;
    } else if (results.results[0].name) {
      project_nam = results.results[0].name;
    } else {
      project_nam = '';
    }

    let rev1;
    let rev2;
    if (results.rev1 || results.rev2) {
      if (!results.rev1) rev1 = '';
      else rev1 = results.rev1;
      if (!results.rev2) rev2 = '';
      else rev2 = ' - ' + results.rev2;
    } else {
      rev1 = '5.001*';
      rev2 = '';
    }

    let reportname;
    if (results.reportname) {
      reportname = results.reportname;
    } else {
      reportname = '';
    }

    if (results) {
      data.currentDate = await this.getCurrentDate();
      data.pagewise = filterReportDto.pagewise;
      data.w_sign = filterReportDto.w_sign;
    }
    const currentDateVal = await this.getCurrentDate();

    const options = {
      format: 'A4',
      displayHeaderFooter: true,
      margin: {
        left: '10mm',
        top: '52mm',
        right: '10mm',
        bottom: '15mm',
      },
      headerTemplate:
        `
      <div style="width: 96%; display: flex; flex-direction: column;">
        <div style="font-size: 10px; text-align: right; color: #1cabb1;">
          <i>Page <span class="pageNumber"></span> of <span class="totalPages"></span></i> 
        </div>
        <div style="color: #0d76ba; text-align: center; text-transform:uppercase;">
          <p style="font-size: 13px; font-weight:600; margin-bottom:5px;">Mne Solutions</p>
          <p style="font-size: 10px; margin-bottom:15px; margin-top: 0px;">Medical Equipment Consultancy Service</p>
        </div>
        <div style="padding-left:35px;">
          <p style='color: #304f4f; font-size: 12px; margin-bottom: 5px; margin-top: 0px;'><b>Project Name : <span class="text-uppercase">` +
        project_nam +
        `</span></b></p>
          <p style='color: #304f4f; font-size: 10px; margin-top: 0px; margin-bottom: 5px;'>Revision No: ` +
        rev1 +
        rev2 +
        ` <span style="margin-left:35px;">Date: ` +
        currentDateVal +
        `</span></p>
          <p style='color: #304f4f; font-size: 12px; margin-top: 0px; margin-bottom: 0px;'><b>` +
        reportname +
        ` <span style="margin-left:35px;">Qty : Total Quantity</span></b></p>   
        </div>   
      </div>
      `,
      footerTemplate:
        '<div style="width: 100%; text-align: center; font-size: 10px; display: none;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      landscape: true,
    };
    // return data;
    const filePath = join(
      process.cwd(),
      'views/reports/common',
      `${filterReportDto.reportType}.hbs`,
    );

    return createPdf(filePath, options, data);
  }

  async getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    // return `${year}-${month}-${day}`;
    return `${day}/${month}/${year}`;
  }
  async getAllremove_duplicates(department) {
    type EquipmentItem = {
      equipmentId: string;
      name: string;
      code: string;
      _id: string;
      total?: number;
    };
    const eqps = [];
    for (const element3 of department) {
      for (const element2 of element3.rooms) {
        for (const element of element2.equipments) {
          if (eqps[element._id] === undefined) {
            //eqps[element._id] = [];
          }

          eqps.push(element);
        }
      }
    }

    const lists = [];
    //for (const element1 in eqps) {

    const items = eqps;

    const inputArray: EquipmentItem[] = eqps;
    //const uniqueItems: { [id: string]  } = {};

    const uniqueItems: { [id: string]: EquipmentItem } = {};
    items.forEach((item) => {
      if (uniqueItems[item.code]) {
        uniqueItems[item.code].total = (uniqueItems[item.code].total || 0) + 1;
      } else {
        uniqueItems[item.code] = { ...item, total: 1 };
      }
    });

    return Object.values(uniqueItems);
  }
  async getAllEqp_group(filterReportDto) {
    console.log('equipmentsv9');
    const results = await this.projectService.getAllEquipmentsByLocation(
      filterReportDto,
    );

    const eqps = [];
    for (const element of results) {
      if (eqps[element._id] === undefined) {
        eqps[element._id] = [];
      }
      eqps[element._id].push(element);
    }

    const lists = [];
    for (const element1 in eqps) {
      console.log('testv8');
      // console.log(element1.code);

      const total = 0;
      const room_info = [];
      const rooms = [];
      const total_equ_array = [];
      const items = eqps[element1];
      type EquipmentItem = {
        _id: string;
        code: string;
        name: string;
        project_code: string;
        project_name: string;
        room_code: string;
        room_name: string;
        department_code: string;
        department_name: string;
        qty1: number;
        totalequ: number;
        total?: number;
      };

      const inputArray: EquipmentItem[] = eqps[element1];

      const uniqueItems: { [id: string]: EquipmentItem } = {};
      items.forEach((item) => {
        if (uniqueItems[item.room_code]) {
          uniqueItems[item.room_code].total =
            (uniqueItems[item.room_code].total || 0) + 1;
        } else {
          uniqueItems[item.room_code] = { ...item, total: 1 };
        }
      });
      // console.log("ffffffvin");
      //console.log(uniqueItems);

      lists.push({
        project_name: eqps[element1][0].project_name,
        project_code: eqps[element1][0].project_code,
        eqp_code: eqps[element1][0].code,
        eqp_name: eqps[element1][0].name,
        group: eqps[element1][0].group,
        cost: eqps[element1][0].cost,
        sum: eqps[element1][0].totalequ,

        //locations: room_info,
        locations: Object.values(uniqueItems),
        total_equ: total_equ_array,
        //data1:data1,
      });
      //}
    }

    return lists;
  }
  async getAllEqp(filterReportDto) {
    console.log('equipmentsv9');
    const results = await this.projectService.getAllEquipmentsByLocation(
      filterReportDto,
    );

    //console.log('resultsv4', results);
    const eqps = [];
    for (const element of results) {
      if (eqps[element._id] === undefined) {
        eqps[element._id] = [];
      }
      console.log('equipmentsv23', element);

      const results2 = await this.projectService.getProjectEquipmentsbyroom(
        filterReportDto.projectId,
        element.room_id,
        element.code,
      );
      element.qty1 = Object.values(results2).length;

      element.totalequ = results2.results[0].metadata[0].total;

      eqps[element._id].push(element);
    }

    const lists = [];
    for (const element1 in eqps) {
      const total = 0;
      const room_info = [];
      const rooms = [];
      const total_equ_array = [];
      const items = eqps[element1];
      type EquipmentItem = {
        _id: string;
        code: string;
        name: string;
        project_code: string;
        project_name: string;
        room_code: string;
        room_name: string;
        department_code: string;
        department_name: string;
        qty1: number;
        totalequ: number;
        total?: number;
      };

      const inputArray: EquipmentItem[] = eqps[element1];

      const uniqueItems: { [id: string]: EquipmentItem } = {};
      items.forEach((item) => {
        if (uniqueItems[item.room_code]) {
          uniqueItems[item.room_code].total =
            (uniqueItems[item.room_code].total || 0) + 1;
        } else {
          uniqueItems[item.room_code] = { ...item, total: 1 };
        }
      });

      //  if(Object.values(uniqueItems).length > 0)
      // {
      lists.push({
        project_name: eqps[element1][0].project_name,
        project_code: eqps[element1][0].project_code,
        eqp_code: eqps[element1][0].code,
        eqp_name: eqps[element1][0].name,
        group: eqps[element1][0].group,
        cost: eqps[element1][0].cost,
        sum: eqps[element1][0].totalequ,

        //locations: room_info,
        locations: Object.values(uniqueItems),
        total_equ: total_equ_array,
        //data1:data1,
      });
      //}
    }

    return lists;
  }

  async xl1(res) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Report');

    worksheet.columns = [
      { header: 'Id', key: 'id', width: 5 },
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Description', key: 'description', width: 25 },
      { header: 'Published', key: 'published', width: 10 },
    ];

    const tutorials = [
      { id: 1, title: 'hghhg', description: 'hhjhjhj', published: 'hghgghhg' },
    ];

    // Add Array Rows
    worksheet.addRows(tutorials);

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    return await workbook.xlsx.write(res);
  }
  async xlExport(res, filterReportDto: FilterReportDto) {
    const results = await this.getQueryData(filterReportDto);
    const data: any = results;

    this.workbook = new Workbook();
    this.worksheet = this.workbook.addWorksheet('Report', {
      headerFooter: {
        firstHeader: 'Hello Exceljs',
        firstFooter: 'Hello World',
      },
    });
    if (filterReportDto.reportType === 'department-list') {
      const depts = [];
      data.departments.forEach((item) => {
        depts.push([item.code, item.name]);
      });
      this.worksheet.addTable({
        name: 'MyTable',
        ref: 'A1',
        headerRow: true,
        // totalsRow: true,
        // style: {
        //   theme: 'TableStyleDark3',
        //   showRowStripes: true,
        // },
        columns: [{ name: 'Code' }, { name: 'Name' }],
        rows: depts,
      });
    }

    // worksheet.addTable({
    //   name: 'MyTable2',
    //   ref: 'A10',
    //   headerRow: true,
    //   totalsRow: true,
    //   // style: {
    //   //   theme: 'TableStyleDark3',
    //   //   showRowStripes: true,
    //   // },
    //   columns: [
    //     { name: 'Date', totalsRowLabel: 'Totals:', filterButton: true },
    //     { name: 'Amount', totalsRowFunction: 'sum', filterButton: false },
    //   ],
    //   rows: [
    //     [new Date('2019-07-20'), 70.1],
    //     [new Date('2019-07-21'), 70.6],
    //     [new Date('2019-07-22'), 70.1],
    //   ],
    // });

    return await this.workbook.xlsx.write(res);
    // return await workbook.xlsx.writeFile('newSaveeee.xlsx');
  }
  async xl(res, filterReportDto: FilterReportDto) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Report', {
      headerFooter: {
        firstHeader: 'Hello Exceljs',
        firstFooter: 'Hello World',
      },
    });

    /*
    worksheet.addTable({
      name: 'MyTable',
      ref: 'A1',
      headerRow: true,
      totalsRow: true,
      style: {
        theme: 'TableStyleDark3',
        showRowStripes: true,
      },
      columns: [
        { name: 'name', totalsRowLabel: 'Totals:', filterButton: true },
        { name: 'Amount', totalsRowFunction: 'sum', filterButton: false },
      ],

      
      rows: [
        [new Date('2019-07-20'), 70.1],
        [new Date('2019-07-21'), 70.6],
        [new Date('2019-07-22'), 70.1],
      ],
    });
    */
    const results = await this.getQueryData(filterReportDto);
    const rowarray = [];

    const row = worksheet.addRow(['MNE SOLUTIONS']);
    const cell = row.getCell(1);
    cell.font = { bold: true };
    worksheet.addRow(['MEDICAL EQUIPMENT CONSULTANCY SERVICE']);
    worksheet.addRow([]);
    worksheet.addRow([]);

    if (filterReportDto.reportType === 'equipment-location-listing') {
      const row5 = worksheet.addRow([
        'Project Name:' + results.equipments[0].project_name,
      ]);
      const cell5 = row5.getCell(1);
      cell5.font = { bold: true };

      worksheet.addRow([
        'Revision No: 5.001*',
        '',
        '',
        'Date:' + (await this.getCurrentDate()),
      ]);

      let sub_total = 0;
      results.equipments.forEach((item) => {
        worksheet.addRow([]);
        worksheet.addRow(['Equipment: ', item.eqp_code, item.eqp_name]);
        worksheet.addRow([
          'Dept Code: ',
          'Department',
          'Room Code',
          'Room Name',
          'Quantity',
          'Group',
          'Remarks',
        ]);
        let total = 0;
        item.locations.forEach((item2) => {
          worksheet.addRow([
            item2.department_code,
            item2.department_name,
            item2.room_code,
            item2.room_name,
            item2.quantity,
          ]);
          if (typeof item2.quantity === 'number') {
            total += item2.quantity;
          }
        });
        sub_total += total;
        worksheet.addRow(['', '', '', 'Sub-total', total]);
        worksheet.addRow([]);
        worksheet.addRow([]);

        worksheet.addRow(['Total Equipments', sub_total]);
      });
    } else if (filterReportDto.reportType === 'department-list') {
      const row5 = worksheet.addRow(['Project Name:' + results.name]);
      const cell5 = row5.getCell(1);
      cell5.font = { bold: true };
      worksheet.addRow([
        'Revision No: 5.001*',
        '',
        '',
        'Date:' + (await this.getCurrentDate()),
      ]);

      worksheet.addRow(['Department List']);
      worksheet.addRow([]);
      worksheet.addRow(['Dept Code: ', 'Department']);

      results.departments.forEach((item) => {
        worksheet.addRow([]);
        worksheet.addRow([item.code, item.name]);
      });
    } else if (filterReportDto.reportType === 'room-listing') {
      const row5 = worksheet.addRow(['Project Name:' + results.name]);
      const cell5 = row5.getCell(1);
      cell5.font = { bold: true };
      worksheet.addRow([
        'Revision No: 5.001*',
        '',
        '',
        'Date:' + (await this.getCurrentDate()),
      ]);

      worksheet.addRow(['Room Listing']);
      worksheet.addRow([]);
      worksheet.addRow(['Dept Code: ', 'Department']);

      results.departments.forEach((item) => {
        worksheet.addRow(['Department: ', item.code, item.name]);
        item.rooms.forEach((item2) => {
          worksheet.addRow([item2.code, item2.name, item2.status]);
        });
        worksheet.addRow([]);

        //worksheet.addRow([item.code, item.name]);
      });
    } else if (filterReportDto.reportType === 'equipment-listing-bq') {
      const row5 = worksheet.addRow(['Project Name:' + results.name]);
      const cell5 = row5.getCell(1);
      cell5.font = { bold: true };
      worksheet.addRow([
        'Revision No: 5.001*',
        '',
        '',
        'Date:' + (await this.getCurrentDate()),
      ]);

      worksheet.addRow(['Equipment Listing(BQ)']);
      worksheet.addRow([]);
      worksheet.addRow(['Code: ', 'Equipment', 'Qty', 'Group', 'Remarks']);
      let sub_total = 0;
      results.EquipmentItemlist.forEach((item) => {
        worksheet.addRow([
          item.code,
          item.name,
          item.quantity,
          item.group,
          item.remarks,
        ]);

        worksheet.addRow([]);
        if (typeof item.quantity === 'number') {
          sub_total += item.quantity;
        }
        //worksheet.addRow([item.code, item.name]);
      });
      worksheet.addRow([]);

      worksheet.addRow(['Total Equipments:' + sub_total]);
    }

    return await workbook.xlsx.write(res);
    // return await workbook.xlsx.writeFile('newSaveeee.xlsx');
  }

  async getQueryData(filterReportDto: FilterReportDto) {
    let results: any;
    type EquipmentItem = {
      _id: string;
      code: string;
      name: string;
      project_code: string;
      project_name: string;
      room_code: string;
      room_name: string;
      department_code: string;
      department_name: string;
      qty1: number;
      totalequ: number;
      total?: number;
    };
    filterReportDto.limit = 200;
    filterReportDto.lean = true;
    const equipmentsRes: any = await this.projectEquipmentService.findAll(
      filterReportDto,
    );
    // equipmentsRes = equipmentsRes.lean();
    if (filterReportDto.reportType === 'equipment-location-listing') {
      const eqpData = [];
      const eqps = [];
      let pname = '';
      for (const eqp of equipmentsRes.results) {
        pname = eqp.project.name;
        if (eqps[eqp.code] === undefined) {
          eqps[eqp.code] = { eqp, locations: [] };
        }
        // console.log('eqp----', eqp);
        eqps[eqp.code].locations.push(eqp);

        // equipments.push({ eqp: eqps[eqp][0], locations: eqps[eqp] });
      }
      console.log('equipmentsv23', eqps);
      const equipments: any = [];
      // eqps.forEach((item, key) => {});
      for (const eqp in eqps) {
        equipments.push(eqps[eqp]);
      }
      // const equipments = eqps;
      // const equipments = await this.getAllEqp(filterReportDto);
      results = { equipments, pname };
      results.reportname = 'Equipment Location Listing';
    } else if (
      filterReportDto.reportType === 'equipment-location-listing-by-pages'
    ) {
      const equipments = await this.getAllEqp(filterReportDto);
      results = { equipments };
      results.pname = equipments[0].project_name;
      results.reportname = 'Equipment Location Listing';
      //results.pname = equipments.0.project_name;
    } else if (
      filterReportDto.reportType ===
        'equipment-listing-with-revisions-variations' ||
      filterReportDto.reportType ===
        'equipment-listing-price-with-revisions-variations'
    ) {
      results = await this.projectService.getAllEquipments_unique_dsply(
        filterReportDto,
      );
      const rev_id1 = filterReportDto.rev1;
      const rev_id2 = filterReportDto.rev2;
      interface EquipmentItem {
        _id: string;
        code: string;
        name: string;
        cost: string;
        cost_rev2: string;
        quantity: number | null;
        quantity_rev2: number | null;
        room_code: string;
        room_name: string;
        project_name: string;
      }
      const results_rev1: EquipmentItem[] =
        await this.projectService.getAllEquipments_unique_dsply_by_revision(
          filterReportDto,
          rev_id1,
        );
      const results_rev2: EquipmentItem[] =
        await this.projectService.getAllEquipments_unique_dsply_by_revision(
          filterReportDto,
          rev_id2,
        );
      // Create a map from code to EquipmentItem for results_rev2
      const mapRev2: { [_id: string]: EquipmentItem } = {};
      results_rev2.forEach((item) => {
        mapRev2[item._id] = item;
      });
      // Update results_rev1 with quantity_rev2 from results_rev2
      results_rev1.forEach((item) => {
        const matchingItem = mapRev2[item._id];
        if (matchingItem) {
          item.quantity_rev2 = matchingItem.quantity;
          item.cost_rev2 = matchingItem.cost;
        }
      });
      results.EquipmentItemlist = results_rev1;
      results.rev1 = rev_id1;
      results.rev2 = rev_id2;
      results.reportname = 'Equipment Variation Listing (BQ)';
    } else if (filterReportDto.reportType === 'equipment-listing-bq') {
      results = await this.projectService.getAllEquipments_unique_dsply(
        filterReportDto,
      );
      results.EquipmentItemlist = results.results;
      results.reportname = 'Equipment Listing (BQ)';
    } else if (
      filterReportDto.reportType === 'equipment-listing-bq-with-price'
    ) {
      results = await this.projectService.getAllEquipments_unique_dsply(
        filterReportDto,
      );
      results.EquipmentItemlist = results.results;
      results.reportname = 'Equipment Listing (BQ)';
    } else if (filterReportDto.reportType === 'disabled-equipment-listing-bq') {
      const results = await this.projectService.getAllDisabledEquipments(
        filterReportDto,
      );
    } else if (
      filterReportDto.reportType === 'disabled-equipment-listing-bq-with-price'
    ) {
      const results = await this.projectService.getAllDisabledEquipments(
        filterReportDto,
      );
    } else if (
      filterReportDto.reportType === 'equipment-listing-by-department'
    ) {
      results = await this.projectService
        .findOne(filterReportDto.projectId)
        .lean();

      results.departments.forEach((item) => {
        item.pagewise = filterReportDto.pagewise;
      });
      results.reportname = 'Equipment Listing By Department';
    } else if (
      filterReportDto.reportType ===
      'equipment-listing-by-department-with-price'
    ) {
      results = await this.projectService
        .findOne(filterReportDto.projectId)
        .lean();
      results.reportname = 'Equipment Listing By Department';
    } else if (
      filterReportDto.reportType === 'equipment-listing-by-department-and-room'
    ) {
      const resultsData = await this.projectService
        .findOne(filterReportDto.projectId)
        .lean();

      const rooms_id_data = filterReportDto.roomIds; //['648972be6be3d0e6681efe07', '648972356be3d0e6681efdbc'];
      console.log('Test v89999');
      console.log(rooms_id_data);
      // if (rooms_id_data.length > 0) {
      if (rooms_id_data) {
        // Create a copy of the original data
        const newData = { ...resultsData };
        // Iterate through departments and filter rooms based on rooms_id
        newData.departments.forEach((department) => {
          department.rooms = department.rooms.filter((room) =>
            rooms_id_data.includes(room.roomId),
          );
        });
        results = newData;
      } else {
        results = resultsData;
      }

      results.departments.forEach((item) => {
        item.pagewise = filterReportDto.pagewise;
        if (item.departmentId) {
          item.rooms.forEach((item_r) => {
            item_r.pagewise = filterReportDto.pagewise;
            item_r.w_sign = filterReportDto.w_sign;
          });
        }
      });
      results.reportname = 'Equipment Listing By Department and Room';
    } else if (
      filterReportDto.reportType ===
      ' equipment-listing-by-department-and-room-with-price'
    ) {
      const resultsData = await this.projectService
        .findOne(filterReportDto.projectId)
        .lean();

      const rooms_id_data = filterReportDto.roomIds; //['648972be6be3d0e6681efe07', '648972356be3d0e6681efdbc'];
      console.log('Test v89999');
      console.log(rooms_id_data);
      // if (rooms_id_data.length > 0) {
      if (rooms_id_data) {
        // Create a copy of the original data
        const newData = { ...resultsData };
        // Iterate through departments and filter rooms based on rooms_id
        newData.departments.forEach((department) => {
          department.rooms = department.rooms.filter((room) =>
            rooms_id_data.includes(room.roomId),
          );
        });
        results = newData;
      } else {
        results = resultsData;
      }

      results.reportname = 'Equipment Listing By Department and Room';
      results.departments.forEach((item) => {
        item.pagewise = filterReportDto.pagewise;
        if (item.departmentId) {
          item.rooms.forEach((item_r) => {
            item_r.pagewise = filterReportDto.pagewise;
            item_r.w_sign = filterReportDto.w_sign;
          });
        }
      });
    } else if (
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-disabled'
    ) {
      const results_val =
        await this.projectService.getAllDisabledEquipmentsbyroomdepart(
          filterReportDto,
        );
      results = results_val[0];
      results.reportname = 'Equipment Listing By Department and Room Disabled';
    } else if (
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-disabled-price'
    ) {
      const results_val =
        await this.projectService.getAllDisabledEquipmentsbyroomdepart(
          filterReportDto,
        );
      results = results_val[0];
      results.reportname = 'Equipment Listing By Department and Room Disabled';
    } else if (
      filterReportDto.reportType === 'equipment-listing-bq-by-group' ||
      filterReportDto.reportType === 'equipment-listing-bq-with-price-by-group'
    ) {
      interface EquipmentItemArray {
        _id: string;
        code: string;
        name: string;
        quantity: number;
        group: string;
        project_code: string;
        project_name: string;
        room_code: string;
        room_name: string;
        department_code: string;
        department_name: string;
      }
      const results_val_array =
        await this.projectService.getAllEquipmentsbygroup(
          filterReportDto,
          null,
        );

      const equipmentItems: EquipmentItemArray[] =
        results_val_array.EquipmentItemlist;
      const groupedByDepartment: Record<string, EquipmentItemArray[]> = {};
      equipmentItems.forEach((item) => {
        const group = item.group ? item.group : 'no-group';
        if (!groupedByDepartment[group]) {
          groupedByDepartment[group] = [];
        }
        groupedByDepartment[group].push(item);
      });

      if ('no-group' in groupedByDepartment) {
        const Nogroup = groupedByDepartment['no-group'];
        delete groupedByDepartment['no-group'];
        groupedByDepartment['no-group'] = Nogroup;
      }

      results = { groupedByDepartment };
      results.reportname = 'Equipment Listing BQ';
      if (results_val_array.EquipmentItemlist[0]) {
        results.pname = results_val_array.EquipmentItemlist[0].project_name;
      } else {
        results.pname = '';
      }
    } else if (
      filterReportDto.reportType === 'equipment-listing-bq-by-group-revision' ||
      filterReportDto.reportType ===
        'equipment-listing-bq-with-price-by-group-revision'
    ) {
      interface EquipmentItemArray {
        _id: string;
        code: string;
        name: string;
        quantity: number;
        cost: string;
        cost_rev2: string;
        quantity_rev2: number | null;
        group: string;
        project_code: string;
        project_name: string;
        room_code: string;
        room_name: string;
        department_code: string;
        department_name: string;
      }
      const rev_id1 = filterReportDto.rev1;
      const rev_id2 = filterReportDto.rev2;
      const results_val_array =
        await this.projectService.getAllEquipmentsbygroup(
          filterReportDto,
          rev_id1,
        );
      const results_val_array2 =
        await this.projectService.getAllEquipmentsbygroup(
          filterReportDto,
          rev_id2,
        );
      const results_val_array4 = results_val_array2.EquipmentItemlist;
      const mapRev2: { [_id: string]: EquipmentItemArray } = {};
      results_val_array4.forEach((item) => {
        mapRev2[item._id] = item;
      });
      const equipmentItems: EquipmentItemArray[] =
        results_val_array.EquipmentItemlist;
      const groupedByDepartment: Record<string, EquipmentItemArray[]> = {};
      equipmentItems.forEach((item) => {
        const group = item.group ? item.group : 'no-group';
        if (!groupedByDepartment[group]) {
          groupedByDepartment[group] = [];
        }
        const matchingItem = mapRev2[item._id];
        if (matchingItem) {
          //if(group===matchingItem.group)
          {
            item.quantity_rev2 = matchingItem.quantity;
            item.cost_rev2 = matchingItem.cost;
          }
        }
        groupedByDepartment[group].push(item);
      });

      if ('no-group' in groupedByDepartment) {
        const Nogroup = groupedByDepartment['no-group'];
        delete groupedByDepartment['no-group'];
        groupedByDepartment['no-group'] = Nogroup;
      }
      console.log('ffff');
      console.log(groupedByDepartment);
      results = { groupedByDepartment };
      results.rev1 = rev_id1;
      results.rev2 = rev_id2;
      results.reportname = 'Equipment Listing BQ Group Revision';
      if (results_val_array.EquipmentItemlist[0]) {
        results.pname = results_val_array.EquipmentItemlist[0].project_name;
      } else {
        results.pname = '';
      }
    } else if (
      filterReportDto.reportType === 'equipment-location-listing-by-group'
    ) {
      /*
      const results_val =
        await this.projectService.getAllEquipmentsByLocation(
          filterReportDto,
        ); */
      const equipments = await this.getAllEqp_group(filterReportDto);
      console.log('equipmentsv7');
      console.log(equipments);
      results = { equipments };
      interface EquipmentItemArray {
        _id: string;
        code: string;
        name: string;
        quantity: number;
        group: string;
        project_code: string;
        project_name: string;
        room_code: string;
        room_name: string;
        department_code: string;
        department_name: string;
        qunatity: number;
        totalequ: string;
        location: [];
      }
      const results_val_array =
        await this.projectService.getAllEquipmentsbygroup(
          filterReportDto,
          null,
        );

      const equipmentItems: EquipmentItemArray[] = results.equipments;
      const groupedByDepartment: Record<string, EquipmentItemArray[]> = {};

      equipmentItems.forEach((item) => {
        const group = item.group ? item.group : 'no-group';
        if (!groupedByDepartment[group]) {
          groupedByDepartment[group] = [];
        }

        groupedByDepartment[group].push(item);
      });
      results = { groupedByDepartment };

      results.pname = results_val_array.EquipmentItemlist[0].project_name
        ? results_val_array.EquipmentItemlist[0].project_name
        : '';
      results.reportname = 'Equipment Location Listing BQ';
    } else if (
      filterReportDto.reportType ===
        'equipment-listing-by-department-by-group' ||
      filterReportDto.reportType ===
        'equipment-listing-by-department-with-price-by-group'
    ) {
      const results_val =
        await this.projectService.getdepartmentEquipmentsbygroups(
          filterReportDto,
        );

      interface EquipmentItemArray {
        _id: string;
        code: string;
        name: string;
        quantity: number;
        group: string;
        project_code: string;
        project_name: string;
        room_code: string;
        room_name: string;
        department_code: string;
        department_name: string;
        qunatity: number;
        totalequ: string;
        location: [];
      }

      const results_val_array =
        await this.projectService.getAllEquipmentsbygroup(
          filterReportDto,
          null,
        );

      const equipmentItems: EquipmentItemArray[] = results_val;
      const groupedByDepartment: Record<string, EquipmentItemArray[]> = {};
      const departmentArray: any[] = [];
      const departmentArray_new: any[] = [];

      equipmentItems.forEach((item) => {
        const department_code = item.group ? item.group : 'no-group';
        if (!groupedByDepartment[department_code]) {
          groupedByDepartment[department_code] = [];
        }

        groupedByDepartment[department_code].push(item);
      });

      console.log('fffff');
      //console.log(groupedByDepartment.FN3003);
      results = { groupedByDepartment };
      console.log('fffffDDDDDDDDDDDDDD');
      //console.log(results);
      console.log(JSON.stringify(results));
      results.pname = results_val_array.EquipmentItemlist[0].project_name;
      results.reportname = 'Equipment Listing by Department';
    } else if (
      filterReportDto.reportType ===
        'equipment-listing-by-department-and-room-by-group' ||
      filterReportDto.reportType ===
        'equipment-listing-by-department-and-room-with-price-by-group'
    ) {
      const departmentArray_new: any[] = [];
      const roomsdepartmentArray_new: any[] = [];
      const rev_id = 0;

      const results_val =
        await this.projectService.getAllEquipmentsbyroomdepartbygroup(
          filterReportDto,
          rev_id,
        );

      results_val[0].departments.forEach((item) => {
        item.rooms.forEach((itemeq) => {
          const departmentArray_new = {};
          itemeq.equipments.forEach((itemeq3) => {
            const group = itemeq3.group ? itemeq3.group : 'no-group';
            if (!departmentArray_new[group]) {
              departmentArray_new[group] = [];
            }
            departmentArray_new[group].push(itemeq3);
          });

          if ('no-group' in departmentArray_new) {
            const Nogroup = departmentArray_new['no-group'];
            delete departmentArray_new['no-group'];
            departmentArray_new['no-group'] = Nogroup;
          }

          itemeq.group = departmentArray_new;
        });
      });

      results = results_val[0];
      results.pname = results.name;
      results.reportname = 'Equipment Listing by Department';
    } else if (
      filterReportDto.reportType ===
        'equipment-listing-by-department-and-room-by-group-revision' ||
      filterReportDto.reportType ===
        'equipment-listing-by-department-and-room-with-price-by-group-rev'
    ) {
      const departmentArray_new: any[] = [];
      const roomsdepartmentArray_new: any[] = [];

      const rev_id1 = filterReportDto.rev1;
      const rev_id2 = filterReportDto.rev2;
      const results_val =
        await this.projectService.getAllEquipmentsbyroomdepartbygroup(
          filterReportDto,
          rev_id1,
        );
      const results_val2 =
        await this.projectService.getAllEquipmentsbyroomdepartbygroup(
          filterReportDto,
          rev_id2,
        );

      const results_rev1 = results_val[0];
      const results_rev2 = results_val2[0];
      //const mapRev2: { [_id: string]: EquipmentItemArray } = {};

      //console.log("gggggggggggggg::::::::");
      //console.log(results_val2);

      for (let i = 0; i < results_rev1.departments.length; i++) {
        const department = results_rev1.departments[i];
        const matchingDepartment = results_rev2.departments.find(
          (d) => d.departmentId === department.departmentId,
        );
        if (matchingDepartment) {
          for (let j = 0; j < department.rooms.length; j++) {
            const room = department.rooms[j];
            const matchingRoom = matchingDepartment.rooms.find(
              (r) => r.roomId === room.roomId,
            );
            if (matchingRoom) {
              for (let k = 0; k < room.equipments.length; k++) {
                const equipment = room.equipments[k];
                const matchingEquipment = matchingRoom.equipments.find(
                  (e) => e.equipmentId === equipment.equipmentId,
                );

                if (
                  matchingEquipment &&
                  matchingEquipment.cost &&
                  matchingEquipment.quantity
                ) {
                  if (equipment.equipmentId === matchingEquipment.equipmentId) {
                    equipment.cost_rev2 = matchingEquipment.cost;
                    equipment.quantity_rev2 = matchingEquipment.quantity;
                  }
                }
              }
            }
          }
        }
      }
      results_rev1.departments.forEach((item) => {
        item.rooms.forEach((itemeq) => {
          const departmentArray_new = {};
          itemeq.equipments.forEach((itemeq3) => {
            const group = itemeq3.group ? itemeq3.group : 'no-group';

            if (!departmentArray_new[group]) {
              departmentArray_new[group] = [];
            }

            departmentArray_new[group].push(itemeq3);
          });

          if ('no-group' in departmentArray_new) {
            const Nogroup = departmentArray_new['no-group'];
            delete departmentArray_new['no-group'];
            departmentArray_new['no-group'] = Nogroup;
          }

          itemeq.group = departmentArray_new;
        });
      });

      results = results_rev1;
      results.pname = results.name;
      results.rev1 = rev_id1;
      results.rev2 = rev_id2;
      results.reportname =
        'Equipment Variation Listing(BQ) By Department and Room';
    } else if (
      filterReportDto.reportType === 'equipment-listing-bq-with-utility'
    ) {
      const results_val = await this.projectService.getAllEquipmentswithUtility(
        filterReportDto,
      );

      results = results_val[0];
      results.top_logo = filterReportDto.top_logo;
      results.b_logo = filterReportDto.b_logo;
      results.medical_logo = filterReportDto.medical_logo;
      results.medical_logo2 = filterReportDto.medical_logo2;
      results.medical_logo3 = filterReportDto.medical_logo3;
      results.reportname = 'Equipment Listing BQ';
    } else if (
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-with-utility'
    ) {
      const results_val = await this.projectService.getAllEquipmentswithUtility(
        filterReportDto,
      );
      results = await this.projectService
        .findOne(filterReportDto.projectId)
        .lean();
      results.pagewise = filterReportDto.pagewise;
      results.top_logo = filterReportDto.top_logo;
      results.b_logo = filterReportDto.b_logo;
      results.medical_logo = filterReportDto.medical_logo;
      results.medical_logo2 = filterReportDto.medical_logo2;
      results.medical_logo3 = filterReportDto.medical_logo3;

      results.reportname = 'Equipment Listing(BQ) By Department and Room';
    } else {
      results = await this.projectService
        .findOne(filterReportDto.projectId)
        .lean();
      if (
        filterReportDto.reportType ===
        'equipment-listing-by-department-and-room-with-price'
      ) {
        results.reportname = 'Equipment Listing By Department and Room';
      } else if (filterReportDto.reportType === 'equipment-listing-by-floor') {
        results.reportname = 'Equipment Listing By Floor';
      } else if (filterReportDto.reportType === 'room-listing') {
        results.reportname = 'Room Listing';
      } else if (filterReportDto.reportType === 'department-list') {
        results.reportname = 'Department Listing';
      } else if (
        filterReportDto.reportType ===
          'equipment-room-to-room-variation-with-price' ||
        filterReportDto.reportType === 'equipment-room-to-room-variation'
      ) {
        results.reportname = 'Equipment room to room variation';
      } else {
        results.reportname = 'Equipment Listing BQ';
      }
    }
    return results;
  }
}
