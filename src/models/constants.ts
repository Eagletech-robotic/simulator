import { degreesToRadians } from '../utils/maths'

// Time
export const stepDuration = 0.004 // seconds
export const defaultGameDurationSeconds = 100 // seconds

// Field
export const fieldWidth = 3.0 // meters
export const fieldHeight = 2.0 // meters

// Robot
export const robotWidth = 0.385 // meters
export const robotLength = 0.30 // meters
export const robotWheelDiameter = 0.069 // meters
export const robotWheelbase = 0.330 // meters
export const encoderImpulsesPerWheelTurn = 500 * 36 * 4
export const robotMaxSpeed = 1.0 // meters per second

// Shovel
export const shovelWidth = 0.28 // meters
export const shovelToCenter = 0.10 // meters
export const shovelExtension = 0.02 // meters

// TOF
export const tofHeight = 0.22 // meters
export const tofToCenter = 0.08 // meters
export const tofHalfAngle = degreesToRadians(25) / 2 // radians

// Sensor errors
export const encoderError = 0.2
export const imuOrientationError = degreesToRadians(10)
export const bluetoothMinStepLatency = 60 // Min latency in number of steps
export const bluetoothMaxStepLatency = 100

// PAMI
export const pamiWidth = 0.15 // meters

// Objects
export const bleacherLength = 0.4 // meters
export const bleacherWidth = 0.1 // meters
export const bleacherHeight = 0.12 // meters
export const canWidth = 0.07 // meters
