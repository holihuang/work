import { handleActions } from 'redux-actions';
import { MYROOM_SUMMARY_SUCCEEDED, MYROOM_SUMMARY_FAILED, MYROOM_DELETE_SUCCEEDED, MYROOM_DELETE_FAILED } from '../constants/home';
import { Toast } from 'antd-mobile';

export default handleActions({
    [MYROOM_SUMMARY_SUCCEEDED](state, action) {
        const { roomList } = action;
        return {...state, roomList};
    },
    [MYROOM_SUMMARY_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    },
    [MYROOM_DELETE_SUCCEEDED](state, action) {
        const { deleteId } = action;
        //得到被删除的预定的id
        //手动删除state中会议室列表中对应的会议
        let roomList = Array.prototype.concat(state.roomList);
        let deleteIndex = -1;
        roomList.forEach( (room, index) => {
            if(room.reserveInfo.reserveId == deleteId) {
                deleteIndex = index
            }
        })
        if(deleteIndex > -1) {
            roomList.splice(deleteIndex, 1)
        }
        return {...state, roomList}
    },
    [MYROOM_DELETE_FAILED](state, action) {
        Toast.info(action.message);
        return state;
    }
}, {
    roomList: []
})
