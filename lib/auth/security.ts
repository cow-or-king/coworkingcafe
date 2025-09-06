import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { Model, Schema, model, models } from 'mongoose'

interface SecurityEventData {
  userId?: string
  action: string
  resource: string
  ip: string
  userAgent: string
  success: boolean
  details?: Record<string, any>
}

interface SecurityEvent extends SecurityEventData {
  timestamp: Date
  _id?: string
}

interface BruteForceAttempt {
  ip: string
  attempts: number
  lastAttempt: Date
  blockedUntil?: Date
}

interface BruteForceCheck {
  isBlocked: boolean
  remainingTime?: number
  attempts: number
}

const SecurityEventSchema = new Schema<SecurityEvent>({
  userId: { type: String, index: true },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true, index: true },
  ip: { type: String, required: true, index: true },
  userAgent: { type: String, required: true },
  success: { type: Boolean, required: true, index: true },
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true }
})

SecurityEventSchema.index({ timestamp: -1 })
SecurityEventSchema.index({ ip: 1, timestamp: -1 })
SecurityEventSchema.index({ action: 1, timestamp: -1 })

const BruteForceSchema = new Schema<BruteForceAttempt>({
  ip: { type: String, required: true, unique: true, index: true },
  attempts: { type: Number, default: 0 },
  lastAttempt: { type: Date, default: Date.now },
  blockedUntil: { type: Date, index: true }
})

const SecurityEventModel: Model<SecurityEvent> = models.SecurityEvent || 
  model<SecurityEvent>('SecurityEvent', SecurityEventSchema)

const BruteForceModel: Model<BruteForceAttempt> = models.BruteForce || 
  model<BruteForceAttempt>('BruteForce', BruteForceSchema)

const MAX_LOGIN_ATTEMPTS = 5
const BLOCK_DURATION_MINUTES = 15
const ATTEMPT_WINDOW_MINUTES = 60

export async function logSecurityEvent(eventData: SecurityEventData): Promise<void> {
  try {
    await connectDB()
    
    const securityEvent = new SecurityEventModel({
      ...eventData,
      timestamp: new Date()
    })
    
    await securityEvent.save()
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

export function getRealIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cloudflareIP = request.headers.get('cf-connecting-ip')
  
  if (cloudflareIP) return cloudflareIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return 'unknown'
}

export async function checkBruteForce(ip: string): Promise<BruteForceCheck> {
  try {
    await connectDB()
    
    const record = await BruteForceModel.findOne({ ip })
    const now = new Date()
    
    if (!record) {
      return {
        isBlocked: false,
        attempts: 0
      }
    }
    
    if (record.blockedUntil && record.blockedUntil > now) {
      const remainingTime = Math.ceil((record.blockedUntil.getTime() - now.getTime()) / 1000)
      return {
        isBlocked: true,
        remainingTime,
        attempts: record.attempts
      }
    }
    
    const windowStart = new Date(now.getTime() - (ATTEMPT_WINDOW_MINUTES * 60 * 1000))
    if (record.lastAttempt < windowStart) {
      await BruteForceModel.deleteOne({ ip })
      return {
        isBlocked: false,
        attempts: 0
      }
    }
    
    return {
      isBlocked: false,
      attempts: record.attempts
    }
  } catch (error) {
    console.error('Error checking brute force:', error)
    return {
      isBlocked: false,
      attempts: 0
    }
  }
}

export async function recordFailedLogin(ip: string): Promise<void> {
  try {
    await connectDB()
    
    const now = new Date()
    const windowStart = new Date(now.getTime() - (ATTEMPT_WINDOW_MINUTES * 60 * 1000))
    
    const record = await BruteForceModel.findOne({ ip })
    
    if (!record) {
      await BruteForceModel.create({
        ip,
        attempts: 1,
        lastAttempt: now
      })
      return
    }
    
    if (record.lastAttempt < windowStart) {
      record.attempts = 1
    } else {
      record.attempts += 1
    }
    
    record.lastAttempt = now
    
    if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
      record.blockedUntil = new Date(now.getTime() + (BLOCK_DURATION_MINUTES * 60 * 1000))
    }
    
    await record.save()
  } catch (error) {
    console.error('Error recording failed login:', error)
  }
}

export async function resetLoginAttempts(ip: string): Promise<void> {
  try {
    await connectDB()
    await BruteForceModel.deleteOne({ ip })
  } catch (error) {
    console.error('Error resetting login attempts:', error)
  }
}

export async function cleanupOldSecurityEvents(): Promise<void> {
  try {
    await connectDB()
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    await SecurityEventModel.deleteMany({ 
      timestamp: { $lt: thirtyDaysAgo } 
    })
    
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    await BruteForceModel.deleteMany({
      lastAttempt: { $lt: sevenDaysAgo },
      blockedUntil: { $lt: new Date() }
    })
  } catch (error) {
    console.error('Error cleaning up old security events:', error)
  }
}