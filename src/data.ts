import { ClaimRecord } from './types';

export const HOTLINKED_ASSETS = {
  claimerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAglTHzYqsugz1ADnYwYPPoPlIuD7HeTNwoCGN90BVZI_PJmfLewU4BPGmVDGfkriJpO8kr0iXXTGc2Gm6MRDWMc_dG8moRQQUzFsUTnL8jx9nq50WK7KApRo6kGZHBuXFTgEzYBRV0Y1Six6RQRE3T5yDL4ExbE1yNkOztod6Teqn-rreKrm5GMuNQM2zD1iKcQrftWTWU_2egHuZwdkJ_j4m9_w9P8qr6HK7iXfVVMH6i3NECqCqTCQ',
  validatorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGEo0uBU0QJl9bJDkaUJEFYa0NY79yShKsyYgTYW4wIWGiIg2k0wj5Jl1yx8R6GF2uyxYW0BrYXSNgvzTAy95UiWwk9lIfXiEm9KzY2viylx7gbmhQamtkvOmK7V_lIBaIguLDF_ai80jqormUidtTFCa57LYVg2g9UQ3p66Rpu_0KYCAJrUb9Xz81seUO8cuqNpbUbf2i7IglgxR1oj6zwZkAnjYP18Q-zMLO9kCK9oqzwwXQMgedyw',
  documentBillImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_cSvgSsjGviJm2FQTbNB_95Bll4Gbopin4P2wBFilP8SyPM1yE9OgkbFHlvleyY8GoPZAhN6IuU9yfpCLWucg70RDBD7n9AZ50SfRy-rOTwUAidnUmTho8mAAZWyPlLBlHAECIZ5MAMGnotpJN6xqMSx1RciZXx5hlaHJltZSESlBVcRDSLQj85y0Z8jndXWshtdplVLBRVrKu2__QoaAedeZzppcaAow2JCRoO92oNKzKgPOeWED0A',
  thumbnailBill1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3Lakk67o4Ki1CULrjaj7W-6W1Ip73bLms23PjPjQvGTkSf4NnQyATdIb8sq7Ki6FQO4AzKHPiO_Qsz-g6AUO2B11kvBawUM8W106qXTfZXpSmKpL-GKpH9OIVk9kIlIi3LjG6hBEAWAPd_DjK2M184aGcBz3R9rjKQhPqYFDPCjhdhsKeVKrzCCsUSK_KR8xe-B_oT0EHkaw2vFpoVvaHzdDEQQnTaeuIEeYO_vYKqYtr3PNypRBxVQ',
  thumbnailSummary: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW_m9bhab8lHcTMT7iX4Umn-nzS_fykNfaewn4Tu9IJq7waGBxSrCoGC5zBr2ojIYdwy8sSs9sh2iXh1WRczY58jH86vTTavRefR4t-mNRg6utG7x1EOrXVi7gVivKoY0y16sn7IXMdXUTTzNoE-dyR6J3mBydQKGlnuvoV75AJXs0PRGUkb3QQkCNkrHtNP6vBuo4Smo7iv3_bhdhIvCtN09z1OcR8_m6l9_SMTtDliWDPhK7aNvs1g',
  carFrontDamage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
};

// Real claims are fetched dynamically from backend API (GET /api/v1/claims/all)
export const INITIAL_CLAIMS: ClaimRecord[] = [];

export const INITIAL_UPLOAD_SLOTS = [
  {
    id: 'slot-1',
    title: 'Car Photos (Four Sides)',
    subtitle: 'Required',
    required: true,
    icon: 'photo_camera',
    categoryPayload: 'accident_photos',
    status: 'empty' as const,
    borderTheme: 'warning' as const,
    hint: 'JPEG, JPG, PNG image only (up to 10MB)',
  },
  {
    id: 'slot-2',
    title: 'Insurance Policy',
    subtitle: 'Required',
    required: true,
    icon: 'verified_user',
    categoryPayload: 'insurance_policy',
    status: 'empty' as const,
    borderTheme: 'warning' as const,
    hint: 'PDF document only (up to 10MB)',
  },
  {
    id: 'slot-3',
    title: 'Repair Invoice',
    subtitle: 'Required',
    required: true,
    icon: 'receipt_long',
    categoryPayload: 'repair_invoice',
    status: 'empty' as const,
    borderTheme: 'warning' as const,
    hint: 'PDF document only (up to 10MB)',
  },
];
