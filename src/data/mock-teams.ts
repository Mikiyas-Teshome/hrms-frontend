export const USE_MOCK_DATA = true;

export const mockAllEmployees = [
  { id: "1", name: "Mark Song", role: "Designer", email: "marksong@someone.com", department: "Engineering" },
  { id: "2", name: "Lydia Douglas", role: "Sales manager", email: "lydiadouglas@someone.com", department: "Sales" },
  { id: "3", name: "Micheal Chris", role: "Developer", email: "mchris@someone.com", department: "Engineering" },
  { id: "4", name: "Bob Trevor", role: "Sales", email: "btrevor@someone.com", department: "Sales" },
  { id: "5", name: "Chris Rock", role: "Developer", email: "crock@someone.com", department: "Engineering" },
  { id: "6", name: "Sarah Connor", role: "Manager", email: "sconnor@someone.com", department: "Engineering" },
];

export const mockTeams = [
  {
    title: "Design operations",
    department: "Engineering",
    dateCreated: "12/05/26",
    members: [
      { id: "1", name: "Mark Song", role: "Designer", email: "marksong@someone.com", department: "Engineering", isManager: true, isYou: true },
      { id: "2", name: "Lydia Douglas", role: "Sales manager", email: "lydiadouglas@someone.com", department: "Sales", isManager: false },
      { id: "3", name: "Micheal Chris", role: "Developer", email: "mchris@someone.com", department: "Engineering", isManager: true },
      { id: "4", name: "Bob Trevor", role: "Sales", email: "btrevor@someone.com", department: "Sales", isManager: true },
    ],
  },
  {
    title: "Development",
    department: "Engineering",
    dateCreated: "12/05/26",
    members: [
      { id: "1", name: "Mark Song", role: "Designer", email: "marksong@someone.com", department: "Engineering", isManager: true, isYou: true },
      { id: "3", name: "Micheal Chris", role: "Developer", email: "mchris@someone.com", department: "Engineering", isManager: true },
      { id: "5", name: "Chris Rock", role: "Developer", email: "crock@someone.com", department: "Engineering", isManager: true },
    ],
  },
];