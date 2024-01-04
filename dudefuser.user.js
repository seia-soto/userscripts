// ==UserScript==
// @encoding utf-8
// @name Devuploads Defuser
// @description Devuploads defuser for compatible environments.
// @author HoJeong Go <seia@outlook.kr>
// @version 0.0.1
//
// @grant none
// @run-at document-start
//
// @match https://dropgalaxy.com/*
// @match https://thecubexguide.com/*
// @match https://djxmaza.in/*
// @match https://dev.miuiflash.com/*
//
// @namespace https://github.com/seia-soto/userscripts
// @homepageURL https://github.com/seia-soto/userscripts
// @supportURL https://github.com/seia-soto/userscripts
// @updateURL https://seia-soto.github.io/userscripts/dudefuser.user.js
// @downloadURL https://seia-soto.github.io/userscripts/dudefuser.user.js
// ==/UserScript==
"use strict";(()=>{var r=()=>{HTMLScriptElement.prototype.getAttribute=new Proxy(HTMLScriptElement.prototype.getAttribute,{apply(e,n,t){let p=Reflect.apply(e,n,t);if(!(typeof p=="string"&&p.includes("extension://")))return p}}),Element.prototype.hasAttribute=new Proxy(Element.prototype.hasAttribute,{apply(e,n,t){return t[0]==="hidden"?!1:Reflect.apply(e,n,t)}})};r();})();
