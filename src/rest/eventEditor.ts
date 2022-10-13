import Debug from 'debug';
import { Observer, Subject } from 'rxjs';

import { RestClient } from './restClient';

const debug = Debug('rsvp:editor');

type EventEditorConfig = {
  accessToken?: string;
  serverName: string;
}

export class EventEditor extends RestClient {
  outgoingEdits: Map<number, Subject<string>>;

  constructor(config: EventEditorConfig) {
    super(config);
    this.outgoingEdits = new Map();
  }

  getEventEditor(eventId: number): Observer<string> {
    let editor = this.outgoingEdits.get(eventId);
    if (!editor) {
      editor = new Subject<string>();
      editor.subscribe((desc: string) => {
        const url = `${this.serverName}/event/edit/${eventId}`
        debug('edit event', url);
        this.post(url, { descriptionMd: desc } )
          .catch(e => {
            const msg =
              'Please save your edit locally and contact your event admin.'
              + '\n\nCannot save event description:\n\n'
              + e;
            window.alert(msg);
            console.error(msg);
          });
      });
      this.outgoingEdits.set(eventId, editor);
    }
    return editor;
  }
}