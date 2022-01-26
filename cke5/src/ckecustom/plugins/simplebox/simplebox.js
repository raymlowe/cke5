import SimpleBoxEditing from '../simplebox/simpleboxediting';
import SimpleBoxUI from '../simplebox/simpleboxui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

//Load the editing and UI parts
export default class SimpleBox extends Plugin {
    static get requires() {
        return [SimpleBoxEditing, SimpleBoxUI];
    }
}