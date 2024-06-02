import { Component, Object3D, WonderlandEngine, type ComponentConstructor } from "@wonderlandengine/api";
import { Matrix3, Matrix4, Quaternion, Quaternion2, Vector3 } from "../../../cauldron/type_definitions/array_type_definitions.js";
import { CloneParams, ObjectUtils } from "../../../cauldron/wl/utils/object_utils.js";
import { PluginUtils } from "../../utils/plugin_utils.js";
import { Object3DExtension } from "./object_type_extension.js";

import "./object_type_extension.js";

export function initObjectExtension(): void {
    _initObjectExtensionProtoype();
}

function _initObjectExtensionProtoype(): void {

    const objectExtension: Object3DExtension = {
        pp_getPosition<T extends Vector3>(this: Readonly<Object3D>, outPosition?: T): T {
            return ObjectUtils.getPosition(this);
        },

        pp_getPositionWorld<T extends Vector3>(this: Readonly<Object3D>, outPosition?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getPositionWorld(this);
        },

        pp_getPositionLocal<T extends Vector3>(this: Readonly<Object3D>, outPosition?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getPositionLocal(this);
        },

        pp_getRotation<T extends Vector3>(this: Readonly<Object3D>, outRotation?: T): T {
            return ObjectUtils.getRotation(this);
        },

        pp_getRotationDegrees<T extends Vector3>(this: Readonly<Object3D>, outRotation?: T): T {
            return ObjectUtils.getRotationDegrees(this);
        },

        pp_getRotationRadians<T extends Vector3>(this: Readonly<Object3D>, outRotation?: T): T {
            return ObjectUtils.getRotationRadians(this);
        },

        pp_getRotationMatrix<T extends Matrix3>(this: Readonly<Object3D>, outRotation?: Matrix3 | T): Matrix3 | T {
            return ObjectUtils.getRotationMatrix(this);
        },

        pp_getRotationQuat<T extends Quaternion>(this: Readonly<Object3D>, outRotation?: Quaternion | T): Quaternion | T {
            return ObjectUtils.getRotationQuat(this);
        },

        pp_getRotationWorld<T extends Vector3>(this: Readonly<Object3D>, outRotation?: T): T {
            return ObjectUtils.getRotationWorld(this);
        },

        pp_getRotationWorldDegrees<T extends Vector3>(this: Readonly<Object3D>, outRotation?: T): T {
            return ObjectUtils.getRotationWorldDegrees(this);
        },

        pp_getRotationWorldRadians<T extends Vector3>(this: Readonly<Object3D>, outRotation?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getRotationWorldRadians(this);
        },

        pp_getRotationWorldMatrix<T extends Matrix3>(this: Readonly<Object3D>, outRotation?: Matrix3 | T): Matrix3 | T {
            return ObjectUtils.getRotationWorldMatrix(this);
        },

        pp_getRotationWorldQuat<T extends Quaternion>(this: Readonly<Object3D>, outRotation?: Quaternion | T): Quaternion | T {
            return ObjectUtils.getRotationWorldQuat(this);
        },

        pp_getRotationLocal<T extends Vector3>(this: Readonly<Object3D>, outRotation?: T): T {
            return ObjectUtils.getRotationLocal(this);
        },

        pp_getRotationLocalDegrees<T extends Vector3>(this: Readonly<Object3D>, outRotation?: T): T {
            return ObjectUtils.getRotationLocalDegrees(this);
        },

        pp_getRotationLocalRadians<T extends Vector3>(this: Readonly<Object3D>, outRotation?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getRotationLocalRadians(this);
        },

        pp_getRotationLocalMatrix<T extends Matrix3>(this: Readonly<Object3D>, outRotation?: Matrix3 | T): Matrix3 | T {
            return ObjectUtils.getRotationLocalMatrix(this);
        },

        pp_getRotationLocalQuat<T extends Quaternion>(this: Readonly<Object3D>, outRotation?: Quaternion | T): Quaternion | T {
            return ObjectUtils.getRotationLocalQuat(this);
        },

        pp_getScale<T extends Vector3>(this: Readonly<Object3D>, outScale?: T): T {
            return ObjectUtils.getScale(this);
        },

        pp_getScaleWorld<T extends Vector3>(this: Readonly<Object3D>, outScale?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getScaleWorld(this);
        },

        pp_getScaleLocal<T extends Vector3>(this: Readonly<Object3D>, outScale?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getScaleLocal(this);
        },

        pp_getTransform<T extends Matrix4>(this: Readonly<Object3D>, outTransform?: Matrix4 | T): Matrix4 | T {
            return ObjectUtils.getTransform(this);
        },

        pp_getTransformMatrix<T extends Matrix4>(this: Readonly<Object3D>, outTransform?: Matrix4 | T): Matrix4 | T {
            return ObjectUtils.getTransformMatrix(this);
        },

        pp_getTransformQuat<T extends Quaternion2>(this: Readonly<Object3D>, outTransform?: Quaternion2 | T): Quaternion2 | T {
            return ObjectUtils.getTransformQuat(this);
        },

        pp_getTransformWorld<T extends Matrix4>(this: Readonly<Object3D>, outTransform?: Matrix4 | T): Matrix4 | T {
            return ObjectUtils.getTransformWorld(this);
        },

        pp_getTransformWorldMatrix<T extends Matrix4>(this: Readonly<Object3D>, outTransform?: Matrix4 | T): Matrix4 | T {
            return ObjectUtils.getTransformWorldMatrix(this);
        },

        pp_getTransformWorldQuat<T extends Quaternion2>(this: Readonly<Object3D>, outTransform?: Quaternion2 | T): Quaternion2 | T {
            return ObjectUtils.getTransformWorldQuat(this);
        },

        pp_getTransformLocal<T extends Matrix4>(this: Readonly<Object3D>, outTransform?: Matrix4 | T): Matrix4 | T {
            return ObjectUtils.getTransformLocal(this);
        },

        pp_getTransformLocalMatrix<T extends Matrix4>(this: Readonly<Object3D>, outTransform?: Matrix4 | T): Matrix4 | T {
            return ObjectUtils.getTransformLocalMatrix(this);
        },

        pp_getTransformLocalQuat<T extends Quaternion2>(this: Readonly<Object3D>, outTransform?: Quaternion2 | T): Quaternion2 | T {
            return ObjectUtils.getTransformLocalQuat(this);
        },

        pp_getAxes<T extends Vector3, U extends Vector3, V extends Vector3>(this: Readonly<Object3D>, outAxes?: [Vector3, Vector3, Vector3] | [T, U, V]): [Vector3, Vector3, Vector3] | [T, U, V] {
            return ObjectUtils.getAxes(this);
        },

        pp_getAxesWorld<T extends Vector3, U extends Vector3, V extends Vector3>(this: Readonly<Object3D>, outAxes?: [Vector3, Vector3, Vector3] | [T, U, V]): [Vector3, Vector3, Vector3] | [T, U, V] {
            return ObjectUtils.getAxesWorld(this);
        },

        pp_getAxesLocal<T extends Vector3, U extends Vector3, V extends Vector3>(this: Readonly<Object3D>, outAxes?: [Vector3, Vector3, Vector3] | [T, U, V]): [Vector3, Vector3, Vector3] | [T, U, V] {
            return ObjectUtils.getAxesLocal(this);
        },

        pp_getForward<T extends Vector3>(this: Readonly<Object3D>, outForward?: T): T {
            return ObjectUtils.getForward(this);
        },

        pp_getForwardWorld<T extends Vector3>(this: Readonly<Object3D>, outForward?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getForwardWorld(this);
        },

        pp_getForwardLocal<T extends Vector3>(this: Readonly<Object3D>, outForward?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getForwardLocal(this);
        },

        pp_getBackward<T extends Vector3>(this: Readonly<Object3D>, outBackward?: T): T {
            return ObjectUtils.getBackward(this);
        },

        pp_getBackwardWorld<T extends Vector3>(this: Readonly<Object3D>, outBackward?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getBackwardWorld(this);
        },

        pp_getBackwardLocal<T extends Vector3>(this: Readonly<Object3D>, outBackward?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getBackwardLocal(this);
        },

        pp_getUp<T extends Vector3>(this: Readonly<Object3D>, outUp?: T): T {
            return ObjectUtils.getUp(this);
        },

        pp_getUpWorld<T extends Vector3>(this: Readonly<Object3D>, outUp?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getUpWorld(this);
        },

        pp_getUpLocal<T extends Vector3>(this: Readonly<Object3D>, outUp?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getUpLocal(this);
        },

        pp_getDown<T extends Vector3>(this: Readonly<Object3D>, outDown?: T): T {
            return ObjectUtils.getDown(this);
        },

        pp_getDownWorld<T extends Vector3>(this: Readonly<Object3D>, outDown?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getDownWorld(this);
        },

        pp_getDownLocal<T extends Vector3>(this: Readonly<Object3D>, outDown?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getDownLocal(this);
        },

        pp_getLeft<T extends Vector3>(this: Readonly<Object3D>, outLeft?: T): T {
            return ObjectUtils.getLeft(this);
        },

        pp_getLeftWorld<T extends Vector3>(this: Readonly<Object3D>, outLeft?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getLeftWorld(this);
        },

        pp_getLeftLocal<T extends Vector3>(this: Readonly<Object3D>, outLeft?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getLeftLocal(this);
        },

        pp_getRight<T extends Vector3>(this: Readonly<Object3D>, outRight?: T): T {
            return ObjectUtils.getRight(this);
        },

        pp_getRightWorld<T extends Vector3>(this: Readonly<Object3D>, outRight?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getRightWorld(this);
        },

        pp_getRightLocal<T extends Vector3>(this: Readonly<Object3D>, outRight?: Vector3 | T): Vector3 | T {
            return ObjectUtils.getRightLocal(this);
        },

        pp_setPosition(this: Object3D, position: Readonly<Vector3>): Object3D {
            return ObjectUtils.setPosition(this);
        },

        pp_setPositionWorld(this: Object3D, position: Readonly<Vector3>): Object3D {
            return ObjectUtils.setPositionWorld(this);
        },

        pp_setPositionLocal(this: Object3D, position: Readonly<Vector3>): Object3D {
            return ObjectUtils.setPositionLocal(this);
        },

        pp_setRotation(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.setRotation(this);
        },

        pp_setRotationDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.setRotationDegrees(this);
        },

        pp_setRotationRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.setRotationRadians(this);
        },

        pp_setRotationMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D {
            return ObjectUtils.setRotationMatrix(this);
        },

        pp_setRotationQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D {
            return ObjectUtils.setRotationQuat(this);
        },

        pp_setRotationWorld(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.setRotationWorld(this);
        },

        pp_setRotationWorldDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.setRotationWorldDegrees(this);
        },

        pp_setRotationWorldRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.setRotationWorldRadians(this);
        },

        pp_setRotationWorldMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D {
            return ObjectUtils.setRotationWorldMatrix(this);
        },

        pp_setRotationWorldQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D {
            return ObjectUtils.setRotationWorldQuat(this);
        },

        pp_setRotationLocal(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.setRotationLocal(this);
        },

        pp_setRotationLocalDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.setRotationLocalDegrees(this);
        },

        pp_setRotationLocalRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.setRotationLocalRadians(this);
        },

        pp_setRotationLocalMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D {
            return ObjectUtils.setRotationLocalMatrix(this);
        },

        pp_setRotationLocalQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D {
            return ObjectUtils.setRotationLocalQuat(this);
        },

        pp_setScale(this: Object3D, scale: Readonly<Vector3> | number): Object3D {
            return ObjectUtils.setScale(this);
        },

        pp_setScaleWorld(this: Object3D, scale: Readonly<Vector3> | number): Object3D {
            return ObjectUtils.setScaleWorld(this);
        },

        pp_setScaleLocal(this: Object3D, scale: Readonly<Vector3> | number): Object3D {
            return ObjectUtils.setScaleLocal(this);
        },

        pp_setAxes(this: Object3D, left?: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setAxes(this);
        },

        pp_setAxesWorld(this: Object3D, left?: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setAxesWorld(this);
        },

        pp_setAxesLocal(this: Object3D, left?: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setAxesLocal(this);
        },

        pp_setForward(this: Object3D, forward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setForward(this);
        },

        pp_setForwardWorld(this: Object3D, forward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setForwardWorld(this);
        },

        pp_setForwardLocal(this: Object3D, forward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setForwardLocal(this);
        },

        pp_setBackward(this: Object3D, backward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setBackward(this);
        },

        pp_setBackwardWorld(this: Object3D, backward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setBackwardWorld(this);
        },

        pp_setBackwardLocal(this: Object3D, backward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setBackwardLocal(this);
        },

        pp_setUp(this: Object3D, up: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setUp(this);
        },

        pp_setUpWorld(this: Object3D, up: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setUpWorld(this);
        },

        pp_setUpLocal(this: Object3D, up: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setUpLocal(this);
        },

        pp_setDown(this: Object3D, down: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setDown(this);
        },

        pp_setDownWorld(this: Object3D, down: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setDownWorld(this);
        },

        pp_setDownLocal(this: Object3D, down: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setDownLocal(this);
        },

        pp_setLeft(this: Object3D, left: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setLeft(this);
        },

        pp_setLeftWorld(this: Object3D, left: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setLeftWorld(this);
        },

        pp_setLeftLocal(this: Object3D, left: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setLeftLocal(this);
        },

        pp_setRight(this: Object3D, right: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setRight(this);
        },

        pp_setRightWorld(this: Object3D, right: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setRightWorld(this);
        },

        pp_setRightLocal(this: Object3D, right: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D {
            return ObjectUtils.setRightLocal(this);
        },

        pp_setTransform(this: Object3D, transform: Readonly<Matrix4>): Object3D {
            return ObjectUtils.setTransform(this);
        },

        pp_setTransformMatrix(this: Object3D, transform: Readonly<Matrix4>): Object3D {
            return ObjectUtils.setTransformMatrix(this);
        },

        pp_setTransformQuat(this: Object3D, transform: Readonly<Quaternion2>): Object3D {
            return ObjectUtils.setTransformQuat(this);
        },

        pp_setTransformWorld(this: Object3D, transform: Readonly<Matrix4>): Object3D {
            return ObjectUtils.setTransformWorld(this);
        },

        pp_setTransformWorldMatrix(this: Object3D, transform: Readonly<Matrix4>): Object3D {
            return ObjectUtils.setTransformWorldMatrix(this);
        },

        pp_setTransformWorldQuat(this: Object3D, transform: Readonly<Quaternion2>): Object3D {
            return ObjectUtils.setTransformWorldQuat(this);
        },

        pp_setTransformLocal(this: Object3D, transform: Readonly<Matrix4>): Object3D {
            return ObjectUtils.setTransformLocal(this);
        },

        pp_setTransformLocalMatrix(this: Object3D, transform: Readonly<Matrix4>): Object3D {
            return ObjectUtils.setTransformLocalMatrix(this);
        },

        pp_setTransformLocalQuat(this: Object3D, transform: Readonly<Quaternion2>): Object3D {
            return ObjectUtils.setTransformLocalQuat(this);
        },

        pp_resetPosition(this: Object3D): Object3D {
            return ObjectUtils.resetPosition(this);
        },

        pp_resetPositionWorld(this: Object3D): Object3D {
            return ObjectUtils.resetPositionWorld(this);
        },

        pp_resetPositionLocal(this: Object3D): Object3D {
            return ObjectUtils.resetPositionLocal(this);
        },

        pp_resetRotation(this: Object3D): Object3D {
            return ObjectUtils.resetRotation(this);
        },

        pp_resetRotationWorld(this: Object3D): Object3D {
            return ObjectUtils.resetRotationWorld(this);
        },

        pp_resetRotationLocal(this: Object3D): Object3D {
            return ObjectUtils.resetRotationLocal(this);
        },

        pp_resetScale(this: Object3D): Object3D {
            return ObjectUtils.resetScale(this);
        },

        pp_resetScaleWorld(this: Object3D): Object3D {
            return ObjectUtils.resetScaleWorld(this);
        },

        pp_resetScaleLocal(this: Object3D): Object3D {
            return ObjectUtils.resetScaleLocal(this);
        },

        pp_resetTransform(this: Object3D): Object3D {
            return ObjectUtils.resetTransform(this);
        },

        pp_resetTransformWorld(this: Object3D): Object3D {
            return ObjectUtils.resetTransformWorld(this);
        },

        pp_resetTransformLocal(this: Object3D): Object3D {
            return ObjectUtils.resetTransformLocal(this);
        },

        pp_translate(this: Object3D, translation: Readonly<Vector3>): Object3D {
            return ObjectUtils.translate(this);
        },

        pp_translateWorld(this: Object3D, translation: Readonly<Vector3>): Object3D {
            return ObjectUtils.translateWorld(this);
        },

        pp_translateLocal(this: Object3D, translation: Readonly<Vector3>): Object3D {
            return ObjectUtils.translateLocal(this);
        },

        pp_translateObject(this: Object3D, translation: Readonly<Vector3>): Object3D {
            return ObjectUtils.translateObject(this);
        },

        pp_translateAxis(this: Object3D, amount: number, direction: Readonly<Vector3>): Object3D {
            return ObjectUtils.translateAxis(this);
        },

        pp_translateAxisWorld(this: Object3D, amount: number, direction: Readonly<Vector3>): Object3D {
            return ObjectUtils.translateAxisWorld(this);
        },

        pp_translateAxisLocal(this: Object3D, amount: number, direction: Readonly<Vector3>): Object3D {
            return ObjectUtils.translateAxisLocal(this);
        },

        pp_translateAxisObject(this: Object3D, amount: number, direction: Readonly<Vector3>): Object3D {
            return ObjectUtils.translateAxisObject(this);
        },

        pp_rotate(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotate(this);
        },

        pp_rotateDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateDegrees(this);
        },

        pp_rotateRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateRadians(this);
        },

        pp_rotateMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D {
            return ObjectUtils.rotateMatrix(this);
        },

        pp_rotateQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D {
            return ObjectUtils.rotateQuat(this);
        },

        pp_rotateWorld(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateWorld(this);
        },

        pp_rotateWorldDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateWorldDegrees(this);
        },

        pp_rotateWorldRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateWorldRadians(this);
        },

        pp_rotateWorldMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D {
            return ObjectUtils.rotateWorldMatrix(this);
        },

        pp_rotateWorldQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D {
            return ObjectUtils.rotateWorldQuat(this);
        },

        pp_rotateLocal(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateLocal(this);
        },

        pp_rotateLocalDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateLocalDegrees(this);
        },

        pp_rotateLocalRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateLocalRadians(this);
        },

        pp_rotateLocalMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D {
            return ObjectUtils.rotateLocalMatrix(this);
        },

        pp_rotateLocalQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D {
            return ObjectUtils.rotateLocalQuat(this);
        },

        pp_rotateObject(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateObject(this);
        },

        pp_rotateObjectDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateObjectDegrees(this);
        },

        pp_rotateObjectRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateObjectRadians(this);
        },

        pp_rotateObjectMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D {
            return ObjectUtils.rotateObjectMatrix(this);
        },

        pp_rotateObjectQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D {
            return ObjectUtils.rotateObjectQuat(this);
        },

        pp_rotateAxis(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAxis(this);
        },

        pp_rotateAxisDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAxisDegrees(this);
        },

        pp_rotateAxisRadians(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAxisRadians(this);
        },

        pp_rotateAxisWorld(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAxisWorld(this);
        },

        pp_rotateAxisWorldDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAxisWorldDegrees(this);
        },

        pp_rotateAxisWorldRadians(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAxisWorldRadians(this);
        },

        pp_rotateAxisLocal(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAxisLocal(this);
        },

        pp_rotateAxisLocalDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAxisLocalDegrees(this);
        },

        pp_rotateAxisLocalRadians(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAxisLocalRadians(this);
        },

        pp_rotateAxisObject(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAxisObject(this);
        },

        pp_rotateAxisObjectDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAxisObjectDegrees(this);
        },

        pp_rotateAxisObjectRadians(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAxisObjectRadians(this);
        },

        pp_rotateAround(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAround(this);
        },

        pp_rotateAroundDegrees(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundDegrees(this);
        },

        pp_rotateAroundRadians(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundRadians(this);
        },

        pp_rotateAroundMatrix(this: Object3D, rotation: Readonly<Matrix3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundMatrix(this);
        },

        pp_rotateAroundQuat(this: Object3D, rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundQuat(this);
        },

        pp_rotateAroundWorld(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundWorld(this);
        },

        pp_rotateAroundWorldDegrees(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundWorldDegrees(this);
        },

        pp_rotateAroundWorldRadians(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundWorldRadians(this);
        },

        pp_rotateAroundWorldMatrix(this: Object3D, rotation: Readonly<Matrix3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundWorldMatrix(this);
        },

        pp_rotateAroundWorldQuat(this: Object3D, rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundWorldQuat(this);
        },

        pp_rotateAroundLocal(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundLocal(this);
        },

        pp_rotateAroundLocalDegrees(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundLocalDegrees(this);
        },

        pp_rotateAroundLocalRadians(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundLocalRadians(this);
        },

        pp_rotateAroundLocalMatrix(this: Object3D, rotation: Readonly<Matrix3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundLocalMatrix(this);
        },

        pp_rotateAroundLocalQuat(this: Object3D, rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundLocalQuat(this);
        },

        pp_rotateAroundObject(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundObject(this);
        },

        pp_rotateAroundObjectDegrees(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundObjectDegrees(this);
        },

        pp_rotateAroundObjectRadians(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundObjectRadians(this);
        },

        pp_rotateAroundObjectMatrix(this: Object3D, rotation: Readonly<Matrix3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundObjectMatrix(this);
        },

        pp_rotateAroundObjectQuat(this: Object3D, rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundObjectQuat(this);
        },

        pp_rotateAroundAxis(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundAxis(this);
        },

        pp_rotateAroundAxisDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundAxisDegrees(this);
        },

        pp_rotateAroundAxisRadians(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundAxisRadians(this);
        },

        pp_rotateAroundAxisWorld(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundAxisWorld(this);
        },

        pp_rotateAroundAxisWorldDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundAxisWorldDegrees(this);
        },

        pp_rotateAroundAxisWorldRadians(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundAxisWorldRadians(this);
        },

        pp_rotateAroundAxisLocal(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundAxisLocal(this);
        },

        pp_rotateAroundAxisLocalDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundAxisLocalDegrees(this);
        },

        pp_rotateAroundAxisLocalRadians(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundAxisLocalRadians(this);
        },

        pp_rotateAroundAxisObject(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundAxisObject(this);
        },

        pp_rotateAroundAxisObjectDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundAxisObjectDegrees(this);
        },

        pp_rotateAroundAxisObjectRadians(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
            return ObjectUtils.rotateAroundAxisObjectRadians(this);
        },

        pp_scaleObject(this: Object3D, scale: Readonly<Vector3> | number): Object3D {
            return ObjectUtils.scaleObject(this);
        },

        pp_lookAt(this: Object3D, position: Readonly<Vector3>, up: Readonly<Vector3>): Object3D {
            return ObjectUtils.lookAt(this);
        },

        pp_lookAtWorld(this: Object3D, position: Readonly<Vector3>, up: Readonly<Vector3>): Object3D {
            return ObjectUtils.lookAtWorld(this);
        },

        pp_lookAtLocal(this: Object3D, position: Readonly<Vector3>, up: Readonly<Vector3>): Object3D {
            return ObjectUtils.lookAtLocal(this);
        },

        pp_lookTo(this: Object3D, direction: Readonly<Vector3>, up: Readonly<Vector3>): Object3D {
            return ObjectUtils.lookTo(this);
        },

        pp_lookToWorld(this: Object3D, direction: Readonly<Vector3>, up?: Readonly<Vector3>): Object3D {
            return ObjectUtils.lookToWorld(this);
        },

        pp_lookToLocal(this: Object3D, direction: Readonly<Vector3>, up?: Readonly<Vector3>): Object3D {
            return ObjectUtils.lookToLocal(this);
        },

        pp_convertPositionObjectToWorld<T extends Vector3>(this: Readonly<Object3D>, position: Readonly<Vector3>, outPosition?: Vector3 | T): Vector3 | T {
            return ObjectUtils.convertPositionObjectToWorld(this);
        },

        pp_convertDirectionObjectToWorld<T extends Vector3>(this: Readonly<Object3D>, direction: Readonly<Vector3>, outDirection?: Vector3 | T): Vector3 | T {
            return ObjectUtils.convertDirectionObjectToWorld(this);
        },

        pp_convertPositionObjectToWorld<T extends Vector3>(this: Readonly<Object3D>, position: Readonly<Vector3>, outPosition?: Vector3 | T): Vector3 | T {
            return ObjectUtils.convertPositionObjectToWorld(this);
        },

        pp_convertDirectionWorldToObject<T extends Vector3>(this: Readonly<Object3D>, direction: Readonly<Vector3>, outDirection?: Vector3 | T): Vector3 | T {
            return ObjectUtils.convertDirectionWorldToObject(this);
        },

        pp_convertPositionLocalToWorld<T extends Vector3>(this: Readonly<Object3D>, position: Readonly<Vector3>, outPosition?: Vector3 | T): Vector3 | T {
            return ObjectUtils.convertPositionLocalToWorld(this);
        },

        pp_convertDirectionLocalToWorld<T extends Vector3>(this: Readonly<Object3D>, direction: Readonly<Vector3>, outDirection?: Vector3 | T): Vector3 | T {
            return ObjectUtils.convertDirectionLocalToWorld(this);
        },

        pp_convertPositionWorldToLocal<T extends Vector3>(this: Readonly<Object3D>, position: Readonly<Vector3>, outPosition?: Vector3 | T): Vector3 | T {
            return ObjectUtils.convertPositionWorldToLocal(this);
        },

        pp_convertDirectionWorldToLocal<T extends Vector3>(this: Readonly<Object3D>, direction: Readonly<Vector3>, outDirection?: Vector3 | T): Vector3 | T {
            return ObjectUtils.convertDirectionWorldToLocal(this);
        },

        pp_convertPositionObjectToLocal<T extends Vector3>(this: Readonly<Object3D>, position: Readonly<Vector3>, outPosition?: Vector3 | T): Vector3 | T {
            return ObjectUtils.convertPositionObjectToLocal(this);
        },

        pp_convertDirectionObjectToLocal<T extends Vector3>(this: Readonly<Object3D>, direction: Readonly<Vector3>, outDirection?: Vector3 | T): Vector3 | T {
            return ObjectUtils.convertDirectionObjectToLocal(this);
        },

        pp_convertPositionLocalToObject<T extends Vector3>(this: Readonly<Object3D>, position: Readonly<Vector3>, outPosition?: Vector3 | T): Vector3 | T {
            return ObjectUtils.convertPositionLocalToObject(this);
        },

        pp_convertDirectionLocalToObject<T extends Vector3>(this: Readonly<Object3D>, direction: Readonly<Vector3>, outDirection?: Vector3 | T): Vector3 | T {
            return ObjectUtils.convertDirectionLocalToObject(this);
        },

        pp_convertTransformObjectToWorld<T extends Matrix4, U extends Matrix4>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformObjectToWorld(this);
        },

        pp_convertTransformObjectToWorldMatrix<T extends Matrix4, U extends Matrix4>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformObjectToWorldMatrix(this);
        },

        pp_convertTransformObjectToWorldQuat<T extends Quaternion2, U extends Quaternion2>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformObjectToWorldQuat(this);
        },

        pp_convertTransformWorldToObject<T extends Matrix4, U extends Matrix4>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformWorldToObject(this);
        },

        pp_convertTransformWorldToObjectMatrix<T extends Matrix4, U extends Matrix4>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformWorldToObjectMatrix(this);
        },

        pp_convertTransformWorldToObjectQuat<T extends Quaternion2, U extends Quaternion2>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformWorldToObjectQuat(this);
        },

        pp_convertTransformLocalToWorld<T extends Matrix4, U extends Matrix4>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformLocalToWorld(this);
        },

        pp_convertTransformLocalToWorldMatrix<T extends Matrix4, U extends Matrix4>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformLocalToWorldMatrix(this);
        },

        pp_convertTransformLocalToWorldQuat<T extends Quaternion2, U extends Quaternion2>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformLocalToWorldQuat(this);
        },

        pp_convertTransformWorldToLocal<T extends Matrix4, U extends Matrix4>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformWorldToLocal(this);
        },

        pp_convertTransformWorldToLocalMatrix<T extends Matrix4, U extends Matrix4>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformWorldToLocalMatrix(this);
        },

        pp_convertTransformWorldToLocalQuat<T extends Quaternion2, U extends Quaternion2>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformWorldToLocalQuat(this);
        },

        pp_convertTransformObjectToLocal<T extends Matrix4, U extends Matrix4>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformObjectToLocal(this);
        },

        pp_convertTransformObjectToLocalMatrix<T extends Matrix4, U extends Matrix4>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformObjectToLocalMatrix(this);
        },

        pp_convertTransformObjectToLocalQuat<T extends Quaternion2, U extends Quaternion2>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformObjectToLocalQuat(this);
        },

        pp_convertTransformLocalToObject<T extends Matrix4, U extends Matrix4>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformLocalToObject(this);
        },

        pp_convertTransformLocalToObjectMatrix<T extends Matrix4, U extends Matrix4>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformLocalToObjectMatrix(this);
        },

        pp_convertTransformLocalToObjectQuat<T extends Quaternion2, U extends Quaternion2>(this: Readonly<Object3D>, transform: Readonly<T>, outTransform?: T | U): T | U {
            return ObjectUtils.convertTransformLocalToObjectQuat(this);
        },

        pp_setParent(this: Object3D, newParent: Object3D, keepTransformWorld?: boolean): Object3D {
            return ObjectUtils.setParent(this);
        },

        pp_getParent(this: Readonly<Object3D>): Object3D | null {
            return ObjectUtils.getParent(this);
        },

        pp_addComponent<T extends Component>(this: Object3D, classOrType: ComponentConstructor<T> | string, paramsOrActive?: Record<string, unknown> | boolean, active?: boolean): T | null {
            return ObjectUtils.addComponent(this);
        },

        pp_getComponent<T extends Component>(this: Readonly<Object3D>, classOrType: ComponentConstructor<T> | string, index?: number): T | null {
            return ObjectUtils.getComponent(this);
        },

        pp_getComponentSelf<T extends Component>(this: Readonly<Object3D>, classOrType: ComponentConstructor<T> | string, index?: number): T | null {
            return ObjectUtils.getComponentSelf(this);
        },

        pp_getComponentHierarchy<T extends Component>(this: Readonly<Object3D>, classOrType: ComponentConstructor<T> | string, index?: number): T | null {
            return ObjectUtils.getComponentHierarchy(this);
        },

        pp_getComponentHierarchyBreadth<T extends Component>(this: Readonly<Object3D>, classOrType: ComponentConstructor<T> | string, index?: number): T | null {
            return ObjectUtils.getComponentHierarchyBreadth(this);
        },

        pp_getComponentHierarchyDepth<T extends Component>(this: Readonly<Object3D>, classOrType: ComponentConstructor<T> | string, index?: number): T | null {
            return ObjectUtils.getComponentHierarchyDepth(this);
        },

        pp_getComponentDescendants<T extends Component>(this: Readonly<Object3D>, classOrType: ComponentConstructor<T> | string, index?: number): T | null {
            return ObjectUtils.getComponentDescendants(this);
        },

        pp_getComponentDescendantsBreadth<T extends Component>(this: Readonly<Object3D>, classOrType: ComponentConstructor<T> | string, index?: number): T | null {
            return ObjectUtils.getComponentDescendantsBreadth(this);
        },

        pp_getComponentDescendantsDepth<T extends Component>(this: Readonly<Object3D>, classOrType: ComponentConstructor<T> | string, index?: number): T | null {
            return ObjectUtils.getComponentDescendantsDepth(this);
        },

        pp_getComponentChildren<T extends Component>(this: Readonly<Object3D>, classOrType: ComponentConstructor<T> | string, index?: number): T | null {
            return ObjectUtils.getComponentChildren(this);
        },

        pp_getComponents<T extends Component>(this: Readonly<Object3D>, classOrType?: ComponentConstructor<T> | string): T[] {
            return ObjectUtils.getComponents(this);
        },

        pp_getComponentsSelf<T extends Component>(this: Readonly<Object3D>, classOrType?: ComponentConstructor<T> | string): T[] {
            return ObjectUtils.getComponentsSelf(this);
        },

        pp_getComponentsHierarchy<T extends Component>(this: Readonly<Object3D>, classOrType?: ComponentConstructor<T> | string): T[] {
            return ObjectUtils.getComponentsHierarchy(this);
        },

        pp_getComponentsHierarchyBreadth<T extends Component>(this: Readonly<Object3D>, classOrType?: ComponentConstructor<T> | string): T[] {
            return ObjectUtils.getComponentsHierarchyBreadth(this);
        },

        pp_getComponentsHierarchyDepth<T extends Component>(this: Readonly<Object3D>, classOrType?: ComponentConstructor<T> | string): T[] {
            return ObjectUtils.getComponentsHierarchyDepth(this);
        },

        pp_getComponentsDescendants<T extends Component>(this: Readonly<Object3D>, classOrType?: ComponentConstructor<T> | string): T[] {
            return ObjectUtils.getComponentsDescendants(this);
        },

        pp_getComponentsDescendantsBreadth<T extends Component>(this: Readonly<Object3D>, classOrType?: ComponentConstructor<T> | string): T[] {
            return ObjectUtils.getComponentsDescendantsBreadth(this);
        },

        pp_getComponentsDescendantsDepth<T extends Component>(this: Readonly<Object3D>, classOrType?: ComponentConstructor<T> | string): T[] {
            return ObjectUtils.getComponentsDescendantsDepth(this);
        },

        pp_getComponentsChildren<T extends Component>(this: Readonly<Object3D>, classOrType?: ComponentConstructor<T> | string): T[] {
            return ObjectUtils.getComponentsChildren(this);
        },

        pp_setActive(this: Object3D, active: boolean): Object3D {
            return ObjectUtils.setActive(this);
        },

        pp_setActiveSelf(this: Object3D, active: boolean): Object3D {
            return ObjectUtils.setActiveSelf(this);
        },

        pp_setActiveHierarchy(this: Object3D, active: boolean): Object3D {
            return ObjectUtils.setActiveHierarchy(this);
        },

        pp_setActiveHierarchyBreadth(this: Object3D, active: boolean): Object3D {
            return ObjectUtils.setActiveHierarchyBreadth(this);
        },

        pp_setActiveHierarchyDepth(this: Object3D, active: boolean): Object3D {
            return ObjectUtils.setActiveHierarchyDepth(this);
        },

        pp_setActiveDescendants(this: Object3D, active: boolean): Object3D {
            return ObjectUtils.setActiveDescendants(this);
        },

        pp_setActiveDescendantsBreadth(this: Object3D, active: boolean): Object3D {
            return ObjectUtils.setActiveDescendantsBreadth(this);
        },

        pp_setActiveDescendantsDepth(this: Object3D, active: boolean): Object3D {
            return ObjectUtils.setActiveDescendantsDepth(this);
        },

        pp_setActiveChildren(this: Object3D, active: boolean): Object3D {
            return ObjectUtils.setActiveChildren(this);
        },

        pp_hasUniformScale(this: Readonly<Object3D>): boolean {
            return ObjectUtils.hasUniformScale(this);
        },

        pp_hasUniformScaleWorld(this: Readonly<Object3D>): boolean {
            return ObjectUtils.hasUniformScaleWorld(this);
        },

        pp_hasUniformScaleLocal(this: Readonly<Object3D>): boolean {
            return ObjectUtils.hasUniformScaleLocal(this);
        },

        pp_clone(this: Readonly<Object3D>, cloneParams?: Readonly<CloneParams>): Object3D | null {
            return ObjectUtils.clone(this);
        },

        pp_isCloneable(this: Readonly<Object3D>, cloneParams?: Readonly<CloneParams>): boolean {
            return ObjectUtils.isCloneable(this);
        },

        pp_toString(this: Readonly<Object3D>): string {
            return ObjectUtils.toString(this);
        },

        pp_toStringExtended(this: Readonly<Object3D>): string {
            return ObjectUtils.toStringExtended(this);
        },

        pp_toStringCompact(this: Readonly<Object3D>): string {
            return ObjectUtils.toStringCompact(this);
        },

        pp_getObjectByName(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null {
            return ObjectUtils.getObjectByName(this);
        },

        pp_getObjectByNameHierarchy(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null {
            return ObjectUtils.getObjectByNameHierarchy(this);
        },

        pp_getObjectByNameHierarchyBreadth(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null {
            return ObjectUtils.getObjectByNameHierarchyBreadth(this);
        },

        pp_getObjectByNameHierarchyDepth(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null {
            return ObjectUtils.getObjectByNameHierarchyDepth(this);
        },

        pp_getObjectByNameDescendants(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null {
            return ObjectUtils.getObjectByNameDescendants(this);
        },

        pp_getObjectByNameDescendantsBreadth(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null {
            return ObjectUtils.getObjectByNameDescendantsBreadth(this);
        },

        pp_getObjectByNameDescendantsDepth(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null {
            return ObjectUtils.getObjectByNameDescendantsDepth(this);
        },

        pp_getObjectByNameChildren(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null {
            return ObjectUtils.getObjectByNameChildren(this);
        },

        pp_getObjectsByName(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[] {
            return ObjectUtils.getObjectsByName(this);
        },

        pp_getObjectsByNameHierarchy(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[] {
            return ObjectUtils.getObjectsByNameHierarchy(this);
        },

        pp_getObjectsByNameHierarchyBreadth(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[] {
            return ObjectUtils.getObjectsByNameHierarchyBreadth(this);
        },

        pp_getObjectsByNameHierarchyDepth(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[] {
            return ObjectUtils.getObjectsByNameHierarchyDepth(this);
        },

        pp_getObjectsByNameDescendants(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[] {
            return ObjectUtils.getObjectsByNameDescendants(this);
        },

        pp_getObjectsByNameDescendantsBreadth(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[] {
            return ObjectUtils.getObjectsByNameDescendantsBreadth(this);
        },

        pp_getObjectsByNameDescendantsDepth(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[] {
            return ObjectUtils.getObjectsByNameDescendantsDepth(this);
        },

        pp_getObjectsByNameChildren(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[] {
            return ObjectUtils.getObjectsByNameChildren(this);
        },

        pp_getObjectByID(this: Readonly<Object3D>, id: number): Object3D | null {
            return ObjectUtils.getObjectByID(this);
        },

        pp_getObjectByIDHierarchy(this: Readonly<Object3D>, id: number): Object3D | null {
            return ObjectUtils.getObjectByIDHierarchy(this);
        },

        pp_getObjectByIDHierarchyBreadth(this: Readonly<Object3D>, id: number): Object3D | null {
            return ObjectUtils.getObjectByIDHierarchyBreadth(this);
        },

        pp_getObjectByIDHierarchyDepth(this: Readonly<Object3D>, id: number): Object3D | null {
            return ObjectUtils.getObjectByIDHierarchyDepth(this);
        },

        pp_getObjectByIDDescendants(this: Readonly<Object3D>, id: number): Object3D | null {
            return ObjectUtils.getObjectByIDDescendants(this);
        },

        pp_getObjectByIDDescendantsBreadth(this: Readonly<Object3D>, id: number): Object3D | null {
            return ObjectUtils.getObjectByIDDescendantsBreadth(this);
        },

        pp_getObjectByIDDescendantsDepth(this: Readonly<Object3D>, id: number): Object3D | null {
            return ObjectUtils.getObjectByIDDescendantsDepth(this);
        },

        pp_getObjectByIDChildren(this: Readonly<Object3D>, id: number): Object3D | null {
            return ObjectUtils.getObjectByIDChildren(this);
        },

        pp_getHierarchy(this: Readonly<Object3D>): Object3D[] {
            return ObjectUtils.getHierarchy(this);
        },

        pp_getHierarchyBreadth(this: Readonly<Object3D>): Object3D[] {
            return ObjectUtils.getHierarchyBreadth(this);
        },

        pp_getHierarchyDepth(this: Readonly<Object3D>): Object3D[] {
            return ObjectUtils.getHierarchyDepth(this);
        },

        pp_getDescendants(this: Readonly<Object3D>): Object3D[] {
            return ObjectUtils.getDescendants(this);
        },

        pp_getDescendantsBreadth(this: Readonly<Object3D>): Object3D[] {
            return ObjectUtils.getDescendantsBreadth(this);
        },

        pp_getDescendantsDepth(this: Readonly<Object3D>): Object3D[] {
            return ObjectUtils.getDescendantsDepth(this);
        },

        pp_getChildren(this: Readonly<Object3D>): Object3D[] {
            return ObjectUtils.getChildren(this);
        },

        pp_getSelf(this: Readonly<Object3D>): Object3D {
            return ObjectUtils.getSelf(this);
        },

        pp_addObject(this: Object3D): Object3D {
            return ObjectUtils.addObject(this);
        },

        pp_getName(this: Readonly<Object3D>): string {
            return ObjectUtils.getName(this);
        },

        pp_setName(this: Object3D, name: string): Object3D {
            return ObjectUtils.setName(this);
        },

        pp_getEngine(this: Readonly<Object3D>): WonderlandEngine {
            return ObjectUtils.getEngine(this);
        },

        pp_getID(this: Readonly<Object3D>): number {
            return ObjectUtils.getID(this);
        },

        pp_markDirty(this: Object3D): Object3D {
            return ObjectUtils.markDirty(this);
        },

        pp_isTransformChanged(this: Readonly<Object3D>): boolean {
            return ObjectUtils.isTransformChanged(this);
        },

        pp_equals(first: Readonly<Object3D>, second: Readonly<Object3D>): boolean {
            return ObjectUtils.equals(this);
        },

        pp_destroy(this: Object3D): void {
            return ObjectUtils.destroy(this);
        },

        pp_reserveObjects(this: Readonly<Object3D>, count: number): Object3D {
            return ObjectUtils.reserveObjects(this);
        },

        pp_reserveObjectsSelf(this: Readonly<Object3D>, count: number): Object3D {
            return ObjectUtils.reserveObjectsSelf(this);
        },

        pp_reserveObjectsHierarchy(this: Readonly<Object3D>, count: number): Object3D {
            return ObjectUtils.reserveObjectsHierarchy(this);
        },

        pp_reserveObjectsDescendants(this: Readonly<Object3D>, count: number): Object3D {
            return ObjectUtils.reserveObjectsDescendants(this);
        },

        pp_reserveObjectsChildren(this: Readonly<Object3D>, count: number): Object3D {
            return ObjectUtils.reserveObjectsChildren(this);
        },

        pp_getComponentsAmountMap(this: Readonly<Object3D>, outComponentsAmountMap?: Map<string, number>): Map<string, number> {
            return ObjectUtils.getComponentsAmountMap(this);
        },

        pp_getComponentsAmountMapSelf(this: Readonly<Object3D>, outComponentsAmountMap?: Map<string, number>): Map<string, number> {
            return ObjectUtils.getComponentsAmountMapSelf(this);
        },

        pp_getComponentsAmountMapHierarchy(this: Readonly<Object3D>, outComponentsAmountMap?: Map<string, number>): Map<string, number> {
            return ObjectUtils.getComponentsAmountMapHierarchy(this);
        },

        pp_getComponentsAmountMapDescendants(this: Readonly<Object3D>, outComponentsAmountMap?: Map<string, number>): Map<string, number> {
            return ObjectUtils.getComponentsAmountMapDescendants(this);
        },

        pp_getComponentsAmountMapChildren(this: Readonly<Object3D>, outComponentsAmountMap?: Map<string, number>): Map<string, number> {
            return ObjectUtils.getComponentsAmountMapChildren(this);
        }
    };

    PluginUtils.injectOwnProperties(objectExtension, Object3D.prototype, false, true, true);
}

