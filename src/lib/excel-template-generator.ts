import ExcelJS from 'exceljs';

export interface TemplateOption {
  label: string;
  value: string;
  companyOuId?: string;
}

export interface TemplateMetadata {
  companies: TemplateOption[];
  departments: TemplateOption[];
  roles: TemplateOption[];
  contracts: TemplateOption[];
  employmentTypes: TemplateOption[];
  salaryStructures: TemplateOption[];
  currencySymbol?: string;
}

export interface ParsedEmployeeRow {
  firstName: string;
  lastName: string;
  email: string;
  companyOuId?: string;
  ouId?: string;
  role?: string;
  gccid?: string;
  employmentType?: string;
  contractId?: string;
  jobTitle?: string;
  salary?: number;
  salaryStructureId?: string;
  isValid: boolean;
  errors: string[];
}

export async function generateEmployeeTemplate({
  companies,
  departments,
  roles,
  contracts,
  employmentTypes,
  salaryStructures,
  currencySymbol = '$',
}: TemplateMetadata): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();

  const mainSheet = workbook.addWorksheet('Employees');
  const listSheet = workbook.addWorksheet('Data_Lists');

  listSheet.state = 'hidden';

  companies.forEach((company, index) => {
    listSheet.getCell(`A${index + 2}`).value = company.label;
  });
  departments.forEach((dept, index) => {
    listSheet.getCell(`B${index + 2}`).value = dept.label;
  });
  roles.forEach((role, index) => {
    listSheet.getCell(`C${index + 2}`).value = role.label;
  });
  contracts.forEach((contract, index) => {
    listSheet.getCell(`D${index + 2}`).value = contract.label;
  });
  employmentTypes.forEach((type, index) => {
    listSheet.getCell(`E${index + 2}`).value = type.label;
  });
  salaryStructures.forEach((structure, index) => {
    listSheet.getCell(`F${index + 2}`).value = structure.label;
  });

  const columns = [
    { header: 'First Name *', key: 'firstName', width: 20 },
    { header: 'Last Name *', key: 'lastName', width: 20 },
    { header: 'Email *', key: 'email', width: 25 },
    { header: 'Company *', key: 'company', width: 28 },
    { header: 'Org Unit', key: 'orgUnit', width: 30 },
    { header: 'Role *', key: 'role', width: 25 },
    { header: 'GCC ID', key: 'gccId', width: 15 },
    { header: 'Employment Type', key: 'employmentType', width: 20 },
    { header: 'Contract Type *', key: 'contractType', width: 30 },
    { header: 'Job Title', key: 'jobTitle', width: 25 },
    { header: `Salary (${currencySymbol})`, key: 'salary', width: 15 },
    { header: 'Salary Structure *', key: 'salaryStructure', width: 30 },
  ];

  mainSheet.columns = columns;

  const headerRow = mainSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2865E3' },
  };
  headerRow.height = 25;
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  const maxRows = 100;

  const companyRange = `Data_Lists!$A$2:$A$${companies.length + 1}`;
  const deptRange = `Data_Lists!$B$2:$B$${departments.length + 1}`;
  const roleRange = `Data_Lists!$C$2:$C$${roles.length + 1}`;
  const contractRange = `Data_Lists!$D$2:$D$${contracts.length + 1}`;
  const empTypeRange = `Data_Lists!$E$2:$E$${employmentTypes.length + 1}`;
  const salaryStructureRange = `Data_Lists!$F$2:$F$${salaryStructures.length + 1}`;

  for (let r = 2; r <= maxRows; r++) {
    if (companies.length > 0) {
      mainSheet.getCell(`D${r}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [companyRange],
        error: 'Please select a company from the dropdown list.',
        errorTitle: 'Invalid Selection',
        showErrorMessage: true,
      };
    }

    if (departments.length > 0) {
      mainSheet.getCell(`E${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [deptRange],
        error: 'Please select an org unit from the dropdown list.',
        errorTitle: 'Invalid Selection',
        showErrorMessage: true,
      };
    }

    if (roles.length > 0) {
      mainSheet.getCell(`F${r}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [roleRange],
        error: 'Please select a role from the dropdown list.',
        errorTitle: 'Invalid Selection',
        showErrorMessage: true,
      };
    }

    if (employmentTypes.length > 0) {
      mainSheet.getCell(`H${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [empTypeRange],
        error: 'Please select an employment type from the dropdown list.',
        errorTitle: 'Invalid Selection',
        showErrorMessage: true,
      };
    }

    if (contracts.length > 0) {
      mainSheet.getCell(`I${r}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [contractRange],
        error: 'Please select a contract type from the dropdown list.',
        errorTitle: 'Invalid Selection',
        showErrorMessage: true,
      };
    }

    if (salaryStructures.length > 0) {
      mainSheet.getCell(`L${r}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [salaryStructureRange],
        error: 'Please select a salary structure from the dropdown list.',
        errorTitle: 'Invalid Selection',
        showErrorMessage: true,
      };
    }
  }

  const sampleCompany = companies[0];
  const sampleCompanyId = sampleCompany?.value;
  const sampleDepartments = sampleCompanyId
    ? departments.filter((dept) => dept.companyOuId === sampleCompanyId)
    : departments;
  const sampleContracts = sampleCompanyId
    ? contracts.filter((contract) => contract.companyOuId === sampleCompanyId)
    : contracts;
  const sampleSalaryStructures = sampleCompanyId
    ? salaryStructures.filter((structure) => structure.companyOuId === sampleCompanyId)
    : salaryStructures;

  const sampleRow = mainSheet.getRow(2);
  sampleRow.getCell(1).value = 'John';
  sampleRow.getCell(2).value = 'Doe';
  sampleRow.getCell(3).value = 'john.doe@example.com';
  if (sampleCompany) sampleRow.getCell(4).value = sampleCompany.label;
  if (sampleDepartments.length > 0) sampleRow.getCell(5).value = sampleDepartments[0].label;
  if (roles.length > 0) sampleRow.getCell(6).value = roles[0].label;
  sampleRow.getCell(7).value = '';
  if (employmentTypes.length > 0) sampleRow.getCell(8).value = employmentTypes[0].label;
  if (sampleContracts.length > 0) sampleRow.getCell(9).value = sampleContracts[0].label;
  sampleRow.getCell(10).value = 'Software Engineer';
  sampleRow.getCell(11).value = 0;
  if (sampleSalaryStructures.length > 0) sampleRow.getCell(12).value = sampleSalaryStructures[0].label;

  sampleRow.eachCell((cell) => {
    cell.font = { italic: true, color: { argb: '888888' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F8F9FC' },
    };
  });

  sampleRow.commit();

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function parseEmployeeExcel(
  file: File,
  metadata: TemplateMetadata,
): Promise<ParsedEmployeeRow[]> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);
  const worksheet = workbook.getWorksheet('Employees');

  if (!worksheet) {
    throw new Error('Could not find the "Employees" sheet in the uploaded template. Please use the original template.');
  }

  const parsedData: ParsedEmployeeRow[] = [];
  const headerLabel = worksheet.getRow(1).getCell(4).text?.trim().toLowerCase() ?? '';
  const isLegacyTemplate = headerLabel === 'department';

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const firstName = row.getCell(1).text?.trim();
    const lastName = row.getCell(2).text?.trim();
    const email = row.getCell(3).text?.trim().toLowerCase();

    let companyLabel = '';
    let orgUnitLabel = '';
    let roleLabel = '';
    let gccid = '';
    let empTypeLabel = '';
    let contractLabel = '';
    let jobTitle = '';
    let salaryVal: ExcelJS.CellValue;
    let salaryStructureLabel = '';

    if (isLegacyTemplate) {
      orgUnitLabel = row.getCell(4).text?.trim();
      roleLabel = row.getCell(5).text?.trim();
      gccid = row.getCell(6).text?.trim();
      empTypeLabel = row.getCell(7).text?.trim();
      contractLabel = row.getCell(8).text?.trim();
      jobTitle = row.getCell(9).text?.trim();
      salaryVal = row.getCell(10).value;
      salaryStructureLabel = row.getCell(11).text?.trim();
    } else {
      companyLabel = row.getCell(4).text?.trim();
      orgUnitLabel = row.getCell(5).text?.trim();
      roleLabel = row.getCell(6).text?.trim();
      gccid = row.getCell(7).text?.trim();
      empTypeLabel = row.getCell(8).text?.trim();
      contractLabel = row.getCell(9).text?.trim();
      jobTitle = row.getCell(10).text?.trim();
      salaryVal = row.getCell(11).value;
      salaryStructureLabel = row.getCell(12).text?.trim();
    }

    if (!firstName && !lastName && !email && !companyLabel && !orgUnitLabel && !roleLabel) return;

    const errors: string[] = [];

    if (!firstName) errors.push('First name is required.');
    if (!lastName) errors.push('Last name is required.');
    if (!email) {
      errors.push('Email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format.');
    }

    if (isLegacyTemplate) {
      errors.push('This template is outdated. Download the latest template with Company, Org Unit, and required contract fields.');
    }

    const cleanStr = (s: string | undefined | null) => (s || '').trim().toLowerCase();

    const matchedCompany = metadata.companies.find(
      (company) => cleanStr(company.label) === cleanStr(companyLabel),
    );
    if (!isLegacyTemplate) {
      if (!companyLabel) {
        errors.push('Company is required.');
      } else if (!matchedCompany) {
        errors.push(`Company "${companyLabel}" is invalid or does not exist.`);
      }
    }

    const matchedDept = metadata.departments.find(
      (dept) =>
        cleanStr(dept.label) === cleanStr(orgUnitLabel)
        && (!matchedCompany || dept.companyOuId === matchedCompany.value),
    );
    if (orgUnitLabel && !matchedDept) {
      errors.push(`Org unit "${orgUnitLabel}" is invalid or does not belong to the selected company.`);
    }

    const matchedRole = metadata.roles.find((role) => cleanStr(role.label) === cleanStr(roleLabel));
    if (!roleLabel) {
      errors.push('Role is required.');
    } else if (!matchedRole) {
      errors.push(`Role "${roleLabel}" is invalid or does not exist.`);
    }

    const matchedEmpType = metadata.employmentTypes.find(
      (type) => cleanStr(type.label) === cleanStr(empTypeLabel),
    );
    if (empTypeLabel && !matchedEmpType) {
      errors.push(`Employment type "${empTypeLabel}" is invalid.`);
    }

    const matchedContract = metadata.contracts.find(
      (contract) =>
        cleanStr(contract.label) === cleanStr(contractLabel)
        && (!matchedCompany || contract.companyOuId === matchedCompany.value),
    );
    if (!contractLabel) {
      errors.push('Contract type is required.');
    } else if (!matchedContract) {
      errors.push(`Contract type "${contractLabel}" is invalid or does not belong to the selected company.`);
    }

    const salary = salaryVal ? Number(salaryVal) : undefined;
    if (salaryVal && isNaN(salary!)) errors.push('Salary must be a numeric value.');

    const matchedSalaryStructure = metadata.salaryStructures.find(
      (structure) =>
        cleanStr(structure.label) === cleanStr(salaryStructureLabel)
        && (!matchedCompany || structure.companyOuId === matchedCompany.value),
    );
    if (!salaryStructureLabel) {
      errors.push('Salary structure is required.');
    } else if (!matchedSalaryStructure) {
      errors.push(
        `Salary structure "${salaryStructureLabel}" is invalid or does not belong to the selected company.`,
      );
    }

    parsedData.push({
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      companyOuId: matchedCompany?.value,
      ouId: matchedDept?.value,
      role: matchedRole?.value,
      gccid,
      employmentType: matchedEmpType?.value,
      contractId: matchedContract?.value,
      jobTitle: jobTitle || matchedRole?.label || '',
      salary,
      salaryStructureId: matchedSalaryStructure?.value,
      isValid: errors.length === 0,
      errors,
    });
  });

  return parsedData;
}
