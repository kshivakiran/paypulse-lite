import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  eventType: string;
  userId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
  eventType: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  details: { type: Schema.Types.Mixed, required: true },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 } // Auto-expire logs after 30 days
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
