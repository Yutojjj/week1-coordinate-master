export const BLOCK_COLORS = {
  set_coordinate: 200,
  change_coordinate: 160,
  control: 260,
  number: 280,
  events: 60,
  functions: 290,
};

export const STAGE_BLOCK_LIST = {
  "1-1-1": ["set_x", "set_y", "change_x", "change_y"],
  "1-1-2": ["set_x", "set_y", "change_x", "change_y", "wait"],
  "1-1-3": ["set_x", "set_y", "change_x", "change_y", "wait", "repeat"],
  "1-2-1": ["set_x", "set_y", "change_x", "change_y", "wait"],
  "1-2-2": ["set_x", "set_y", "change_x", "change_y", "wait", "repeat"],
  "2-1-1": ["point_in_direction", "move_steps", "wait"],
  "2-1-2": ["point_towards", "wait"],
  "2-2-1": ["point_towards", "move_steps", "wait"],
  "2-2-2": ["point_towards", "move_steps", "wait", "repeat_times"],
  "3-1-1": ["event_when_key_pressed", "change_x_event"],
  "3-1-2": ["event_when_key_pressed", "change_x_event", "change_y_event"],
  "3-2-1": ["event_when_sprite_clicked", "cast_barrier"],
  "3-2-2": ["event_when_key_pressed", "change_x_event", "change_y_event", "event_when_sprite_clicked", "cast_barrier"],
};