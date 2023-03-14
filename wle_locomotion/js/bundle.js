//WLE 

require('@wonderlandengine/components/8thwall-camera');
require('@wonderlandengine/components/cursor-target');
require('@wonderlandengine/components/cursor');
require('@wonderlandengine/components/debug-object');
require('@wonderlandengine/components/device-orientation-look');
require('@wonderlandengine/components/finger-cursor');
require('@wonderlandengine/components/fixed-foveation');
require('@wonderlandengine/components/hand-tracking');
require('@wonderlandengine/components/hit-test-location');
require('@wonderlandengine/components/howler-audio-listener');
require('@wonderlandengine/components/howler-audio-source');
require('@wonderlandengine/components/image-texture');
require('@wonderlandengine/components/mouse-look');
//require('@wonderlandengine/components/player-height'); 
require('@wonderlandengine/components/target-framerate');
require('@wonderlandengine/components/teleport');
require('@wonderlandengine/components/two-joint-ik-solver');
require('@wonderlandengine/components/video-texture');
require('@wonderlandengine/components/vr-mode-active-switch');
require('@wonderlandengine/components/wasd-controls');
require('@wonderlandengine/components/wonderleap-ad');

require("./pp/bundle");

//CAULDRON

require('./cauldron/toggle_require_mouse_down');
require('./cauldron/character_spawner');
require('./cauldron/ai_movement');
require('./cauldron/stick_movement');

//TEST

require('./test/raycast_test');
require('./test/moving_physx_test');
require('./test/bullet_through_wall_test');
require('./test/reset_transform');
require('./test/touch_start_test');
require('./test/vec_create_count');
require('./test/vec3_function_count');
require('./test/show_line_test');
require('./test/inverted_sphere');
require('./test/show_torus');
require('./test/toggle_active');
require('./test/test_tracked_hand_draw_joints');
require('./test/gamepad_button_display');
require('./test/show_meshed_line');
require('./test/pulse_on_button');
require('./test/move_static_collider');
require('./test/clone_object');
require('./test/test_get_transform_local');
require('./test/test_pp_analyzer_overhead');