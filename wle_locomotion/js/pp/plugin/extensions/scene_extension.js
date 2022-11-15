/*
    How to use

    On some of the functions u can specify if the algorithm should explore by Breadth/Depth, example:
        - pp_getObjectByNameBreadth
        - pp_getComponentsDepth
    By default the functions explore by Breadth

    List of functions:
        - pp_getRoot
        - pp_getObjects
        
        - pp_getComponent
        - pp_getComponents
        
        - pp_getObjectByName
        - pp_getObjectsByName
        
        - pp_toString / pp_toStringCompact / pp_toStringExtended

        - pp_getComponentAmountMap
*/

if (WL && WL.scene) {

    WL.scene.pp_getRoot = function () {
        return new WL.Object(0);
    }

    WL.scene.pp_getObjects = function () {
        return WL.scene.pp_getObjectsBreadth();
    }

    WL.scene.pp_getObjectsBreadth = function () {
        return WL.scene.pp_getRoot().pp_getHierarchyBreadth();
    }

    WL.scene.pp_getObjectsDepth = function () {
        return WL.scene.pp_getRoot().pp_getHierarchyDepth();
    }

    //Get Component    

    WL.scene.pp_getComponent = function (type, index) {
        return WL.scene.pp_getComponentBreadth(type, index);
    }

    WL.scene.pp_getComponentBreadth = function (type, index) {
        return WL.scene.pp_getRoot().pp_getComponentHierarchyBreadth(type, index);
    }

    WL.scene.pp_getComponentDepth = function (type, index) {
        return WL.scene.pp_getRoot().pp_getComponentHierarchyDepth(type, index);
    }

    WL.scene.pp_getComponents = function (type) {
        return WL.scene.pp_getComponentsBreadth(type);
    }

    WL.scene.pp_getComponentsBreadth = function (type) {
        return WL.scene.pp_getRoot().pp_getComponentsHierarchyBreadth(type);
    }

    WL.scene.pp_getComponentsDepth = function (type) {
        return WL.scene.pp_getRoot().pp_getComponentsHierarchyDepth(type);
    }

    //Get By Name

    WL.scene.pp_getObjectByName = function (name) {
        return WL.scene.pp_getObjectByNameBreadth(name);
    }

    WL.scene.pp_getObjectByNameBreadth = function (name) {
        return WL.scene.pp_getRoot().pp_getObjectByNameHierarchyBreadth(name);
    }

    WL.scene.pp_getObjectByNameDepth = function (name) {
        return WL.scene.pp_getRoot().pp_getObjectByNameHierarchyDepth(name);
    }

    WL.scene.pp_getObjectsByName = function (name) {
        return WL.scene.pp_getObjectsByNameBreadth(name);
    }

    WL.scene.pp_getObjectsByNameBreadth = function (name) {
        return WL.scene.pp_getRoot().pp_getObjectsByNameHierarchyBreadth(name);
    }

    WL.scene.pp_getObjectsByNameDepth = function (name) {
        return WL.scene.pp_getRoot().pp_getObjectsByNameHierarchyDepth(name);
    }

    //To String

    WL.scene.pp_toString = function () {
        return WL.scene.pp_toStringCompact();
    }

    WL.scene.pp_toStringCompact = function () {
        return WL.scene.pp_getRoot().pp_toStringCompact();
    }

    WL.scene.pp_toStringExtended = function () {
        return WL.scene.pp_getRoot().pp_toStringExtended();
    }

    //Cauldron

    WL.scene.pp_getComponentAmountMap = function (amountMap = new Map()) {
        return WL.scene.pp_getRoot().pp_getComponentAmountMapHierarchy(amountMap);
    }

}