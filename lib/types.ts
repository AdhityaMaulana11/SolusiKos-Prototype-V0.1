export type Region = "kota-cirebon" | "kab-cirebon" | "kuningan" | "majalengka" | "indramayu"
export type RoomType = "putra" | "putri" | "campur"
export type RentalPeriod = "mingguan" | "bulanan" | "tahunan"
export type MembershipTier = "gratis" | "perak" | "emas"
export type UserRole = "penghuni" | "pemilik" | "penyedia" | "admin"
export type ProviderType = "laundry" | "kebersihan" | "tukang"
export type BookingStatus = "menunggu" | "aktif" | "selesai" | "dibatalkan"
export type PaymentStatus = "belum_bayar" | "menunggu" | "lunas" | "gagal"
export type JobStatus = "menunggu" | "dikerjakan" | "selesai"
export type SurveyStatus = "menunggu" | "dikonfirmasi" | "selesai" | "dibatalkan"

export interface RegionData {
  id: Region
  name: string
  description: string
  gradient: string
  propertyCount: number
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  providerType?: ProviderType
  avatar: string
  membershipTier?: MembershipTier
  createdAt: string
}

export interface Property {
  id: string
  name: string
  region: Region
  address: string
  description: string
  images: string[]
  amenities: string[]
  pricePerMonth: number
  pricePerWeek?: number
  pricePerYear?: number
  roomType: RoomType
  totalRooms: number
  availableRooms: number
  ownerId: string
  membershipTier: MembershipTier
  rating: number
  reviewCount: number
  featured: boolean
  rentalPeriods: RentalPeriod[]
}

export interface Booking {
  id: string
  propertyId: string
  tenantId: string
  checkIn: string
  checkOut: string
  status: BookingStatus
  monthlyRent: number
  adminFee: number
  totalPaid: number
  rentalPeriod: RentalPeriod
  duration: number
  createdAt: string
}

export interface Payment {
  id: string
  bookingId: string
  tenantId: string
  ownerId: string
  amount: number
  adminFee: number
  netAmount: number
  status: PaymentStatus
  method: string
  dueDate: string
  paidAt?: string
  createdAt: string
}

export interface ServiceRequest {
  id: string
  tenantId: string
  providerId: string
  propertyId: string
  serviceType: ProviderType
  description: string
  status: JobStatus
  price: number
  createdAt: string
  completedAt?: string
}

export interface ProviderService {
  id: string
  providerId: string
  name: string
  description: string
  price: number
  serviceType: ProviderType
  active: boolean
}

export interface AppNotification {
  id: string
  userId: string
  title: string
  message: string
  type: "booking" | "payment" | "service" | "membership" | "system" | "survey" | "qna"
  read: boolean
  createdAt: string
}

export interface MembershipPlan {
  tier: MembershipTier
  name: string
  price: number
  features: string[]
  highlighted: boolean
}

export interface SurveyVisit {
  id: string
  propertyId: string
  tenantId: string
  ownerId: string
  date: string
  time: string
  status: SurveyStatus
  notes?: string
  createdAt: string
}

export interface QAThread {
  id: string
  propertyId: string
  tenantId: string
  question: string
  answer?: string
  answeredAt?: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  senderId: string
  message: string
  timestamp: string
  isAdmin: boolean
}
