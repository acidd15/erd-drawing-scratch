export enum State {
    SELECT = 1,
    ADD_ENTITY,
    ADD_RELATION
};

export enum EventType {
    EVT_EDIT_ENTITY
};

export enum DragState {
    READY,
    DRAGGING,
    ENDED
};

export enum Direction {
    NONE,
    LEFT,
    TOP,
    BOTTOM,
    RIGHT,
    LEFT_TOP,
    LEFT_BOTTOM,
    RIGHT_TOP,
    RIGHT_BOTTOM
}