import { UserClientSide } from './users/schemas/users.schema';

export const MESSAGE_TO_SERVER='messageToServer';
export const MESSAGE_FROM_SERVER='messageFromServer';
export const USER_CONNECTED='userConnected';
export const USER_DISCONNECTED='userDisconnected';
export const CHAT_EXCEPTION='exception';

export const DRAWING_TO_SERVER='drawingToServer';
export const DRAWING_FROM_SERVER='drawingFromServer';
export const SWITCH_COMMAND_TO_SERVER='switchCommandToServer';
export const SWITCH_COMMAND_FROM_SERVER='switchCommandFromServer';
export const SELECT_COMMAND_TO_SERVER='selectCommandToServer';
export const SELECT_COMMAND_FROM_SERVER='selectCommandFromServer';
export const UNSELECT_COMMAND_TO_SERVER='unselectCommandToServer';
export const UNSELECT_COMMAND_FROM_SERVER='unselectCommandFromServer';
export const CHANGE_COMMAND_TO_SERVER='changeCommandToServer';
export const CHANGE_COMMAND_FROM_SERVER='changeCommandFromServer';
export const DELETE_COMMAND_FROM_SERVER='deleteCommandFromServer';
export const DELETE_COMMAND_TO_SERVER='deleteCommandToServer';
export const MESSAGE_TO_SERVER_IN_DRAWING='messageToServerInDrawing';
export const MESSAGE_FROM_SERVER_IN_DRAWING='messageFromServerInDrawing';
export const DRAWING_EXCEPTION='exception';


export const MIME_TYPES = ['image/jpg', 'image/jpeg', 'image/png'];


export const DATABASE_PASSWORD = 'Q1FjrHSmgJ0edvcR';
export const JWT_SECRET = 'FcCs2FtxGHtZGTYD4Sr4444DtMcxfCamw6nNLxaC';

export const MAX_USERNAME_LENGTH = 12;
export const MIN_USERNAME_LENGTH = 1;

export const MAX_ALBUM_NAME = 15;
export const MAX_ALBUM_DESCRIPTION = 200;

export const MAX_ROOM_NAME = 15;

export const MAX_DRAWING_NAME = 15;

export const MAIN_ROOM = 'Principal';

export const MAIN_ALBUM = 'Public';

export const AVATAR_FOLDER = './avatar';

export const DEFAULT_AVATAR_FOLDER = './default_avatar';

export const DEFAULT_AVATAR = './default_avatar/default_01.png';

export const ALL_DEFAULT_AVATAR = ['default_01.png', 'default_02.png', 'default_03.png', 'default_04.png', 'default_05.png', 'default_06.png', 'default_07.png', 'default_08.png', 'default_09.png'];


export const AVATAR_SIZE_LIMIT = 5000;

export const DEFAULT_DRAWING_PICTURE = './drawing/default_drawing.png';
export const DRAWING_FOLDER='./drawing';

export const DEFAULT_CONCOURS_PICTURE = './concours/default_concours.png';
export const CONCOURS_FOLDER='./concours';

export const unauthorizedChat = {statusCode: '401', error:'Unauthorized', message: 'Forbidden resource'};
export const badrequestChat = {statusCode: '400', error: 'Bad request', message: 'Room don\'t exist'};

export const unauthorizedDrawing = {statusCode: '401', error:'Unauthorized', message: 'Forbidden resource'};
export const badrequestDrawing = {statusCode: '400', error: 'Bad request', message: 'Drawing don\'t exist'};


export class DrawingInfo{
    userdata: UserClientSide;
    drawingID: string;
}


export const CONCOURS_THEME = ['Jambon', 'Poulet', 'Tofu', 'Porc', 'Truite', 'Saumon', 'Thon', 'Veau', 'Agneau', 'Côtelette'];

export const CONCOURS_TIME= '0 */20 * * * *';

export const CONCOURS_TIME_UPDATE= '10 */20 * * * *';

export const DRAWING_SIZE_LIMIT = 800;



export const SALT_VALUE=12;

export const MAX_VOTE_PER_WEEK = 5;
export const MAX_CONCOURS_POST_PER_WEEK = 1;


//TOOL
const DASH_FREQ = 10;
export const LINE_DASH_OFFSET = 10;
export const LINE: number[] = [];
export const PERIMETER_STROKE_SIZE = 2;
export const DASH: number[] = [DASH_FREQ, DASH_FREQ];
export const DEFAULT_WIDTH = 1210;
export const DEFAULT_HEIGHT = 800;
export const BIGGEST_LETTER = 'Mg';
export const INTERLINE = 1;
export const PADDING = 10;

export const GIF_FOLDER = './gif';
export const DEFAULT_GIF_PICTURE = './gif/default_gif.gif';
