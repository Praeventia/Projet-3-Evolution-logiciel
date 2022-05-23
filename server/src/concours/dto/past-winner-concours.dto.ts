import { ConcoursWeek } from '../schema/concours-week.schema';
import { ConcoursEntryToClient } from './concours-entry-to-client.dto';

export class PastWinnerConcours {
    concoursWeek: ConcoursWeek;
    winner: ConcoursEntryToClient[];
}