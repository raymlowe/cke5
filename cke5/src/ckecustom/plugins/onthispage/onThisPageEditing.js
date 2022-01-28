import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
//widget imports are used during upcasting / downcasting to make items editable
import {
    toWidget,
    toWidgetEditable,
} from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import InsertOnThisPageCommand from './insertOnThisPageCommand';

export default class OnThisPageEditing extends Plugin {

    //we just always need this
    static get requires() {
        return [Widget];
    }

    init() {
        console.log('onThisPageEditing#inkt() got called')

        const editor = this.editor;
        const conversion = editor.conversion;
        const schema = editor.model.schema;
        const headings = editor.config.get("heading").options;

        //execute conversion on init
        this._setupConversion(conversion, schema, headings);
        //define and configure elements
        this._defineSchema();
        this._defineConverters();

        //add command - 
        editor.commands.add(
            "insertOnThisPage",
            new InsertOnThisPageCommand(editor)
          );

    }

    //configuration for elements of this plugin component
    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register('onThisPage', {
            // Behaves like a self-contained object
            isObject: true,

            //Allow in places where other blocks are allowed
            allowIn: "$block",
        });

        schema.register('onThisPageTitle', {
            // Cannot be split or left by the caret.
            isLimit: true,

            allowIn: 'onThisPage',

            // Allow heading
            allowContentOf: 'heading1'
        });

        schema.register('onThisPageList', {
            // Cannot be split or left by the caret.
            isLimit: true,

            allowIn: 'onThisPage',

            // Allow content which is allowed in the root (e.g. paragraphs).
            allowContentOf: '$root'
        });

        //Disallow the inclusing on a on this page plugin within an on this page list
        schema.addChildCheck((context, childDefinition) => {
            if (context.endsWith('onThisPageList') && childDefinition.name == 'onThisPage') {
                return false;
            }
        });

    }

    //Set up conversions for upcasting / downcasting
    _defineConverters() {
        const conversion = this.editor.conversion;

        //onThisPage converters
        //configs to upcast to CKE data
        conversion.for('upcast').elementToElement({
            model: 'onThisPage',
            view: {
                name: 'section',
                classes: 'on-this-page'
            }
        });
        //configs for downcast to CKE view 
        conversion.for('downcast').elementToElement({
            model: 'onThisPage',
            view: {
                name: 'section',
                classes: 'on-this-page'
            }
        });
        //editing downcast
        conversion.for('editingDowncast').elementToElement({
            model: 'onThisPage',
            view: (modelElement, { writer: viewWriter }) => {
                const section = viewWriter.createContainerElement('section', { class: 'on-this-page' });
                return toWidget(section, viewWriter, { label: "On This Page Widget" });
            }
        });

        //onThisPage Title converters
        //This gets cast from h2 to "onThisPageTitle"
        conversion.for("upcast").elementToElement({
            model: "onThisPageTitle",
            view: {
                name: "h2",
                classes: "on-this-page-title",
            },
        });
        conversion.for("dataDowncast").elementToElement({
            model: "onThisPageTitle",
            view: {
                name: "h2",
                classes: "on-this-page-title",
            },
        });
        conversion.for("editingDowncast").elementToElement({
            model: "onThisPageTitle",
            view: (modelElement, { writer: viewWriter }) => {
                // Note: You use a more specialized createEditableElement() method here.
                const h2 = viewWriter.createEditableElement("h2", {
                    class: "on-this-page-title",
                });

                // use toWidgetEditable to switch to contentEditable=true
                return toWidgetEditable(h2, viewWriter);
            },
        });

        // <onThisPageList> converters
        conversion.for("upcast").elementToElement({
            model: "onThisPageList",
            view: {
                name: "div",
                classes: "on-this-page-list",
            },
        });
        conversion.for("dataDowncast").elementToElement({
            model: "onThisPageList",
            view: {
                name: "div",
                classes: "on-this-page-list",
            },
        });
        conversion.for("editingDowncast").elementToElement({
            model: "onThisPageList",
            view: (modelElement, { writer: viewWriter }) => {
                // Note: You use a more specialized createEditableElement() method here.
                const div = viewWriter.createEditableElement("div", {
                    class: "on-this-page-list",
                });

                // use toWidgetEditable to switch to contentEditable=true
                return toWidgetEditable(div, viewWriter);
            },
        });
    }

    //This is triggered on init()
    //On Downcast, we want to set the 'id' attribute to the same value as the heading text
    _setupConversion(conversion, schema, headings) {
        conversion.attributeToAttribute({ model: "id", view: "id" });

        // Extend conversion only for headings.
        for (const heading of headings) {
            if (heading.model.match(/^heading1/)) {
                schema.extend(heading.model, { allowAttributes: ["id"] });

                conversion.for("downcast").add((dispatcher) => {
                    dispatcher.on(
                        `insert:${heading.model}`,
                        (evt, data, conversionApi) => {
                            const modelElement = data.item;
                            const headingText = modelElement?._children?._nodes?.[0]?._data;
                            const id = headingText
                                ?.toString()
                                ?.toLowerCase()
                                ?.replace(/[^\w\s]/gi, "") // Remove non-alphanumeric chars, preserve spaces
                                ?.split(" ")
                                ?.join("-");

                            // Set attribute on the view element
                            conversionApi.writer.setAttribute(
                                "id",
                                id,
                                conversionApi.mapper.toViewElement(modelElement)
                            );
                            // Set attribute on the model element
                            conversionApi.writer.setAttribute("id", id, modelElement);
                        },
                        { priority: "low" }
                    );
                });
            }
        }
    }
}