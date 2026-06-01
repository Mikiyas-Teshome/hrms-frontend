import ExcelJS from 'exceljs';

export interface TemplateMetadata {
  departments: { label: string; value: string }[];
  roles: { label: string; value: string }[];
  contracts: { label: string; value: string }[];
  employmentTypes: { label: string; value: string }[];
  currencySymbol?: string;
}

export interface ParsedEmployeeRow {
  firstName: string;
  lastName: string;
  email: string;
  ouId?: string;
  role?: string;
  gccid?: string;
  employmentType?: string;
  contractId?: string;
  jobTitle?: string;
  salary?: number;
  isValid: boolean;
  errors: string[];
}

export async function generateEmployeeTemplate({
  departments,
  roles,
  contracts,
  employmentTypes,
  currencySymbol = '$',
}: TemplateMetadata): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();

  // 1. Create Sheets
  const mainSheet = workbook.addWorksheet('Employees');
  const listSheet = workbook.addWorksheet('Data_Lists');
  
  // Hide the reference list sheet so the template stays perfectly neat
  listSheet.state = 'hidden';

  // 2. Populate the Hidden Reference Sheet
  // Column A: Departments, Column B: Roles, Column C: Contracts, Column D: Employment Types
  departments.forEach((dept, index) => {
    listSheet.getCell(`A${index + 2}`).value = dept.label;
  });
  roles.forEach((role, index) => {
    listSheet.getCell(`B${index + 2}`).value = role.label;
  });
  contracts.forEach((contract, index) => {
    listSheet.getCell(`C${index + 2}`).value = contract.label;
  });
  employmentTypes.forEach((type, index) => {
    listSheet.getCell(`D${index + 2}`).value = type.label;
  });

  // 3. Define Main Sheet Headers
  const columns = [
    { header: 'First Name *', key: 'firstName', width: 20 },
    { header: 'Last Name *', key: 'lastName', width: 20 },
    { header: 'Email *', key: 'email', width: 25 },
    { header: 'Department', key: 'department', width: 25 },
    { header: 'Role *', key: 'role', width: 25 },
    { header: 'GCC ID', key: 'gccId', width: 15 },
    { header: 'Employment Type', key: 'employmentType', width: 20 },
    { header: 'Contract Type', key: 'contractType', width: 25 },
    { header: 'Job Title', key: 'jobTitle', width: 25 },
    { header: `Salary (${currencySymbol})`, key: 'salary', width: 15 },
  ];
  
  mainSheet.columns = columns;

  // Header Styling (Premium Look matching Bekur Design System)
  const headerRow = mainSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2865E3' }, // Primary Brand Blue
  };
  headerRow.height = 25;
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // 4. Apply Excel Dropdown Data Validations (Apply to 100 rows for flexibility)
  const maxRows = 100;
  
  const deptRange = `Data_Lists!$A$2:$A$${departments.length + 1}`;
  const roleRange = `Data_Lists!$B$2:$B$${roles.length + 1}`;
  const contractRange = `Data_Lists!$C$2:$C$${contracts.length + 1}`;
  const empTypeRange = `Data_Lists!$D$2:$D$${employmentTypes.length + 1}`;

  for (let r = 2; r <= maxRows; r++) {
    // Department (Col D)
    if (departments.length > 0) {
      mainSheet.getCell(`D${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [deptRange],
        error: 'Please select a department from the dropdown list.',
        errorTitle: 'Invalid Selection',
        showErrorMessage: true,
      };
    }

    // Role (Col E)
    if (roles.length > 0) {
      mainSheet.getCell(`E${r}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [roleRange],
        error: 'Please select a role from the dropdown list.',
        errorTitle: 'Invalid Selection',
        showErrorMessage: true,
      };
    }

    // Employment Type (Col G)
    if (employmentTypes.length > 0) {
      mainSheet.getCell(`G${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [empTypeRange],
        error: 'Please select an employment type from the dropdown list.',
        errorTitle: 'Invalid Selection',
        showErrorMessage: true,
      };
    }

    // Contract Type (Col H)
    if (contracts.length > 0) {
      mainSheet.getCell(`H${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [contractRange],
        error: 'Please select a contract type from the dropdown list.',
        errorTitle: 'Invalid Selection',
        showErrorMessage: true,
      };
    }
  }

  // 5. Add a sample row (row 2) with default values from each dynamic list
  const sampleRow = mainSheet.getRow(2);
  // Static placeholder columns
  sampleRow.getCell(1).value = 'John';     // First Name
  sampleRow.getCell(2).value = 'Doe';      // Last Name
  sampleRow.getCell(3).value = 'john.doe@example.com'; // Email
  // Dynamic dropdown columns — pre-fill with the first available option
  if (departments.length > 0) sampleRow.getCell(4).value = departments[0].label;   // Department (Col D)
  if (roles.length > 0)       sampleRow.getCell(5).value = roles[0].label;          // Role (Col E)
  sampleRow.getCell(6).value = '';  // GCC ID — leave blank
  if (employmentTypes.length > 0) sampleRow.getCell(7).value = employmentTypes[0].label; // Employment Type (Col G)
  if (contracts.length > 0)       sampleRow.getCell(8).value = contracts[0].label;        // Contract Type (Col H)
  sampleRow.getCell(9).value = roles.length > 0 ? roles[0].label : 'Software Engineer'; // Job Title
  sampleRow.getCell(10).value = 0; // Salary

  // Style the sample row subtly so it's distinguishable as an example
  sampleRow.eachCell((cell) => {
    cell.font = { italic: true, color: { argb: '888888' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F8F9FC' },
    };
  });

  sampleRow.commit();

  // 6. Generate and Return File Buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function parseEmployeeExcel(
  file: File,
  metadata: TemplateMetadata
): Promise<ParsedEmployeeRow[]> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);
  const worksheet = workbook.getWorksheet('Employees');

  if (!worksheet) {
    throw new Error('Could not find the "Employees" sheet in the uploaded template. Please use the original template.');
  }

  const parsedData: ParsedEmployeeRow[] = [];

  worksheet.eachRow((row, rowNumber) => {
    // Skip header row
    if (rowNumber === 1) return;

    const firstName = row.getCell(1).text?.trim();
    const lastName = row.getCell(2).text?.trim();
    const email = row.getCell(3).text?.trim().toLowerCase();
    const deptLabel = row.getCell(4).text?.trim();
    const roleLabel = row.getCell(5).text?.trim();
    const gccid = row.getCell(6).text?.trim();
    const empTypeLabel = row.getCell(7).text?.trim();
    const contractLabel = row.getCell(8).text?.trim();
    const jobTitle = row.getCell(9).text?.trim();
    const salaryVal = row.getCell(10).value;

    // Skip entirely empty rows
    if (!firstName && !lastName && !email && !deptLabel && !roleLabel) return;

    const errors: string[] = [];

    // Basic Validation Checks
    if (!firstName) errors.push('First name is required.');
    if (!lastName) errors.push('Last name is required.');
    if (!email) {
      errors.push('Email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format.');
    }

    // Resolve IDs from dynamic labels — fall back to first available default if blank
    const cleanStr = (s: string | undefined | null) => (s || '').trim().toLowerCase();

    // --- Department (OU) ---
    let matchedDept = metadata.departments.find(d => cleanStr(d.label) === cleanStr(deptLabel));
    if (!deptLabel && metadata.departments.length > 0) {
      matchedDept = metadata.departments[0]; // default: first OU
    } else if (deptLabel && !matchedDept) {
      errors.push(`Department "${deptLabel}" is invalid or does not exist.`);
    }

    // --- Role ---
    let matchedRole = metadata.roles.find(r => cleanStr(r.label) === cleanStr(roleLabel));
    if (!roleLabel && metadata.roles.length > 0) {
      matchedRole = metadata.roles[0]; // default: first role
    } else if (roleLabel && !matchedRole) {
      errors.push(`Role "${roleLabel}" is invalid or does not exist.`);
    }

    // --- Employment Type ---
    let matchedEmpType = metadata.employmentTypes.find(t => cleanStr(t.label) === cleanStr(empTypeLabel));
    if (!empTypeLabel && metadata.employmentTypes.length > 0) {
      matchedEmpType = metadata.employmentTypes[0]; // default: first employment type
    } else if (empTypeLabel && !matchedEmpType) {
      errors.push(`Employment type "${empTypeLabel}" is invalid.`);
    }

    // --- Contract Type ---
    let matchedContract = metadata.contracts.find(c => cleanStr(c.label) === cleanStr(contractLabel));
    if (!contractLabel && metadata.contracts.length > 0) {
      matchedContract = metadata.contracts[0]; // default: first contract type
    } else if (contractLabel && !matchedContract) {
      errors.push(`Contract type "${contractLabel}" is invalid.`);
    }

    const salary = salaryVal ? Number(salaryVal) : undefined;
    if (salaryVal && isNaN(salary!)) errors.push('Salary must be a numeric value.');

    parsedData.push({
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      ouId: matchedDept?.value,
      role: matchedRole?.value,
      gccid,
      employmentType: matchedEmpType?.value,
      contractId: matchedContract?.value,
      jobTitle: jobTitle || matchedRole?.label || '',
      salary,
      isValid: errors.length === 0,
      errors,
    });
  });

  return parsedData;
}
