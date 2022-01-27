import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
//used during upcasting / downcasting on the data to make fields editable
//viewToModelPositionOutsideModelElement -- this fixes a drag and drop mapping error
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import PlaceholderCommand from './placeholdercommand';  
import './theme/placeholder.css';

export default class PlaceholderEditing extends Plugin {

    static get requires() {
        return [Widget];
    }

    init() {
        console.log('PlaceholderEditing#init() got called');

        this._defineSchema();
        this._defineConverters();
        //Add commands
        this.editor.commands.add( 'placeholder', new PlaceholderCommand( this.editor ) );

        // ADDED - fix out of bounds mapping error
        this.editor.editing.mapper.on(
            'viewToModelPosition',
            viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'placeholder' ) )
        );

        // This defines the 'placeholder' configuration
        this.editor.config.define( 'placeholderConfig', {
            types: [ 'date', 'first name', 'surname' ]
        } );

    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register('placeholder', {
            // Allow wherever text is allowed:
            allowWhere: '$text',

            // The placeholder will act as an inline node:
            isInline: true,

            // The inline widget is self-contained so it cannot be split by the caret and can be selected:
            isObject: true,

            // The inline widget can have the same attributes as text (for example linkHref, bold).
            allowAttributesOf: '$text',

            // The placeholder can have many types, like date, name, surname, etc:
            allowAttributes: ['name']
        });
    }

    _defineConverters() {                                                      // ADDED
        const conversion = this.editor.conversion;

        conversion.for('upcast').elementToElement({
            view: {
                name: 'span',
                classes: ['placeholder']
            },
            model: (viewElement, { writer: modelWriter }) => {
                // Extract the "name" from "{name}".
                const name = viewElement.getChild(0).data.slice(1, -1);

                return modelWriter.createElement('placeholder', { name });
            }
        });

        conversion.for('editingDowncast').elementToElement({
            model: 'placeholder',
            view: (modelItem, { writer: viewWriter }) => {
                const widgetElement = createPlaceholderView(modelItem, viewWriter);

                // Enable widget handling on a placeholder element inside the editing view.
                return toWidget(widgetElement, viewWriter);
            }
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'placeholder',
            view: (modelItem, { writer: viewWriter }) => createPlaceholderView(modelItem, viewWriter)
        });

        // Helper method for both downcast converters.
        function createPlaceholderView(modelItem, viewWriter) {
            const name = modelItem.getAttribute('name');

            const placeholderView = viewWriter.createContainerElement('span', {
                class: 'placeholder'
            }, {
                isAllowedInsideAttributeElement: true
            });

            // Insert the placeholder name (as a text).
            const innerText = viewWriter.createText('{' + name + '}');
            viewWriter.insert(viewWriter.createPositionAt(placeholderView, 0), innerText);

            return placeholderView;
        }
    }
}