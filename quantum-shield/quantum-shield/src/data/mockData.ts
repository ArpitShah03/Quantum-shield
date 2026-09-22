export const mockUser = {
  name: 'Dr. Alan Turing',
  role: 'Professor',
  department: 'Computer Science',
  email: 'a.turing@university.edu',
  avatar: 'https://i.pravatar.cc/150?u=a.turing@university.edu',
};

export const mockStats = {
  totalPapers: 124,
  encryptedPapers: 118,
  verificationRequests: 32,
  activeUsers: 8,
};

export const mockPapers = [
  {
    id: 'P-2023-001',
    name: 'Advanced Cryptography Final',
    subject: 'Computer Science',
    courseCode: 'CS601',
    semester: 'Fall 2023',
    uploadTime: '2023-11-20T10:30:00Z',
    professor: 'Dr. Alan Turing',
    status: 'Verified',
    encrypted: true,
    signed: true,
  },
  {
    id: 'P-2023-002',
    name: 'Quantum Computing Midterm',
    subject: 'Physics',
    courseCode: 'PHY505',
    semester: 'Fall 2023',
    uploadTime: '2023-11-22T14:15:00Z',
    professor: 'Dr. Richard Feynman',
    status: 'Pending',
    encrypted: true,
    signed: false,
  },
  {
    id: 'P-2023-003',
    name: 'Data Structures Quiz 3',
    subject: 'Computer Science',
    courseCode: 'CS301',
    semester: 'Fall 2023',
    uploadTime: '2023-11-25T09:00:00Z',
    professor: 'Dr. Grace Hopper',
    status: 'Verified',
    encrypted: true,
    signed: true,
  },
];

export const mockAuditLogs = [
  {
    id: 'L-100',
    timestamp: '2023-11-25T10:12:00Z',
    user: 'Dr. Alan Turing',
    role: 'Professor',
    action: 'Uploaded Paper',
    status: 'Success',
    ipAddress: '192.168.1.105',
  },
  {
    id: 'L-101',
    timestamp: '2023-11-25T11:05:00Z',
    user: 'System',
    role: 'System',
    action: 'AES Key Encrypted (Kyber)',
    status: 'Success',
    ipAddress: 'Internal',
  },
  {
    id: 'L-102',
    timestamp: '2023-11-26T08:30:00Z',
    user: 'Exam Centre A',
    role: 'Exam Centre',
    action: 'Verification Request',
    status: 'Pending',
    ipAddress: '10.0.0.42',
  },
  {
    id: 'L-103',
    timestamp: '2023-11-26T08:32:00Z',
    user: 'Exam Centre A',
    role: 'Exam Centre',
    action: 'Hash Mismatch',
    status: 'Tampered',
    ipAddress: '10.0.0.42',
  },
];

export const mockUsers = [
  {
    id: 'U-001',
    name: 'Admin User',
    role: 'Admin',
    department: 'IT Security',
    status: 'Active',
  },
  {
    id: 'U-002',
    name: 'Dr. Alan Turing',
    role: 'Professor',
    department: 'Computer Science',
    status: 'Active',
  },
  {
    id: 'U-003',
    name: 'Dr. Richard Feynman',
    role: 'Professor',
    department: 'Physics',
    status: 'Active',
  },
  {
    id: 'U-004',
    name: 'Exam Centre North',
    role: 'Exam Centre',
    department: 'External',
    status: 'Active',
  },
  {
    id: 'U-005',
    name: 'Exam Centre South',
    role: 'Exam Centre',
    department: 'External',
    status: 'Inactive',
  },
];

export const mockActivityTimeline = [
  {
    id: 1,
    title: 'Paper P-2023-001 Verified',
    time: '2 hours ago',
    description: 'Exam Centre North successfully verified and decrypted the paper.',
    type: 'success',
  },
  {
    id: 2,
    title: 'New Paper Uploaded',
    time: '5 hours ago',
    description: 'Dr. Grace Hopper uploaded Data Structures Quiz 3.',
    type: 'info',
  },
  {
    id: 3,
    title: 'Security Alert: Failed Verification',
    time: '1 day ago',
    description: 'Tampering detected during verification at Exam Centre South.',
    type: 'error',
  },
];
