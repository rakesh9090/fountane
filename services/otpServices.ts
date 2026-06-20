export enum OtpErrorCode {
  EXPIRED = 'EXPIRED',
  INVALID = 'INVALID',
  RATE_LIMITED = 'RATE_LIMITED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  NOT_FOUND = 'NOT_FOUND',
}

export class OtpError extends Error {
  constructor(
    public readonly code: OtpErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'OtpError';
  }
}

interface OtpRecord {
  otp: string;
  expiresAt: number;
  lastSentAt: number;
  resendCount: number;
  verificationAttempts: number;
}

interface SendOtpResponse {
  success: boolean;
  otp: string;
  expiresIn: number;
}

interface VerifyOtpResponse {
  success: boolean;
  token: string;
}

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_RESENDS = 3;
const MAX_ATTEMPTS = 5;

const otpStore = new Map<string, OtpRecord>();

const generateOtp = (): string => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

const sendOtp = (
  identifier: string
): SendOtpResponse => {
  const existingRecord = otpStore.get(identifier);

  if (
    existingRecord &&
    Date.now() - existingRecord.lastSentAt <
      RESEND_COOLDOWN_MS
  ) {
    throw new OtpError(
      OtpErrorCode.RATE_LIMITED,
      'Please wait before requesting another OTP'
    );
  }

  if (
    existingRecord &&
    existingRecord.resendCount >= MAX_RESENDS
  ) {
    throw new OtpError(
      OtpErrorCode.RATE_LIMITED,
      'Maximum resend limit reached'
    );
  }

  const otp = generateOtp();

  const record: OtpRecord = {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    lastSentAt: Date.now(),
    resendCount: existingRecord
      ? existingRecord.resendCount + 1
      : 1,
    verificationAttempts: 0,
  };

  otpStore.set(identifier, record);

  return {
    success: true,
    otp, // visible only because this is a mock assignment
    expiresIn: OTP_EXPIRY_MS / 1000,
  };
};

const resendOtp = (
  identifier: string
): SendOtpResponse => {
  return sendOtp(identifier);
};

const verifyOtp = (
  identifier: string,
  enteredOtp: string
): VerifyOtpResponse => {
  const record = otpStore.get(identifier);

  if (!record) {
    throw new OtpError(
      OtpErrorCode.NOT_FOUND,
      'OTP not found'
    );
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(identifier);

    throw new OtpError(
      OtpErrorCode.EXPIRED,
      'OTP expired'
    );
  }

  if (
    record.verificationAttempts >= MAX_ATTEMPTS
  ) {
    throw new OtpError(
      OtpErrorCode.TOO_MANY_ATTEMPTS,
      'Too many verification attempts'
    );
  }

  if (record.otp !== enteredOtp) {
    record.verificationAttempts += 1;

    otpStore.set(identifier, record);

    throw new OtpError(
      OtpErrorCode.INVALID,
      'Invalid OTP'
    );
  }

  otpStore.delete(identifier);

  return {
    success: true,
    token: `mock_token_${Date.now()}`,
  };
};

const getRemainingCooldown = (
  identifier: string
): number => {
  const record = otpStore.get(identifier);

  if (!record) {
    return 0;
  }

  const remaining =
    RESEND_COOLDOWN_MS -
    (Date.now() - record.lastSentAt);

  return Math.max(
    0,
    Math.ceil(remaining / 1000)
  );
};

export const otpServices = {
  sendOtp,
  resendOtp,
  verifyOtp,
  getRemainingCooldown,
};