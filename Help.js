/** @fileoverview Help.js
 
 g_app.help.activate().helpEvent(null);
 
 tt.Help.Attach(element,'help-id')
 
 =============================================================================*/
"use strict";

var Help=function(){}



/**
 @param {Element|string} element
 @param {string} helpid
 */
Help.Attach=function(element,helpid) {
  if(typeof element === 'string') element=$id(element);
  // if(element) element.$help=helpid;
  if(element) element.setAttribute('help',helpid);
}


/**
 @return {Help} - this
 */
Help.prototype.init=function() {
  this.helement=undefined;
  this.selement=undefined;
  
  this.popup=undefined;
  this.hmap=undefined;
  
  this.blanket_div=undefined;
  this.help_div=undefined;
  this.help_content=undefined;
  this.glow_div=undefined;
  
  this.req=undefined;
  this.clazz = 'Help';
  this.activateTime=undefined;
  this.flavor = 'min';
  this.active=false;
  document.body.addEventListener('keydown',function(event) {

    
    if(this.active) {
      event.stopPropagation();event.preventDefault();
      this.deactivate();
      return;
    }
    if(event.keyCode!==112) return; // F1
    this.activate(); //.helpEvent(null);
    event.stopPropagation();event.preventDefault();
  }.bind(this));
  window.addEventListener('resize',this.deactivate.bind(this));

  return this;
}


/**
 @return {undefined}
 */
Help.prototype.destroy=function() {
  this.deactivate();
}


/**
 @return {Help} - this
 */
Help.prototype.activate=function() {
  
  if(this.active) return;
  
  console.debug("HELP: ACTIVE");
  if(!this.hmap) this.load();
  
  this.active=true;
  this.activateTime=new Date;
  this.helement=undefined;
  
  var x=this.blanket_div=document.createElement('div');
  x.className=this.clazz+'_blanket';
  document.body.appendChild(x);
  if(navigator.isMobile()) {
    x.ontouchstart=function() {
      this.helpEvent(event);
    }.bind(this);
    x.ontouchmove=function(event) {
      this.helpEvent(event);
    }.bind(this);
  } else {
    x.onclick=function() {
      this.deactivate();
    }.bind(this);
    x.onmousemove=function(event) {

      this.helpEvent(event);
    }.bind(this);
  }
  window.addEventListener("scroll", function(event) {

    this.highlight(null);
  }.bind(this));
  
  
  var y=this.help_div=document.createElement('div');
  y.className=this.clazz+'_help'+' '+this.clazz+'_f_'+this.flavor; //g_app.flavor
  y.style.display='none';
  if(navigator.isMobile()) {
    y.ontouchstart=y.ontouchmove=function(event) {
      event.stopPropagation();
    };
  } else {
    y.onclick=function(event) {
      event.stopPropagation();
    };
  }
  x.appendChild(y);
  
  var z=document.createElement('div');
  z.className=this.clazz+'_content';
  y.appendChild(z);
  this.help_content=z;
  
  var z=document.createElement('div');
  z.className=this.clazz+'_close';
  z.onclick=this.deactivate.bind(this);
  z.ontouchstart=this.deactivate.bind(this);
  y.appendChild(z);
  
  
  var y=this.glow_div=document.createElement('div');
  y.className=this.clazz+'_glow';
  y.style.display='none';
  x.appendChild(y);
  
  this.highlight(null);
  this.show();
  return this;
}


/**
 @return {undefined}
 */
Help.prototype.deactivate=function() {
  if(!this.active) return;
  console.debug("HELP: done");
  this.show(null);
  this.active=false;
  this.helement=undefined;
  this.activateTime=undefined;
  if(this.req) this.req.abort();
  delete this.req;
  document.body.removeChild(this.blanket_div); delete this.blanket_div;
}


/**
 @param {string} str - md
 @return {Object} - hmap
 */
Help.prototype.parse=function(str) {
  var hmap={}, key=null, val='';

  for(var line, cursor=0;
      (line =String.Line(str,cursor))!=null;
      cursor=String.Next(str,cursor)) {
    if(line[0]==='#') {

      if(key) {
        hmap[key]=val.trim();
      }
      key=line.substr(1).trim();
      val='';
    } else {
      val+=line+'\n';
    }
  }
  if(key) {
    hmap[key]=val.trim();
  }
  return hmap;
}


/**
 XHR to load help file
 @return {undefined}
 */
Help.prototype.load=function() {
  if(this.req) return; // already in progress

  var req=this.req=new XMLHttpRequest,
  url='./help.md';
  req.open("POST",url,true);
  req.onreadystatechange=function() {
    if(!req || req.readyState!=req.DONE) return;
    delete this.req;
    if(req.status===200) {
      try {
        this.hmap=this.parse(req.responseText);
        if(this.active && this.helement===undefined) this.show();
      } catch(err) {
        console.error('Error loading help: %s',err.toString());
        this.deactivate();
      }
    } else {
      console.error("Load[%s]: %s",req.status,req.responseText||req.statusText);
      this.deactivate();
    }
  }.bind(this);
  req.send();
}


/**
 @param {Element} element
 @param {string=} css
 @return {string} - hid
 */
Help.prototype.highlight=function(element,css) {
  
  if(element===this.helement)
    return element&&element.getAttribute('help');
  
  var hid=undefined;

  if(!element || !(hid=element.getAttribute('help'))
    || !this.hmap || ( !this.hmap[hid])) {
    // Hide all
    var db=document.body.getBoundingClientRect();
    this.blanket_div.style.borderTopWidth=db.height+'px';
    this.blanket_div.style.borderBottomWidth=0;
    this.blanket_div.style.borderLeftWidth=db.width+'px';
    this.blanket_div.style.borderRightWidth=0;
    
    console.debug("  HH: -");
    
    this.glow_div.style.display='none';
    if(this.helement===undefined && !this.hmap) return hid;
  } else {
    // Make a hole
   
    
    var bb=element.getBoundingClientRect(),
      db=document.body.getBoundingClientRect();
    var    windowHeight = window.innerHeight;
    // var windowWidth = window.innerWidth;
    // var    windowOffsetTop = window.pageYOffset;
    // var    windowOffsetLeft = window.pageXOffset;

    this.blanket_div.style.borderTopWidth=Math.max(0,bb.top)+'px';
    this.blanket_div.style.borderBottomWidth=Math.max(0,windowHeight-bb.top-bb.height)+'px';
    this.blanket_div.style.borderLeftWidth=Math.max(0,bb.left)+'px';
    this.blanket_div.style.borderRightWidth=Math.max(0,db.width-bb.left-bb.width)+'px';
    this.glow_div.style.display=null;
    // this.glow_div.style.top=bb.top+'px';
    this.glow_div.style.top='0px';
    // this.glow_div.style.left=bb.left+'px';
    this.glow_div.style.left='0px';
    this.glow_div.style.width=(bb.width+.49)+'px';
    
    if(bb.top <0){
      this.glow_div.style.height=bb.height+bb.top+'px';
    }else {
      this.glow_div.style.height=bb.height+'px';
    }
    
    this.glow_div.className=this.clazz+'_glow '+(css||'');
  }
  this.helement=element;
  return hid;
}


/**
 @param {Element} e
 @return {boolean}
 */
Help.prototype._isVisible=function(e) {
  var bb=e.getBoundingClientRect();
  if(bb.left+bb.width<=0) return false;
  for(; e; e=e.parentElement)
    if(e.style.display==='none' || e.style.visibility==='hidden') return false;
  return true;
}

/**
 @param {?string} hid
 @param {Element=} context
 @return {?Element} - element
 */
Help.prototype._findHid=function(hid,context) {
  context=context||document;
  // If there is a popup up, check if it has hid
  var popups=context.querySelectorAll('.'+tt.Popup.prototype.clazz+'_blanket'),
    up=false;
  for(var j=0, p; (p=popups[j]); j++) {
    if(p.display==='none') continue;
    var all=p.querySelectorAll('[help]');
    for(var i=0, e; (e=all[i]); i++)
      if(e.getAttribute('help')===hid && this._isVisible(e))
        return e;
    up=true;
  }
  if(up) return null;
  
  // Search all the elements in document
  var all=(context||document).querySelectorAll('[help]');
  for(var i=0, e; (e=all[i]); i++)
    if(e.getAttribute('help')===hid && this._isVisible(e))
      return e;
  
  return null;
}


/**
 @param {?string=} hid
 @param {Element=} element
 */
Help.prototype.show=function(hid,element) {
  var md;
  if(!this.hmap) {
    // md=_("Loading Help...");
    md="Loading Help...";
  } else if(!hid) {
    var hid='help',
      idx=location.pathname.lastIndexOf('/'),
      page=idx>=0?location.pathname.substr(idx+1):'',
      flavor=navigator.isMobile()?'mobile':'full';
    if(idx>=0)
      md=this.hmap['help:'+page+':'+flavor]||
        this.hmap['help:'+page]           ||
        this.hmap['help::'+flavor]        ||
        this.hmap[hid];
    else
      md=this.hmap[hid];
  } else if(this.hmap[hid]) {
    md=this.hmap[hid]||('[help]: '+hid);
  } else {
    md=null;
  }
  if(md) {
    this.help_content.innerHTML=(0&&tt.DEV?hid:'')+this.hmd2html(md);
    this.help_div.style.display=null;
  } else {
    this.help_div.style.display='none';
  }
  if(this.selement!==element) this.help_div.scrollTop='0';
  this.selement=element;
}


/**
 @param {Event=} event
 
 Called on mouse move on blanket div.
 */
Help.prototype.helpEvent=function(event) {

  if(this.timer) {
    clearTimeout(this.timer); delete this.timer;
    // removeClass(this.help_div,this.clazz+'_fadeout');
  }
  
  // Ignore move events immediately after activation
  if(event && ((new Date).getTime()-this.activateTime.getTime())<500) {
    console.debug('IGNORE');
    return;
  }
  
  var element=event&&document.elementFromPoint(event.clientX,event.clientY);
  
  for(; element; element=element.parentElement)
    if(element===this.help_div) {
      this.highlight(this.selement||null);
      return; // Moving inside help div: noop
    }
  
  this.blanket_div.style.visibility='hidden';
  var element=event&&document.elementFromPoint(event.clientX,event.clientY);
  for(; element; element=element.parentElement)
    if(element.getAttribute('help')) break;
  var hid=this.highlight(element);
  
  this.blanket_div.style.visibility=null;
  
  // addClass(this.help_div,this.clazz+'_fadeout');
  this.timer=setTimeout(function() {
    console.debug("TIMEOUT: %s",hid);
    delete this.timer;
    this.show(hid,element);
  }.bind(this), 500);
}


/**
 @param {string} s - help markdown
 @return {string} - html
 */
Help.prototype.hmd2html=function(s) {
  var r=s, ii, pre1=[], pre2=[];
  
  // detect newline format
  var newline=r.indexOf('\r\n')!=-1?'\r\n':r.indexOf('\n')!=-1?'\n':'';
  
  // store {{{ unformatted blocks }}} and <pre> pre-formatted blocks </pre>
  r=r.replace(/{{{([\s\S]*?)}}}/g, function (x) { pre1.push(x.substring(3, x.length - 3)); return '{{{}}}'; });
  r=r.replace(new RegExp('<pre>([\\s\\S]*?)</pre>', 'gi'), function (x) { pre2.push(x.substring(5, x.length - 6)); return '<pre></pre>'; });
  
  // h1 - h4 and hr
  r=r.replace(/^==== (.*)=*/gm, '<h4>$1</h4>');
  r=r.replace(/^=== (.*)=*/gm, '<h3>$1</h3>');
  r=r.replace(/^== (.*)=*/gm, '<h2>$1</h2>');
  r=r.replace(/^= (.*)=*/gm, '<h1>$1</h1>');
  r=r.replace(/^---+/gm, '<hr>');
  
  // unordered lists
  r=r.replace(/^ *\*\*\*\* (.*)/gm, '<ul><ul><ul><ul><li>$1</li></ul></ul></ul></ul>');
  r=r.replace(/^ *\*\*\* (.*)/gm, '<ul><ul><ul><li>$1</li></ul></ul></ul>');
  r=r.replace(/^ *\*\* (.*)/gm, '<ul><ul><li>$1</li></ul></ul>');
  r=r.replace(/^ *\* (.*)/gm, '<ul><li>$1</li></ul>');
  for (ii=0; ii < 3; ii++) r=r.replace(new RegExp('</ul>' + newline + '<ul>', 'g'), newline);
  
  // colors
  r=r.replace(/=(\w+)\|(\w+)=/g, ' <span style="color:$1">$2</span>');
  r=r.replace(/=(\w+)=/g, ' <span style="color:$1">$1</span>');
  r=r.replace(/!(\w+)\|(\w+)!/g, ' <span style="background:$1">$2</span>');
  r=r.replace(/!(\w+)!/g, ' <span style="background:$1">$1</span>');
  
  // links
  r=r.replace(/\[\[(http:[^\]|]+)\]\]/g, '<a target="_blank" href="$1">$1</a>');
  r=r.replace(/\[\[(http:[^\]|]+)\|(.+)\]\]/g, '<a target="_blank" href="$1">$2</a>');
  r=r.replace(/\[\[([^\]|]+)\]\]/g, '<a href="$1">$1</a>');
  r=r.replace(/\[\[([^|]+)\|(.+)\]\]/g, '<a href="$1">$2</a>');
  
  // bold, italics, and code formatting
  r=r.replace(/\[\*([^\|]+)\|([^\]]+)\*\]/g, '<span class="help_ref" onmouseover="GP_HH(event,\'$1\')" onmouseout="GP_HH(event,null)" onmousemove="GP_NOOP(event)" onclick="/*GP_BEEP()*/">$2</span>');
  r=r.replace(/\*([^*]+)\*/g, '<b>$1</b>');
  r=r.replace(/\|\|([^|\[\*]+)\|\|/g, '<button onclick="/*GP_BEEP()*/">$1</button>');
  r=r.replace(/\|([^|\[\*]+)\|/g, '<tt>$1</tt>');
  r=r.replace(/\[:([^\]]+):\]/g, '<em>$1</em>');
  r=r.replace(/\[<([^\]]+)>\]/g, '<span class="box">$1</span>');
  
  // Special chars
  r=r.replace(/->/g, '&#9658;');
  r=r.replace(/<-/g, '&#9668;');
  r=r.replace(/([^-])---([^-])/g, '$1&mdash;$2');
  r=r.replace(/  +$/g, '<br>');
  // r=r.replace(/\*(.*?)\*/g, '<b>$1</b>');
  r=r.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  r=r.replace(new RegExp('//(((?!https?://).)*?)//', 'g'), '<em>$1</em>');
  r=r.replace(/``([^`]+)``/g, '<code>$1</code>');
  
  
  // ordered lists
  // r=r.replace(/^#### (.*)/gm, '<ol><ol><ol><ol><li>$1</li></ol></ol></ol></ol>');
  // r=r.replace(/^### (.*)/gm, '<ol><ol><ol><li>$1</li></ol></ol></ol>');
  // r=r.replace(/^## (.*)/gm, '<ol><ol><li>$1</li></ol></ol>');
  r=r.replace(/^ *[0-9]+\. (.*)/gm, '<ol><li>$1</li></ol>');
  for (ii=0; ii < 3; ii++) r=r.replace(new RegExp('</ol>' + newline + '<ol>', 'g'), newline);
  
  
  // images
  r=r.replace(/{{([^\]| ]+)}}/g, '<img src="$1">');
  r=r.replace(/{{([^ ]+) (.*)}}/g, '<img src="$1" $2>');
  r=r.replace(/{{([^|]+)\|(.+)}}/g, '<img src="$1" alt="$2">');
  
  // video
  r=r.replace(/<<(.*?)>>/g, '<embed class="video" src="$1" allowfullscreen="true" allowscriptaccess="never" type="application/x-shockwave/flash"></embed>');
  
  // hard linebreak if there are 2 or more spaces at the end of a line
  r=r.replace(new RegExp(' + ' + newline, 'g'), '<br>' + newline);
  
  // split on double-newlines, then add paragraph tags when the first tag isn't a block level element
  if(newline!='') for(var p=r.split(newline + newline), i=0; i<p.length; i++) {
    var blockLevel=false;
    if (p[i].length >= 1 && p[i].charAt(0) == '<') {
      // check if the first tag is a block-level element
      var firstSpace=p[i].indexOf(' '), firstCloseTag=p[i].indexOf('>');
      var endIndex=firstSpace > -1 && firstCloseTag > -1 ? Math.min(firstSpace, firstCloseTag) : firstSpace > -1 ? firstSpace : firstCloseTag;
      var tag=p[i].substring(1, endIndex).toLowerCase();
      // for (var j=0; j < blockLevelElements.length; j++) if (blockLevelElements[j] == tag) blockLevel=true;
    } else if (p[i].length >= 1 && p[i].charAt(0) == '|') {
      // format the paragraph as a table
      blockLevel=true;
      p[i]=p[i].replace(/ \|= /g, '</th><th>').replace(/\|= /g, '<tr><th>').replace(/ \|=/g, '</th></tr>');
      p[i]=p[i].replace(/ \| /g, '</td><td>').replace(/\| /g, '<tr><td>').replace(/ \|/g, '</td></tr>');
      p[i]='<table>' + p[i] + '</table>';
    } else if (p[i].length >= 2 && p[i].charAt(0) == '>' && p[i].charAt(1) == ' ') {
      // format the paragraph as a blockquote
      blockLevel=true;
      p[i]='<blockquote>' + p[i].replace(/^> /gm, '') + '</blockquote>';
    }
    if (!blockLevel) p[i]='<p>' + p[i] + '</p>';
  }
  
  // reassemble the paragraphs
  if (newline != '') r=p.join(newline + newline);
  
  // restore the preformatted and unformatted blocks
  r=r.replace(new RegExp('<pre></pre>', 'g'), function (match) { return '<pre>' + pre2.shift() + '</pre>'; });
  r=r.replace(/{{{}}}/g, function (match) { return pre1.shift(); });
  return r;
}


// EOF


//-----------------------------------------------------------------------------
//
//  888b    888                   d8b                   888
//  8888b   888                   Y8P                   888
//  88888b  888                                         888
//  888Y88b 888  8888b.  888  888 888  .d88b.   8888b.  888888 .d88b.  888d888
//  888 Y88b888     "88b 888  888 888 d88P"88b     "88b 888   d88""88b 888P"
//  888  Y88888 .d888888 Y88  88P 888 888  888 .d888888 888   888  888 888
//  888   Y8888 888  888  Y8bd8P  888 Y88b 888 888  888 Y88b. Y88..88P 888
//  888    Y888 "Y888888   Y88P   888  "Y88888 "Y888888  "Y888 "Y88P"  888
//                                         888
//                                    Y8b d88P
//                                     "Y88P"
//
//-----------------------------------------------------------------------------
/**
 @return {boolean}
 */
navigator.isWebKit=function() {
  return navigator.userAgent.indexOf('WebKit')!==-1;
  // return navigator.userAgent.indexOf('AppleWebKit')!==-1;
}

/**
 @return {boolean}
 */
navigator.isChrome=function() {
  // return Boolean(window.chrome);
  return navigator.vendor=="Google Inc.";
}

/**
 @return {boolean}
 */
navigator.isSafari=function() {
  return navigator.vendor==="Apple Computer, Inc.";
}

/**
 @return {boolean}
 */
navigator.isMozilla=function() {
  var useragent = navigator.userAgent;
  return useragent.indexOf('Firefox')!==-1 && useragent.indexOf('Edge')===-1;
}

/**
 @return {boolean}
 */
navigator.isEdge=function() {
  var useragent = navigator.userAgent;
  return useragent.indexOf('Edge')!==-1;
}

/**
 @return {boolean}
 */
navigator.isPhone=function() {
  var useragent = navigator.userAgent;
  return useragent.indexOf('iPhone')!==-1 || useragent.indexOf('Android')!==-1;
}

/**
 @return {boolean}
 */
navigator.isTablet=function() {
  var useragent = navigator.userAgent;
  return useragent.indexOf('iPad')!==-1;
}

/**
 @return {boolean}
 */
navigator.isMobile=function() {
  return navigator.isPhone() || navigator.isTablet(); //||(typeof g_app !== 'undefined' && g_app && g_app.mobile
}


/**
 @return {boolean}
 */
navigator.isAndroid=function() {
  var useragent = navigator.userAgent;
  return useragent.indexOf('Android')!==-1;
}

/**
 @return {boolean}
 */
navigator.isWindows=function() {
  var useragent = navigator.userAgent;
  return useragent.indexOf('Windows')!==-1;
}

/**
 @return {boolean}
 */
navigator.isMacintosh=function() {
  var useragent = navigator.userAgent;
  return useragent.indexOf('Macintosh')!==-1;
}

/**
 @return {boolean}
 */
navigator.isLinux=function() {
  var useragent = navigator.userAgent;
  return useragent.indexOf('Linux')!==-1;
}

/**
 @return {boolean}
 */
navigator.prefix=function() {
  if(navigator.isWebKit ()) return 'webkit';
  if(navigator.isEdge()) return 'webkit'; //'ms' 'edge';
  if(navigator.isMozilla()) return 'moz';
  throw '???';
  //return '???';
}
navigator['prefix']=navigator.prefix;


//-----------------------------------------------------------------------------
//
//   .d8888b.  888            d8b
//  d88P  Y88b 888            Y8P
//  Y88b.      888
//   "Y888b.   888888 888d888 888 88888b.   .d88b.
//      "Y88b. 888    888P"   888 888 "88b d88P"88b
//        "888 888    888     888 888  888 888  888
//  Y88b  d88P Y88b.  888     888 888  888 Y88b 888
//   "Y8888P"   "Y888 888     888 888  888  "Y88888
//                                              888
//                                         Y8b d88P
//                                          "Y88P"
//
//-----------------------------------------------------------------------------
/**
 @param {string} str
 @param {number} cursor
 @param {string=} char
 @return {string} - line
 
 for(var line, cursor=0;
 (line =String.Line(str,cursor,'\n')!=null);
 cursor=String.Next(str,cursor,'\n')) { ... }
 */
String.Line=function(str,cursor,char) {
  if(!str) return str;
  char=char || "\n";
  cursor=cursor || 0;
  if(cursor<0) return undefined;
  var pos=str.indexOf(char,cursor);
  if(pos<0) {
    var len=str.length;
    if(cursor>=len) return undefined;
    return str.substr(cursor);
  }
  // return pos+char.length;
  return str.substr(cursor,pos-cursor);
}
/**
 @param {string} str
 @param {number} cursor
 @param {string=} char
 @return {number} - cursor
 */
String.Next=function(str,cursor,char) {
  char=char || "\n";
  if(cursor<0) return cursor;
  if(!str) return -1;
  cursor=str.indexOf(char,cursor);
  if(cursor<0) return cursor;
  return cursor+1;
}

// EOF
