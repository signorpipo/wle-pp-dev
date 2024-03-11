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

import { Component, WonderlandEngine, type ComponentConstructor } from "@wonderlandengine/api";
import { Matrix3, Matrix4, Quaternion, Quaternion2, Vector3 } from "../../../cauldron/type_definitions/array_type_definitions.js";
import { CloneParams } from "../../../index.js";

declare module "@wonderlandengine/api" {
    export interface Object3D {

        pp_getPosition(this: Readonly<Object3D>, outPosition?: Vector3): Vector3;
        pp_getPositionWorld(this: Readonly<Object3D>, outPosition?: Vector3): Vector3;
        pp_getPositionLocal(this: Readonly<Object3D>, outPosition?: Vector3): Vector3;

        pp_getRotation(this: Readonly<Object3D>, outRotation?: Vector3): Vector3;
        pp_getRotationDegrees(this: Readonly<Object3D>, outRotation?: Vector3): Vector3;
        pp_getRotationRadians(this: Readonly<Object3D>, outRotation?: Vector3): Vector3;
        pp_getRotationMatrix(this: Readonly<Object3D>, outRotation?: Matrix3): Matrix3;
        pp_getRotationQuat(this: Readonly<Object3D>, outRotation?: Quaternion): Quaternion;

        pp_getRotationWorld(this: Readonly<Object3D>, outRotation?: Vector3): Vector3;
        pp_getRotationWorldDegrees(this: Readonly<Object3D>, outRotation?: Vector3): Vector3;
        pp_getRotationWorldRadians(this: Readonly<Object3D>, outRotation?: Vector3): Vector3;
        pp_getRotationWorldMatrix(this: Readonly<Object3D>, outRotation?: Matrix3): Matrix3;
        pp_getRotationWorldQuat(this: Readonly<Object3D>, outRotation?: Quaternion): Quaternion;

        pp_getRotationLocal(this: Readonly<Object3D>, outRotation?: Vector3): Vector3;
        pp_getRotationLocalDegrees(this: Readonly<Object3D>, outRotation?: Vector3): Vector3;
        pp_getRotationLocalRadians(this: Readonly<Object3D>, outRotation?: Vector3): Vector3;
        pp_getRotationLocalMatrix(this: Readonly<Object3D>, outRotation?: Matrix3): Matrix3;
        pp_getRotationLocalQuat(this: Readonly<Object3D>, outRotation?: Quaternion): Quaternion;

        pp_getScale(this: Readonly<Object3D>, outScale?: Vector3): Vector3;
        pp_getScaleWorld(this: Readonly<Object3D>, outScale?: Vector3): Vector3;
        pp_getScaleLocal(this: Readonly<Object3D>, outScale?: Vector3): Vector3;

        pp_getTransform(this: Readonly<Object3D>, outTransform?: Matrix4): Matrix4;
        pp_getTransformMatrix(this: Readonly<Object3D>, outTransform?: Matrix4): Matrix4;
        pp_getTransformQuat(this: Readonly<Object3D>, outTransform?: Quaternion2): Quaternion2;

        pp_getTransformWorld(this: Readonly<Object3D>, outTransform?: Matrix4): Matrix4;
        pp_getTransformWorldMatrix(this: Readonly<Object3D>, outTransform?: Matrix4): Matrix4;
        pp_getTransformWorldQuat(this: Readonly<Object3D>, outTransform?: Quaternion2): Quaternion2;

        pp_getTransformLocal(this: Readonly<Object3D>, outTransform?: Matrix4): Matrix4;
        pp_getTransformLocalMatrix(this: Readonly<Object3D>, outTransform?: Matrix4): Matrix4;
        pp_getTransformLocalQuat(this: Readonly<Object3D>, outTransform?: Quaternion2): Quaternion2;

        pp_getAxes(this: Readonly<Object3D>, outAxes?: [Vector3, Vector3, Vector3]): [Vector3, Vector3, Vector3];
        pp_getAxesWorld(this: Readonly<Object3D>, outAxes?: [Vector3, Vector3, Vector3]): [Vector3, Vector3, Vector3];
        pp_getAxesLocal(this: Readonly<Object3D>, outAxes?: [Vector3, Vector3, Vector3]): [Vector3, Vector3, Vector3];

        pp_getForward(this: Readonly<Object3D>, outForward?: Vector3): Vector3;
        pp_getForwardWorld(this: Readonly<Object3D>, outForward?: Vector3): Vector3;
        pp_getForwardLocal(this: Readonly<Object3D>, outForward?: Vector3): Vector3;

        pp_getBackward(this: Readonly<Object3D>, outBackward?: Vector3): Vector3;
        pp_getBackwardWorld(this: Readonly<Object3D>, outBackward?: Vector3): Vector3;
        pp_getBackwardLocal(this: Readonly<Object3D>, outBackward?: Vector3): Vector3;

        pp_getUp(this: Readonly<Object3D>, outUp?: Vector3): Vector3;
        pp_getUpWorld(this: Readonly<Object3D>, outUp?: Vector3): Vector3;
        pp_getUpLocal(this: Readonly<Object3D>, outUp?: Vector3): Vector3;

        pp_getDown(this: Readonly<Object3D>, outDown?: Vector3): Vector3;
        pp_getDownWorld(this: Readonly<Object3D>, outDown?: Vector3): Vector3;
        pp_getDownLocal(this: Readonly<Object3D>, outDown?: Vector3): Vector3;

        pp_getLeft(this: Readonly<Object3D>, outLeft?: Vector3): Vector3;
        pp_getLeftWorld(this: Readonly<Object3D>, outLeft?: Vector3): Vector3;
        pp_getLeftLocal(this: Readonly<Object3D>, outLeft?: Vector3): Vector3;

        pp_getRight(this: Readonly<Object3D>, outRight?: Vector3): Vector3;
        pp_getRightWorld(this: Readonly<Object3D>, outRight?: Vector3): Vector3;
        pp_getRightLocal(this: Readonly<Object3D>, outRight?: Vector3): Vector3;

        pp_setPosition(this: Object3D, position: Readonly<Vector3>): Object3D;
        pp_setPositionWorld(this: Object3D, position: Readonly<Vector3>): Object3D;
        pp_setPositionLocal(this: Object3D, position: Readonly<Vector3>): Object3D;

        pp_setRotation(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_setRotationDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_setRotationRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_setRotationMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D;
        pp_setRotationQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D;

        pp_setRotationWorld(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_setRotationWorldDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_setRotationWorldRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_setRotationWorldMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D;
        pp_setRotationWorldQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D;

        pp_setRotationLocal(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_setRotationLocalDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_setRotationLocalRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_setRotationLocalMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D;
        pp_setRotationLocalQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D;

        pp_setScale(this: Object3D, scale: number | Vector3): Object3D;
        pp_setScaleWorld(this: Object3D, uniformScale: number): Object3D;
        pp_setScaleWorld(this: Object3D, scale: Vector3): Object3D;
        pp_setScaleWorld(this: Object3D, scale: number | Vector3): Object3D;
        pp_setScaleLocal(this: Object3D, uniformScale: number): Object3D;
        pp_setScaleLocal(this: Object3D, scale: Vector3): Object3D;
        pp_setScaleLocal(this: Object3D, scale: number | Vector3): Object3D;

        pp_setAxes(this: Object3D, left?: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D;
        pp_setAxesWorld(this: Object3D, left?: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D;
        pp_setAxesLocal(this: Object3D, left?: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D;

        pp_setForward(this: Object3D, forward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D;
        pp_setForwardWorld(this: Object3D, forward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D;
        pp_setForwardLocal(this: Object3D, forward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D;

        pp_setBackward(this: Object3D, backward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D;
        pp_setBackwardWorld(this: Object3D, backward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D;
        pp_setBackwardLocal(this: Object3D, backward: Readonly<Vector3>, up?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D;

        pp_setUp(this: Object3D, up: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D;
        pp_setUpWorld(this: Object3D, up: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D;
        pp_setUpLocal(this: Object3D, up: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D;

        pp_setDown(this: Object3D, down: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D;
        pp_setDownWorld(this: Object3D, down: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D;
        pp_setDownLocal(this: Object3D, down: Readonly<Vector3>, forward?: Readonly<Vector3>, left?: Readonly<Vector3>): Object3D;

        pp_setLeft(this: Object3D, left: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D;
        pp_setLeftWorld(this: Object3D, left: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D;
        pp_setLeftLocal(this: Object3D, left: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D;

        pp_setRight(this: Object3D, right: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D;
        pp_setRightWorld(this: Object3D, right: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D;
        pp_setRightLocal(this: Object3D, right: Readonly<Vector3>, up?: Readonly<Vector3>, forward?: Readonly<Vector3>): Object3D;

        pp_setTransform(this: Object3D, transform: Readonly<Matrix4>): Object3D;
        pp_setTransformMatrix(this: Object3D, transform: Readonly<Matrix4>): Object3D;
        pp_setTransformQuat(this: Object3D, transform: Readonly<Quaternion2>): Object3D;

        pp_setTransformWorld(this: Object3D, transform: Readonly<Matrix4>): Object3D;
        pp_setTransformWorldMatrix(this: Object3D, transform: Readonly<Matrix4>): Object3D;
        pp_setTransformWorldQuat(this: Object3D, transform: Readonly<Quaternion2>): Object3D;

        pp_setTransformLocal(this: Object3D, transform: Readonly<Matrix4>): Object3D;
        pp_setTransformLocalMatrix(this: Object3D, transform: Readonly<Matrix4>): Object3D;
        pp_setTransformLocalQuat(this: Object3D, transform: Readonly<Quaternion2>): Object3D;

        pp_resetPosition(this: Object3D): Object3D;
        pp_resetPositionWorld(this: Object3D): Object3D;
        pp_resetPositionLocal(this: Object3D): Object3D;

        pp_resetRotation(this: Object3D): Object3D;
        pp_resetRotationWorld(this: Object3D): Object3D;
        pp_resetRotationLocal(this: Object3D): Object3D;

        pp_resetScale(this: Object3D): Object3D;
        pp_resetScaleWorld(this: Object3D): Object3D;
        pp_resetScaleLocal(this: Object3D): Object3D;

        pp_resetTransform(this: Object3D): Object3D;
        pp_resetTransformWorld(this: Object3D): Object3D;
        pp_resetTransformLocal(this: Object3D): Object3D;

        pp_translate(this: Object3D, translation: Readonly<Vector3>): Object3D;
        pp_translateWorld(this: Object3D, translation: Readonly<Vector3>): Object3D;
        pp_translateLocal(this: Object3D, translation: Readonly<Vector3>): Object3D;
        pp_translateObject(this: Object3D, translation: Readonly<Vector3>): Object3D;

        pp_translateAxis(this: Object3D, amount: number, direction: Readonly<Vector3>): Object3D;
        pp_translateAxisWorld(this: Object3D, amount: number, direction: Readonly<Vector3>): Object3D;
        pp_translateAxisLocal(this: Object3D, amount: number, direction: Readonly<Vector3>): Object3D;
        pp_translateAxisObject(this: Object3D, amount: number, direction: Readonly<Vector3>): Object3D;

        pp_rotate(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_rotateDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_rotateRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_rotateMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D;
        pp_rotateQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D;

        pp_rotateWorld(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_rotateWorldDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_rotateWorldRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_rotateWorldMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D;
        pp_rotateWorldQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D;

        pp_rotateLocal(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_rotateLocalDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_rotateLocalRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_rotateLocalMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D;
        pp_rotateLocalQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D;

        pp_rotateObject(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_rotateObjectDegrees(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_rotateObjectRadians(this: Object3D, rotation: Readonly<Vector3>): Object3D;
        pp_rotateObjectMatrix(this: Object3D, rotation: Readonly<Matrix3>): Object3D;
        pp_rotateObjectQuat(this: Object3D, rotation: Readonly<Quaternion>): Object3D;

        pp_rotateAxis(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D;
        pp_rotateAxisDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D;
        pp_rotateAxisRadians(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D;

        pp_rotateAxisWorld(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D;
        pp_rotateAxisWorldDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D;
        pp_rotateAxisWorldRadians(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D;

        pp_rotateAxisLocal(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D;
        pp_rotateAxisLocalDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D;
        pp_rotateAxisLocalRadians(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D;

        pp_rotateAxisObject(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D;
        pp_rotateAxisObjectDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D;
        pp_rotateAxisObjectRadians(this: Object3D, angle: number, axis: Readonly<Vector3>): Object3D;

        pp_rotateAround(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundDegrees(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundRadians(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundMatrix(this: Object3D, rotation: Readonly<Matrix3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundQuat(this: Object3D, rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): Object3D;

        pp_rotateAroundWorld(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundWorldDegrees(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundWorldRadians(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundWorldMatrix(this: Object3D, rotation: Readonly<Matrix3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundWorldQuat(this: Object3D, rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): Object3D;

        pp_rotateAroundLocal(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundLocalDegrees(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundLocalRadians(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundLocalMatrix(this: Object3D, rotation: Readonly<Matrix3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundLocalQuat(this: Object3D, rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): Object3D;

        pp_rotateAroundObject(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundObjectDegrees(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundObjectRadians(this: Object3D, rotation: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundObjectMatrix(this: Object3D, rotation: Readonly<Matrix3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundObjectQuat(this: Object3D, rotation: Readonly<Quaternion>, origin: Readonly<Vector3>): Object3D;

        pp_rotateAroundAxis(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundAxisDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundAxisRadians(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;

        pp_rotateAroundAxisWorld(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundAxisWorldDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundAxisWorldRadians(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;

        pp_rotateAroundAxisLocal(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundAxisLocalDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundAxisLocalRadians(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;

        pp_rotateAroundAxisObject(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundAxisObjectDegrees(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;
        pp_rotateAroundAxisObjectRadians(this: Object3D, angle: number, axis: Readonly<Vector3>, origin: Readonly<Vector3>): Object3D;

        pp_scaleObject(this: Object3D, scale: number | Vector3): Object3D;

        pp_lookAt(this: Object3D, position: Readonly<Vector3>, up: Readonly<Vector3>): Object3D;
        pp_lookAtWorld(this: Object3D, position: Readonly<Vector3>, up: Readonly<Vector3>): Object3D;
        pp_lookAtLocal(this: Object3D, position: Readonly<Vector3>, up: Readonly<Vector3>): Object3D;

        pp_lookTo(this: Object3D, direction: Readonly<Vector3>, up: Readonly<Vector3>): Object3D;
        pp_lookToWorld(this: Object3D, direction: Readonly<Vector3>, up: Readonly<Vector3>): Object3D;
        pp_lookToLocal(this: Object3D, direction: Readonly<Vector3>, up: Readonly<Vector3>): Object3D;

        pp_convertPositionObjectToWorld(this: Readonly<Object3D>, position: Readonly<Vector3>, outPosition?: Vector3): Vector3;
        pp_convertDirectionObjectToWorld(this: Readonly<Object3D>, direction: Readonly<Vector3>, outDirection?: Vector3): Vector3;
        pp_convertPositionWorldToObject(this: Readonly<Object3D>, position: Readonly<Vector3>, outPosition?: Vector3): Vector3;
        pp_convertDirectionWorldToObject(this: Readonly<Object3D>, direction: Readonly<Vector3>, outDirection?: Vector3): Vector3;

        pp_convertPositionLocalToWorld(this: Readonly<Object3D>, position: Readonly<Vector3>, outPosition?: Vector3): Vector3;
        pp_convertDirectionLocalToWorld(this: Readonly<Object3D>, direction: Readonly<Vector3>, outDirection?: Vector3): Vector3;
        pp_convertPositionWorldToLocal(this: Readonly<Object3D>, position: Readonly<Vector3>, outPosition?: Vector3): Vector3;
        pp_convertDirectionWorldToLocal(this: Readonly<Object3D>, direction: Readonly<Vector3>, outDirection?: Vector3): Vector3;

        pp_convertPositionObjectToLocal(this: Readonly<Object3D>, position: Readonly<Vector3>, outPosition?: Vector3): Vector3;
        pp_convertDirectionObjectToLocal(this: Readonly<Object3D>, direction: Readonly<Vector3>, outDirection?: Vector3): Vector3;
        pp_convertPositionLocalToObject(this: Readonly<Object3D>, position: Readonly<Vector3>, outPosition?: Vector3): Vector3;
        pp_convertDirectionLocalToObject(this: Readonly<Object3D>, direction: Readonly<Vector3>, outDirection?: Vector3): Vector3;

        pp_convertTransformObjectToWorld(this: Readonly<Object3D>, transform: Readonly<Matrix4>, outTransform?: Matrix4): Matrix4;
        pp_convertTransformObjectToWorldMatrix(this: Readonly<Object3D>, transform: Readonly<Matrix4>, outTransform?: Matrix4): Matrix4;
        pp_convertTransformObjectToWorldQuat(this: Readonly<Object3D>, transform: Readonly<Quaternion2>, outTransform?: Quaternion2): Quaternion2;
        pp_convertTransformWorldToObject(this: Readonly<Object3D>, transform: Readonly<Matrix4>, outTransform?: Matrix4): Matrix4;
        pp_convertTransformWorldToObjectMatrix(this: Readonly<Object3D>, transform: Readonly<Matrix4>, outTransform?: Matrix4): Matrix4;
        pp_convertTransformWorldToObjectQuat(this: Readonly<Object3D>, transform: Readonly<Quaternion2>, outTransform?: Quaternion2): Quaternion2;

        pp_convertTransformLocalToWorld(this: Readonly<Object3D>, transform: Readonly<Matrix4>, outTransform?: Matrix4): Matrix4;
        pp_convertTransformLocalToWorldMatrix(this: Readonly<Object3D>, transform: Readonly<Matrix4>, outTransform?: Matrix4): Matrix4;
        pp_convertTransformLocalToWorldQuat(this: Readonly<Object3D>, transform: Readonly<Quaternion2>, outTransform?: Quaternion2): Quaternion2;
        pp_convertTransformWorldToLocal(this: Readonly<Object3D>, transform: Readonly<Matrix4>, outTransform?: Matrix4): Matrix4;
        pp_convertTransformWorldToLocalMatrix(this: Readonly<Object3D>, transform: Readonly<Matrix4>, outTransform?: Matrix4): Matrix4;
        pp_convertTransformWorldToLocalQuat(this: Readonly<Object3D>, transform: Readonly<Quaternion2>, outTransform?: Quaternion2): Quaternion2;

        pp_convertTransformObjectToLocal(this: Readonly<Object3D>, transform: Readonly<Matrix4>, outTransform?: Matrix4): Matrix4;
        pp_convertTransformObjectToLocalMatrix(this: Readonly<Object3D>, transform: Readonly<Matrix4>, outTransform?: Matrix4): Matrix4;
        pp_convertTransformObjectToLocalQuat(this: Readonly<Object3D>, transform: Readonly<Quaternion2>, outTransform?: Quaternion2): Quaternion2;
        pp_convertTransformLocalToObject(this: Readonly<Object3D>, transform: Readonly<Matrix4>, outTransform?: Matrix4): Matrix4;
        pp_convertTransformLocalToObjectMatrix(this: Readonly<Object3D>, transform: Readonly<Matrix4>, outTransform?: Matrix4): Matrix4;
        pp_convertTransformLocalToObjectQuat(this: Readonly<Object3D>, transform: Readonly<Quaternion2>, outTransform?: Quaternion2): Quaternion2;

        pp_setParent(this: Object3D, newParent: Object3D, keepTransformWorld?: boolean): Object3D;
        pp_getParent(this: Readonly<Object3D>): Object3D | null;

        pp_addComponent<T extends Component>(this: Object3D, typeOrClass: string | ComponentConstructor<T>, paramsOrActive?: Record<string, any> | boolean, active?: boolean): T | null;

        pp_getComponent<T extends Component>(this: Readonly<Object3D>, typeOrClass: string | ComponentConstructor<T>, index?: number): T | null;
        pp_getComponentSelf<T extends Component>(this: Readonly<Object3D>, typeOrClass: string | ComponentConstructor<T>, index?: number): T | null;
        pp_getComponentHierarchy<T extends Component>(this: Readonly<Object3D>, typeOrClass: string | ComponentConstructor<T>, index?: number): T | null;
        pp_getComponentHierarchyBreadth<T extends Component>(this: Readonly<Object3D>, typeOrClass: string | ComponentConstructor<T>, index?: number): T | null;
        pp_getComponentHierarchyDepth<T extends Component>(this: Readonly<Object3D>, typeOrClass: string | ComponentConstructor<T>, index?: number): T | null;
        pp_getComponentDescendants<T extends Component>(this: Readonly<Object3D>, typeOrClass: string | ComponentConstructor<T>, index?: number): T | null;
        pp_getComponentDescendantsBreadth<T extends Component>(this: Readonly<Object3D>, typeOrClass: string | ComponentConstructor<T>, index?: number): T | null;
        pp_getComponentDescendantsDepth<T extends Component>(this: Readonly<Object3D>, typeOrClass: string | ComponentConstructor<T>, index?: number): T | null;
        pp_getComponentChildren<T extends Component>(this: Readonly<Object3D>, typeOrClass: string | ComponentConstructor<T>, index?: number): T | null;
        pp_getComponents<T extends Component>(this: Readonly<Object3D>, typeOrClass?: string | ComponentConstructor<T>): T[];
        pp_getComponentsSelf<T extends Component>(this: Readonly<Object3D>, typeOrClass?: string | ComponentConstructor<T>): T[];
        pp_getComponentsHierarchy<T extends Component>(this: Readonly<Object3D>, typeOrClass?: string | ComponentConstructor<T>): T[];
        pp_getComponentsHierarchyBreadth<T extends Component>(this: Readonly<Object3D>, typeOrClass?: string | ComponentConstructor<T>): T[];
        pp_getComponentsHierarchyDepth<T extends Component>(this: Readonly<Object3D>, typeOrClass?: string | ComponentConstructor<T>): T[];
        pp_getComponentsDescendants<T extends Component>(this: Readonly<Object3D>, typeOrClass?: string | ComponentConstructor<T>): T[];
        pp_getComponentsDescendantsBreadth<T extends Component>(this: Readonly<Object3D>, typeOrClass?: string | ComponentConstructor<T>): T[];
        pp_getComponentsDescendantsDepth<T extends Component>(this: Readonly<Object3D>, typeOrClass?: string | ComponentConstructor<T>): T[];
        pp_getComponentsChildren<T extends Component>(this: Readonly<Object3D>, typeOrClass?: string | ComponentConstructor<T>): T[];

        pp_setActive(this: Object3D, active: boolean): Object3D;
        pp_setActiveSelf(this: Object3D, active: boolean): Object3D;
        pp_setActiveHierarchy(this: Object3D, active: boolean): Object3D;
        pp_setActiveHierarchyBreadth(this: Object3D, active: boolean): Object3D;
        pp_setActiveHierarchyDepth(this: Object3D, active: boolean): Object3D;
        pp_setActiveDescendants(this: Object3D, active: boolean): Object3D;
        pp_setActiveDescendantsBreadth(this: Object3D, active: boolean): Object3D;
        pp_setActiveDescendantsDepth(this: Object3D, active: boolean): Object3D;
        pp_setActiveChildren(this: Object3D, active: boolean): Object3D;

        pp_hasUniformScale(this: Readonly<Object3D>): boolean;
        pp_hasUniformScaleWorld(this: Readonly<Object3D>): boolean;
        pp_hasUniformScaleLocal(this: Readonly<Object3D>): boolean;

        pp_clone(this: Readonly<Object3D>, cloneParams?: Readonly<CloneParams>): Object3D | null;
        pp_isCloneable(this: Readonly<Object3D>, cloneParams?: Readonly<CloneParams>): boolean;

        pp_toString(this: Readonly<Object3D>): string;
        pp_toStringExtended(this: Readonly<Object3D>): string;
        pp_toStringCompact(this: Readonly<Object3D>): string;

        pp_getObjectByName(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null;
        pp_getObjectByNameHierarchy(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null;
        pp_getObjectByNameHierarchyBreadth(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null;
        pp_getObjectByNameHierarchyDepth(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null;
        pp_getObjectByNameDescendants(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null;
        pp_getObjectByNameDescendantsBreadth(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null;
        pp_getObjectByNameDescendantsDepth(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null;
        pp_getObjectByNameChildren(this: Readonly<Object3D>, name: string, isRegex?: boolean, index?: number): Object3D | null;
        pp_getObjectsByName(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[];
        pp_getObjectsByNameHierarchy(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[];
        pp_getObjectsByNameHierarchyBreadth(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[];
        pp_getObjectsByNameHierarchyDepth(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[];
        pp_getObjectsByNameDescendants(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[];
        pp_getObjectsByNameDescendantsBreadth(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[];
        pp_getObjectsByNameDescendantsDepth(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[];
        pp_getObjectsByNameChildren(this: Readonly<Object3D>, name: string, isRegex?: boolean): Object3D[];

        pp_getObjectByID(this: Readonly<Object3D>, id: number): Object3D | null;
        pp_getObjectByIDHierarchy(this: Readonly<Object3D>, id: number): Object3D | null;
        pp_getObjectByIDHierarchyBreadth(this: Readonly<Object3D>, id: number): Object3D | null;
        pp_getObjectByIDHierarchyDepth(this: Readonly<Object3D>, id: number): Object3D | null;
        pp_getObjectByIDDescendants(this: Readonly<Object3D>, id: number): Object3D | null;
        pp_getObjectByIDDescendantsBreadth(this: Readonly<Object3D>, id: number): Object3D | null;
        pp_getObjectByIDDescendantsDepth(this: Readonly<Object3D>, id: number): Object3D | null;
        pp_getObjectByIDChildren(this: Readonly<Object3D>, id: number): Object3D | null;

        pp_getHierarchyBreadth(this: Readonly<Object3D>): Object3D[];
        pp_getHierarchyDepth(this: Readonly<Object3D>): Object3D[];
        pp_getDescendants(this: Readonly<Object3D>): Object3D[];
        pp_getDescendantsBreadth(this: Readonly<Object3D>): Object3D[];
        pp_getDescendantsDepth(this: Readonly<Object3D>): Object3D[];
        pp_getChildren(this: Readonly<Object3D>): Object3D[];
        pp_getSelf(this: Readonly<Object3D>): Object3D;

        pp_addObject(this: Object3D): Object3D;
        pp_getName(this: Readonly<Object3D>): string;
        pp_setName(this: Object3D, name: string): Object3D;
        pp_getEngine(this: Readonly<Object3D>): WonderlandEngine;
        pp_getID(this: Readonly<Object3D>): number;
        pp_markDirty(this: Object3D): Object3D;
        pp_isTransformChanged(this: Readonly<Object3D>): boolean;
        pp_equals(this: Readonly<Object3D>, object: Readonly<Object3D>): boolean;
        pp_destroy(this: Object3D): void;

        pp_reserveObjects(this: Readonly<Object3D>, count: number): Object3D;
        pp_reserveObjectsSelf(this: Readonly<Object3D>, count: number): Object3D;
        pp_reserveObjectsHierarchy(this: Readonly<Object3D>, count: number): Object3D;
        pp_reserveObjectsDescendants(this: Readonly<Object3D>, count: number): Object3D;
        pp_reserveObjectsChildren(this: Readonly<Object3D>, count: number): Object3D;

        pp_getComponentsAmountMap(this: Readonly<Object3D>, outComponentsAmountMap?: Map<string, number>): Map<string, number>;
        pp_getComponentsAmountMapSelf(this: Readonly<Object3D>, outComponentsAmountMap?: Map<string, number>): Map<string, number>;
        pp_getComponentsAmountMapHierarchy(this: Readonly<Object3D>, outComponentsAmountMap?: Map<string, number>): Map<string, number>;
        pp_getComponentsAmountMapDescendants(this: Readonly<Object3D>, outComponentsAmountMap?: Map<string, number>): Map<string, number>;
        pp_getComponentsAmountMapChildren(this: Readonly<Object3D>, outComponentsAmountMap?: Map<string, number>): Map<string, number>;
    }
}