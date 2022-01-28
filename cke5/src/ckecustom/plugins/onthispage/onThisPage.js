import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import OnThisPageEditing from './onThisPageEditing';
import OnThisPageUI  from './onThisPageUI';

/*
The purpose of the "onThisPage" plugin is to parse through the CKEditor
input field and look for h2 elements. The h2 elements onload will be assigned
and ID with the value equivalent to the value of the h2 element. This is
will then be used as a target and the 'onThisPage' plugin will then generate
a list of links which will take the user to the h2 anchors
*/
//get required plugins
export default class OnThisPage extends Plugin{
    static get requires(){
        return[OnThisPageEditing, OnThisPageUI];
    }
}