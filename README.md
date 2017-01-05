
<!--#echo json="package.json" key="name" underline="=" -->
read-files-assoc
================
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
Read multiple files, deliver their contents in a dictionary with keys
defaulting to the filenames.
<!--/#echo -->


Usage
-----
see [doc/demo/usage.js](doc/demo/usage.js)
:TODO:

<!--!#include file="test/usage.js" start="  //#u" stop="  //#r"
  outdent="  " code="javascript" -->
```javascript
var read-files-assoc = require('read-files-assoc');
D.result  = read-files-assoc(null);
D.expect('===',           null);
```
<!--/include-->

```bash
$ read-files-assoc foo
bar
```


<!--#toc stop="scan" -->


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
