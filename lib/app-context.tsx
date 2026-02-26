"use client"

import React, { createContext, useContext, useReducer, type ReactNode } from "react"
import type {
  User, Property, Booking, Payment, ServiceRequest,
  AppNotification, BookingStatus, PaymentStatus, JobStatus, UserRole,
  SurveyVisit, SurveyStatus, QAThread, ChatMessage,
} from "./types"
import {
  users as initialUsers,
  properties as initialProperties,
  bookings as initialBookings,
  payments as initialPayments,
  serviceRequests as initialServiceRequests,
  notifications as initialNotifications,
  surveyVisits as initialSurveyVisits,
  qaThreads as initialQAThreads,
  adminChatMessages as initialChatMessages,
  ADMIN_FEE_PERCENTAGE,
} from "./mock-data"

interface AppState {
  currentUser: User
  users: User[]
  properties: Property[]
  bookings: Booking[]
  payments: Payment[]
  serviceRequests: ServiceRequest[]
  notifications: AppNotification[]
  surveyVisits: SurveyVisit[]
  qaThreads: QAThread[]
  chatMessages: ChatMessage[]
}

type AppAction =
  | { type: "SWITCH_USER"; userId: string }
  | { type: "CREATE_BOOKING"; booking: Booking }
  | { type: "UPDATE_BOOKING_STATUS"; bookingId: string; status: BookingStatus }
  | { type: "CREATE_PAYMENT"; payment: Payment }
  | { type: "UPDATE_PAYMENT_STATUS"; paymentId: string; status: PaymentStatus; paidAt?: string; method?: string }
  | { type: "CREATE_SERVICE_REQUEST"; request: ServiceRequest }
  | { type: "UPDATE_JOB_STATUS"; requestId: string; status: JobStatus; completedAt?: string }
  | { type: "ADD_NOTIFICATION"; notification: AppNotification }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ"; userId: string }
  | { type: "UPDATE_PROPERTY"; property: Property }
  | { type: "UPGRADE_MEMBERSHIP"; userId: string; tier: User["membershipTier"] }
  | { type: "CREATE_SURVEY_VISIT"; survey: SurveyVisit }
  | { type: "UPDATE_SURVEY_STATUS"; surveyId: string; status: SurveyStatus }
  | { type: "ADD_QA_THREAD"; thread: QAThread }
  | { type: "ANSWER_QA_THREAD"; threadId: string; answer: string }
  | { type: "ADD_CHAT_MESSAGE"; message: ChatMessage }

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SWITCH_USER": {
      const user = state.users.find((u) => u.id === action.userId)
      if (!user) return state
      return { ...state, currentUser: user }
    }
    case "CREATE_BOOKING":
      return { ...state, bookings: [...state.bookings, action.booking] }
    case "UPDATE_BOOKING_STATUS":
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.bookingId ? { ...b, status: action.status } : b
        ),
      }
    case "CREATE_PAYMENT":
      return { ...state, payments: [...state.payments, action.payment] }
    case "UPDATE_PAYMENT_STATUS":
      return {
        ...state,
        payments: state.payments.map((p) =>
          p.id === action.paymentId
            ? { ...p, status: action.status, paidAt: action.paidAt, method: action.method ?? p.method }
            : p
        ),
      }
    case "CREATE_SERVICE_REQUEST":
      return { ...state, serviceRequests: [...state.serviceRequests, action.request] }
    case "UPDATE_JOB_STATUS":
      return {
        ...state,
        serviceRequests: state.serviceRequests.map((sr) =>
          sr.id === action.requestId
            ? { ...sr, status: action.status, completedAt: action.completedAt }
            : sr
        ),
      }
    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.notification, ...state.notifications] }
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read: true } : n
        ),
      }
    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.userId === action.userId ? { ...n, read: true } : n
        ),
      }
    case "UPDATE_PROPERTY":
      return {
        ...state,
        properties: state.properties.map((p) =>
          p.id === action.property.id ? action.property : p
        ),
      }
    case "UPGRADE_MEMBERSHIP":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.userId ? { ...u, membershipTier: action.tier } : u
        ),
        currentUser:
          state.currentUser.id === action.userId
            ? { ...state.currentUser, membershipTier: action.tier }
            : state.currentUser,
      }
    case "CREATE_SURVEY_VISIT":
      return { ...state, surveyVisits: [...state.surveyVisits, action.survey] }
    case "UPDATE_SURVEY_STATUS":
      return {
        ...state,
        surveyVisits: state.surveyVisits.map((sv) =>
          sv.id === action.surveyId ? { ...sv, status: action.status } : sv
        ),
      }
    case "ADD_QA_THREAD":
      return { ...state, qaThreads: [...state.qaThreads, action.thread] }
    case "ANSWER_QA_THREAD":
      return {
        ...state,
        qaThreads: state.qaThreads.map((t) =>
          t.id === action.threadId
            ? { ...t, answer: action.answer, answeredAt: new Date().toISOString().split("T")[0] }
            : t
        ),
      }
    case "ADD_CHAT_MESSAGE":
      return { ...state, chatMessages: [...state.chatMessages, action.message] }
    default:
      return state
  }
}

const initialState: AppState = {
  currentUser: initialUsers[0],
  users: initialUsers,
  properties: initialProperties,
  bookings: initialBookings,
  payments: initialPayments,
  serviceRequests: initialServiceRequests,
  notifications: initialNotifications,
  surveyVisits: initialSurveyVisits,
  qaThreads: initialQAThreads,
  chatMessages: initialChatMessages,
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}

export function useCurrentUser() {
  const { state } = useApp()
  return state.currentUser
}

export function useNotifications(userId?: string) {
  const { state } = useApp()
  const uid = userId ?? state.currentUser.id
  return state.notifications.filter((n) => n.userId === uid)
}

export function useUnreadCount(userId?: string) {
  const notifs = useNotifications(userId)
  return notifs.filter((n) => !n.read).length
}

export function useUserBookings(tenantId?: string) {
  const { state } = useApp()
  const tid = tenantId ?? state.currentUser.id
  return state.bookings.filter((b) => b.tenantId === tid)
}

export function useOwnerProperties(ownerId?: string) {
  const { state } = useApp()
  const oid = ownerId ?? state.currentUser.id
  return state.properties.filter((p) => p.ownerId === oid)
}

export function useOwnerPayments(ownerId?: string) {
  const { state } = useApp()
  const oid = ownerId ?? state.currentUser.id
  return state.payments.filter((p) => p.ownerId === oid)
}

export function useProviderJobs(providerId?: string) {
  const { state } = useApp()
  const pid = providerId ?? state.currentUser.id
  return state.serviceRequests.filter((sr) => sr.providerId === pid)
}

export function usePropertyQA(propertyId: string) {
  const { state } = useApp()
  return state.qaThreads.filter((t) => t.propertyId === propertyId)
}

export function usePropertySurveys(propertyId: string) {
  const { state } = useApp()
  return state.surveyVisits.filter((sv) => sv.propertyId === propertyId)
}

export function useOwnerSurveys(ownerId?: string) {
  const { state } = useApp()
  const oid = ownerId ?? state.currentUser.id
  return state.surveyVisits.filter((sv) => sv.ownerId === oid)
}

export function useTenantSurveys(tenantId?: string) {
  const { state } = useApp()
  const tid = tenantId ?? state.currentUser.id
  return state.surveyVisits.filter((sv) => sv.tenantId === tid)
}

export function getRolePath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    penghuni: "/dasbor/penghuni",
    pemilik: "/dasbor/pemilik",
    penyedia: "/dasbor/penyedia",
    admin: "/admin",
  }
  return paths[role]
}

export { ADMIN_FEE_PERCENTAGE }
