export type Region = "kuningan" | "cirebon" | "majalengka"
export type RoomType = "putra" | "putri" | "campur"
export type MembershipTier = "gratis" | "perak" | "emas"
export type UserRole = "penghuni" | "pemilik" | "penyedia" | "admin"
export type ProviderType = "laundry" | "kebersihan" | "tukang"
export type BookingStatus = "menunggu" | "aktif" | "selesai" | "dibatalkan"
export type PaymentStatus = "belum_bayar" | "menunggu" | "lunas" | "gagal"
export type JobStatus = "menunggu" | "dikerjakan" | "selesai"

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
  roomType: RoomType
  totalRooms: number
  availableRooms: number
  ownerId: string
  membershipTier: MembershipTier
  rating: number
  reviewCount: number
  featured: boolean
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
  type: "booking" | "payment" | "service" | "membership" | "system"
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
