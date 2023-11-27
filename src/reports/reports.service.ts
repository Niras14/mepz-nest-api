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
import mongoose, { Model, FilterQuery } from 'mongoose';

interface WeeklySalesNumbers {
  product: string;
  week1: number;
  week2: number;
  week3: number;
}
interface Item {
  name: string;
  code: string;
  qty: number | undefined;
  cost: string | undefined;
  group: string | undefined;
  remarks: string | undefined;
  utility: string | undefined;
  qty_rev: number | undefined;
  cost_rev: string | undefined;
}
@Injectable()
export class ReportsService {
  reportType = {};
  workbook: Excel.Workbook;
  worksheet: Excel.Worksheet;

  constructor(
    private projectService: ProjectService,
    private projectEquipmentService: ProjectEquipmentService,
  ) { }

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
    mongoose.set('debug', true);
    const results = await this.getQueryData(filterReportDto);
    const data: any = results;
    // console.log('results : ', results);
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
      rev1 = results.rev_number? results.rev_number:'--';
      rev2 = '';
    }

    let reportname, package_name;
    if (results.reportname) {
      reportname = results.reportname;

    } else {
      reportname = package_name = '';

    }
    if (results.package1) {

      package_name = "Package : " + results.package1;
    } else {
      package_name = '';

    }

    if (results) {
      data.currentDate = await this.getCurrentDate();
      data.pagewise = filterReportDto.pagewise;
      data.w_sign = filterReportDto.w_sign;
    }
    let b_log_img = '';
    let medical_logo = '';
    if (filterReportDto.b_logo) {
      b_log_img = ' <img style="height: 30px; width: auto;" src="http://13.232.11.217/assets/images/logo.png"> ';
    }
    if (filterReportDto.medical_logo) {
      medical_logo = ' <img style="height: 30px; width: auto;" src="http://13.232.11.217/assets/images/logo.png"> ';
    }
    const currentDateVal = await this.getCurrentDate();
    const options = {
      format: 'A4',
      displayHeaderFooter: true,
      margin: {
        left: '10mm',
        top: '60mm',
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
        <div style="text-align: right; ">
        <p> `+ b_log_img + `</p> 
        <p> `+ medical_logo + `</p> 
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
        <p style='color: #304f4f; font-size: 12px; margin-top: 10px; margin-bottom: 0px;'><b> ` +
        package_name +
        ` </b></p>
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
    filterReportDto.limit = 20;
    const results = await this.projectEquipmentService.findAll(filterReportDto);
    return results;
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

    const headerText1 = 'MNE SOLUTIONS';
    const headerText2 = 'MEDICAL EQUIPMENT CONSULTANCY SERVICE,';
    const headerText3 = '';
    const headerText4 = '';
    const headerText5 = 'Project Name: '+ project_nam;
    const headerText6 = 'Revision No: 5.001*  Date: '+ (await this.getCurrentDate());
    const headerText7 = '';
    
    this.workbook = new Workbook();
    this.worksheet = this.workbook.addWorksheet('Report', {
      headerFooter: {
        firstHeader: 'Hello Exceljs',
        firstFooter: 'Hello World',
      },
    });
    const row = this.worksheet.addRow([headerText1]);
    const cell = row.getCell(1);
    cell.font = { bold: true };
    this.worksheet.addRow([headerText2]);
    this.worksheet.addRow([headerText3]);
    this.worksheet.addRow([headerText4]);
    this.worksheet.addRow([headerText5]);
    this.worksheet.addRow([headerText6]);
    this.worksheet.addRow([headerText7]);
    if (filterReportDto.reportType === 'equipment-location-listing') {
    
  
     

      let sub_total = 0;
      results.equipments.forEach((item) => {
       this.worksheet.addRow([]);
       this.worksheet.addRow(['Equipment: ', item.code, item.name]);
       this.worksheet.addRow([
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
          this.worksheet.addRow([
            item2.department.code,
            item2.department.name,
            item2.room.code,
            item2.room.name,
            item2.qty,
            item2.group,
            item2.remarks,
          ]);
          if (typeof item2.qty === 'number') {
            total += item2.qty;
          }
        });


        sub_total += total;
        this.worksheet.addRow(['', '', '', 'Sub-total', total]);
        this.worksheet.addRow([]);
        this.worksheet.addRow([]);

        
      });

      this.worksheet.addRow(['Total Equipments', sub_total]);

    } else if (filterReportDto.reportType === 'department-list') {
      const depts = [];
      //depts.push(['Code', 'Department']); // Column headings
      data.departments.forEach((item) => {
        depts.push([item.code, item.name]);
      });
      this.worksheet.addTable({
        name: 'MyTable',
        ref: 'A8', // Start of the table
        headerRow: true,
        columns: [{ name: 'Code' }, { name: 'Department' }], // Column headings
        rows: depts, // Rows of data
      });
    }
    else if (filterReportDto.reportType === 'room-listing') {
    
      this.worksheet.addRow(['Room Listing']);
      this.worksheet.addRow([]);
      results.departments.forEach((item) => {
        this.worksheet.addRow(['Department: ', item.code, item.name]);
        this.worksheet.addRow(['Room Code: ', 'Room Name', 'status']);
        item.rooms.forEach((item2) => {
          this.worksheet.addRow([item2.code, item2.name, item2.status]);
        });
        this.worksheet.addRow([]);

    });
  } else if (filterReportDto.reportType === 'equipment-listing-bq' || filterReportDto.reportType === 'equipment-listing-bq-with-price' ||  filterReportDto.reportType === 'disabled-equipment-listing-bq' ||
  filterReportDto.reportType === 'disabled-equipment-listing-bq-with-price' ||
  filterReportDto.reportType === 'equipment-listing-bq-with-utility') {
   
    this.worksheet.addRow(['Equipment Listing(BQ)']);
    this.worksheet.addRow([]);
    if(filterReportDto.reportType === 'equipment-listing-bq-with-price' ||
    filterReportDto.reportType === 'disabled-equipment-listing-bq-with-price')
    {
      this.worksheet.addRow(['Code: ', 'Equipment', 'Qty', 'Price', 'Total', 'Group', 'Remarks']);
    }
    else if(filterReportDto.reportType === 'equipment-listing-bq-with-utility')
    {
      
      this.worksheet.addRow(['Code: ', 'Equipment', 'Qty', 'Utility', 'Remarks']); 
    }
    else
    {
      this.worksheet.addRow(['Code: ', 'Equipment', 'Qty', 'Group', 'Remarks']);  
    }
    let sub_total = 0;
    this.worksheet.addRow([]);
    results.equipments.forEach((item) => {

      if(filterReportDto.reportType === 'equipment-listing-bq-with-price' ||
      filterReportDto.reportType === 'disabled-equipment-listing-bq-with-price')
      {

      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
        item.cost,
        item.qty * item.cost,
        item.group,
        item.remarks,
      ]);
     }
     else if(filterReportDto.reportType === 'equipment-listing-bq-with-utility')
     {
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
        item.utility,
        item.remarks,
      ]);
     }
     else
     {
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
        item.group,
        item.remarks,
      ]);
     }
      
      if (typeof item.qty === 'number') {
        sub_total += item.qty;
      }
      //worksheet.addRow([item.code, item.name]);
    });
    this.worksheet.addRow([]);

    this.worksheet.addRow(['Total Equipments:' + sub_total]);
 }
 else if (filterReportDto.reportType === 'equipment-listing-price-with-revisions-variations') {
    
  this.worksheet.addRow(['Equipment Listing(BQ) price revisions']);
  this.worksheet.addRow([]);
  
    this.worksheet.addRow(['Code: ', 'Equipment', 'Prev Qty', 'Rev Qty', 'Diff Qty', 'Prev Price', 'Total Price', 'Rev Price', 'Total Price','Diff Price']);
  
  let sub_total = 0;
  let sub_total_rev_qty = 0;
  let sub_total_price = 0;
  let sub_total_rev_price = 0;
  this.worksheet.addRow([]);
  results.equipments.forEach((item) => {

    this.worksheet.addRow([
      item.code,
      item.name,
      item.qty,
      item.qty_rev,
      item.qty_rev - item.qty,
      item.cost,
      item.qty * item.cost,
      item.cost_rev,
      item.qty_rev * item.cost_rev,
      item.qty_rev * item.cost_rev - item.qty * item.cost,
     
    ]);

    if (typeof item.qty === 'number') {
      sub_total += item.qty;
    }
    if (typeof item.qty_rev === 'number') {
      sub_total_rev_qty += item.qty_rev;
    }
    if (typeof item.qty === 'number') {
      sub_total_price += item.qty * item.cost;
    }
    if (typeof item.qty_rev === 'number') {
      sub_total_rev_price += item.qty_rev * item.cost_rev;
    }
    //worksheet.addRow([item.code, item.name]);
  });
  this.worksheet.addRow([]);

  this.worksheet.addRow(['Total Equipments:','', sub_total,sub_total_rev_qty,'','',sub_total_price,'','',sub_total_rev_price-sub_total_price]);
  } else if (
    filterReportDto.reportType === 'equipment-listing-by-department' ||
    filterReportDto.reportType ===
    'equipment-listing-by-department-with-price'
  ) {
    this.worksheet.addRow(['Equipment Listing(BQ)']);
    this.worksheet.addRow([]);

    let sub_total = 0;
    this.worksheet.addRow([]);
    results.departments.forEach((items) => {
      this.worksheet.addRow(['Department: ', items.deapartname, items.deapartcode]);
      console.log("items:",items)
      if(filterReportDto.reportType === 'equipment-listing-by-department-with-price' )
      {
        this.worksheet.addRow(['Item Code', 'Description', 'Quantity', 'Price', 'Total']);
      }
      else
      {
        this.worksheet.addRow(['Item Code', 'Description', 'Quantity']);  
      }
      items.data.forEach((item) => {
      if(filterReportDto.reportType === 'equipment-listing-by-department-with-price' )
      {
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
        item.cost,
        item.qty * item.cost,
     
      ]);
     }
     else
     {
      
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
    
      ]);
     }
      
      if (typeof item.qty === 'number') {
        sub_total += item.qty;
      }
      //worksheet.addRow([item.code, item.name]);
    });
    });
    this.worksheet.addRow([]);

    this.worksheet.addRow(['Total Equipments:' + sub_total]);

  } else if (
    filterReportDto.reportType ===
    'equipment-listing-by-department-and-room' ||
    filterReportDto.reportType ===
    'equipment-listing-by-department-and-room-with-price' || filterReportDto.reportType ===
    'equipment-listing-by-department-and-room-disabled' || filterReportDto.reportType ===
    'equipment-listing-by-department-and-room-disabled-with-price'
  ) {
    this.worksheet.addRow(['Equipment Listing(BQ)']);
    this.worksheet.addRow([]);

    let sub_total = 0;
    let sub_total_price = 0;
    this.worksheet.addRow([]);
    results.rooms.forEach((items) => {
      let sub_total_room=0;
      this.worksheet.addRow(['Department: ', items.deapartname, items.deapartcode]);
      this.worksheet.addRow(['Room: ', items.roomcode, items.roomname]);
      console.log("items:",items)
      if(filterReportDto.reportType === 'equipment-listing-by-department-and-room-with-price' || filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-disabled-with-price' )
      {
        this.worksheet.addRow(['Item Code', 'Description', 'Quantity', 'Price', 'Total']);
      }
      else
      {
        this.worksheet.addRow(['Item Code', 'Description', 'Quantity']);  
      }

      items.data.forEach((item) => {
      if(filterReportDto.reportType === 'equipment-listing-by-department-and-room-with-price' || filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-disabled-with-price' )
      {
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
        item.cost,
        item.qty * item.cost,
     
      ]);
     }
     else
     {
      
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
    
      ]);
     }
      
      if (typeof item.qty === 'number') {
        sub_total += item.qty;
        sub_total_price += item.qty * item.cost;
        sub_total_room += item.qty;
      }
      
    });
     if(filterReportDto.reportType === 'equipment-listing-by-department-and-room-with-price' || filterReportDto.reportType ===
     'equipment-listing-by-department-and-room-disabled-with-price' )
      {
    this.worksheet.addRow(['','Total Equipments for Room'+items.roomcode,sub_total_room,'Total',sub_total_price]);
      }
      else
      {
        this.worksheet.addRow(['','Total Equipments for Room'+items.roomcode,sub_total_room]);
      }

    });
    this.worksheet.addRow([]);

    this.worksheet.addRow(['Total Equipments:' + sub_total]);

  } else if (filterReportDto.reportType === 'equipment-room-to-room-variation-with-price'
  ) {
      




    this.worksheet.addRow(['Equipment Listing(BQ)']);
    this.worksheet.addRow([]);

    let sub_total = 0;
    let sub_total_price = 0;
    let sub_total_price_rev = 0;
    this.worksheet.addRow([]);
    results.rooms.forEach((items) => {
      let sub_total_room=0;
      let sub_total_rev_room=0;
      this.worksheet.addRow(['Department: ', items.deapartname, items.deapartcode]);
      this.worksheet.addRow(['Room: ', items.roomcode, items.roomname]);
   
        this.worksheet.addRow(['Item Code','Description','Pre Qty', 'Rev Qty', 'Diff Qty', 'Prev price', 'Total price', 'Rev price', 'Total price', 'Diff price']);
    

      items.data.forEach((item) => {
     
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
        item.qty_rev,
        item.qty_rev- item.qty,
        item.cost,
        item.qty * item.cost,
        item.cost_rev,
        item.qty_rev * item.cost_rev,
        (item.qty_rev * item.cost_rev) - (item.qty * item.cost),
     
      ]);
  
      
      if (typeof item.qty === 'number') {
        sub_total += item.qty;
        sub_total_price += item.qty * item.cost;
        sub_total_room += item.qty;
      }
      if (typeof item.qty_rev === 'number') {
        sub_total_rev_room += item.qty_rev;
        sub_total_price_rev += item.qty_rev * item.cost_rev;
        sub_total_room += item.qty;
      }
      
    });
   
    this.worksheet.addRow(['','Total Equipments for Room'+items.roomcode,sub_total_room,sub_total_rev_room,'',sub_total_price,' ',' ',sub_total_price_rev,sub_total_price_rev-sub_total_price]);
    

    });
    this.worksheet.addRow([]);

    this.worksheet.addRow(['Total Equipments:' + sub_total]);

     
    } else if (
      filterReportDto.reportType === 'equipment-listing-bq-by-group' ||
      filterReportDto.reportType === 'equipment-listing-bq-by-group-with-price'
    ) 
    {
      
    this.worksheet.addRow(['Equipment Listing(BQ)']);
    this.worksheet.addRow([]);
    if(filterReportDto.reportType === 'equipment-listing-bq-by-group-with-price' )
    {
      this.worksheet.addRow(['Code: ', 'Equipment', 'Qty', 'Price', 'Total', 'Group', 'Remarks']);
    }
    else
    {
      this.worksheet.addRow(['Code: ', 'Equipment', 'Qty', 'Group', 'Remarks']);  
    }
    let sub_total = 0;
    this.worksheet.addRow([]);
    results.equipments.forEach((items) => {
      
     
      for(const key in items) { 
      if (Array.isArray(items[key])) {
      if(key!='no-group')
      {
      this.worksheet.addRow([key]);
      }
      else
      {
        this.worksheet.addRow(['']);  
      }
      let sub_total_group =0;
      items[key].forEach((item) => {
      if(filterReportDto.reportType === 'equipment-listing-bq-by-group-with-price' )
      {

      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
        item.cost,
        item.qty * item.cost,
        item.group,
        item.remarks,
      ]);
     }
     else
     {
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
        item.group,
        item.remarks,
      ]);
     }
      
      if (typeof item.qty === 'number') {
        sub_total += item.qty;
        sub_total_group += item.qty;
      }
      //worksheet.addRow([item.code, item.name]);
    });
    this.worksheet.addRow(['Total Equipments '+key+':' + sub_total_group]);
    }
  }
    });
    this.worksheet.addRow([]);

    this.worksheet.addRow(['Total Equipments:' + sub_total]);

     }
     else if (
      filterReportDto.reportType ===
      'equipment-listing-bq-by-group-revision-with-price'
    ) {


      
    this.worksheet.addRow(['Equipment Listing(BQ) ']);
    this.worksheet.addRow([]);

    let sub_total = 0;
    let sub_total_price = 0;
    let sub_total_price_rev = 0;
    this.worksheet.addRow([]);

    results.equipments.forEach((items) => {
      
     
      for(const key in items) { 
      if (Array.isArray(items[key])) {
        let sub_total_room=0;
        let sub_total_rev_room=0;
        if(key!='no-group')
        {
        this.worksheet.addRow([key]);
        }
        else
        {
          this.worksheet.addRow(['']);  
        }
 
     
          this.worksheet.addRow(['Item Code','Description','Pre Qty', 'Rev Qty', 'Diff Qty', 'Prev price', 'Total price', 'Rev price', 'Total price', 'Diff price']);
      
  
        items[key].forEach((item) => {
       
        this.worksheet.addRow([
          item.code,
          item.name,
          item.qty,
          item.qty_rev,
          item.qty_rev- item.qty,
          item.cost,
          item.qty * item.cost,
          item.cost_rev,
          item.qty_rev * item.cost_rev,
          (item.qty_rev * item.cost_rev) - (item.qty * item.cost),
       
        ]);
    
        
        if (typeof item.qty === 'number') {
          sub_total += item.qty;
          sub_total_price += item.qty * item.cost;
          sub_total_room += item.qty;
        }
        if (typeof item.qty_rev === 'number') {
          sub_total_rev_room += item.qty_rev;
          sub_total_price_rev += item.qty_rev * item.cost_rev;
          sub_total_room += item.qty;
        }
      });
      this.worksheet.addRow(['','Total Equipments for Room'+items.roomcode,sub_total_room,sub_total_rev_room,'',sub_total_price,' ',' ',sub_total_price_rev,sub_total_price_rev-sub_total_price]);
    

    }
  }
});
    
   
   // this.worksheet.addRow(['','Total Equipments for Room'+items.roomcode,sub_total_room,sub_total_rev_room,'',sub_total_price,' ',' ',sub_total_price_rev,sub_total_price_rev-sub_total_price]);
    

    
    this.worksheet.addRow([]);

    this.worksheet.addRow(['Total Equipments:' + sub_total]);

 
  } else if (
    filterReportDto.reportType === 'equipment-location-listing-by-group'
  ) {

    let sub_total = 0;
      results.equipments.forEach((items) => {
     
        let total = 0;
       
        for(const key in items) { 
          //console.log('item::',items[key]);
          if (Array.isArray(items[key])) {
            let sub_total_room=0;
            let sub_total_rev_room=0;
            if(key!='no-group')
            {
            this.worksheet.addRow([key]);
            }
            else
            {
              this.worksheet.addRow(['']);  
            }
      
            items[key].forEach((item) => {
              this.worksheet.addRow([]);
              this.worksheet.addRow(['Equipment: ', item.code, item.name]);
              this.worksheet.addRow([
                 'Dept Code: ',
                 'Department',
                 'Room Code',
                 'Room Name',
                 'Quantity',
                 'Group',
                 'Remarks',
               ]);
              item.locations.forEach((item2) => {
          
          this.worksheet.addRow([
            item2.department.code,
           item2.department.name,
           item2.room.code,
            item2.name,
            item2.code,
            item2.qty,
            item2.group,
            item2.remarks,
          ]);
          if (typeof item2.qty === 'number') {
            total += item2.qty;
          }
        });
          });

     
        sub_total += total;
        this.worksheet.addRow(['', '', '', 'Sub-total', total]);
        this.worksheet.addRow([]);
        this.worksheet.addRow([]);
      }
      }
        
      });

      this.worksheet.addRow(['Total Equipments', sub_total]);
  
    } else if (
      filterReportDto.reportType ===
      'equipment-listing-by-department-by-group' ||
      filterReportDto.reportType ===
      'equipment-listing-by-department-by-group-with-price'
    ) {



      this.worksheet.addRow(['Equipment Listing(BQ)']);
    this.worksheet.addRow([]);

    let sub_total = 0;
    this.worksheet.addRow([]);
    results.departments.forEach((items) => {
       for(const key in items.data) { 
          console.log('item:::::',items.data[key]);
          console.log('item:::::end1');
          if (Array.isArray(items.data[key])) {
            console.log('item:::::one');
            let sub_total_room=0;
            let sub_total_rev_room=0;
            if(key!='no-group')
            {
            this.worksheet.addRow([key]);
            }
            else
            {
              this.worksheet.addRow(['']);  
            }
      this.worksheet.addRow(['Department: ', items.deapartname, items.deapartcode]);
     // console.log("items:::",items[key])
      if(filterReportDto.reportType === 'equipment-listing-by-department-by-group-with-price' )
      {
        this.worksheet.addRow(['Item Code', 'Description', 'Quantity', 'Price', 'Total']);
      }
      else
      {
        this.worksheet.addRow(['Item Code', 'Description', 'Quantity']);  
      }
      items.data[key].forEach((item) => {
      if(filterReportDto.reportType === 'equipment-listing-by-department-by-group-with-price' )
      {
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
        item.cost,
        item.qty * item.cost,
     
      ]);
     }
     else
     {
      
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
    
      ]);
     }
      
      if (typeof item.qty === 'number') {
        sub_total += item.qty;
      }
      //worksheet.addRow([item.code, item.name]);
    });
    }
    }
    });
    this.worksheet.addRow([]);

    this.worksheet.addRow(['Total Equipments:' + sub_total]);





  } else if (
    filterReportDto.reportType ===
    'equipment-listing-by-department-and-room-by-group' ||
    filterReportDto.reportType ===
    'equipment-listing-by-department-and-room-by-group-with-price' ||  filterReportDto.reportType ==='equipment-listing-by-department-and-room-by-group-with-disabled' ||  filterReportDto.reportType ==='equipment-listing-by-department-and-room-by-group-with-price_disabled'
  ) {

   
    this.worksheet.addRow(['Equipment Listing(BQ) By Department and Room']);
    this.worksheet.addRow([]);

    let sub_total = 0;
    this.worksheet.addRow([]);
    results.departments.forEach((items) => {
       for(const key in items.data) { 
        let sub_total_room=0;
        let sub_total_room_price=0;
          if (Array.isArray(items.data[key])) {
            
           
            let sub_total_rev_room=0;
            if(key!='no-group')
            {
            this.worksheet.addRow([key]);
            }
            else
            {
              this.worksheet.addRow(['']);  
            }
      this.worksheet.addRow(['Department: ', items.deapartname, items.deapartcode]);
      this.worksheet.addRow(['Room: ', items.roomcode, items.roomname]);
     // console.log("items:::",items[key])
      if(filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-group-with-price' || filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-group-with-price_disabled' )
      {
        this.worksheet.addRow(['Item Code', 'Description', 'Quantity', 'Price', 'Total','Group','Remarks','Y N','Client Remarks']);
      }
      else
      {
        this.worksheet.addRow(['Item Code', 'Description', 'Quantity']);  
      }
  
      items.data[key].forEach((item) => {
        if(filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-group-with-price' || filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-group-with-price_disabled' )
      {
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
        item.cost,
        item.qty * item.cost,
     
      ]);
     }
     else
     {
      
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
    
      ]);
     }
      
      if (typeof item.qty === 'number') {
        sub_total += item.qty;
        sub_total_room += item.qty;
        sub_total_room_price += item.qty*item.cost;
      }
      //worksheet.addRow([item.code, item.name]);
    });
    if(filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-group-with-price' || filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-group-with-price_disabled' )
    {
       this.worksheet.addRow(['','Total Equipments for Room '+items.roomcode ,sub_total_room,'Total',sub_total_room_price]);
      }
      else
      {
        this.worksheet.addRow(['','Total Equipments for Room '+items.roomcode ,sub_total_room]);  
      }
    this.worksheet.addRow([]);
    this.worksheet.addRow([]);
    this.worksheet.addRow([]);
    this.worksheet.addRow([]);
    }
    }
    });
   

    this.worksheet.addRow(['Total Equipments:' + sub_total]);

  } else if (
    filterReportDto.reportType ===
    'equipment-listing-by-department-and-room-with-price-by-group-rev'
  ) {

     
    this.worksheet.addRow(['Equipment Listing(BQ) By Department and Room']);
    this.worksheet.addRow([]);

    let sub_total = 0;
    this.worksheet.addRow([]);
    results.departments.forEach((items) => {
       for(const key in items.data) { 
        let sub_total_room=0;
        let sub_total_room_rev=0;
        let sub_total_room_price=0;
        let sub_total_room_price_rev=0;
          if (Array.isArray(items.data[key])) {
            
           
            let sub_total_rev_room=0;
            if(key!='no-group')
            {
            this.worksheet.addRow([key]);
            }
            else
            {
              this.worksheet.addRow(['']);  
            }
      this.worksheet.addRow(['Department: ', items.deapartname, items.deapartcode]);
      this.worksheet.addRow(['Room: ', items.roomcode, items.roomname]);
     // console.log("items:::",items[key])
    
        this.worksheet.addRow(['Item Code', 'Description', 'Pre Qty', 'Rev Qty', 'Diff Qty','Prev price','Total price','Rev price','Total price','Diff price']);
      
  
      items.data[key].forEach((item) => {
      
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
        item.qty_rev,
        item.qty_rev-item.qty,
        item.cost,
        item.cost * item.qty,
        item.cost_rev,
        item.qty_rev * item.cost_rev,
        (item.qty_rev * item.cost_rev) - (item.cost * item.qty),
     
      ]);
    
      
      if (typeof item.qty === 'number') {
        sub_total += item.qty;
        sub_total_room += item.qty;
        sub_total_room_rev += item.qty_rev;
        sub_total_room_price += item.qty*item.cost;
        sub_total_room_price_rev += item.qty_rev*item.cost_rev;
      }
      //worksheet.addRow([item.code, item.name]);
    });
   
       this.worksheet.addRow(['','Total Equipments for Room '+items.roomcode ,sub_total_room,sub_total_room_rev,'','',sub_total_room_price,'',sub_total_room_price_rev,sub_total_room_price_rev-sub_total_room_price_rev]);
    
    this.worksheet.addRow([]);
    this.worksheet.addRow([]);
    this.worksheet.addRow([]);
    this.worksheet.addRow([]);
    }
    }
    });
   

    this.worksheet.addRow(['Total Equipments:' + sub_total]);

  
  } else if ( filterReportDto.reportType === 'equipment-listing-by-department-and-room-with-utility'
  ) {
    this.worksheet.addRow(['Equipment Listing(BQ) By Department and Room']);
    this.worksheet.addRow([]);

    let sub_total = 0;
    let sub_total_price = 0;
    this.worksheet.addRow([]);
    results.rooms.forEach((items) => {
      let sub_total_room=0;
      this.worksheet.addRow(['Department: ', items.deapartname, items.deapartcode]);
      this.worksheet.addRow(['Room: ', items.roomcode, items.roomname]);
    
    
        this.worksheet.addRow(['Item Code', 'Description', 'Quantity','Package','Remarks','Y N','Client Remarks']);  
      

      items.data.forEach((item) => {
  
      
      this.worksheet.addRow([
        item.code,
        item.name,
        item.qty,
        item.package,
        item.remarks,
        '',
        '',
    
      ]);
    
      
      if (typeof item.qty === 'number') {
        sub_total += item.qty;
        sub_total_price += item.qty * item.cost;
        sub_total_room += item.qty;
      }
      
    });
    
        this.worksheet.addRow(['','Total Equipments for Room'+items.roomcode,sub_total_room]);
      
    });
    this.worksheet.addRow([]);

    this.worksheet.addRow(['Total Equipments:' + sub_total]);


  } else if (filterReportDto.reportType === 'power_requirement' ) {
   
    this.worksheet.addRow(['Additional data for equipment']);
    this.worksheet.addRow([]);
   
    
      this.worksheet.addRow(['Equipment Name ', 'Equipment Code', 'Qty', 'Equipment Group', 'Typical Power Consumption','Total Power Consumption','Type of Power (1-phase/3-phase)','Water Inlet(Hot/Cold)','Drainage', 'Ventilation','Gas','Typical Weight (KG)','Typical Floor Loading','Typical Ceiling Loading','Radiation Shielding','Corridor clearance','Control room','Tech. room','Chiller','Attach Image 1','Attach Image 2','Attach Image 3','Remarks']);  
    
    let sub_total = 0;
    this.worksheet.addRow([]);
    results.equipments.forEach((item) => {

      this.worksheet.addRow([
        item.name,
        item.code,
        item.qty,
        item.group,
        item.typicalPowerConsumption,
        item.typicalPowerConsumption,
        item.typeOfPower,
        item.waterInlet,
        item.drainage,
        item.ventilationExhaust,
        item.medicalGas,
        item.typicalWeight,
        item.typicalFloorLoading,
        item.typicalCeilingLoading,
        item.radiationShielding,
        item.corridorClearance,
        item.controlRoom,
        item.techRoom,
        item.chiller,
        item.fileOne,
        item.fileTwo,
        item.fileThree,
        item.remarks,
      ]);
     
      
      if (typeof item.qty === 'number') {
        sub_total += item.qty;
      }
      //worksheet.addRow([item.code, item.name]);
    });
    this.worksheet.addRow([]);

    this.worksheet.addRow(['Total Equipments:' + sub_total]);
    
  } else if (filterReportDto.reportType === 'power_requirement_for_rds' ) {
   
    this.worksheet.addRow(['Additional data for equipment']);
    this.worksheet.addRow([]);
   
    
      this.worksheet.addRow(['LEVEL', 'DEPT_CD', 'DEPT_NAME', 'RMCODE', 'RMNAME','GP Rv1','ItemCode','Item Description','Qty', 'Power Consumption (KW)','Total Power Consumption','Type of Power (1-phase/3-phase)','Cold Water (per machine - aprox. 2 to 5 bar)','Hot Water (per machine - aprox. 2 to 5 bar)','Hot Water (per machine - aprox. 2 to 5 bar)','Normal Drain','Cast Iron Pipe Drain','Exhaust/Ventilation/Medical Air','Weight (KG)','HEAT DISSIPATION (kw)(each)','Medical Gas Points(each)','ICT Port','BSS Port','Typical Floor Loading','Typical Ceiling Loading','Radiation Shielding','Corridor clearance','Control room','Tech. room','Tech. room','Chiller','Attach Image 1','Attach Image 2','Attach Image 3','Dimension','Remarks']);  
    
    let sub_total = 0;
    this.worksheet.addRow([]);
    results.equipments.forEach((item) => {

      this.worksheet.addRow([
        item.department.floorlevel_tx,
        item.department.code,
        item.department.name,
        item.room.code,
        item.room.name,
        item.label,
        item.code,
        item.name,
        item.qty,
        item.typicalPowerConsumption,
        item.typicalPowerConsumption,
        item.typeOfPower,

  
        item.waterInlet,
        item.drainage,
        item.ventilationExhaust,
        item.medicalGas,
        item.typicalWeight,
        item.typicalFloorLoading,
        item.typicalCeilingLoading,
        item.radiationShielding,
        item.corridorClearance,
        item.controlRoom,
        item.techRoom,
        item.chiller,
        item.fileOne,
        item.fileTwo,
        item.fileThree,
        item.remarks,
      ]);
     
      
      if (typeof item.qty === 'number') {
        sub_total += item.qty;
      }
      //worksheet.addRow([item.code, item.name]);
    });
    this.worksheet.addRow([]);

    this.worksheet.addRow(['Total Equipments:' + sub_total]);
    } else if (filterReportDto.reportType === 'equipment_brands' ) {
    
      
    this.worksheet.addRow(['Medical Brands']);
    this.worksheet.addRow([]);
   
    this.worksheet.addRow(['', '', '', '', '','','','','']);  

    this.worksheet.addRow(['No', 'CODE', 'Equipments', 'QTY', 'PACKAGE','BUDGET PRICE','TOTAL PRICE','BRAND','MODEL', 'ORIGIN','UNIT PRICE','SUPPLIER','BRAND','ORIGIN','UNIT PRICE','SUPPLIER','BRAND','MODEL','ORIGIN','UNIT PRICE','SUPPLIER','BRAND','MODEL','ORIGIN','UNIT PRICE','SUPPLIER','BRAND','MODEL','ORIGIN','UNIT PRICE','SUPPLIER']);  
    
    let sub_total = 0;
    let k = 1;
    this.worksheet.addRow([]);
    results.equipments.forEach((item) => {
      
     // let brandObj = JSON.parse(item.brands);
     // let c_origin = brandObj.country_origin && brandObj.country_origin[0] || '';
     // let unit_price = brandObj.unit_price && brandObj.unit_price[0] || '';
     // let supplier = brandObj.supplier && brandObj.supplier[0] || '';
      this.worksheet.addRow([
        k++,
        item.code,
        item.name,
        item.qty,
        item.package,
        item.cost,
        item.qty * item.cost,
       // brandObj.brand[0],
       // brandObj.model[0],
        //c_origin,
       // unit_price,
       // supplier,
       // brandObj.brand[1],
       // brandObj.model[1],
       // c_origin,
       // unit_price,
       // supplier,
       // brandObj.brand[2],
       // brandObj.model[2],
        //c_origin,
       // unit_price,
       // supplier,
       // brandObj.brand[3],
       // brandObj.model[3],
       // c_origin,
       // unit_price,
       // supplier,
       // item.remarks,
      ]);
     
      
      if (typeof item.qty === 'number') {
        sub_total += item.qty;
      }
      //worksheet.addRow([item.code, item.name]);
    });
    this.worksheet.addRow([]);

    this.worksheet.addRow(['Total Equipments:' + sub_total]);

  } else if (
    filterReportDto.reportType === 'equipment-listing-bq-by-package' ||
    filterReportDto.reportType === 'equipment-listing-bq-by-package-with-price'
  ) 
{
  this.worksheet.addRow(['Equipment Listing(BQ)']);
  this.worksheet.addRow([]);
  const baseHeader = ['Code:', 'Equipment', 'Qty'];
  
  if (results.apq_filt) {
    baseHeader.push('APQ');
  }
  
  if (results.fpq_filt) {
    baseHeader.push('FPQ');
  }
  
  if (filterReportDto.reportType === 'equipment-listing-bq-by-package-with-price') {
    baseHeader.push('Package','Price', 'Total');
  }
  
  baseHeader.push('Package','Group', 'Remarks');
  
  this.worksheet.addRow(baseHeader);
  
  let columnOffset = 0;
  
  let sub_total = 0;
  this.worksheet.addRow([]);
  results.equipments.forEach((items) => {
    for (const key in items) {
      if (Array.isArray(items[key])) {
        if (key !== 'no-group') {
          this.worksheet.addRow([key]);
        } else {
          this.worksheet.addRow(['']);
        }
        let sub_total_group = 0;
        items[key].forEach((item) => {
          const row = [
            item.code,
            item.name,
            item.qty,
          ];
  
          if (results.apq_filt) {
            row.push(item.apq);
          }
  
          if (results.fpq_filt) {
            row.push(item.fpq);
          }
  
          if (filterReportDto.reportType === 'equipment-listing-bq-by-package-with-price') {
            row.push(item.package1,item.cost, item.qty * item.cost);
          } else {
            row.push(item.package1);
          }
  
          row.push(item.group, item.remarks);
  
          this.worksheet.addRow(row);
  
          if (typeof item.qty === 'number') {
            sub_total += item.qty;
            sub_total_group += item.qty;
          }
        });
        this.worksheet.addRow(['Total Equipments ' + key + ':' + sub_total_group]);
      }
    }
  });
  
  this.worksheet.addRow([]);
  
  this.worksheet.addRow(['Total Equipments:' + sub_total]);
  
  
} else if (
  filterReportDto.reportType === 'equipment-location-listing-by-package' 
) 
 {
  
  let sub_total = 0;
  results.equipments.forEach((items) => {
    
    for (const key in items) {
      if(Array.isArray(items[key])) {
        let total = 0;
        let sub_total_room = 0;
        let sub_total_rev_room = 0;
        if (key !== 'no-group') {
          this.worksheet.addRow([key]);
        } else {
          this.worksheet.addRow(['']);
        }
  
        items[key].forEach((item) => {
          this.worksheet.addRow([]);
          const equipmentHeader = [
            'Dept Code',
            'Department',
            'Room Code',
            'Room Name',
            'Quantity',
          ];
  
          if (results.apq_filt) {
            equipmentHeader.push('APQ');
          }
  
          if (results.fpq_filt) {
            equipmentHeader.push('FPQ');
          }
  
          equipmentHeader.push('Package', 'Group', 'Remarks');
  
          this.worksheet.addRow(['Equipment: ', item.code, item.name]);
          this.worksheet.addRow(equipmentHeader);
  
          item.locations.forEach((item2) => {
            const equipmentRow = [
              item2.department.code,
              item2.department.name,
              item2.room.code,
              item2.name,
              item2.qty,
            ];
  
            if (results.apq_filt) {
              equipmentRow.push(item2.apq); // Add APQ value here
            }
  
            if (results.fpq_filt) {
              equipmentRow.push(item2.fpq); // Add FPQ value here
            }
  
            equipmentRow.push(item2.package1, item2.group, item2.remarks);
  
            this.worksheet.addRow(equipmentRow);
  
            if (typeof item2.qty === 'number') {
              total += item2.qty;
            }
            
            
            
            
            
          });
  
          sub_total += total;
          this.worksheet.addRow(['', '', '', 'Sub-total', total]);
          this.worksheet.addRow([]);
          this.worksheet.addRow([]);
        });
      }
    }
  });
  
  this.worksheet.addRow(['Total Equipments', sub_total]);
  

} else if (
  filterReportDto.reportType ===
  'equipment-listing-by-department-by-package' ||
  filterReportDto.reportType ===
  'equipment-listing-by-department-by-package-with-price'
) {
  this.worksheet.addRow(['Equipment Listing(BQ)']);
  this.worksheet.addRow([]);
  
  let sub_total = 0;
  this.worksheet.addRow([]);
  results.departments.forEach((items) => {
    for (const key in items.data) {
      if (Array.isArray(items.data[key])) {
        let sub_total_room = 0;
        let sub_total_rev_room = 0;
        if (key !== 'no-group') {
          this.worksheet.addRow([key]);
        } else {
          this.worksheet.addRow(['']);
        }
        this.worksheet.addRow(['Department: ', items.deapartname, items.deapartcode]);
  
        const departmentHeader = ['Item Code', 'Description', 'Quantity'];
  
        if (results.apq_filt) {
          departmentHeader.push('APQ');
        }
  
        if (results.fpq_filt) {
          departmentHeader.push('FPQ');
        }
  
        if (filterReportDto.reportType === 'equipment-listing-by-department-by-package-with-price') {
          departmentHeader.push('Price', 'Total');
        }
  
        this.worksheet.addRow(departmentHeader);
  
        items.data[key].forEach((item) => {
          const departmentRow = [
            item.code,
            item.name,
            item.qty,
          ];
  
          if (results.apq_filt) {
            departmentRow.push(item.apq); // Add APQ value here
          }
  
          if (results.fpq_filt) {
            departmentRow.push(item.fpq); // Add FPQ value here
          }
  
          if (filterReportDto.reportType === 'equipment-listing-by-department-by-package-with-price') {
            departmentRow.push(item.cost, item.qty * item.cost);
          }
  
          this.worksheet.addRow(departmentRow);
  
          if (typeof item.qty === 'number') {
            sub_total += item.qty;
          }
        });
      }
    }
  });
  
  this.worksheet.addRow([]);
  
  this.worksheet.addRow(['Total Equipments:' + sub_total]);

} else if (
  filterReportDto.reportType ===
  'equipment-listing-by-department-and-room-by-package' ||
  filterReportDto.reportType ===
  'equipment-listing-by-department-and-room-by-package-with-price' || filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-package-with-utility'
) {  
  this.worksheet.addRow(['Equipment Listing(BQ)']);
  this.worksheet.addRow([]);
  
  let sub_total = 0;
  this.worksheet.addRow([]);
  results.departments.forEach((items) => {
    for (const key in items.data) {
      if (Array.isArray(items.data[key])) {
        let sub_total_room = 0;
        let sub_total_rev_room = 0;
        if (key !== 'no-group') {
          this.worksheet.addRow([key]);
        } else {
          this.worksheet.addRow(['']);
        }
        this.worksheet.addRow(['Department: ', items.deapartname, items.deapartcode]);
  
        const departmentHeader = ['Item Code', 'Description', 'Quantity'];
  
        if (results.apq_filt) {
          departmentHeader.push('APQ');
        }
  
        if (results.fpq_filt) {
          departmentHeader.push('FPQ');
        }
  
        if (filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-package-with-price') {
          departmentHeader.push('Price', 'Total');
        }
        departmentHeader.push('Package', 'Remarks', 'Y N', 'Client Remarks');
        this.worksheet.addRow(departmentHeader);
  
        items.data[key].forEach((item) => {
          const departmentRow = [
            item.code,
            item.name,
            item.qty,
          ];
  
          if (results.apq_filt) {
            departmentRow.push(item.apq); // Add APQ value here
          }
  
          if (results.fpq_filt) {
            departmentRow.push(item.fpq); // Add FPQ value here
          }
  
          if (filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-package-with-price') {
            departmentRow.push(item.cost, item.qty * item.cost);
          }
          departmentRow.push(item.package1,item.remarks,'',''); // Add FPQ value here
          this.worksheet.addRow(departmentRow);
  
          if (typeof item.qty === 'number') {
            sub_total += item.qty;
          }
        });
      }
    }
  });
  
  this.worksheet.addRow([]);
  
  this.worksheet.addRow(['Total Equipments:' + sub_total]);
 
} else if (
  filterReportDto.reportType ===
  'equipment-listing-by-department-and-room-by-package' ||
  filterReportDto.reportType ===
  'equipment-listing-by-department-and-room-by-package-with-price' || filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-package-with-utility'
) {  
  this.worksheet.addRow(['Equipment Listing(BQ)']);
  this.worksheet.addRow([]);
  
  let sub_total = 0;
  this.worksheet.addRow([]);
  results.departments.forEach((items) => {
    for (const key in items.data) {
      if (Array.isArray(items.data[key])) {
        let sub_total_room = 0;
        let sub_total_rev_room = 0;
        if (key !== 'no-group') {
          this.worksheet.addRow([key]);
        } else {
          this.worksheet.addRow(['']);
        }
        this.worksheet.addRow(['Department: ', items.deapartname, items.deapartcode]);
  
        const departmentHeader = ['Item Code', 'Description', 'Quantity'];
  
        if (results.apq_filt) {
          departmentHeader.push('APQ');
        }
  
        if (results.fpq_filt) {
          departmentHeader.push('FPQ');
        }
  
        if (filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-package-with-price') {
          departmentHeader.push('Price', 'Total');
        }
        departmentHeader.push('Package', 'Remarks', 'Y N', 'Client Remarks');
        this.worksheet.addRow(departmentHeader);
  
        items.data[key].forEach((item) => {
          const departmentRow = [
            item.code,
            item.name,
            item.qty,
          ];
  
          if (results.apq_filt) {
            departmentRow.push(item.apq); // Add APQ value here
          }
  
          if (results.fpq_filt) {
            departmentRow.push(item.fpq); // Add FPQ value here
          }
  
          if (filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-package-with-price') {
            departmentRow.push(item.cost, item.qty * item.cost);
          }
          departmentRow.push(item.package1,item.remarks,'',''); // Add FPQ value here
          this.worksheet.addRow(departmentRow);
  
          if (typeof item.qty === 'number') {
            sub_total += item.qty;
          }
        });
      }
    }
  });
  
  this.worksheet.addRow([]);
  
  this.worksheet.addRow(['Total Equipments:' + sub_total]);
 }

    return await this.workbook.xlsx.write(res);
    // return await workbook.xlsx.writeFile('newSaveeee.xlsx');
  }
   async xl(res, filterReportDto: FilterReportDto) {
  //   const workbook = new Workbook();
  //   const worksheet = workbook.addWorksheet('Report', {
  //     headerFooter: {
  //       firstHeader: 'Hello Exceljs',
  //       firstFooter: 'Hello World',
  //     },
  //   });

  //   /*
  //   worksheet.addTable({
  //     name: 'MyTable',
  //     ref: 'A1',
  //     headerRow: true,
  //     totalsRow: true,
  //     style: {
  //       theme: 'TableStyleDark3',
  //       showRowStripes: true,
  //     },
  //     columns: [
  //       { name: 'name', totalsRowLabel: 'Totals:', filterButton: true },
  //       { name: 'Amount', totalsRowFunction: 'sum', filterButton: false },
  //     ],

      
  //     rows: [
  //       [new Date('2019-07-20'), 70.1],
  //       [new Date('2019-07-21'), 70.6],
  //       [new Date('2019-07-22'), 70.1],
  //     ],
  //   });
  //   */
  //   const results = await this.getQueryData(filterReportDto);
  //   const rowarray = [];

  //   const row = worksheet.addRow(['MNE SOLUTIONS']);
  //   const cell = row.getCell(1);
  //   cell.font = { bold: true };
  //   worksheet.addRow(['MEDICAL EQUIPMENT CONSULTANCY SERVICE']);
  //   worksheet.addRow([]);
  //   worksheet.addRow([]);

  //   if (filterReportDto.reportType === 'equipment-location-listing') {
  //     const row5 = worksheet.addRow([
  //       'Project Name:' + results.equipments[0].project_name,
  //     ]);
  //     const cell5 = row5.getCell(1);
  //     cell5.font = { bold: true };

  //     worksheet.addRow([
  //       'Revision No: 5.001*',
  //       '',
  //       '',
  //       'Date:' + (await this.getCurrentDate()),
  //     ]);

  //     let sub_total = 0;
  //     results.equipments.forEach((item) => {
  //       worksheet.addRow([]);
  //       worksheet.addRow(['Equipment: ', item.eqp_code, item.eqp_name]);
  //       worksheet.addRow([
  //         'Dept Code: ',
  //         'Department',
  //         'Room Code',
  //         'Room Name',
  //         'Quantity',
  //         'Group',
  //         'Remarks',
  //       ]);
  //       let total = 0;
  //       item.locations.forEach((item2) => {
  //         worksheet.addRow([
  //           item2.department_code,
  //           item2.department_name,
  //           item2.room_code,
  //           item2.room_name,
  //           item2.quantity,
  //         ]);
  //         if (typeof item2.quantity === 'number') {
  //           total += item2.quantity;
  //         }
  //       });
  //       sub_total += total;
  //       worksheet.addRow(['', '', '', 'Sub-total', total]);
  //       worksheet.addRow([]);
  //       worksheet.addRow([]);

  //       worksheet.addRow(['Total Equipments', sub_total]);
  //     });
  //   } else if (filterReportDto.reportType === 'department-list') {
  //     const row5 = worksheet.addRow(['Project Name:' + results.name]);
  //     const cell5 = row5.getCell(1);
  //     cell5.font = { bold: true };
  //     worksheet.addRow([
  //       'Revision No: 5.001*',
  //       '',
  //       '',
  //       'Date:' + (await this.getCurrentDate()),
  //     ]);

  //     worksheet.addRow(['Department List']);
  //     worksheet.addRow([]);
  //     worksheet.addRow(['Dept Code: ', 'Department']);

  //     results.departments.forEach((item) => {
  //       worksheet.addRow([]);
  //       worksheet.addRow([item.code, item.name]);
  //     });
  //   } else if (filterReportDto.reportType === 'room-listing') {
  //     const row5 = worksheet.addRow(['Project Name:' + results.name]);
  //     const cell5 = row5.getCell(1);
  //     cell5.font = { bold: true };
  //     worksheet.addRow([
  //       'Revision No: 5.001*',
  //       '',
  //       '',
  //       'Date:' + (await this.getCurrentDate()),
  //     ]);

  //     worksheet.addRow(['Room Listing']);
  //     worksheet.addRow([]);
  //     worksheet.addRow(['Dept Code: ', 'Department']);

  //     results.departments.forEach((item) => {
  //       worksheet.addRow(['Department: ', item.code, item.name]);
  //       item.rooms.forEach((item2) => {
  //         worksheet.addRow([item2.code, item2.name, item2.status]);
  //       });
  //       worksheet.addRow([]);

  //       //worksheet.addRow([item.code, item.name]);
  //     });
  //     return await workbook.xlsx.write(res);
  //   } else if (filterReportDto.reportType === 'equipment-listing-bq' || filterReportDto.reportType === 'equipment-listing-bq-with-price') {
  //     const row5 = worksheet.addRow(['Project Name:' + results.name]);
  //     const cell5 = row5.getCell(1);
  //     cell5.font = { bold: true };
  //     worksheet.addRow([
  //       'Revision Noxxxxxxxxxxxxxxxxxxxxx: 5.0018888888888888*',
  //       '',
  //       '',
  //       'Date:' + (await this.getCurrentDate()),
  //     ]);

  //     worksheet.addRow(['Equipment Listing(BQ)']);
  //     worksheet.addRow([]);
  //     if(filterReportDto.reportType === 'equipment-listing-bq-with-price')
  //     {
  //     worksheet.addRow(['Code: ', 'Equipment', 'Qty', 'Price', 'Total', 'Group', 'Remarks']);
  //     }
  //     else
  //     {
  //       worksheet.addRow(['Code: ', 'Equipment', 'Qty', 'Group', 'Remarks']);  
  //     }
  //     let sub_total = 0;
  //     results.EquipmentItemlist.forEach((item) => {
  //       if(filterReportDto.reportType === 'equipment-listing-bq-with-price')
  //     {
  //       worksheet.addRow([
  //         item.code,
  //         item.name,
  //         item.qty,
  //         item.price,
  //         item.qty ,
  //         item.group,
  //         item.remarks,
  //       ]);
  //     }
  //     else
  //     {
  //       worksheet.addRow([
  //         item.code,
  //         item.name,
  //         item.qty,
  //         item.group,
  //         item.remarks,
  //       ]);
  //     }
  //       worksheet.addRow([]);
  //       if (typeof item.quantity === 'number') {
  //         sub_total += item.quantity;
  //       }
  //       //worksheet.addRow([item.code, item.name]);
  //     });
  //     worksheet.addRow([]);

  //     worksheet.addRow(['Total Equipments:' + sub_total]);
  //   }

  //   return await workbook.xlsx.write(res);
  //   // return await workbook.xlsx.writeFile('newSaveeee.xlsx');
   }

  lowerCamelCase(str) {
    return str.replace(/-([a-z])/g, function (g) {
      return g[1].toUpperCase();
    });
  }
  equipmentListingAll(equipmentsRes,isDisabled) {
    let results = equipmentsRes.results;
   
    console.log(equipmentsRes);
    results.reportType = equipmentsRes.reportType;

    
    const equipmentMap = new Map();
    if (isDisabled) {
     
    results.forEach((result) => {
      const code = result.code;
      if (!equipmentMap.has(code) && result.active === false) {

        equipmentMap.set(code, {
          name: result.name,
          code: result.code,
          qty: result.qty,
          cost: result.cost,
          group: result.group,
          remarks: result.remarks,
          utility: result.utility,
        });

      }
    
    });
  }
  else
  {
       
    results.forEach((result) => {
      const code = result.code;
     
     
      if (equipmentMap.has(code)) {
      } else {
        equipmentMap.set(code, {
          name: result.name,
          code: result.code,
          qty: result.qty,
          cost: result.cost,
          group: result.group,
          remarks: result.remarks,
          utility: result.utility,
        });
      }
    }); 
  }
  
    const equipment = Array.from(equipmentMap.values());
    results.equipments = equipment;

    results.pname = results[0].project.name;
    if (results.reportType === 'equipment-listing-by-floor') {
      results.reportname = 'Equipment Listing By Floor';
    } else {
      results.reportname = 'Equipment Listing (BQ)';
    }
    return results;
  }


  revisionMergeEquipment(rev1_equ, rev2_equ) {
    const rev1: Item[] = rev1_equ;

    const rev2: Item[] = rev2_equ;

    const variation_equ: Item[] = [];

    // Create a map of rev2 for faster lookup by code
    const rev2Map: Record<string, Item> = {};
    rev2.forEach((item) => {
      rev2Map[item.code] = item;
    });

    // Iterate through rev1 and add qty_rev and cost_rev
    rev1.forEach((item) => {
      const matchingItemInArray2 = rev2Map[item.code];
      if (matchingItemInArray2) {
        const qty_rev = item.qty || 0;
        const cost_rev = item.cost || 0;

        const newItem: Item = {
          ...item,
          qty_rev: matchingItemInArray2.qty || 0,
          cost_rev: matchingItemInArray2.cost || '0',
        };

        variation_equ.push(newItem);
      } else {
        const newItem: Item = {
          ...item,
          qty_rev: 0,
          cost_rev: '0',
        };

        variation_equ.push(newItem);
      }
    });

    return variation_equ;
  }
  equipmentLocationListing(equipmentsRes, filterReportDto, isDisabled) {
    const results = equipmentsRes.results;
    const equipmentMap = new Map();

    results.forEach((result) => {
      const code = result.code;

      if (isDisabled) {
        if (!equipmentMap.has(code) && result.active === false) {
          equipmentMap.set(code, {
            name: result.name,
            code: result.code,
            qty: result.qty,
            cost: result.cost,
            group: result.group,
            remarks: result.remarks,
            utility: result.utility,
          });
        }
      } else {
        const group_id_data = filterReportDto.group; //['G1', 'G2'];
        const equipment_code = filterReportDto.equipCode; //['G1', 'G2'];
        const filter_package = filterReportDto.package1; //['G1', 'G2'];
        if ((!filter_package || filter_package===result.package) &&
        (!equipment_code || equipment_code===result.code) &&
        (!group_id_data || group_id_data.includes(result.labels))) {
        // if (
        //   (!filter_package || filter_package.includes(result.package)) &&
        //   (!group_id_data || group_id_data.includes(result.labels))
        // ) {                    
          if (equipmentMap.has(code)) {            
              const existingEquipment = equipmentMap.get(code);            
              existingEquipment.locations.push({              
                  qty: result.qty,              
                  department: result.department,              
                  room: result.room,              
                  group: result.group,              
                  group_labels: result.labels,              
                  apq: result.apq,              
                  fpq: result.fpq,              
                  package1: result.package,            
              });          
          } else {            
            equipmentMap.set(code, {              
              name: result.name,              
              code: result.code,              
              group: result.group,              
              group_labels: result.labels,             
              locations: [{                  
                  qty: result.qty,                  
                  department: result.department,                  
                  room: result.room,                  
                  apq: result.apq,                  
                  fpq: result.fpq,                  
                  package1: result.package,                
              }],            
            });         
          } 
          
          // if (equipmentMap.has(code)) {
          //   const existingEquipment = equipmentMap.get(code);
          //   existingEquipment.locations.push({
          //     qty: result.qty,
          //     department: result.department,
          //     room: result.room,
          //     group: result.group,
          //     group_labels: result.labels,
          //     apq: result.apq,
          //     fpq: result.fpq,
          //     package1: result.package,
          //   });
          // } else {
          //   equipmentMap.set(code, {
          //     name: result.name,
          //     code: result.code,
          //     group: result.group,
          //     group_labels: result.labels,
          //     locations: [
          //       {
          //         qty: result.qty,
          //         department: result.department,
          //         room: result.room,
          //         apq: result.apq,
          //         fpq: result.fpq,
          //         package1: result.package,
          //       },
          //     ],
          //   });
          // }
        }
      }
    });

    const equipment = Array.from(equipmentMap.values());
    results.equipments = equipment;
    
   if (results[0] && results[0].project && results[0].project.name) 
    {
    results.pname = results[0].project.name;
    }

    if (isDisabled) {
      results.reportname = 'Disabled Equipment Listing';
    } else {
      results.reportname = 'Equipment Location Listing';
    }

    return results;
  }



  equipmentListingByDepart(equipmentsRes) {
    const results = equipmentsRes.results;
    const departmentMap = new Map();

    results.forEach((result) => {
      const deapartcode = result.department.code;
      if (departmentMap.has(deapartcode)) {
        const existingEquipment = departmentMap.get(deapartcode);
        existingEquipment.data.push({
          qty: result.qty,
          department: result.department,
          room: result.room,
          name: result.name,
          code: result.code,
          cost: result.cost,
        });
      } else {
        departmentMap.set(deapartcode, {
          deapartcode: result.department.code,
          deapartname: result.department.name,
          data: [
            {
              qty: result.qty,
              department: result.department,
              room: result.room,
              name: result.name,
              code: result.code,
              cost: result.cost,
            },
          ],
        });
      }
    });
    const department = Array.from(departmentMap.values());
    results.departments = department;
    results.pname = results[0].project.name;

    results.reportname = 'Equipment Listing By Department';
    return results;
  }

  equipmentListingByDepartandRoom(equipmentsRes, filterReportDto, isDisabled) {
    const results = equipmentsRes.results;
    const roomMap = new Map();
    const roomIds = filterReportDto.roomIds;

    results.forEach((result) => {
      const roomcode = result.room.code;
      // isRoomDisabled be true if the room is disabled (result.room.disabled is equal to 1), and false if the room is not disabled.
      const isRoomDisabled = result.room.disabled === 1;

      if ((!isDisabled || (isDisabled && isRoomDisabled)) && (!roomIds || roomIds.includes(result.room.projectRoomId))) {
        if (roomMap.has(roomcode)) {
          roomMap.get(roomcode).data.push({
            qty: result.qty,
            department: result.department,
            room: result.room,
            name: result.name,
            code: result.code,
            cost: result.cost,
            group: result.group,
            remarks: result.remarks,
            utility: result.utility,
          });
        } else {
          roomMap.set(roomcode, {
            deapartcode: result.department.code,
            deapartname: result.department.name,
            roomcode: result.room.code,
            roomname: result.room.name,
            projectRoomId: result.room.projectRoomId,
            data: [
              {
                qty: result.qty,
                department: result.department,
                room: result.room,
                name: result.name,
                code: result.code,
                cost: result.cost,
                group: result.group,
                remarks: result.remarks,
                utility: result.utility,
              },
            ],
          });
        }
      }
    });

    const rooms = Array.from(roomMap.values());
    results.rooms = rooms;
    results.pname = results[0].project.name;

    const filterReportDtoKeys = ['pagewise', 'top_logo', 'b_logo', 'medical_logo', 'medical_logo2', 'medical_logo3'];
    filterReportDtoKeys.forEach((key) => {
      if (filterReportDto[key] !== undefined) {
        results[key] = filterReportDto[key];
      }
    });

    results.reportname = isDisabled ? 'Equipment Listing By Department and Room Disabled' : 'Equipment Listing(BQ) By Department and Room';

    return results;
  }

  DepartandRoomtoRoomVariation(
    equipmentsRes_rev1,
    equipmentsRes_rev2,
    filterReportDto,
  ) {
    const rooms_id_data = filterReportDto.roomIds; //['648972be6be3d0e6681efe07', '648972356be3d0e6681efdbc'];
    const results = equipmentsRes_rev1.results;
    const results_rev = equipmentsRes_rev2.results;

    const results_rev_map = new Map();
    results_rev.forEach((result_rev) => {
      const roomcode = result_rev.room.code;
      const code = result_rev.code;
      const room_with_code = roomcode + code;
      results_rev_map.set(room_with_code, {
        qty: result_rev.qty,
        cost: result_rev.cost,
      });
    });

    const roomMap = new Map();
    results.forEach((result) => {
      const roomcode = result.room.code;
      const code = result.code;
      const room_with_code = roomcode + code;

      let qty_rev = 0;
      let cost_rev = '0';

      if (results_rev_map.has(room_with_code)) {
        const existingRevData = results_rev_map.get(room_with_code);
        qty_rev = existingRevData.qty;
        cost_rev = existingRevData.cost;
      }

      if (!roomMap.has(roomcode)) {
        if (!rooms_id_data || rooms_id_data.includes(result.room.projectRoomId)) {
          roomMap.set(roomcode, {
            deapartcode: result.department.code,
            deapartname: result.department.name,
            roomcode: roomcode,
            roomname: result.room.name,
            projectRoomId: result.room.projectRoomId,
            data: [],
          });
        }
      }

      if (roomMap.has(roomcode)) {
        const existingEquipment = roomMap.get(roomcode);
        existingEquipment.data.push({
          qty: result.qty,
          qty_rev: qty_rev,
          department: result.department,
          room: result.room,
          name: result.name,
          code: result.code,
          cost: result.cost,
          cost_rev: cost_rev,
          utility: result.utility,
        });
      }
    });


    // results.forEach((result) => {
    //   const roomcode = result.room.code;
    //   const code = result.code;

    //   const room_with_code = roomcode + code;
    //   let qty_rev = 0;
    //   let cost_rev = '0';
    //   if (results_rev_map.has(room_with_code)) {
    //     qty_rev = results_rev_map.get(room_with_code).qty;
    //     cost_rev = results_rev_map.get(room_with_code).cost;
    //   }

    //   if (roomMap.has(roomcode)) {
    //     const existingEquipment = roomMap.get(roomcode);
    //     existingEquipment.data.push({
    //       qty: result.qty,
    //       qty_rev: qty_rev,
    //       department: result.department,
    //       room: result.room,
    //       name: result.name,
    //       code: result.code,
    //       cost: result.cost,
    //       cost_rev: cost_rev,
    //       utility: result.utility,
    //     });
    //   } else {
    //     // roomid sort case
    //     if (rooms_id_data) {
    //       if (rooms_id_data.includes(result.room.projectRoomId)) {
    //         roomMap.set(roomcode, {
    //           deapartcode: result.department.code,
    //           deapartname: result.department.name,
    //           roomcode: result.room.code,
    //           roomname: result.room.name,
    //           projectRoomId: result.room.projectRoomId,
    //           data: [
    //             {
    //               qty: result.qty,
    //               qty_rev: qty_rev,
    //               department: result.department,
    //               room: result.room,
    //               name: result.name,
    //               code: result.code,
    //               cost: result.cost,
    //               cost_rev: cost_rev,
    //               utility: result.utility,
    //             },
    //           ],
    //         });
    //       }
    //     } else {
    //       roomMap.set(roomcode, {
    //         deapartcode: result.department.code,
    //         deapartname: result.department.name,
    //         roomcode: result.room.code,
    //         roomname: result.room.name,
    //         projectRoomId: result.room.projectRoomId,
    //         data: [
    //           {
    //             qty: result.qty,
    //             qty_rev: qty_rev,
    //             department: result.department,
    //             room: result.room,
    //             name: result.name,
    //             code: result.code,
    //             cost: result.cost,
    //             cost_rev: cost_rev,
    //           },
    //         ],
    //       });
    //     }
    //   }
    // });
    const room = Array.from(roomMap.values());
    results.rooms = room;
    results.pname = results[0].project.name;

    results.pagewise = filterReportDto.pagewise;
    results.top_logo = filterReportDto.top_logo;
    results.b_logo = filterReportDto.b_logo;
    results.medical_logo = filterReportDto.medical_logo;
    results.medical_logo2 = filterReportDto.medical_logo2;
    results.medical_logo3 = filterReportDto.medical_logo3;

    results.reportname = 'Equipment Listing Room To Room Variation';
    return results;
  }
  equipmentListingByGroup(equipmentsRes, filterReportDto) {
    const results = equipmentsRes.results;
    const equipmentMap = new Map();
    const group_id_data = filterReportDto.group; //['G1', 'G2'];
    const filter_package = filterReportDto.package1; //['G1', 'G2'];
    results.forEach((result) => {
      const code = result.code;
      //console.log('Results :- ', result.labels);
      if (!equipmentMap.has(code)) {
        if ((!filter_package || filter_package === result.package) &&
          (!group_id_data || group_id_data.includes(result.labels))) {
          equipmentMap.set(code, {
            name: result.name,
            code: result.code,
            qty: result.qty,
            cost: result.cost,
            group: result.group,
            group_labels: result.labels,
            remarks: result.remarks,
            utility: result.utility,
            apq: result.apq,
            fpq: result.fpq,
            package1: result.package,
          });
        }
      }
      else {
        // Entry already exists, update the qty value
        const existingEquipment = equipmentMap.get(code);
        existingEquipment.qty += result.qty;
        existingEquipment.apq += result.apq;
        existingEquipment.fpq += result.fpq;
        equipmentMap.set(code, existingEquipment);


      }
    });

    const equipment = Array.from(equipmentMap.values());

    // Create an object to store objects grouped by their 'group' property
    const groupedData = {};

    // Separate objects into groups
    equipment.forEach((item) => {
      //const groupName = item.group || 'no-group';
      const groupName = item.group_labels || 'no-group';
      if (!groupedData.hasOwnProperty(groupName)) {
        //console.log('Results :- ', groupName);
        groupedData[groupName] = [];
      }
      groupedData[groupName].push(item);
    });

    // Get the keys and sort them, moving 'no-group' to the end
    const sortedKeys = Object.keys(groupedData).sort((a, b) => {
      if (a === 'no-group') return 1;
      if (b === 'no-group') return -1;
      return a.localeCompare(b);
    });

    // Convert the sorted keys to an array of objects with group names as keys
    const groupedArray = sortedKeys.map((groupName) => ({
      [groupName]: groupedData[groupName],
    }));
    //console.log('Results :- ', results.equipments);
    results.equipments = groupedArray;
    results.pname = results[0].project.name;
    results.reportname = 'Equipment Listing(BQ)';
    results.package1 = filterReportDto.package1;
    results.apq_filt = filterReportDto.apq_filt;
    results.fpq_filt = filterReportDto.fpq_filt;
    const filterReportDtoKeys = ['pagewise', 'top_logo', 'b_logo', 'medical_logo', 'medical_logo2', 'medical_logo3'];
    filterReportDtoKeys.forEach((key) => {
      if (filterReportDto[key] !== undefined) {
        results[key] = filterReportDto[key];
      }
    });
    // console.log('Results :- ', results.equipments);
    return results;
  }
  equipmentListingByGroup_revision(
    equipmentsRes_rev1,
    equipmentsRes_rev2,
    filterReportDto,
  ) {
    const results = this.equipmentListingAll(equipmentsRes_rev1,false);
    const results_rev2 = this.equipmentListingAll(equipmentsRes_rev2,false);
    const group_id_data = filterReportDto.group; //['G1', 'G2'];

    const equipment = this.revisionMergeEquipment(
      results.equipments,
      results_rev2.equipments,
    );

    // Create an object to store objects grouped by their 'group' property
    const groupedData = {};

    // Separate objects into groups
    equipment.forEach((item) => {
      // const groupName = item.group || 'no-group';
      const groupName = item.group || 'no-group';
      if (!groupedData.hasOwnProperty(groupName)) {
        groupedData[groupName] = [];
      }
      groupedData[groupName].push(item);
    });

    // Get the keys and sort them, moving 'no-group' to the end
    const sortedKeys = Object.keys(groupedData).sort((a, b) => {
      if (a === 'no-group') return 1;
      if (b === 'no-group') return -1;
      return a.localeCompare(b);
    });

    // Convert the sorted keys to an array of objects with group names as keys
    const groupedArray = sortedKeys.map((groupName) => ({
      [groupName]: groupedData[groupName],
    }));

    results.equipments = groupedArray;
    results.pname = results[0].project.name;
    return results;
  }

  equipmentListingBQByGroup(equipmentsRes) {
    const results = equipmentsRes.results;

    const equipmentMap = new Map();
    results.forEach((result) => {
      const code = result.code;
      if (equipmentMap.has(code)) {
      } else {
        equipmentMap.set(code, {
          name: result.name,
          code: result.code,
          qty: result.qty,
          cost: result.cost,
          group: result.group,
          group_labels: result.labels,
          remarks: result.remarks,
          utility: result.utility,
        });
      }
    });
    const equipment = Array.from(equipmentMap.values());

    // Create an object to store objects grouped by their 'group' property
    const groupedData = {};

    // Separate objects into groups
    equipment.forEach((item) => {
      const groupName = item.group_labels || 'no-group';
      if (!groupedData.hasOwnProperty(groupName)) {
        groupedData[groupName] = [];
      }
      groupedData[groupName].push(item);
    });

    // Get the keys and sort them, moving 'no-group' to the end
    const sortedKeys = Object.keys(groupedData).sort((a, b) => {
      if (a === 'no-group') return 1;
      if (b === 'no-group') return -1;
      return a.localeCompare(b);
    });

    // Convert the sorted keys to an array of objects with group names as keys
    const groupedArray = sortedKeys.map((groupName) => ({
      [groupName]: groupedData[groupName],
    }));

    results.equipments = groupedArray;
    results.pname = results[0].project.name;
    return results;
  }

  equipmentListingDepartByGroup(equipmentsRes, filterReportDto) {
    const results = equipmentsRes.results;
    const group_id_data = filterReportDto.group; //['G1', 'G2'];

    const filter_package = filterReportDto.package1; //['G1', 'G2'];

    const departmentMap = new Map();
    const noGroupData = new Map();

    results.forEach((result) => {
      const deapartcode = result.department.code;
      const group = result.labels || 'no-group';

      if ((!filter_package || filter_package === result.package) &&
        (!group_id_data || group_id_data.includes(result.labels))) {
        if (!departmentMap.has(deapartcode)) {

          departmentMap.set(deapartcode, {
            deapartcode: result.department.code,
            deapartname: result.department.name,
            data: {},
          });
        }

        const existingDepartment = departmentMap.get(deapartcode);
        if (group != 'no-group') {
          if (!existingDepartment.data[group]) {
            existingDepartment.data[group] = [];
          }

          existingDepartment.data[group].push({
            qty: result.qty,
            department: result.department,
            room: result.room,
            name: result.name,
            code: result.code,
            cost: result.cost,
            utility: result.utility,
            apq: result.apq,
            fpq: result.fpq,
            package1: result.package
          });

        }

        // Collect 'no-group' data
        if (group === 'no-group') {
          if (!noGroupData.has(deapartcode)) {
            noGroupData.set(deapartcode, []);
          }
          // if ((!filter_package || filter_package.includes(result.package)) &&(!group_id_data || group_id_data.includes(result.labels))) {

          noGroupData.get(deapartcode).push({
            qty: result.qty,
            department: result.department,
            room: result.room,
            name: result.name,
            code: result.code,
            cost: result.cost,
            apq: result.apq,
            fpq: result.fpq,
            package1: result.package,
            // package1: result.package
          });
          // }
        }

        // console.log(result.package+'::222')
      }
    });

    // Append 'no-group' data to the departmentMap
    noGroupData.forEach((items, deapartcode) => {
      departmentMap.get(deapartcode).data['no-group'] = items;
    });
    const department = Array.from(departmentMap.values());
    results.departments = department;
    results.pname = results[0].project.name;
    results.reportname = 'Equipment Listing(BQ) By Department';
    results.package1 = filterReportDto.package1;
    results.apq_filt = filterReportDto.apq_filt;
    results.fpq_filt = filterReportDto.fpq_filt;
    return results;
  }

  equipmentListingDepartNRoomByGroup(equipmentsRes, filterReportDto,isDisabled) {
    const results = equipmentsRes.results;
    const group_id_data = filterReportDto.group; //['G1', 'G2'];
    const filter_package = filterReportDto.package1; //['G1', 'G2'];
    const roomMap = new Map();
    const noGroupData = new Map();
    const departmentLastOccurrenceMap = new Map(); // To track the last occurrence of each department
    let totalqty = 0;
    let lastDepartmentCode = 0;
    
    results.forEach((result, index) => {
      const roomcode = result.room.code;
      const departmentCode = result.department.code;
      const group = result.labels || 'no-group';
      const isRoomDisabled = result.room.disabled === 1;

     
      // package/ groupcase filter case
      if ((!filter_package || filter_package === result.package) &&
        (!group_id_data || group_id_data.includes(result.labels))) {
         // added at the end 
         if (!isDisabled || (isDisabled && isRoomDisabled)) 
         {
          if (!roomMap.has(roomcode)) {
         
          roomMap.set(roomcode, {
            deapartcode: result.department.code,
            deapartname: result.department.name,
            roomcode: result.room.code,
            roomname: result.room.name,
            data: {},
            totalQty: null,  // Initialize department total quantity
            totalapq: null,
            totalfpq: null,
          });
        }
        

        const existingDepartment = roomMap.get(roomcode);
       

        if (group != 'no-group') {
          if (!existingDepartment.data[group]) {
            existingDepartment.data[group] = [];
          }

          existingDepartment.data[group].push({
            qty: result.qty,
            department: result.department,
            room: result.room,
            name: result.name,
            code: result.code,
            cost: result.cost,
            apq: result.apq,
            fpq: result.fpq,
            package1: result.package,
          });
          // Update department totals
          //existingDepartment.totalQty += result.qty;


        }


        // Collect 'no-group' data  need to display at the end of the each room pdf list
        if (group === 'no-group') {
          if (!noGroupData.has(roomcode)) {
            noGroupData.set(roomcode, []);
          }
          // package/ groupcase filter case
          // if ((!filter_package || filter_package.includes(result.package)) &&(!group_id_data || group_id_data.includes(result.labels))) {
          noGroupData.get(roomcode).push({
            qty: result.qty,
            department: result.department,
            room: result.room,
            name: result.name,
            code: result.code,
            cost: result.cost,
            apq: result.apq,
            fpq: result.fpq,
            package1: result.package,
          });
          // Update department totals
          //existingDepartment.totalQty += result.qty;
        }
      }

      }
    });

    // Append 'no-group' data to the departmentMap
    noGroupData.forEach((items, roomcode) => {
      roomMap.get(roomcode).data['no-group'] = items;
    });

    const department = Array.from(roomMap.values());
    // start Total Department QTy, APA FPA  etc Via Department 
    let totalQty = 0;
    let lastDepartmentIdex = {};
    let lastDepartmentTot = {};
    for (let i = 0; i < department.length; i++) {
      const departmentId = department[i].deapartcode;
      lastDepartmentIdex[departmentId] = i;
      if (!(departmentId in lastDepartmentTot)) {

        lastDepartmentTot[departmentId] = {}; // Initialize the department if it doesn't exist

        lastDepartmentTot[departmentId]['qty'] = 0;
        lastDepartmentTot[departmentId]['apq'] = 0;
        lastDepartmentTot[departmentId]['fpq'] = 0;
      }
      if ('data' in department[i]) {
        for (let groupname in department[i].data) {
          const groupdata = department[i].data[groupname];
          groupdata.forEach((groupdataitems) => {
            lastDepartmentTot[departmentId]['qty'] += groupdataitems.qty;
            lastDepartmentTot[departmentId]['apq'] += groupdataitems.apq;
            lastDepartmentTot[departmentId]['fpq'] += groupdataitems.fpq;
          });
        }
      }
    }
    for (let groupname in lastDepartmentIdex) {
      let index = lastDepartmentIdex[groupname];

      department[index].totalQty = lastDepartmentTot[groupname]['qty'];
      department[index].totalapq = lastDepartmentTot[groupname]['apq'];
      department[index].totalfpq = lastDepartmentTot[groupname]['fpq'];


    }
    // end Total Department QTy, APA FPA  etc Via Department 

    results.departments = department;
    const department_ = {};

    results.pname = results[0].project.name;

    results.reportname = 'Equipment Listing(BQ) By Department and Room';
    results.package1 = filterReportDto.package1;
    results.apq_filt = filterReportDto.apq_filt;
    results.fpq_filt = filterReportDto.fpq_filt;
    return results;
  }
  equipmentListingDepartNRoomByGroup_revision(
    equipmentsRes_rev1,
    equipmentsRes_rev2,
  ) {
    const results = equipmentsRes_rev1.results;
    const results_rev = equipmentsRes_rev2.results;
    const departmentMap = new Map();
    const noGroupData = new Map();
    const results_rev_map = new Map();
    results_rev.forEach((result_rev) => {
      const roomcode = result_rev.room.code;
      const code = result_rev.code;
      const room_with_code = roomcode + code;
      results_rev_map.set(room_with_code, {
        qty: result_rev.qty,
        cost: result_rev.cost,
      });
    });
    //console.log("Testing rev2 map:::");
    //console.log(results_rev_map);
    results.forEach((result) => {
      const roomcode = result.room.code;

      const group = result.labels || 'no-group';

      if (!departmentMap.has(roomcode)) {
        departmentMap.set(roomcode, {
          deapartcode: result.department.code,
          deapartname: result.department.name,
          roomcode: result.room.code,
          roomname: result.room.name,
          data: {},
        });
      }

      const existingDepartment = departmentMap.get(roomcode);
      const code = result.code;
      const room_with_code = roomcode + code;
      let qty_rev = 0;
      let code_rev = '0';
      if (results_rev_map.has(room_with_code)) {
        // console.log("Testing value map:::",room_with_code);
        //console.log(results_rev_map.get(room_with_code).qty);
        qty_rev = results_rev_map.get(room_with_code).qty;
        code_rev = results_rev_map.get(room_with_code).cost;
      }

      if (group != 'no-group') {
        if (!existingDepartment.data[group]) {
          existingDepartment.data[group] = [];
        }

        existingDepartment.data[group].push({
          qty: result.qty,
          qty_rev: qty_rev,
          department: result.department,
          room: result.room,
          name: result.name,
          code: result.code,
          cost_rev: code_rev,
          cost: result.cost,
        });
      }

      // Collect 'no-group' data  need to display at the end of the each room pdf list
      if (group === 'no-group') {
        if (!noGroupData.has(roomcode)) {
          noGroupData.set(roomcode, []);
        }

        noGroupData.get(roomcode).push({
          qty: result.qty,
          qty_rev: qty_rev,
          cost: result.cost,
          department: result.department,
          room: result.room,
          name: result.name,
          code: result.code,
          cost_rev: code_rev,
        });
      }
    });

    // Append 'no-group' data to the departmentMap
    noGroupData.forEach((items, roomcode) => {
      departmentMap.get(roomcode).data['no-group'] = items;
    });

    const department = Array.from(departmentMap.values());
    results.departments = department;
    //console.log(department);
    results.pname = results[0].project.name;

    results.reportname = 'Equipment Listing by Department';
    return results;
  }

  equipmentLocationListingByGroup(equipmentsRes, filterReportDto) {
    const results = this.equipmentLocationListing(equipmentsRes, filterReportDto, false);
    const groupedData = {};
    results.equipments.forEach((item) => {
      const groupName = item.group_labels || 'no-group';

      if (!groupedData.hasOwnProperty(groupName)) {
        groupedData[groupName] = [];
      }
      groupedData[groupName].push(item);
    });
    // // Get the keys and sort them, moving 'no-group' to the end
    const sortedKeys = Object.keys(groupedData).sort((a, b) => {
      if (a === 'no-group') return 1;
      if (b === 'no-group') return -1;
      return a.localeCompare(b);
    });
    const groupedArray = sortedKeys.map((groupName) => ({
      [groupName]: groupedData[groupName],
    }));
    // // Convert the sorted keys to an array of objects with group names as keys
    // const groupedArray = sortedKeys.map(groupName => ({
    //   [groupName]: groupedData[groupName]
    // }));
    // // Create an object to store objects grouped by their 'group' property
    // const groupedData = {};

    // // Separate objects into groups
    // results.equipments.forEach(item => {
    //   const groupName = item.group || 'no-group';
    //   if (!groupedData.hasOwnProperty(groupName)) {
    //     groupedData[groupName] = [];
    //   }
    //   groupedData[groupName].push(item);
    // });

    // // Get the keys and sort them, moving 'no-group' to the end
    // const sortedKeys = Object.keys(groupedData).sort((a, b) => {
    //   if (a === 'no-group') return 1;
    //   if (b === 'no-group') return -1;
    //   return a.localeCompare(b);
    // });

    // // Convert the sorted keys to an array of objects with group names as keys
    // const groupedArray = sortedKeys.map(groupName => ({
    //   [groupName]: groupedData[groupName]
    // }));
    console.log(groupedArray);
    results.equipments = groupedArray;
    results.package1 = filterReportDto.package1;
    results.apq_filt = filterReportDto.apq_filt;
    results.fpq_filt = filterReportDto.fpq_filt;
    return results;
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
    filterReportDto.limit = 100;
    // filterReportDto.lean = true;
    const equipmentsRes: any = await this.projectEquipmentService.findAll(
      filterReportDto,
    );
    // const data = await this.getAllEqp(filterReportDto);

    if (
      filterReportDto.reportType === 'equipment-location-listing' ||
      filterReportDto.reportType === 'equipment-location-listing-by-pages'
    ) {
      filterReportDto.reportType = 'equipment-location-listing';
      const functionName = this.lowerCamelCase(filterReportDto.reportType);
      return this[functionName](equipmentsRes, filterReportDto, false);
    } else if (filterReportDto.reportType === 'equipment-specs') {
      filterReportDto.reportType = 'equipment-location-listing';
      const functionName = this.lowerCamelCase(filterReportDto.reportType);
      return this.equipmentLocationListing(equipmentsRes, filterReportDto, false);
    } else if (
      filterReportDto.reportType === 'equipment-listing-bq' ||
      filterReportDto.reportType === 'equipment-listing-bq-with-price' ||
      filterReportDto.reportType === 'equipment-listing-bq-with-utility' ||
      filterReportDto.reportType === 'equipment-listing-by-floor'
    ) {
      equipmentsRes.reportType = filterReportDto.reportType;
      return this.equipmentListingAll(equipmentsRes,false);
    } else if (filterReportDto.reportType === 'power_requirement' ) {
      equipmentsRes.reportType = filterReportDto.reportType;
      return this.equipmentListingAll(equipmentsRes,false);
    } else if (filterReportDto.reportType === 'power_requirement_for_rds' ) {

      equipmentsRes.reportType = filterReportDto.reportType;
      return this.equipmentListingAll(equipmentsRes,false);


    } else if (filterReportDto.reportType === 'equipment-listing_for_rds' ) {

      equipmentsRes.reportType = filterReportDto.reportType;
      return this.equipmentListingAll(equipmentsRes,false);


    } else if (filterReportDto.reportType === 'equipment_brands' ) {
      
      
      const equipmentsRes: any = await this.projectEquipmentService.combineEquipmentWithProject(
        filterReportDto,
      );
      equipmentsRes.reportType = filterReportDto.reportType;
      equipmentsRes.results.reportType = filterReportDto.reportType;
      equipmentsRes.results.pname = 'bull';
      equipmentsRes.results.name = 'bull';
      //equipmentsRes.results.project.name = filterReportDto.reportType;
      console.log('equipmentsRes:::');
      console.log(equipmentsRes);
      
      //return equipmentsRes;
      
     return this.equipmentListingAll(equipmentsRes,false);
    
    } else if (
      filterReportDto.reportType ===
      'equipment-listing-with-revisions-variations' ||
      filterReportDto.reportType ===
      'equipment-listing-price-with-revisions-variations'
    ) {
      // revision data is not updated
      filterReportDto.limit = 20;
      //should replace by filter with rev1 value
      const equipmentsRes_rev1: any =
        await this.projectEquipmentService.findAll(filterReportDto);
      //should replace by filter with rev2 value
      const equipmentsRes_rev2: any =
        await this.projectEquipmentService.findAll(filterReportDto);
      const result_rev1 = this.equipmentListingAll(equipmentsRes_rev1,false);
      const result_rev2 = this.equipmentListingAll(equipmentsRes_rev2,false);

      result_rev1.equipments = this.revisionMergeEquipment(
        result_rev1.equipments,
        result_rev2.equipments,
      );
      result_rev1.reportname = 'Equipment Variation Listing (BQ)';
      const rev_id1 = filterReportDto.rev1;
      const rev_id2 = filterReportDto.rev2;
      result_rev1.rev1 = rev_id1;
      result_rev1.rev2 = rev_id2;
      return result_rev1;

    } else if (
      filterReportDto.reportType === 'disabled-equipment-listing-bq' ||
      filterReportDto.reportType === 'disabled-equipment-listing-bq-with-price'
    ) {

      equipmentsRes.reportType = filterReportDto.reportType;
      return this.equipmentListingAll(equipmentsRes,true);
      //return this.equipmentLocationListing(equipmentsRes, null,true);
    } else if (
      filterReportDto.reportType === 'equipment-listing-by-department' ||
      filterReportDto.reportType ===
      'equipment-listing-by-department-with-price'
    ) {
      return this.equipmentListingByDepart(equipmentsRes);
    } else if (
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room' ||
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-with-price' ||
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-with-utility'
    ) {
      return this.equipmentListingByDepartandRoom(
        equipmentsRes,
        filterReportDto, false
      );
    } else if (
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-disabled' ||
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-disabled-with-price'
    ) {
      // Plz note Room diabled feid/data is not updated

      return this.equipmentListingByDepartandRoom(
        equipmentsRes,
        filterReportDto, true
      );
    } else if (
      filterReportDto.reportType === 'equipment-room-to-room-variation' ||
      filterReportDto.reportType ===
      'equipment-room-to-room-variation-with-price'
    ) {
      // revision data is not updated
      filterReportDto.limit = 20;
      //should replace by filter with rev1 value
      const equipmentsRes_rev1: any =
        await this.projectEquipmentService.findAll(filterReportDto);
      //should replace by filter with rev2 value
      const equipmentsRes_rev2: any =
        await this.projectEquipmentService.findAll(filterReportDto);

      return this.DepartandRoomtoRoomVariation(
        equipmentsRes_rev1,
        equipmentsRes_rev2,
        filterReportDto,
      );
    } else if (
      filterReportDto.reportType === 'equipment-listing-bq-by-group' ||
      filterReportDto.reportType === 'equipment-listing-bq-by-group-with-price'
    ) {
      return this.equipmentListingByGroup(equipmentsRes, filterReportDto);
    } else if (
      filterReportDto.reportType === 'equipment-listing-bq-by-group-revision' ||
      filterReportDto.reportType ===
      'equipment-listing-bq-by-group-revision-with-price'
    ) {
      // revision data is not updated
      filterReportDto.limit = 20;
      //should replace by filter with rev1 value
      const equipmentsRes_rev1: any =
        await this.projectEquipmentService.findAll(filterReportDto);
      //should replace by filter with rev2 value
      const equipmentsRes_rev2: any =
        await this.projectEquipmentService.findAll(filterReportDto);
      const result_rev1 = this.equipmentListingAll(equipmentsRes_rev1,false);
      const result_rev2 = this.equipmentListingAll(equipmentsRes_rev2,false);
      return this.equipmentListingByGroup_revision(
        equipmentsRes_rev1,
        equipmentsRes_rev2,
        filterReportDto,
      );
    } else if (
      filterReportDto.reportType === 'equipment-listing-bq-by-package' ||
      filterReportDto.reportType === 'equipment-listing-bq-by-package-with-price'
    ) {
      return this.equipmentListingByGroup(equipmentsRes, filterReportDto);
    } else if (
      filterReportDto.reportType === 'equipment-location-listing-by-group'
    ) {
      filterReportDto.reportType = 'equipment-location-listing-by-group';
      //const functionName = this.lowerCamelCase(filterReportDto.reportType);
      //return this[functionName](equipmentsRes);

      return this.equipmentLocationListingByGroup(equipmentsRes, filterReportDto);
    }
    else if (
      filterReportDto.reportType === 'equipment-location-listing-by-package'
    ) {
      filterReportDto.reportType = 'equipment-location-listing-by-package';
      //const functionName = this.lowerCamelCase(filterReportDto.reportType);
      //return this[functionName](equipmentsRes);

      return this.equipmentLocationListingByGroup(equipmentsRes, filterReportDto);
    } else if (
      filterReportDto.reportType ===
      'equipment-listing-by-department-by-group' ||
      filterReportDto.reportType ===
      'equipment-listing-by-department-by-group-with-price'
    ) {
      return this.equipmentListingDepartByGroup(equipmentsRes, filterReportDto);
    } else if (
      filterReportDto.reportType ===
      'equipment-listing-by-department-by-package' ||
      filterReportDto.reportType ===
      'equipment-listing-by-department-by-package-with-price'
    ) {
      return this.equipmentListingDepartByGroup(equipmentsRes, filterReportDto);
    } else if (
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-by-group' ||
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-by-group-with-price'
    ) {
      return this.equipmentListingDepartNRoomByGroup(equipmentsRes, filterReportDto,false);
  } else if (
    filterReportDto.reportType ===
    'equipment-listing-by-department-and-room-by-group_disabled' ||
    filterReportDto.reportType ===
    'equipment-listing-by-department-and-room-by-group-with-price_disabled'
  ) {
    return this.equipmentListingDepartNRoomByGroup(equipmentsRes, filterReportDto,true);
    } else if (
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-by-package' ||
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-by-package-with-price' || filterReportDto.reportType === 'equipment-listing-by-department-and-room-by-package-with-utility'
    ) {
      return this.equipmentListingDepartNRoomByGroup(equipmentsRes, filterReportDto,false);


    } else if (
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-by-group-revision' ||
      filterReportDto.reportType ===
      'equipment-listing-by-department-and-room-with-price-by-group-rev'
    ) {
      // revision data is not updated
      filterReportDto.limit = 20;
      //should replace by filter with rev1 value
      const equipmentsRes_rev1: any =
        await this.projectEquipmentService.findAll(filterReportDto);
      //should replace by filter with rev2 value
      const equipmentsRes_rev2: any =
        await this.projectEquipmentService.findAll(filterReportDto);
      const result_rev1 = this.equipmentListingAll(equipmentsRes_rev1,false);
      const result_rev2 = this.equipmentListingAll(equipmentsRes_rev2,false);
      return this.equipmentListingDepartNRoomByGroup_revision(
        equipmentsRes_rev1,
        equipmentsRes_rev2,
      );
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
        results.departments.sort((a, b) => a.code.localeCompare(b.code));
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
