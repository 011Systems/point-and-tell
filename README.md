# point-and-tell

  Help system / page guide

## Installation

  ```
  <script src="PATH_TO_FILE/Help.js"></script>
  ```
## Usage

  In your .js file init library
  ```
  var help = new Help();
  help.init();
  ```
  Connect HTML element with content from help.md
  ```
  Help.Attach(ELEMENT, CONTENT_ID_FROM_MD_FILE);
  ```
  add button to HTML to activate point-and-tell
  <button onclick="help.activate().helpEvent(null);">HELP</button>

## Hello World Example - check directory 'example'
  index.html
  ```
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>Example</title>
    <link href="https://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet">
    <link href="../Help.css" rel="stylesheet">
    <link href="example.css" rel="stylesheet">
  </head>
  <body>
  <button class="helpButton" onclick="help.activate().helpEvent(null);" id="help">HELP</button>
  <header>
    <div class="container">
      <h1 id="pageTitle">Page Title</h1>
    </div>
  </header>
  </div>
  <script src="../Help.js"></script>
  <script>
    var pageTitle = document.getElementById('pageTitle');
    Help.Attach(pageTitle, 'pageTitle');
    var help = new Help();
    help.init();
  </script>
  </body>
  </html>
  ```
  help.md
  ```
  #help
  = Help System

  <div style='background:beige'>
  Click [:Info->Help:] or hit |F1| to activate help.
  Then hover mouse over views and controls to get help for that element.
  Click anywhere outside this box or hit any button to deactivate help.
  </div>

  ---

  Short Help System Description

  == Getting Started

  About Help System Copy


  #help::mobile
  = Help System Mobile

  Tap on an element to get help for that element.

  #pageTitle
   = Page Title

  Page Title
  ```
## License
### ISC
https://en.wikipedia.org/wiki/ISC_license