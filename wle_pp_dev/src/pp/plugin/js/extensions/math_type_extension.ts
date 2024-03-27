/*
    How to use

    By default the rotations are in Degrees

    For rotations u can add a suffix like Degrees/Radians to use a specific version, example:
        - pp_angleDistanceSignedDegrees
        - pp_isInsideAngleRangeRadians
        
    List of constants:
        - PP_EPSILON / PP_EPSILON_SQUARED / PP_EPSILON_DEGREES

    List of functions:
        Notes:
            - The suffixes (like Degrees or Radians) are omitted 

        - pp_clamp
        - pp_sign
        - pp_toDegrees      / pp_toRadians
        - pp_roundDecimal
        - pp_mapToRange
        - pp_random         / pp_randomInt    / pp_randomInt        / pp_randomSign / pp_randomPick
        - pp_lerp           / pp_interpolate
        - pp_angleDistance  / pp_angleDistanceSigned
        - pp_angleClamp
        - pp_isInsideAngleRange
*/

import { EasingFunction } from "../../../cauldron/utils/math_utils.js";

export interface MathExtension {
    PP_EPSILON: number;
    PP_EPSILON_SQUARED: number;
    PP_EPSILON_DEGREES: number;

    pp_clamp(value: number, start: number, end: number): number;

    pp_sign(value: number, zeroSign?: number): number;

    pp_toDegrees(angle: number): number;
    pp_toRadians(angle: number): number;

    pp_roundDecimal(number: number, decimalPlaces: number): number;

    pp_mapToRange(value: number, originRangeStart: number, originRangeEnd: number, newRangeStart: number, newRangeEnd: number): number;

    pp_random(): number;
    pp_random(start: number, end: number): number;
    pp_randomInt(start: number, end: number): number;
    pp_randomBool(): boolean;
    pp_randomSign(): number;
    pp_randomPick<T>(...args: T[]): T | null;
    pp_randomUUID(): string;

    pp_lerp(from: number, to: number, interpolationFactor: number): number;
    pp_interpolate(from: number, to: number, interpolationFactor: number, easingFunction?: EasingFunction): number;
    pp_interpolatePeriodic(from: number, to: number, interpolationFactor: number, easingFunction?: EasingFunction): number;

    pp_angleDistance(from: number, to: number): number;
    pp_angleDistanceDegrees(from: number, to: number): number;
    pp_angleDistanceRadians(from: number, to: number): number;
    pp_angleDistanceSigned(from: number, to: number): number;
    pp_angleDistanceSignedDegrees(from: number, to: number): number;
    pp_angleDistanceSignedRadians(from: number, to: number): number;
    pp_angleClamp(angle: number, usePositiveRange?: boolean): number;
    pp_angleClampDegrees(angle: number, usePositiveRange?: boolean): number;
    pp_angleClampRadians(angle: number, usePositiveRange?: boolean): number;

    pp_isInsideAngleRange(angle: number, start: number, end: number, useShortestAngle?: boolean): boolean;
    pp_isInsideAngleRangeDegrees(angle: number, start: number, end: number, useShortestAngle?: boolean): boolean;
    pp_isInsideAngleRangeRadians(angle: number, start: number, end: number, useShortestAngle?: boolean): boolean;
}

declare global {
    export interface Math extends MathExtension { }
}