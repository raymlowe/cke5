import React, { Component } from "react";
import styled from "styled-components";
import { CKEditor } from '@ckeditor/ckeditor5-react';

// NOTE: Use the editor from source (not a build)!
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import List from "@ckeditor/ckeditor5-list/src/list";
import Link from "@ckeditor/ckeditor5-link/src/link";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";

import SimpleBox from "./ckecustom/plugins/simplebox/simplebox";

const editorConfiguration = {
  plugins: [Essentials, Bold, Italic, Link, List, SimpleBox, Heading],
  toolbar: ["heading", "bold", "italic", "bulletedList", "numberedList", "link", "simpleBox"]
};

const WYSIWYG = styled.div`
.simple-box {
  padding: 10px;
  margin: 1em 0;

  background: rgba( 0, 0, 0, 0.1 );
  border: solid 1px hsl(0, 0%, 77%);
  border-radius: 2px;
}

.simple-box-title, .simple-box-description {
  padding: 10px;
  margin: 0;

  background: #FFF;
  border: solid 1px hsl(0, 0%, 77%);
}

.simple-box-title {
  margin-bottom: 10px;
}
`


class App extends Component {
  render() {
    return (
      <WYSIWYG>
        <div className="App">
          <h2>Using CKEditor 5 build in React</h2>
          <CKEditor
            editor={ClassicEditor}
            config={editorConfiguration}
            data="<p>Hello from CKEditor 5!</p>"
            onReady={editor => {
              // You can store the "editor" and use when it is needed.
              console.log('Editor is ready to use!', editor);
            }}
            onChange={(event, editor) => {
              const data = editor.getData();
              console.log({ event, editor, data });
            }}
            onBlur={(event, editor) => {
              console.log('Blur.', editor);
            }}
            onFocus={(event, editor) => {
              console.log('Focus.', editor);
            }}
          />
        </div>
      </WYSIWYG>
    );
  }
}
export default App;