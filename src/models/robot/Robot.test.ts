import { describe, it, expect, beforeEach } from 'vitest';
import { Robot } from './Robot';
import { robotWheelbase, fieldHeight, fieldWidth } from '../constants';

describe('Robot.buildMove', () => {
    let robot: Robot;

    beforeEach(() => {
        // Initial position: x=0, y=0, orientation=0
        robot = new Robot('blue', 0, 0, 0);
    });

    // Helper function for arc movement calculations
    const calculateExpectedArcMove = (initialX: number, initialY: number, initialOrientation: number, leftWheelInput: number, rightWheelInput: number) => {
        const W = robotWheelbase;

        const d_orientation = (rightWheelInput - leftWheelInput) / W;
        const expectedOrientation = initialOrientation + d_orientation;

        // Avoid division by zero if d_orientation is zero (straight line or no movement)
        // This specific helper is for arcs, so (rightWheelInput - leftWheelInput) should not be 0 here.
        // If it were 0, it would mean straight movement, handled by a different path in buildMove.
        const R_turn = (W / 2) * (rightWheelInput + leftWheelInput) / (rightWheelInput - leftWheelInput);

        const icr_x = initialX - R_turn * Math.sin(initialOrientation);
        const icr_y = initialY + R_turn * Math.cos(initialOrientation);

        const V_icr_to_robot_x = initialX - icr_x;
        const V_icr_to_robot_y = initialY - icr_y;

        const V_rotated_x = V_icr_to_robot_x * Math.cos(d_orientation) - V_icr_to_robot_y * Math.sin(d_orientation);
        const V_rotated_y = V_icr_to_robot_x * Math.sin(d_orientation) + V_icr_to_robot_y * Math.cos(d_orientation);
        
        const expectedX = icr_x + V_rotated_x;
        const expectedY = icr_y + V_rotated_y;

        return { expectedX, expectedY, expectedOrientation };
    };

    it('should move forward correctly', () => {
        const move = robot.buildMove(1, 1);
        expect(move.x).toBeCloseTo(1);
        expect(move.y).toBeCloseTo(0);
        expect(move.orientation).toBeCloseTo(0);
        expect(move.leftWheelDistance).toBe(1);
        expect(move.rightWheelDistance).toBe(1);
    });

    it('should move backward correctly', () => {
        robot = new Robot('blue', 0, 0, Math.PI);
        const move = robot.buildMove(-1, -1);
        expect(move.x).toBeCloseTo(1); // Moving backward from PI orientation
        expect(move.y).toBeCloseTo(0, 5); // y should be close to 0
        expect(move.orientation).toBeCloseTo(Math.PI);
        expect(move.leftWheelDistance).toBe(-1);
        expect(move.rightWheelDistance).toBe(-1);
    });

    it('should arc left correctly (positive rotation)', () => {
        const leftWheelInput = 0.5;
        const rightWheelInput = 1.0;
        const initialX = robot.lastStep.x;
        const initialY = robot.lastStep.y;
        const initialOrientation = robot.lastStep.orientation;

        const move = robot.buildMove(leftWheelInput, rightWheelInput);
        const { expectedX, expectedY, expectedOrientation } = calculateExpectedArcMove(initialX, initialY, initialOrientation, leftWheelInput, rightWheelInput);

        expect(move.x).toBeCloseTo(expectedX);
        expect(move.y).toBeCloseTo(expectedY);
        expect(move.orientation).toBeCloseTo(expectedOrientation);
        expect(move.leftWheelDistance).toBe(leftWheelInput);
        expect(move.rightWheelDistance).toBe(rightWheelInput);
    });

    it('should arc right correctly (negative rotation)', () => {
        const leftWheelInput = 1.0;
        const rightWheelInput = 0.5;
        const initialX = robot.lastStep.x;
        const initialY = robot.lastStep.y;
        const initialOrientation = robot.lastStep.orientation;

        const move = robot.buildMove(leftWheelInput, rightWheelInput);
        const { expectedX, expectedY, expectedOrientation } = calculateExpectedArcMove(initialX, initialY, initialOrientation, leftWheelInput, rightWheelInput);

        expect(move.x).toBeCloseTo(expectedX);
        expect(move.y).toBeCloseTo(expectedY);
        expect(move.orientation).toBeCloseTo(expectedOrientation);
        expect(move.leftWheelDistance).toBe(leftWheelInput);
        expect(move.rightWheelDistance).toBe(rightWheelInput);
    });

    it('should spin in place (clockwise) correctly', () => {
        const wheelDistance = 0.5;
        const move = robot.buildMove(wheelDistance, -wheelDistance);

        const rotationAngle = (-wheelDistance - wheelDistance) / robotWheelbase;

        expect(move.x).toBeCloseTo(0);
        expect(move.y).toBeCloseTo(0); 
        expect(move.orientation).toBeCloseTo(rotationAngle);
        expect(move.leftWheelDistance).toBe(wheelDistance);
        expect(move.rightWheelDistance).toBe(-wheelDistance);
    });

    it('should spin in place (counter-clockwise) correctly', () => {
        const wheelDistance = 0.5;
        const move = robot.buildMove(-wheelDistance, wheelDistance);

        const rotationAngle = (wheelDistance - (-wheelDistance)) / robotWheelbase;
        
        expect(move.x).toBeCloseTo(0);
        expect(move.y).toBeCloseTo(0);
        expect(move.orientation).toBeCloseTo(rotationAngle);
        expect(move.leftWheelDistance).toBe(-wheelDistance);
        expect(move.rightWheelDistance).toBe(wheelDistance);
    });

    it('should accumulate wheel distances', () => {
        robot.steps[0].leftWheelDistance = 10;
        robot.steps[0].rightWheelDistance = 15;

        const moveForward = robot.buildMove(1, 1);
        expect(moveForward.leftWheelDistance).toBe(11);
        expect(moveForward.rightWheelDistance).toBe(16);

        const turnLeft = robot.buildMove(0, 1);
        expect(turnLeft.leftWheelDistance).toBe(10);
        expect(turnLeft.rightWheelDistance).toBe(16);
    });

     it('should handle zero movement', () => {
        const move = robot.buildMove(0, 0);
        expect(move.x).toBe(0);
        expect(move.y).toBe(0);
        expect(move.orientation).toBe(0);
        expect(move.leftWheelDistance).toBe(0);
        expect(move.rightWheelDistance).toBe(0);
    });
}); 