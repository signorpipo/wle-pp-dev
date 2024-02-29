/*
    How to use

    By default the functions work on World space, rotations are in Degrees and transforms are Matrix (and not Quat 2) 
    For functions that work with rotations, Matrix means Matrix 3 and Quat means Quat
    For functions that work with transforms, Matrix means Matrix 4 and Quat means Quat 2

    You can add a suffix like World/Local/Object at the end of some functions to specify the space, example:
        - pp_getPositionLocal to get the position in local space (parent space)
        - pp_translateObject to translate in object space

    For rotations u can add a suffix like Degrees/Radians/Quat/Matrix to use a specific version, example:
        - pp_getRotationDegrees
        - pp_setRotationLocalMatrix
        - pp_rotateWorldQuat
        
    For transform u can add a suffix like Quat/Matrix to use a specific version, example:
        - pp_getTransformQuat
        - pp_setTransformWorldMatrix
        
    Some functions let you specify if u want them to work on the Hierarchy/Descendants/Children/Self where:
        - Self: the current object only
        - Children: direct children of the object
        - Descendants: all the children of the object, including child of child and so on 
        - Hierarchy: Descendants plus the current object
    Examples:
        - pp_getComponent
        - pp_getComponentHierarchy
        - pp_getComponentsAmountMapDescendants
        - pp_setActiveChildren
        - pp_setActiveSelf
    By default the functions work on the Hierarchy
    On some of the functions where u can specify Hierarchy/Descendants u can also specify 
    if the algorithm should explore by Breadth/Depth, example:
        - pp_getComponentHierarchyBreadth
        - pp_setActiveDescendantsDepth
    By default the functions explore by Breadth

    The functions leave u the choice of forwarding an out parameter or just get the return value, example:
        - let position = this.object.pp_getPosition()
        - this.object.pp_getPosition(position)
        - the out parameter is always the last one

    If a method require an engine parameter, u can always avoid specifying it and it will by default use the current main engine
    If a method require a scene parameter, u can always avoid specifying it and it will by default use the scene from the current main engine

    List of functions:
        Notes:
            - The suffixes (like World or Radians) are omitted 

        - pp_getPosition    / pp_setPosition    / pp_resetPosition
        - pp_getRotation    / pp_setRotation    / pp_resetRotation
        - pp_getScale       / pp_setScale       (u can specify a single number instead of a vector to uniform scale easily) / pp_resetScale 
        - pp_getTransform   / pp_setTransform   / pp_resetTransform

        - pp_getAxes        / pp_setAxes
        - pp_getLeft        / pp_getRight       / pp_setLeft        / pp_setRight
        - pp_getUp          / pp_getDown        / pp_setUp          / pp_setDown
        - pp_getForward     / pp_getBackward    / pp_setForward     / pp_setBackward

        - pp_translate      / pp_translateAxis
        - pp_rotate         / pp_rotateAxis     / pp_rotateAround    / pp_rotateAroundAxis
        - pp_scaleObject    (for now scale only have this variant) (u can specify a single number instead of a vector to uniform scale easily)

        - pp_lookAt         / pp_lookTo (u can avoid to specify up and the function will pickup the object up by default)

        - pp_getParent      / pp_setParent (let u specify if u want to keep the transform or not)

        - pp_convertPositionObjectToWorld (you can use all the combinations between Object/Local/World)
        - pp_convertDirectionObjectToWorld (you can use all the combinations between Object/Local/World)
        - pp_convertTransformObjectToWorld (you can use all the combinations between Object/Local/World) (u also have Quat and Matrix version)

        - pp_hasUniformScale

        - pp_addComponent
        - pp_getComponent   / pp_getComponentHierarchy  / pp_getComponentDescendants  / pp_getComponentChildren / pp_getComponentSelf
        - pp_getComponents  / pp_getComponentsHierarchy / pp_getComponentsDescendants / pp_getComponentsChildren / pp_getComponentsSelf

        - pp_setActive  / pp_setActiveHierarchy / pp_setActiveDescendants / pp_setActiveChildren / pp_setActiveSelf

        - pp_clone      / pp_isCloneable
        
        - pp_toString   / pp_toStringCompact / pp_toStringExtended
        
        - pp_getObjectByName  / pp_getObjectByNameHierarchy / pp_getObjectByNameDescendants / pp_getObjectByNameChildren
        - pp_getObjectsByName  / pp_getObjectsByNameHierarchy / pp_getObjectsByNameDescendants / pp_getObjectsByNameChildren
        
        - pp_getObjectByID  / pp_getObjectByIDHierarchy / pp_getObjectByIDDescendants / pp_getObjectByIDChildren

        - pp_getHierarchy / pp_getHierarchyBreadth / pp_getHierarchyDepth 
        - pp_getDescendants / pp_getDescendantsBreadth / pp_getDescendantsDepth 
        - pp_getChildren
        - pp_getSelf

        - pp_addObject
        - pp_getName    / pp_setName
        - pp_getEngine
        - pp_getID
        - pp_reserveObjects / pp_reserveObjectsHierarchy / pp_reserveObjectsDescendants / pp_reserveObjectsChildren / pp_reserveObjectsSelf
        - pp_getComponentsAmountMap / pp_getComponentsAmountMapHierarchy / pp_getComponentsAmountMapDescendants / pp_getComponentsAmountMapChildren / pp_getComponentsAmountMapSelf
        - pp_markDirty
        - pp_isTransformChanged
        - pp_equals
        - pp_destroy
*/

import { Component, Object3D, WonderlandEngine, type ComponentConstructor } from "@wonderlandengine/api";
import { Matrix3, Matrix4, Quaternion, Quaternion2, Vector3 } from "../../../cauldron/js/array_type_definitions.js";
import { Mat3Utils } from "../../../cauldron/js/utils/mat3_utils.js";
import { Mat4Utils } from "../../../cauldron/js/utils/mat4_utils.js";
import { Quat2Utils } from "../../../cauldron/js/utils/quat2_utils.js";
import { QuatUtils } from "../../../cauldron/js/utils/quat_utils.js";
import { Vec3Utils } from "../../../cauldron/js/utils/vec3_utils.js";
import { CloneParams, ObjectUtils } from "../../../cauldron/wl/utils/object_utils.js";
import { PluginUtils } from "../../utils/plugin_utils.js";

export function initObjectExtension(): void {
    initObjectExtensionProtoype();
}

export function initObjectExtensionProtoype(): void {

    const objectExtension: Record<string, any> = {};

    // GETTER

    // Position

    objectExtension.pp_getPosition = function pp_getPosition(outPosition: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getPosition(this, outPosition);
    };

    objectExtension.pp_getPositionWorld = function pp_getPositionWorld(outPosition: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getPositionWorld(this, outPosition);
    };

    objectExtension.pp_getPositionLocal = function pp_getPositionLocal(outPosition: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getPositionLocal(this, outPosition);
    };

    // Rotation

    objectExtension.pp_getRotation = function pp_getRotation(outRotation: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getRotation(this, outRotation);
    };

    objectExtension.pp_getRotationDegrees = function pp_getRotationDegrees(outRotation: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getRotationDegrees(this, outRotation);
    };

    objectExtension.pp_getRotationRadians = function pp_getRotationRadians(outRotation: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getRotationRadians(this, outRotation);
    };

    objectExtension.pp_getRotationMatrix = function pp_getRotationMatrix(outRotation: Matrix3 = Mat3Utils.create()): Matrix3 {
        return ObjectUtils.getRotationMatrix(this, outRotation);
    };

    objectExtension.pp_getRotationQuat = function pp_getRotationQuat(outRotation: Quaternion = QuatUtils.create()): Quaternion {
        return ObjectUtils.getRotationQuat(this, outRotation);
    };

    // Rotation World

    objectExtension.pp_getRotationWorld = function pp_getRotationWorld(outRotation: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getRotationWorld(this, outRotation);
    };

    objectExtension.pp_getRotationWorldDegrees = function pp_getRotationWorldDegrees(outRotation: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getRotationWorldDegrees(this, outRotation);
    };

    objectExtension.pp_getRotationWorldRadians = function pp_getRotationWorldRadians(outRotation: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getRotationWorldRadians(this, outRotation);
    };

    objectExtension.pp_getRotationWorldMatrix = function pp_getRotationWorldMatrix(outRotation: Matrix3 = Mat3Utils.create()): Matrix3 {
        return ObjectUtils.getRotationWorldMatrix(this, outRotation);
    };

    objectExtension.pp_getRotationWorldQuat = function pp_getRotationWorldQuat(outRotation: Quaternion = QuatUtils.create()): Quaternion {
        return ObjectUtils.getRotationWorldQuat(this, outRotation);
    };

    // Rotation Local

    objectExtension.pp_getRotationLocal = function pp_getRotationLocal(outRotation: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getRotationLocal(this, outRotation);
    };

    objectExtension.pp_getRotationLocalDegrees = function pp_getRotationLocalDegrees(outRotation: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getRotationLocalDegrees(this, outRotation);
    };

    objectExtension.pp_getRotationLocalRadians = function pp_getRotationLocalRadians(outRotation: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getRotationLocalRadians(this, outRotation);
    };

    objectExtension.pp_getRotationLocalMatrix = function pp_getRotationLocalMatrix(outRotation: Matrix3 = Mat3Utils.create()): Matrix3 {
        return ObjectUtils.getRotationLocalMatrix(this, outRotation);
    };

    objectExtension.pp_getRotationLocalQuat = function pp_getRotationLocalQuat(outRotation: Quaternion = QuatUtils.create()): Quaternion {
        return ObjectUtils.getRotationLocalQuat(this, outRotation);
    };

    // Scale

    objectExtension.pp_getScale = function pp_getScale(outScale: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getScale(this, outScale);
    };

    objectExtension.pp_getScaleWorld = function pp_getScaleWorld(outScale: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getScaleWorld(this, outScale);
    };

    objectExtension.pp_getScaleLocal = function pp_getScaleLocal(outScale: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getScaleLocal(this, outScale);
    };

    // Transform

    objectExtension.pp_getTransform = function pp_getTransform(outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.getTransform(this, outTransform);
    };

    objectExtension.pp_getTransformMatrix = function pp_getTransformMatrix(outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.getTransformMatrix(this, outTransform);
    };

    objectExtension.pp_getTransformQuat = function pp_getTransformQuat(outTransform: Quaternion2 = Quat2Utils.create()): Quaternion2 {
        return ObjectUtils.getTransformQuat(this, outTransform);
    };

    // Transform World

    objectExtension.pp_getTransformWorld = function pp_getTransformWorld(outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.getTransformWorld(this, outTransform);
    };

    objectExtension.pp_getTransformWorldMatrix = function pp_getTransformWorldMatrix(outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.getTransformWorldMatrix(this, outTransform);
    };

    objectExtension.pp_getTransformWorldQuat = function pp_getTransformWorldQuat(outTransform: Quaternion2 = Quat2Utils.create()): Quaternion2 {
        return ObjectUtils.getTransformWorldQuat(this, outTransform);
    };

    // Transform Local

    objectExtension.pp_getTransformLocal = function pp_getTransformLocal(outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.getTransformLocal(this, outTransform);
    };

    objectExtension.pp_getTransformLocalMatrix = function pp_getTransformLocalMatrix(outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.getTransformLocalMatrix(this, outTransform);
    };

    objectExtension.pp_getTransformLocalQuat = function pp_getTransformLocalQuat(outTransform: Quaternion2 = Quat2Utils.create()): Quaternion2 {
        return ObjectUtils.getTransformLocalQuat(this, outTransform);
    };

    // Axes

    objectExtension.pp_getAxes = function pp_getAxes(axes: [Vector3, Vector3, Vector3] = [Vec3Utils.create(), Vec3Utils.create(), Vec3Utils.create()]): [Vector3, Vector3, Vector3] {
        return ObjectUtils.getAxes(this, axes);
    };

    objectExtension.pp_getAxesWorld = function pp_getAxesWorld(axes: [Vector3, Vector3, Vector3] = [Vec3Utils.create(), Vec3Utils.create(), Vec3Utils.create()]): [Vector3, Vector3, Vector3] {
        return ObjectUtils.getAxesWorld(this, axes);
    };

    objectExtension.pp_getAxesLocal = function pp_getAxesLocal(axes: [Vector3, Vector3, Vector3] = [Vec3Utils.create(), Vec3Utils.create(), Vec3Utils.create()]): [Vector3, Vector3, Vector3] {
        return ObjectUtils.getAxesLocal(this, axes);
    };

    // Forward

    objectExtension.pp_getForward = function pp_getForward(forward: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getForward(this, forward);
    };

    objectExtension.pp_getForwardWorld = function pp_getForwardWorld(forward: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getForwardWorld(this, forward);
    };

    objectExtension.pp_getForwardLocal = function pp_getForwardLocal(forward: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getForwardLocal(this, forward);
    };

    // Backward

    objectExtension.pp_getBackward = function pp_getBackward(backward: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getBackward(this, backward);
    };

    objectExtension.pp_getBackwardWorld = function pp_getBackwardWorld(backward: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getBackwardWorld(this, backward);
    };

    objectExtension.pp_getBackwardLocal = function pp_getBackwardLocal(backward: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getBackwardLocal(this, backward);
    };

    // Up

    objectExtension.pp_getUp = function pp_getUp(up: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getUp(this, up);
    };

    objectExtension.pp_getUpWorld = function pp_getUpWorld(up: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getUpWorld(this, up);
    };

    objectExtension.pp_getUpLocal = function pp_getUpLocal(up: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getUpLocal(this, up);
    };

    // Down

    objectExtension.pp_getDown = function pp_getDown(down: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getDown(this, down);
    };

    objectExtension.pp_getDownWorld = function pp_getDownWorld(down: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getDownWorld(this, down);
    };

    objectExtension.pp_getDownLocal = function pp_getDownLocal(down: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getDownLocal(this, down);
    };

    // Left

    objectExtension.pp_getLeft = function pp_getLeft(left: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getLeft(this, left);
    };

    objectExtension.pp_getLeftWorld = function pp_getLeftWorld(left: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getLeftWorld(this, left);
    };

    objectExtension.pp_getLeftLocal = function pp_getLeftLocal(left: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getLeftLocal(this, left);
    };

    // Right

    objectExtension.pp_getRight = function pp_getRight(right: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getRight(this, right);
    };

    objectExtension.pp_getRightWorld = function pp_getRightWorld(right: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getRightWorld(this, right);
    };

    objectExtension.pp_getRightLocal = function pp_getRightLocal(right: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.getRightLocal(this, right);
    };

    // SETTER

    // Position

    objectExtension.pp_setPosition = function pp_setPosition(position: Readonly<Vector3>): Object3D {
        return ObjectUtils.setPosition(this, position);
    };

    objectExtension.pp_setPositionWorld = function pp_setPositionWorld(position: Readonly<Vector3>): Object3D {
        return ObjectUtils.setPositionWorld(this, position);
    };

    objectExtension.pp_setPositionLocal = function pp_setPositionLocal(position: Readonly<Vector3>): Object3D {
        return ObjectUtils.setPositionLocal(this, position);
    };

    // Rotation

    objectExtension.pp_setRotation = function pp_setRotation(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.setRotation(this, rotation);
    };

    objectExtension.pp_setRotationDegrees = function pp_setRotationDegrees(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.setRotationDegrees(this, rotation);
    };

    objectExtension.pp_setRotationRadians = function pp_setRotationRadians(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.setRotationRadians(this, rotation);
    };

    objectExtension.pp_setRotationMatrix = function pp_setRotationMatrix(rotation: Readonly<Matrix3>): Object3D {
        return ObjectUtils.setRotationMatrix(this, rotation);
    };

    objectExtension.pp_setRotationQuat = function pp_setRotationQuat(rotation: Readonly<Quaternion>): Object3D {
        return ObjectUtils.setRotationQuat(this, rotation);
    };

    // Rotation World

    objectExtension.pp_setRotationWorld = function pp_setRotationWorld(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.setRotationWorld(this, rotation);
    };

    objectExtension.pp_setRotationWorldDegrees = function pp_setRotationWorldDegrees(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.setRotationWorldDegrees(this, rotation);
    };

    objectExtension.pp_setRotationWorldRadians = function pp_setRotationWorldRadians(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.setRotationWorldRadians(this, rotation);
    };

    objectExtension.pp_setRotationWorldMatrix = function pp_setRotationWorldMatrix(rotation: Readonly<Matrix3>): Object3D {
        return ObjectUtils.setRotationWorldMatrix(this, rotation);
    };

    objectExtension.pp_setRotationWorldQuat = function pp_setRotationWorldQuat(rotation: Readonly<Quaternion>): Object3D {
        return ObjectUtils.setRotationWorldQuat(this, rotation);
    };

    // Rotation Local

    objectExtension.pp_setRotationLocal = function pp_setRotationLocal(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.setRotationLocal(this, rotation);
    };

    objectExtension.pp_setRotationLocalDegrees = function pp_setRotationLocalDegrees(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.setRotationLocalDegrees(this, rotation);
    };

    objectExtension.pp_setRotationLocalRadians = function pp_setRotationLocalRadians(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.setRotationLocalRadians(this, rotation);
    };

    objectExtension.pp_setRotationLocalMatrix = function pp_setRotationLocalMatrix(rotation: Readonly<Matrix3>): Object3D {
        return ObjectUtils.setRotationLocalMatrix(this, rotation);
    };

    objectExtension.pp_setRotationLocalQuat = function pp_setRotationLocalQuat(rotation: Readonly<Quaternion>): Object3D {
        return ObjectUtils.setRotationLocalQuat(this, rotation);
    };

    // Scale

    objectExtension.pp_setScale = function pp_setScale(scale: number | Vector3): Object3D {
        return ObjectUtils.setScale(this, scale);
    };

    objectExtension.pp_setScaleWorld = function pp_setScaleWorld(scale: number | Vector3): Object3D {
        return ObjectUtils.setScaleWorld(this, scale);
    };

    objectExtension.pp_setScaleLocal = function pp_setScaleLocal(scale: number | Vector3): Object3D {
        return ObjectUtils.setScaleLocal(this, scale);
    };

    // Axes    

    objectExtension.pp_setAxes = function pp_setAxes(left: Readonly<Vector3> | null = null, up: Readonly<Vector3> | null = null, forward: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setAxes(this, left, up, forward);
    };

    objectExtension.pp_setAxesWorld = function pp_setAxesWorld(left: Readonly<Vector3> | null = null, up: Readonly<Vector3> | null = null, forward: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setAxesWorld(this, left, up, forward);
    };

    objectExtension.pp_setAxesLocal = function pp_setAxesLocal(left: Readonly<Vector3> | null = null, up: Readonly<Vector3> | null = null, forward: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setAxesLocal(this, left, up, forward);
    };

    // Forward

    objectExtension.pp_setForward = function pp_setForward(forward: Readonly<Vector3>, up: Readonly<Vector3> | null = null, left: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setForward(this, forward, up, left);
    };

    objectExtension.pp_setForwardWorld = function pp_setForwardWorld(forward: Readonly<Vector3>, up: Readonly<Vector3> | null = null, left: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setForwardWorld(this, forward, up, left);
    };

    objectExtension.pp_setForwardLocal = function pp_setForwardLocal(forward: Readonly<Vector3>, up: Readonly<Vector3> | null = null, left: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setForwardLocal(this, forward, up, left);
    };

    // Backward

    objectExtension.pp_setBackward = function pp_setBackward(backward: Readonly<Vector3>, up: Readonly<Vector3> | null = null, left: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setBackward(this, backward, up, left);
    };

    objectExtension.pp_setBackwardWorld = function pp_setBackwardWorld(backward: Readonly<Vector3>, up: Readonly<Vector3> | null = null, left: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setBackwardWorld(this, backward, up, left);
    };

    objectExtension.pp_setBackwardLocal = function pp_setBackwardLocal(backward: Readonly<Vector3>, up: Readonly<Vector3> | null = null, left: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setBackwardLocal(this, backward, up, left);
    };

    // Up

    objectExtension.pp_setUp = function pp_setUp(up: Readonly<Vector3>, forward: Readonly<Vector3> | null = null, left: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setUp(this, up, forward, left);
    };

    objectExtension.pp_setUpWorld = function pp_setUpWorld(up: Readonly<Vector3>, forward: Readonly<Vector3> | null = null, left: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setUpWorld(this, up, forward, left);
    };

    objectExtension.pp_setUpLocal = function pp_setUpLocal(up: Readonly<Vector3>, forward: Readonly<Vector3> | null = null, left: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setUpLocal(this, up, forward, left);
    };

    // Down

    objectExtension.pp_setDown = function pp_setDown(down: Readonly<Vector3>, forward: Readonly<Vector3> | null = null, left: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setDown(this, down, forward, left);
    };

    objectExtension.pp_setDownWorld = function pp_setDownWorld(down: Readonly<Vector3>, forward: Readonly<Vector3> | null = null, left: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setDownWorld(this, down, forward, left);
    };

    objectExtension.pp_setDownLocal = function pp_setDownLocal(down: Readonly<Vector3>, forward: Readonly<Vector3> | null = null, left: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setDownLocal(this, down, forward, left);
    };

    // Left

    objectExtension.pp_setLeft = function pp_setLeft(left: Readonly<Vector3>, up: Readonly<Vector3> | null = null, forward: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setLeft(this, left, up, forward);
    };

    objectExtension.pp_setLeftWorld = function pp_setLeftWorld(left: Readonly<Vector3>, up: Readonly<Vector3> | null = null, forward: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setLeftWorld(this, left, up, forward);
    };

    objectExtension.pp_setLeftLocal = function pp_setLeftLocal(left: Readonly<Vector3>, up: Readonly<Vector3> | null = null, forward: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setLeftLocal(this, left, up, forward);
    };

    // Right

    objectExtension.pp_setRight = function pp_setRight(right: Readonly<Vector3>, up: Readonly<Vector3> | null = null, forward: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setRight(this, right, up, forward);
    };

    objectExtension.pp_setRightWorld = function pp_setRightWorld(right: Readonly<Vector3>, up: Readonly<Vector3> | null = null, forward: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setRightWorld(this, right, up, forward);
    };

    objectExtension.pp_setRightLocal = function pp_setRightLocal(right: Readonly<Vector3>, up: Readonly<Vector3> | null = null, forward: Readonly<Vector3> | null = null): Object3D {
        return ObjectUtils.setRightLocal(this, right, up, forward);
    };

    // Transform

    objectExtension.pp_setTransform = function pp_setTransform(transform: Readonly<Matrix4>): Object3D {
        return ObjectUtils.setTransform(this, transform);
    };

    objectExtension.pp_setTransformMatrix = function pp_setTransformMatrix(transform: Readonly<Matrix4>): Object3D {
        return ObjectUtils.setTransformMatrix(this, transform);
    };

    objectExtension.pp_setTransformQuat = function pp_setTransformQuat(transform: Readonly<Quaternion2>): Object3D {
        return ObjectUtils.setTransformQuat(this, transform);
    };

    // Transform World

    objectExtension.pp_setTransformWorld = function pp_setTransformWorld(transform: Readonly<Matrix4>): Object3D {
        return ObjectUtils.setTransformWorld(this, transform);
    };

    objectExtension.pp_setTransformWorldMatrix = function pp_setTransformWorldMatrix(transform: Readonly<Matrix4>): Object3D {
        return ObjectUtils.setTransformWorldMatrix(this, transform);
    };

    objectExtension.pp_setTransformWorldQuat = function pp_setTransformWorldQuat(transform: Readonly<Quaternion2>): Object3D {
        return ObjectUtils.setTransformWorldQuat(this, transform);
    };

    // Transform Local

    objectExtension.pp_setTransformLocal = function pp_setTransformLocal(transform: Readonly<Matrix4>): Object3D {
        return ObjectUtils.setTransformLocal(this, transform);
    };

    objectExtension.pp_setTransformLocalMatrix = function pp_setTransformLocalMatrix(transform: Readonly<Matrix4>): Object3D {
        return ObjectUtils.setTransformLocalMatrix(this, transform);
    };

    objectExtension.pp_setTransformLocalQuat = function pp_setTransformLocalQuat(transform: Readonly<Quaternion2>): Object3D {
        return ObjectUtils.setTransformLocalQuat(this, transform);
    };

    // RESET

    // Position

    objectExtension.pp_resetPosition = function pp_resetPosition(): Object3D {
        return ObjectUtils.resetPosition(this);
    };

    objectExtension.pp_resetPositionWorld = function pp_resetPositionWorld(): Object3D {
        return ObjectUtils.resetPositionWorld(this);
    };

    objectExtension.pp_resetPositionLocal = function pp_resetPositionLocal(): Object3D {
        return ObjectUtils.resetPositionLocal(this);
    };

    // Rotation

    objectExtension.pp_resetRotation = function pp_resetRotation(): Object3D {
        return ObjectUtils.resetRotation(this);
    };

    objectExtension.pp_resetRotationWorld = function pp_resetRotationWorld(): Object3D {
        return ObjectUtils.resetRotationWorld(this);
    };

    objectExtension.pp_resetRotationLocal = function pp_resetRotationLocal(): Object3D {
        return ObjectUtils.resetRotationLocal(this);
    };

    // Scale

    objectExtension.pp_resetScale = function pp_resetScale(): Object3D {
        return ObjectUtils.resetScale(this);
    };

    objectExtension.pp_resetScaleWorld = function pp_resetScaleWorld(): Object3D {
        return ObjectUtils.resetScaleWorld(this);
    };

    objectExtension.pp_resetScaleLocal = function pp_resetScaleLocal(): Object3D {
        return ObjectUtils.resetScaleLocal(this);
    };

    // Transform

    objectExtension.pp_resetTransform = function pp_resetTransform(): Object3D {
        return ObjectUtils.resetTransform(this);
    };

    objectExtension.pp_resetTransformWorld = function pp_resetTransformWorld(): Object3D {
        return ObjectUtils.resetTransformWorld(this);
    };

    objectExtension.pp_resetTransformLocal = function pp_resetTransformLocal(): Object3D {
        return ObjectUtils.resetTransformLocal(this);
    };

    // TRANSFORMATIONS

    // Translate

    objectExtension.pp_translate = function pp_translate(translation: Readonly<Vector3>): Object3D {
        return ObjectUtils.translate(this, translation);
    };

    objectExtension.pp_translateWorld = function pp_translateWorld(translation: Readonly<Vector3>): Object3D {
        return ObjectUtils.translateWorld(this, translation);
    };

    objectExtension.pp_translateLocal = function pp_translateLocal(translation: Readonly<Vector3>): Object3D {
        return ObjectUtils.translateLocal(this, translation);
    };

    objectExtension.pp_translateObject = function pp_translateObject(translation: Readonly<Vector3>): Object3D {
        return ObjectUtils.translateObject(this, translation);
    };

    // Translate Axis

    objectExtension.pp_translateAxis = function pp_translateAxis(amount: number, direction: Readonly<Vector3>): Object3D {
        return ObjectUtils.translateAxis(this, amount, direction);
    };

    objectExtension.pp_translateAxisWorld = function pp_translateAxisWorld(amount: number, direction: Readonly<Vector3>): Object3D {
        return ObjectUtils.translateAxisWorld(this, amount, direction);
    };

    objectExtension.pp_translateAxisLocal = function pp_translateAxisLocal(amount: number, direction: Readonly<Vector3>): Object3D {
        return ObjectUtils.translateAxisLocal(this, amount, direction);
    };

    objectExtension.pp_translateAxisObject = function pp_translateAxisObject(amount: number, direction: Readonly<Vector3>): Object3D {
        return ObjectUtils.translateAxisObject(this, amount, direction);
    };

    // Rotate

    objectExtension.pp_rotate = function pp_rotate(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotate(this, rotation);
    };

    objectExtension.pp_rotateDegrees = function pp_rotateDegrees(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateDegrees(this, rotation);
    };

    objectExtension.pp_rotateRadians = function pp_rotateRadians(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateRadians(this, rotation);
    };

    objectExtension.pp_rotateMatrix = function pp_rotateMatrix(rotation: Readonly<Matrix3>): Object3D {
        return ObjectUtils.rotateMatrix(this, rotation);
    };

    objectExtension.pp_rotateQuat = function pp_rotateQuat(rotation: Readonly<Quaternion>): Object3D {
        return ObjectUtils.rotateQuat(this, rotation);
    };

    // Rotate World

    objectExtension.pp_rotateWorld = function pp_rotateWorld(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateWorld(this, rotation);
    };

    objectExtension.pp_rotateWorldDegrees = function pp_rotateWorldDegrees(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateWorldDegrees(this, rotation);
    };

    objectExtension.pp_rotateWorldRadians = function pp_rotateWorldRadians(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateWorldRadians(this, rotation);
    };

    objectExtension.pp_rotateWorldMatrix = function pp_rotateWorldMatrix(rotation: Readonly<Matrix3>): Object3D {
        return ObjectUtils.rotateWorldMatrix(this, rotation);
    };

    objectExtension.pp_rotateWorldQuat = function pp_rotateWorldQuat(rotation: Readonly<Quaternion>): Object3D {
        return ObjectUtils.rotateWorldQuat(this, rotation);
    };

    // Rotate Local

    objectExtension.pp_rotateLocal = function pp_rotateLocal(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateLocal(this, rotation);
    };

    objectExtension.pp_rotateLocalDegrees = function pp_rotateLocalDegrees(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateLocalDegrees(this, rotation);
    };

    objectExtension.pp_rotateLocalRadians = function pp_rotateLocalRadians(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateLocalRadians(this, rotation);
    };

    objectExtension.pp_rotateLocalMatrix = function pp_rotateLocalMatrix(rotation: Readonly<Matrix3>): Object3D {
        return ObjectUtils.rotateLocalMatrix(this, rotation);
    };

    objectExtension.pp_rotateLocalQuat = function pp_rotateLocalQuat(rotation: Readonly<Quaternion>): Object3D {
        return ObjectUtils.rotateLocalQuat(this, rotation);
    };

    // Rotate Object

    objectExtension.pp_rotateObject = function pp_rotateObject(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateObject(this, rotation);
    };

    objectExtension.pp_rotateObjectDegrees = function pp_rotateObjectDegrees(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateObjectDegrees(this, rotation);
    };

    objectExtension.pp_rotateObjectRadians = function pp_rotateObjectRadians(rotation: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateObjectRadians(this, rotation);
    };

    objectExtension.pp_rotateObjectMatrix = function pp_rotateObjectMatrix(rotation: Readonly<Matrix3>): Object3D {
        return ObjectUtils.rotateObjectMatrix(this, rotation);
    };

    objectExtension.pp_rotateObjectQuat = function pp_rotateObjectQuat(rotation: Readonly<Quaternion>): Object3D {
        return ObjectUtils.rotateObjectQuat(this, rotation);
    };

    // Rotate Axis

    objectExtension.pp_rotateAxis = function pp_rotateAxis(angle: number, axis: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAxis(this, angle, axis);
    };

    objectExtension.pp_rotateAxisDegrees = function pp_rotateAxisDegrees(angle: number, axis: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAxisDegrees(this, angle, axis);
    };

    objectExtension.pp_rotateAxisRadians = function pp_rotateAxisRadians(angle: number, axis: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAxisRadians(this, angle, axis);
    };

    // Rotate Axis World

    objectExtension.pp_rotateAxisWorld = function pp_rotateAxisWorld(angle: number, axis: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAxisWorld(this, angle, axis);
    };

    objectExtension.pp_rotateAxisWorldDegrees = function pp_rotateAxisWorldDegrees(angle: number, axis: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAxisWorldDegrees(this, angle, axis);
    };

    objectExtension.pp_rotateAxisWorldRadians = function pp_rotateAxisWorldRadians(angle: number, axis: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAxisWorldRadians(this, angle, axis);
    };

    // Rotate Axis Local

    objectExtension.pp_rotateAxisLocal = function pp_rotateAxisLocal(angle: number, axis: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAxisLocal(this, angle, axis);
    };

    objectExtension.pp_rotateAxisLocalDegrees = function pp_rotateAxisLocalDegrees(angle: number, axis: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAxisLocalDegrees(this, angle, axis);
    };

    objectExtension.pp_rotateAxisLocalRadians = function pp_rotateAxisLocalRadians(angle: number, axis: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAxisLocalRadians(this, angle, axis);
    };

    // Rotate Axis Object

    objectExtension.pp_rotateAxisObject = function pp_rotateAxisObject(angle: number, axis: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAxisObject(this, angle, axis);
    };

    objectExtension.pp_rotateAxisObjectDegrees = function pp_rotateAxisObjectDegrees(angle: number, axis: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAxisObjectDegrees(this, angle, axis);
    };

    objectExtension.pp_rotateAxisObjectRadians = function pp_rotateAxisObjectRadians(angle: number, axis: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAxisObjectRadians(this, angle, axis);
    };

    // Rotate Around

    objectExtension.pp_rotateAround = function pp_rotateAround(rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAround(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundDegrees = function pp_rotateAroundDegrees(rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundDegrees(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundRadians = function pp_rotateAroundRadians(rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundRadians(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundMatrix = function pp_rotateAroundMatrix(rotation: Readonly<Matrix3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundMatrix(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundQuat = function pp_rotateAroundQuat(rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundQuat(this, rotation, origin);
    };

    // Rotate Around World

    objectExtension.pp_rotateAroundWorld = function pp_rotateAroundWorld(rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundWorld(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundWorldDegrees = function pp_rotateAroundWorldDegrees(rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundWorldDegrees(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundWorldRadians = function pp_rotateAroundWorldRadians(rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundWorldRadians(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundWorldMatrix = function pp_rotateAroundWorldMatrix(rotation: Readonly<Matrix3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundWorldMatrix(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundWorldQuat = function pp_rotateAroundWorldQuat(rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundWorldQuat(this, rotation, origin);
    };

    // Rotate Around Local

    objectExtension.pp_rotateAroundLocal = function pp_rotateAroundLocal(rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundLocal(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundLocalDegrees = function pp_rotateAroundLocalDegrees(rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundLocalDegrees(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundLocalRadians = function pp_rotateAroundLocalRadians(rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundLocalRadians(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundLocalMatrix = function pp_rotateAroundLocalMatrix(rotation: Readonly<Matrix3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundLocalMatrix(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundLocalQuat = function pp_rotateAroundLocalQuat(rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundLocalQuat(this, rotation, origin);
    };

    // Rotate Around Object

    objectExtension.pp_rotateAroundObject = function pp_rotateAroundObject(rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundObject(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundObjectDegrees = function pp_rotateAroundObjectDegrees(rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundObjectDegrees(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundObjectRadians = function pp_rotateAroundObjectRadians(rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundObjectRadians(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundObjectMatrix = function pp_rotateAroundObjectMatrix(rotation: Readonly<Matrix3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundObjectMatrix(this, rotation, origin);
    };

    objectExtension.pp_rotateAroundObjectQuat = function pp_rotateAroundObjectQuat(rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundObjectQuat(this, rotation, origin);
    };

    // Rotate Around Axis

    objectExtension.pp_rotateAroundAxis = function pp_rotateAroundAxis(angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundAxis(this, angle, axis, origin);
    };

    objectExtension.pp_rotateAroundAxisDegrees = function pp_rotateAroundAxisDegrees(angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundAxisDegrees(this, angle, axis, origin);
    };

    objectExtension.pp_rotateAroundAxisRadians = function pp_rotateAroundAxisRadians(angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundAxisRadians(this, angle, axis, origin);
    };

    // Rotate Around Axis World

    objectExtension.pp_rotateAroundAxisWorld = function pp_rotateAroundAxisWorld(angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundAxisWorld(this, angle, axis, origin);
    };

    objectExtension.pp_rotateAroundAxisWorldDegrees = function pp_rotateAroundAxisWorldDegrees(angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundAxisWorldDegrees(this, angle, axis, origin);
    };

    objectExtension.pp_rotateAroundAxisWorldRadians = function pp_rotateAroundAxisWorldRadians(angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundAxisWorldRadians(this, angle, axis, origin);
    };

    // Rotate Around Axis Local

    objectExtension.pp_rotateAroundAxisLocal = function pp_rotateAroundAxisLocal(angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundAxisLocal(this, angle, axis, origin);
    };

    objectExtension.pp_rotateAroundAxisLocalDegrees = function pp_rotateAroundAxisLocalDegrees(angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundAxisLocalDegrees(this, angle, axis, origin);
    };

    objectExtension.pp_rotateAroundAxisLocalRadians = function pp_rotateAroundAxisLocalRadians(angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundAxisLocalRadians(this, angle, axis, origin);
    };

    // Rotate Around Axis Object

    objectExtension.pp_rotateAroundAxisObject = function pp_rotateAroundAxisObject(angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundAxisObject(this, angle, axis, origin);
    };

    objectExtension.pp_rotateAroundAxisObjectDegrees = function pp_rotateAroundAxisObjectDegrees(angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundAxisObjectDegrees(this, angle, axis, origin);
    };

    objectExtension.pp_rotateAroundAxisObjectRadians = function pp_rotateAroundAxisObjectRadians(angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D {
        return ObjectUtils.rotateAroundAxisObjectRadians(this, angle, axis, origin);
    };

    // Scale

    objectExtension.pp_scaleObject = function pp_scaleObject(scale: number | Vector3): Object3D {
        return ObjectUtils.scaleObject(this, scale);
    };

    // Look At

    objectExtension.pp_lookAt = function pp_lookAt(position: Readonly<Vector3>, up: Readonly<Vector3>): Object3D {
        return ObjectUtils.lookAt(this, position, up);
    };

    objectExtension.pp_lookAtWorld = function pp_lookAtWorld(position: Readonly<Vector3>, up: Readonly<Vector3>): Object3D {
        return ObjectUtils.lookAtWorld(this, position, up);
    };

    objectExtension.pp_lookAtLocal = function pp_lookAtLocal(position: Readonly<Vector3>, up: Readonly<Vector3>): Object3D {
        return ObjectUtils.lookAtLocal(this, position, up);
    };

    objectExtension.pp_lookTo = function pp_lookTo(direction: Readonly<Vector3>, up: Readonly<Vector3>): Object3D {
        return ObjectUtils.lookTo(this, direction, up);
    };

    objectExtension.pp_lookToWorld = function pp_lookToWorld(direction: Readonly<Vector3>, up: Readonly<Vector3>): Object3D {
        return ObjectUtils.lookToWorld(this, direction, up);
    };

    objectExtension.pp_lookToLocal = function pp_lookToLocal(direction: Readonly<Vector3>, up: Readonly<Vector3>): Object3D {
        return ObjectUtils.lookToLocal(this, direction, up);
    };

    // EXTRA

    // Parent

    objectExtension.pp_setParent = function pp_setParent(newParent: Object3D, keepTransformWorld: boolean = true): Object3D {
        return ObjectUtils.setParent(this, newParent, keepTransformWorld);
    };

    objectExtension.pp_getParent = function pp_getParent(): Object3D {
        return ObjectUtils.getParent(this);
    };

    // Convert Vector Object World

    objectExtension.pp_convertPositionObjectToWorld = function pp_convertPositionObjectToWorld(position: Readonly<Vector3>, outPosition: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.convertPositionObjectToWorld(this, position, outPosition);
    };

    objectExtension.pp_convertDirectionObjectToWorld = function pp_convertDirectionObjectToWorld(direction: Readonly<Vector3>, outDirection: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.convertDirectionObjectToWorld(this, direction, outDirection);
    };

    objectExtension.pp_convertPositionWorldToObject = function pp_convertPositionWorldToObject(position: Readonly<Vector3>, outPosition: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.convertPositionWorldToObject(this, position, outPosition);
    };

    objectExtension.pp_convertDirectionWorldToObject = function pp_convertDirectionWorldToObject(direction: Readonly<Vector3>, outDirection: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.convertDirectionWorldToObject(this, direction, outDirection);
    };

    // Convert Vector Local World

    objectExtension.pp_convertPositionLocalToWorld = function pp_convertPositionLocalToWorld(position: Readonly<Vector3>, outPosition: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.convertPositionLocalToWorld(this, position, outPosition);
    };

    objectExtension.pp_convertDirectionLocalToWorld = function pp_convertDirectionLocalToWorld(direction: Readonly<Vector3>, outDirection: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.convertDirectionLocalToWorld(this, direction, outDirection);
    };

    objectExtension.pp_convertPositionWorldToLocal = function pp_convertPositionWorldToLocal(position: Readonly<Vector3>, outPosition: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.convertPositionWorldToLocal(this, position, outPosition);
    };

    objectExtension.pp_convertDirectionWorldToLocal = function pp_convertDirectionWorldToLocal(direction: Readonly<Vector3>, outDirection: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.convertDirectionWorldToLocal(this, direction, outDirection);
    };

    // Convert Vector Local Object

    objectExtension.pp_convertPositionObjectToLocal = function pp_convertPositionObjectToLocal(position: Readonly<Vector3>, outPosition: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.convertPositionObjectToLocal(this, position, outPosition);
    };

    objectExtension.pp_convertDirectionObjectToLocal = function pp_convertDirectionObjectToLocal(direction: Readonly<Vector3>, outDirection: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.convertDirectionObjectToLocal(this, direction, outDirection);
    };

    objectExtension.pp_convertPositionLocalToObject = function pp_convertPositionLocalToObject(position: Readonly<Vector3>, outPosition: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.convertPositionLocalToObject(this, position, outPosition);
    };

    objectExtension.pp_convertDirectionLocalToObject = function pp_convertDirectionLocalToObject(direction: Readonly<Vector3>, outDirection: Vector3 = Vec3Utils.create()): Vector3 {
        return ObjectUtils.convertDirectionLocalToObject(this, direction, outDirection);
    };

    // Convert Transform Object World

    objectExtension.pp_convertTransformObjectToWorld = function pp_convertTransformObjectToWorld(transform: Readonly<Matrix4>, outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.convertTransformObjectToWorld(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformObjectToWorldMatrix = function pp_convertTransformObjectToWorldMatrix(transform: Readonly<Matrix4>, outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.convertTransformObjectToWorldMatrix(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformObjectToWorldQuat = function pp_convertTransformObjectToWorldQuat(transform: Readonly<Quaternion2>, outTransform: Quaternion2 = Quat2Utils.create()): Quaternion2 {
        return ObjectUtils.convertTransformObjectToWorldQuat(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformWorldToObject = function pp_convertTransformWorldToObject(transform: Readonly<Matrix4>, outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.convertTransformWorldToObject(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformWorldToObjectMatrix = function pp_convertTransformWorldToObjectMatrix(transform: Readonly<Matrix4>, outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.convertTransformWorldToObjectMatrix(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformWorldToObjectQuat = function pp_convertTransformWorldToObjectQuat(transform: Readonly<Quaternion2>, outTransform: Quaternion2 = Quat2Utils.create()): Quaternion2 {
        return ObjectUtils.convertTransformWorldToObjectQuat(this, transform, outTransform);
    };

    // Convert Transform Local World

    objectExtension.pp_convertTransformLocalToWorld = function pp_convertTransformLocalToWorld(transform: Readonly<Matrix4>, outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.convertTransformLocalToWorld(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformLocalToWorldMatrix = function pp_convertTransformLocalToWorldMatrix(transform: Readonly<Matrix4>, outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.convertTransformLocalToWorldMatrix(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformLocalToWorldQuat = function pp_convertTransformLocalToWorldQuat(transform: Readonly<Quaternion2>, outTransform: Quaternion2 = Quat2Utils.create()): Quaternion2 {
        return ObjectUtils.convertTransformLocalToWorldQuat(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformWorldToLocal = function pp_convertTransformWorldToLocal(transform: Readonly<Matrix4>, outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.convertTransformWorldToLocal(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformWorldToLocalMatrix = function pp_convertTransformWorldToLocalMatrix(transform: Readonly<Matrix4>, outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.convertTransformWorldToLocalMatrix(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformWorldToLocalQuat = function pp_convertTransformWorldToLocalQuat(transform: Readonly<Quaternion2>, outTransform: Quaternion2 = Quat2Utils.create()): Quaternion2 {
        return ObjectUtils.convertTransformWorldToLocalQuat(this, transform, outTransform);
    };

    // Convert Transform Object Local

    objectExtension.pp_convertTransformObjectToLocal = function pp_convertTransformObjectToLocal(transform: Readonly<Matrix4>, outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.convertTransformObjectToLocal(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformObjectToLocalMatrix = function pp_convertTransformObjectToLocalMatrix(transform: Readonly<Matrix4>, outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.convertTransformObjectToLocalMatrix(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformObjectToLocalQuat = function pp_convertTransformObjectToLocalQuat(transform: Readonly<Quaternion2>, outTransform: Quaternion2 = Quat2Utils.create()): Quaternion2 {
        return ObjectUtils.convertTransformObjectToLocalQuat(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformLocalToObject = function pp_convertTransformLocalToObject(transform: Readonly<Matrix4>, outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.convertTransformLocalToObject(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformLocalToObjectMatrix = function pp_convertTransformLocalToObjectMatrix(transform: Readonly<Matrix4>, outTransform: Matrix4 = Mat4Utils.create()): Matrix4 {
        return ObjectUtils.convertTransformLocalToObjectMatrix(this, transform, outTransform);
    };

    objectExtension.pp_convertTransformLocalToObjectQuat = function pp_convertTransformLocalToObjectQuat(transform: Readonly<Quaternion2>, outTransform: Quaternion2 = Quat2Utils.create()): Quaternion2 {
        return ObjectUtils.convertTransformLocalToObjectQuat(this, transform, outTransform);
    };

    // Component

    objectExtension.pp_addComponent = function pp_addComponent<T extends Component>(typeOrClass: string | ComponentConstructor<T>, paramsOrActive: Record<string, any> | boolean | null = null, active: boolean | null = null): T {
        return ObjectUtils.addComponent(this, typeOrClass, paramsOrActive, active);
    };

    objectExtension.pp_getComponent = function pp_getComponent<T extends Component>(typeOrClass: string | ComponentConstructor<T>, index: number = 0): T | null {
        return ObjectUtils.getComponent(this, typeOrClass, index);
    };

    objectExtension.pp_getComponentSelf = function pp_getComponentSelf<T extends Component>(typeOrClass: string | ComponentConstructor<T>, index: number = 0): T | null {
        return ObjectUtils.getComponentSelf(this, typeOrClass, index);
    };

    objectExtension.pp_getComponentHierarchy = function pp_getComponentHierarchy<T extends Component>(typeOrClass: string | ComponentConstructor<T>, index: number = 0): T | null {
        return ObjectUtils.getComponentHierarchy(this, typeOrClass, index);
    };

    objectExtension.pp_getComponentHierarchyBreadth = function pp_getComponentHierarchyBreadth<T extends Component>(typeOrClass: string | ComponentConstructor<T>, index: number = 0): T | null {
        return ObjectUtils.getComponentHierarchyBreadth(this, typeOrClass, index);
    };

    objectExtension.pp_getComponentHierarchyDepth = function pp_getComponentHierarchyDepth<T extends Component>(typeOrClass: string | ComponentConstructor<T>, index: number = 0): T | null {
        return ObjectUtils.getComponentHierarchyDepth(this, typeOrClass, index);
    };

    objectExtension.pp_getComponentDescendants = function pp_getComponentDescendants<T extends Component>(typeOrClass: string | ComponentConstructor<T>, index: number = 0): T | null {
        return ObjectUtils.getComponentDescendants(this, typeOrClass, index);
    };

    objectExtension.pp_getComponentDescendantsBreadth = function pp_getComponentDescendantsBreadth<T extends Component>(typeOrClass: string | ComponentConstructor<T>, index: number = 0): T | null {
        return ObjectUtils.getComponentDescendantsBreadth(this, typeOrClass, index);
    };

    objectExtension.pp_getComponentDescendantsDepth = function pp_getComponentDescendantsDepth<T extends Component>(typeOrClass: string | ComponentConstructor<T>, index: number = 0): T | null {
        return ObjectUtils.getComponentDescendantsDepth(this, typeOrClass, index);
    };

    objectExtension.pp_getComponentChildren = function pp_getComponentChildren<T extends Component>(typeOrClass: string | ComponentConstructor<T>, index: number = 0): T | null {
        return ObjectUtils.getComponentChildren(this, typeOrClass, index);
    };

    objectExtension.pp_getComponents = function pp_getComponents<T extends Component>(typeOrClass: string | ComponentConstructor<T>): T[] {
        return ObjectUtils.getComponents(this, typeOrClass);
    };

    objectExtension.pp_getComponentsSelf = function pp_getComponentsSelf<T extends Component>(typeOrClass: string | ComponentConstructor<T>): T[] {
        return ObjectUtils.getComponentsSelf(this, typeOrClass);
    };

    objectExtension.pp_getComponentsHierarchy = function pp_getComponentsHierarchy<T extends Component>(typeOrClass: string | ComponentConstructor<T>): T[] {
        return ObjectUtils.getComponentsHierarchy(this, typeOrClass);
    };

    objectExtension.pp_getComponentsHierarchyBreadth = function pp_getComponentsHierarchyBreadth<T extends Component>(typeOrClass: string | ComponentConstructor<T>): T[] {
        return ObjectUtils.getComponentsHierarchyBreadth(this, typeOrClass);
    };

    objectExtension.pp_getComponentsHierarchyDepth = function pp_getComponentsHierarchyDepth<T extends Component>(typeOrClass: string | ComponentConstructor<T>): T[] {
        return ObjectUtils.getComponentsHierarchyDepth(this, typeOrClass);
    };

    objectExtension.pp_getComponentsDescendants = function pp_getComponentsDescendants<T extends Component>(typeOrClass: string | ComponentConstructor<T>): T[] {
        return ObjectUtils.getComponentsDescendants(this, typeOrClass);
    };

    objectExtension.pp_getComponentsDescendantsBreadth = function pp_getComponentsDescendantsBreadth<T extends Component>(typeOrClass: string | ComponentConstructor<T>): T[] {
        return ObjectUtils.getComponentsDescendantsBreadth(this, typeOrClass);
    };

    objectExtension.pp_getComponentsDescendantsDepth = function pp_getComponentsDescendantsDepth<T extends Component>(typeOrClass: string | ComponentConstructor<T>): T[] {
        return ObjectUtils.getComponentsDescendantsDepth(this, typeOrClass);
    };

    objectExtension.pp_getComponentsChildren = function pp_getComponentsChildren<T extends Component>(typeOrClass: string | ComponentConstructor<T>): T[] {
        return ObjectUtils.getComponentsChildren(this, typeOrClass);
    };

    // Active

    objectExtension.pp_setActive = function pp_setActive(active: boolean): Object3D {
        return ObjectUtils.setActive(this, active);
    };

    objectExtension.pp_setActiveSelf = function pp_setActiveSelf(active: boolean): Object3D {
        return ObjectUtils.setActiveSelf(this, active);
    };

    objectExtension.pp_setActiveHierarchy = function pp_setActiveHierarchy(active: boolean): Object3D {
        return ObjectUtils.setActiveHierarchy(this, active);
    };

    objectExtension.pp_setActiveHierarchyBreadth = function pp_setActiveHierarchyBreadth(active: boolean): Object3D {
        return ObjectUtils.setActiveHierarchyBreadth(this, active);
    };

    objectExtension.pp_setActiveHierarchyDepth = function pp_setActiveHierarchyDepth(active: boolean): Object3D {
        return ObjectUtils.setActiveHierarchyDepth(this, active);
    };

    objectExtension.pp_setActiveDescendants = function pp_setActiveDescendants(active: boolean): Object3D {
        return ObjectUtils.setActiveDescendants(this, active);
    };

    objectExtension.pp_setActiveDescendantsBreadth = function pp_setActiveDescendantsBreadth(active: boolean): Object3D {
        return ObjectUtils.setActiveDescendantsBreadth(this, active);
    };

    objectExtension.pp_setActiveDescendantsDepth = function pp_setActiveDescendantsDepth(active: boolean): Object3D {
        return ObjectUtils.setActiveDescendantsDepth(this, active);
    };

    objectExtension.pp_setActiveChildren = function pp_setActiveChildren(active: boolean): Object3D {
        return ObjectUtils.setActiveChildren(this, active);
    };

    // Uniform Scale

    objectExtension.pp_hasUniformScale = function pp_hasUniformScale(): boolean {
        return ObjectUtils.hasUniformScale(this);
    };

    objectExtension.pp_hasUniformScaleWorld = function pp_hasUniformScaleWorld(): boolean {
        return ObjectUtils.hasUniformScaleWorld(this);
    };

    objectExtension.pp_hasUniformScaleLocal = function pp_hasUniformScaleLocal(): boolean {
        return ObjectUtils.hasUniformScaleLocal(this);
    };

    // Clone

    objectExtension.pp_clone = function pp_clone(cloneParams: Readonly<CloneParams> = new CloneParams()): Object3D | null {
        return ObjectUtils.clone(this, cloneParams);
    };

    objectExtension.pp_isCloneable = function pp_isCloneable(cloneParams: Readonly<CloneParams> = new CloneParams()): boolean {
        return ObjectUtils.isCloneable(this, cloneParams);
    };

    // To String

    objectExtension.pp_toString = function pp_toString(): string {
        return ObjectUtils.toString(this);
    };

    objectExtension.pp_toStringExtended = function pp_toStringExtended(): string {
        return ObjectUtils.toStringExtended(this);
    };

    objectExtension.pp_toStringCompact = function pp_toStringCompact(): string {
        return ObjectUtils.toStringCompact(this);
    };

    // Get Object By Name

    objectExtension.pp_getObjectByName = function pp_getObjectByName(name: string, isRegex: boolean = false, index: number = 0): Object3D | null {
        return ObjectUtils.getObjectByName(this, name, isRegex, index);
    };

    objectExtension.pp_getObjectByNameHierarchy = function pp_getObjectByNameHierarchy(name: string, isRegex: boolean = false, index: number = 0): Object3D | null {
        return ObjectUtils.getObjectByNameHierarchy(this, name, isRegex, index);
    };

    objectExtension.pp_getObjectByNameHierarchyBreadth = function pp_getObjectByNameHierarchyBreadth(name: string, isRegex: boolean = false, index: number = 0): Object3D | null {
        return ObjectUtils.getObjectByNameHierarchyBreadth(this, name, isRegex, index);
    };

    objectExtension.pp_getObjectByNameHierarchyDepth = function pp_getObjectByNameHierarchyDepth(name: string, isRegex: boolean = false, index: number = 0): Object3D | null {
        return ObjectUtils.getObjectByNameHierarchyDepth(this, name, isRegex, index);
    };

    objectExtension.pp_getObjectByNameDescendants = function pp_getObjectByNameDescendants(name: string, isRegex: boolean = false, index: number = 0): Object3D | null {
        return ObjectUtils.getObjectByNameDescendants(this, name, isRegex, index);
    };

    objectExtension.pp_getObjectByNameDescendantsBreadth = function pp_getObjectByNameDescendantsBreadth(name: string, isRegex: boolean = false, index: number = 0): Object3D | null {
        return ObjectUtils.getObjectByNameDescendantsBreadth(this, name, isRegex, index);
    };

    objectExtension.pp_getObjectByNameDescendantsDepth = function pp_getObjectByNameDescendantsDepth(name: string, isRegex: boolean = false, index: number = 0): Object3D | null {
        return ObjectUtils.getObjectByNameDescendantsDepth(this, name, isRegex, index);
    };

    objectExtension.pp_getObjectByNameChildren = function pp_getObjectByNameChildren(name: string, isRegex: boolean = false, index: number = 0): Object3D | null {
        return ObjectUtils.getObjectByNameChildren(this, name, isRegex, index);
    };

    objectExtension.pp_getObjectsByName = function pp_getObjectsByName(name: string, isRegex: boolean = false): Object3D | null {
        return ObjectUtils.getObjectsByName(this, name, isRegex);
    };

    objectExtension.pp_getObjectsByNameHierarchy = function pp_getObjectsByNameHierarchy(name: string, isRegex: boolean = false): Object3D[] {
        return ObjectUtils.getObjectsByNameHierarchy(this, name, isRegex);
    };

    objectExtension.pp_getObjectsByNameHierarchyBreadth = function pp_getObjectsByNameHierarchyBreadth(name: string, isRegex: boolean = false): Object3D[] {
        return ObjectUtils.getObjectsByNameHierarchyBreadth(this, name, isRegex);
    };

    objectExtension.pp_getObjectsByNameHierarchyDepth = function pp_getObjectsByNameHierarchyDepth(name: string, isRegex: boolean = false): Object3D[] {
        return ObjectUtils.getObjectsByNameHierarchyDepth(this, name, isRegex);
    };

    objectExtension.pp_getObjectsByNameDescendants = function pp_getObjectsByNameDescendants(name: string, isRegex: boolean = false): Object3D[] {
        return ObjectUtils.getObjectsByNameDescendants(this, name, isRegex);
    };

    objectExtension.pp_getObjectsByNameDescendantsBreadth = function pp_getObjectsByNameDescendantsBreadth(name: string, isRegex: boolean = false): Object3D[] {
        return ObjectUtils.getObjectsByNameDescendantsBreadth(this, name, isRegex);
    };

    objectExtension.pp_getObjectsByNameDescendantsDepth = function pp_getObjectsByNameDescendantsDepth(name: string, isRegex: boolean = false): Object3D[] {
        return ObjectUtils.getObjectsByNameDescendantsDepth(this, name, isRegex);
    };

    objectExtension.pp_getObjectsByNameChildren = function pp_getObjectsByNameChildren(name: string, isRegex: boolean = false): Object3D[] {
        return ObjectUtils.getObjectsByNameChildren(this, name, isRegex);
    };

    // Get Object By ID

    objectExtension.pp_getObjectByID = function pp_getObjectByID(id: number): Object3D | null {
        return ObjectUtils.getObjectByID(this, id);
    };

    objectExtension.pp_getObjectByIDHierarchy = function pp_getObjectByIDHierarchy(id: number): Object3D | null {
        return ObjectUtils.getObjectByIDHierarchy(this, id);
    };

    objectExtension.pp_getObjectByIDHierarchyBreadth = function pp_getObjectByIDHierarchyBreadth(id: number): Object3D | null {
        return ObjectUtils.getObjectByIDHierarchyBreadth(this, id);
    };

    objectExtension.pp_getObjectByIDHierarchyDepth = function pp_getObjectByIDHierarchyDepth(id: number): Object3D | null {
        return ObjectUtils.getObjectByIDHierarchyDepth(this, id);
    };

    objectExtension.pp_getObjectByIDDescendants = function pp_getObjectByIDDescendants(id: number): Object3D | null {
        return ObjectUtils.getObjectByIDDescendants(this, id);
    };

    objectExtension.pp_getObjectByIDDescendantsBreadth = function pp_getObjectByIDDescendantsBreadth(id: number): Object3D | null {
        return ObjectUtils.getObjectByIDDescendantsBreadth(this, id);
    };

    objectExtension.pp_getObjectByIDDescendantsDepth = function pp_getObjectByIDDescendantsDepth(id: number): Object3D | null {
        return ObjectUtils.getObjectByIDDescendantsDepth(this, id);
    };

    objectExtension.pp_getObjectByIDChildren = function pp_getObjectByIDChildren(id: number): Object3D | null {
        return ObjectUtils.getObjectByIDChildren(this, id);
    };

    // Get Hierarchy

    objectExtension.pp_getHierarchyBreadth = function pp_getHierarchyBreadth(): Object3D[] {
        return ObjectUtils.getHierarchyBreadth(this);
    };

    objectExtension.pp_getHierarchyDepth = function pp_getHierarchyDepth(): Object3D[] {
        return ObjectUtils.getHierarchyDepth(this);
    };

    objectExtension.pp_getDescendants = function pp_getDescendants(): Object3D[] {
        return ObjectUtils.getDescendants(this);
    };

    objectExtension.pp_getDescendantsBreadth = function pp_getDescendantsBreadth(): Object3D[] {
        return ObjectUtils.getDescendantsBreadth(this);
    };

    objectExtension.pp_getDescendantsDepth = function pp_getDescendantsDepth(): Object3D[] {
        return ObjectUtils.getDescendantsDepth(this);
    };

    objectExtension.pp_getChildren = function pp_getChildren(): Object3D[] {
        return ObjectUtils.getChildren(this);
    };

    objectExtension.pp_getSelf = function pp_getSelf(): Object3D {
        return ObjectUtils.getSelf(this);
    };

    // Cauldron

    objectExtension.pp_addObject = function pp_addObject(): Object3D {
        return ObjectUtils.addObject(this);
    };

    objectExtension.pp_getName = function pp_getName(): string {
        return ObjectUtils.getName(this);
    };

    objectExtension.pp_setName = function pp_setName(name: string): Object3D {
        return ObjectUtils.setName(this, name);
    };

    objectExtension.pp_getEngine = function pp_getEngine(): WonderlandEngine {
        return ObjectUtils.getEngine(this);
    };

    objectExtension.pp_getID = function pp_getID(): number {
        return ObjectUtils.getID(this);
    };

    objectExtension.pp_markDirty = function pp_markDirty(): Object3D {
        return ObjectUtils.markDirty(this);
    };

    objectExtension.pp_isTransformChanged = function pp_isTransformChanged(): boolean {
        return ObjectUtils.isTransformChanged(this);
    };

    objectExtension.pp_equals = function pp_equals(otherObject: Object3D): boolean {
        return ObjectUtils.equals(this, otherObject);
    };

    objectExtension.pp_destroy = function pp_destroy(): void {
        return ObjectUtils.destroy(this);
    };

    objectExtension.pp_reserveObjects = function pp_reserveObjects(count: number): Object3D {
        return ObjectUtils.reserveObjects(this, count);
    };

    objectExtension.pp_reserveObjectsSelf = function pp_reserveObjectsSelf(count: number): Object3D {
        return ObjectUtils.reserveObjectsSelf(this, count);
    };

    objectExtension.pp_reserveObjectsHierarchy = function pp_reserveObjectsHierarchy(count: number): Object3D {
        return ObjectUtils.reserveObjectsHierarchy(this, count);
    };

    objectExtension.pp_reserveObjectsDescendants = function pp_reserveObjectsDescendants(count: number): Object3D {
        return ObjectUtils.reserveObjectsDescendants(this, count);
    };

    objectExtension.pp_reserveObjectsChildren = function pp_reserveObjectsChildren(count: number): Object3D {
        return ObjectUtils.reserveObjectsChildren(this, count);
    };

    objectExtension.pp_getComponentsAmountMap = function pp_getComponentsAmountMap(amountMap: Map<string, number> = new Map<string, number>()): Map<string, number> {
        return ObjectUtils.getComponentsAmountMap(this, amountMap);
    };

    objectExtension.pp_getComponentsAmountMapSelf = function pp_getComponentsAmountMapSelf(amountMap: Map<string, number> = new Map<string, number>()): Map<string, number> {
        return ObjectUtils.getComponentsAmountMapSelf(this, amountMap);
    };

    objectExtension.pp_getComponentsAmountMapHierarchy = function pp_getComponentsAmountMapHierarchy(amountMap: Map<string, number> = new Map<string, number>()): Map<string, number> {
        return ObjectUtils.getComponentsAmountMapHierarchy(this, amountMap);
    };

    objectExtension.pp_getComponentsAmountMapDescendants = function pp_getComponentsAmountMapDescendants(amountMap: Map<string, number> = new Map<string, number>()): Map<string, number> {
        return ObjectUtils.getComponentsAmountMapDescendants(this, amountMap);
    };

    objectExtension.pp_getComponentsAmountMapChildren = function pp_getComponentsAmountMapChildren(amountMap: Map<string, number> = new Map<string, number>()): Map<string, number> {
        return ObjectUtils.getComponentsAmountMapChildren(this, amountMap);
    };



    PluginUtils.injectProperties(objectExtension, Object3D.prototype, false, true, true);
}