export interface ContractType {
    id: string;
    name: string;
    description: string;
    duration: string;
    probation: string;
    renewable: boolean;
    contractsSigned: number;
    status: 'Active' | 'Inactive';
}

export const contractTypes: ContractType[] = [
    {
        id: '1',
        name: 'Permanent full-time',
        description: 'Permanent employment contract with full-time work hours.',
        duration: 'Permanent',
        probation: '6 months',
        renewable: false,
        contractsSigned: 6,
        status: 'Active',
    },
    {
        id: '2',
        name: 'Fixed-term contract',
        description: 'Fixed-term employment contract for specific duration.',
        duration: '12 months',
        probation: '3 months',
        renewable: true,
        contractsSigned: 3,
        status: 'Active',
    },
    {
        id: '3',
        name: 'Part-time contract',
        description: 'Part-time employment contract with reduced work hours.',
        duration: 'Permanent',
        probation: '3 months',
        renewable: false,
        contractsSigned: 1,
        status: 'Active',
    },
    {
        id: '4',
        name: 'Temporary contract',
        description: 'Short-term temporary contract for immediate staffing needs.',
        duration: '6 months',
        probation: '1 month',
        renewable: true,
        contractsSigned: 12,
        status: 'Active',
    },
    {
        id: '5',
        name: 'Consultant contract',
        description: 'Independent contractor agreement for specialized services.',
        duration: '6 months',
        probation: '0',
        renewable: true,
        contractsSigned: 4,
        status: 'Active',
    },
    {
        id: '6',
        name: 'Internship contract',
        description: 'Educational internship contract for students and recent graduates.',
        duration: '3 months',
        probation: '0',
        renewable: true,
        contractsSigned: 2,
        status: 'Active',
    },
    {
        id: '7',
        name: 'Probationary contract',
        description: 'Initial probationary employment contract with extension possibility.',
        duration: '6 months',
        probation: '6 months',
        renewable: true,
        contractsSigned: 0,
        status: 'Active',
    },
    {
        id: '8',
        name: 'Seasonal contract',
        description: 'Seasonal employment contract for specific periods or projects.',
        duration: '4 months',
        probation: '1 month',
        renewable: true,
        contractsSigned: 0,
        status: 'Active',
    },
];
