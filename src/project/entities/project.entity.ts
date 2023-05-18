export class Project {
  code: string;
  projectname: string;
  fullProjectName: string;
  clientOwner: string;
  contractNo: string;
  noofBeds: string;
  classification: string;
  projecttype: string;
  company: string;
  groupname: string;
  signature1: string;
  signature2: string;
  created: Date;
  updated: Date;
  departmentEq: {
    name: string;
    apq: number;
    fpq: number;
    qty: number;
  }[];
  roomsEq: {
    name: string;
    apq: number;
    fpq: number;
    qty: number;
  }[];
  equipmentsEq: {
    name: string;
    apq: number;
    fpq: number;
    qty: number;
  }[];
}