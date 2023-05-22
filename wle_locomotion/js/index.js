/**
 * /!\ This file is auto-generated.
 *
 * This is the entry point of your standalone application.
 *
 * There are multiple tags used by the editor to inject code automatically:
 *     - `wle:auto-imports:start` and `wle:auto-imports:end`: The list of import statements
 *     - `wle:auto-register:start` and `wle:auto-register:end`: The list of component to register
 *     - `wle:auto-constants:start` and `wle:auto-constants:end`: The project's constants,
 *        such as the project's name, whether it should use the physx runtime, etc...
 *     - `wle:auto-benchmark:start` and `wle:auto-benchmark:end`: Append the benchmarking code
 */

/* wle:auto-imports:start */
import {MouseLookComponent} from '@wonderlandengine/components';
import {AIMovementComponent} from './cauldron/components/ai_movement_component.js';
import {CharacterSpawnerComponent} from './cauldron/components/character_spawner_component.js';
import {ExampleEasyTuneVariablesComponent} from './cauldron/components/example_easy_tune_variables_component.js';
import {RemoveMainEngineComponent} from './cauldron/components/remove_main_engine_component.js';
import {StickMovementComponent} from './cauldron/components/stick_movement_component.js';
import {AdjustHierarchyPhysXScaleComponent} from './pp/index.js';
import {BenchmarkMaxPhysXComponent} from './pp/index.js';
import {BenchmarkMaxVisibleTrianglesComponent} from './pp/index.js';
import {ConsoleVRToolComponent} from './pp/index.js';
import {CopyHandTransformComponent} from './pp/index.js';
import {CopyPlayerPivotTransformComponent} from './pp/index.js';
import {DebugTransformComponent} from './pp/index.js';
import {EasyTuneToolComponent} from './pp/index.js';
import {GamepadControlSchemeComponent} from './pp/index.js';
import {GamepadMeshAnimatorComponent} from './pp/index.js';
import {PPGatewayComponent} from './pp/index.js';
import {PlayerLocomotionComponent} from './pp/index.js';
import {SetActiveComponent} from './pp/index.js';
import {SetHandLocalTransformComponent} from './pp/index.js';
import {SetHeadLocalTransformComponent} from './pp/index.js';
import {SetTrackedHandJointLocalTransformComponent} from './pp/index.js';
import {ShowFPSComponent} from './pp/index.js';
import {SpatialAudioListenerComponent} from './pp/index.js';
import {SwitchHandObjectComponent} from './pp/index.js';
import {ToolCursorComponent} from './pp/index.js';
import {TrackedHandDrawAllJointsComponent} from './pp/index.js';
import {TrackedHandDrawSkinComponent} from './pp/index.js';
import {VirtualGamepadComponent} from './pp/index.js';
import {BulletThroughWallTestComponent} from './test/components/bullet_through_wall_test_component.js';
import {GamepadButtonDisplayComponent} from './test/components/gamepad_button_display_component.js';
import {InvertedSphereComponent} from './test/components/inverted_sphere_component.js';
import {MovingPhysXTestComponent} from './test/components/moving_physx_test_component.js';
import {RaycastTestComponent} from './test/components/raycast_test_component.js';
import {ResetTransformComponent} from './test/components/reset_transform_component.js';
import {ShowMeshedLineComponent} from './test/components/show_meshed_line_component.js';
import {ShowTorusComponent} from './test/components/show_torus_component.js';
import {ToggleActiveComponent} from './test/components/toggle_active_component.js';
import {VecCreateCountComponent} from './test/components/vec_create_count_component.js';
/* wle:auto-imports:end */

import { loadRuntime } from '@wonderlandengine/api';

/* wle:auto-constants:start */
const RuntimeOptions = {
    physx: true,
    loader: false,
    xrFramebufferScaleFactor: 1,
    canvas: 'canvas',
};
const Constants = {
    ProjectName: 'wle_locomotion',
    RuntimeBaseName: 'WonderlandRuntime',
    WebXRRequiredFeatures: ['local','local-floor',],
    WebXROptionalFeatures: ['local','local-floor','hand-tracking',],
};
/* wle:auto-constants:end */

const engine = await loadRuntime(Constants.RuntimeBaseName, RuntimeOptions);

engine.onSceneLoaded.once(() => {
    const el = document.getElementById('version');
    if (el) setTimeout(() => el.remove(), 2000);
});

/* WebXR setup. */

function requestSession(mode) {
    engine
        .requestXRSession(mode, Constants.WebXRRequiredFeatures, Constants.WebXROptionalFeatures)
        .catch((e) => console.error(e));
}

function setupButtonsXR() {
    /* Setup AR / VR buttons */
    const arButton = document.getElementById('ar-button');
    if (arButton) {
        arButton.dataset.supported = engine.arSupported;
        arButton.addEventListener('click', () => requestSession('immersive-ar'));
    }
    const vrButton = document.getElementById('vr-button');
    if (vrButton) {
        vrButton.dataset.supported = engine.vrSupported;
        vrButton.addEventListener('click', () => requestSession('immersive-vr'));
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('load', setupButtonsXR);
} else {
    setupButtonsXR();
}

/* wle:auto-register:start */
engine.registerComponent(MouseLookComponent);
engine.registerComponent(AIMovementComponent);
engine.registerComponent(CharacterSpawnerComponent);
engine.registerComponent(ExampleEasyTuneVariablesComponent);
engine.registerComponent(RemoveMainEngineComponent);
engine.registerComponent(StickMovementComponent);
engine.registerComponent(AdjustHierarchyPhysXScaleComponent);
engine.registerComponent(BenchmarkMaxPhysXComponent);
engine.registerComponent(BenchmarkMaxVisibleTrianglesComponent);
engine.registerComponent(ConsoleVRToolComponent);
engine.registerComponent(CopyHandTransformComponent);
engine.registerComponent(CopyPlayerPivotTransformComponent);
engine.registerComponent(DebugTransformComponent);
engine.registerComponent(EasyTuneToolComponent);
engine.registerComponent(GamepadControlSchemeComponent);
engine.registerComponent(GamepadMeshAnimatorComponent);
engine.registerComponent(PPGatewayComponent);
engine.registerComponent(PlayerLocomotionComponent);
engine.registerComponent(SetActiveComponent);
engine.registerComponent(SetHandLocalTransformComponent);
engine.registerComponent(SetHeadLocalTransformComponent);
engine.registerComponent(SetTrackedHandJointLocalTransformComponent);
engine.registerComponent(ShowFPSComponent);
engine.registerComponent(SpatialAudioListenerComponent);
engine.registerComponent(SwitchHandObjectComponent);
engine.registerComponent(ToolCursorComponent);
engine.registerComponent(TrackedHandDrawAllJointsComponent);
engine.registerComponent(TrackedHandDrawSkinComponent);
engine.registerComponent(VirtualGamepadComponent);
engine.registerComponent(BulletThroughWallTestComponent);
engine.registerComponent(GamepadButtonDisplayComponent);
engine.registerComponent(InvertedSphereComponent);
engine.registerComponent(MovingPhysXTestComponent);
engine.registerComponent(RaycastTestComponent);
engine.registerComponent(ResetTransformComponent);
engine.registerComponent(ShowMeshedLineComponent);
engine.registerComponent(ShowTorusComponent);
engine.registerComponent(ToggleActiveComponent);
engine.registerComponent(VecCreateCountComponent);
/* wle:auto-register:end */

engine.scene.load(`${Constants.ProjectName}.bin`);

/* wle:auto-benchmark:start */
/* wle:auto-benchmark:end */
