/*
Command is responsible for the action executed by the plugin
*/

import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertOnThisPageCommand extends Command {

    execute() {
        const editor = this.editor;
        const root = editor.model.document.getRoot();
        //Creates a range inside the given element which starts before the 
        //first child of that element and ends after the last child of that element.
        const range = editor.model.createRangeIn(root);
        //container for heading objects
        const headings = [];

        // Iternate through all children and remove existing instances
        // of 'onThisPage' - this will ensure only one instances will
        // exist on the page. Clicking the 'onThisPage' button effectively
        // refreshes the component and ensure a singular instance of it

        let children = root.getChildren();
        for (let child of children) {
            console.log("CHILD: ")
            console.log(child)
            if (child.name.match(/^onThisPage/)) {
                editor.model.change(writer => {
                    writer.remove(child);
                });
            }
        }

        // Iterate through all elements in the document and get H2 headings.
        // Note that "heading1" in the CKEditor model refers to H2:
        // https://ckeditor.com/docs/ckeditor5/latest/features/headings.html
        for (const value of range.getWalker({ ignoreElementEnd: true })) {
            if (value.item.is("element") && value.item.name.match(/^heading1/)) {
                headings.unshift({
                    id: value.item.getAttribute("id"),
                    text: value.item.getChild(0)?.data,
                });
            }
        }

        // Insert the On this Page heading and a list of links
        editor.model.change((writer) => {
            const onThisPageContainer = writer.createElement("onThisPage");
            const onThisPageHeading = writer.createElement("onThisPageTitle");
            writer.appendText("On this page", onThisPageHeading);
            writer.append(onThisPageHeading, onThisPageContainer);
            const onThisPageList = writer.createElement("onThisPageList");

            for (const header of headings) {
                const listItem = writer.createElement("listItem", {
                    listType: "bulleted",
                    listIndent: 0,
                });

                writer.appendText(
                    header?.text?.toString(),
                    { linkHref: `#${header?.id}` },
                    listItem
                );

                writer.insert(listItem, onThisPageList);
            }

            writer.append(onThisPageList, onThisPageContainer);
            //insert at top of page
            writer.insert(onThisPageContainer, root);
        });

    }

    refresh() {
        const editor = this.editor;
        const root = editor.model.document.getRoot();
        const range = editor.model.createRangeIn(root);
        const headings = [];

        for (const value of range.getWalker({ ignoreElementEnd: true })) {
            if (value.item.is("element") && value.item.name.match(/^heading1/)) {
                headings.unshift({
                    id: value.item.getAttribute("id"),
                    text: value.item.getChild(0)?.data,
                });
            }
        }

        // Disable the OnThisPage command if there are no headings in the model
        this.isEnabled = headings?.length > 0;
    }
}