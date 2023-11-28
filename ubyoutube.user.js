// ==UserScript==
// @encoding utf-8
// @name Universal YouTube
// @description Block YouTube Ads on Safari.
// @author HoJeong Go <seia@outlook.kr>
// @version 0.1.1
//
// @grant none
// @run-at document-start
//
// @match http://youtube.com/*
// @match https://youtube.com/*
// @match http://www.youtube.com/*
// @match https://www.youtube.com/*
// @match http://m.youtube.com/*
// @match https://m.youtube.com/*
//
// @namespace https://github.com/seia-soto/userscripts
// @homepageURL https://github.com/seia-soto/userscripts
// @supportURL https://github.com/seia-soto/userscripts
// @updateURL https://seia-soto.github.io/userscripts/ubyoutube.user.js
// @downloadURL https://seia-soto.github.io/userscripts/ubyoutube.user.js
// ==/UserScript==
"use strict";(()=>{var o=()=>{try{return window.self!==window.top}catch(e){return!0}},u=async e=>e.readyState!=="loading"?!0:new Promise(t=>{e.addEventListener("readystatechange",()=>{t(!0)})});if(o())throw new Error("UBYOUTUBE_SUBFRAME_FOUND");var i=e=>{let t=document.querySelector("video");t&&(console.debug("subscribeElements found HTMLVideoElement observed=false",t),e(t)),new MutationObserver(l=>{let n=document.querySelector("video");n&&t!==n&&(console.debug("subscribeElements found HTMLVideoElement observed=true",t),t=n,e(n))}).observe(document.documentElement||document.body,{childList:!0,subtree:!0}),console.debug("subscribeElements started observasion")},c=(e,t)=>{e.addEventListener("play",()=>{t(e)}),e.paused||t(e)},d=()=>{let e=document.querySelector(".ytp-scrubber-container>div");if(e)return getComputedStyle(e).backgroundColor.includes("255, 204")},s=()=>{let e=document.querySelector("button.ytp-ad-skip-button-modern.ytp-button");return e?(console.debug("trySkipButton",e),e.click(),!0):!1},a=async e=>new Promise(t=>{if(!d()){console.debug("skipAdContainer valid color signature not found"),t(0);return}if(s()){t(2);return}console.debug("skipAdContainer set={muted,currentTime}"),e.muted=!0,e.currentTime=e.duration-.1;let r=()=>{e.muted=!1,s(),t(e.duration)};e.addEventListener("ended",r),console.debug("skipAdContainer apply=play"),e.play()});console.debug("ubyoutube installed");u(document).then(()=>{i(e=>{let t=!1;c(e,async()=>{if(!t){for(t=!0;d();)await a(e);t=!1}})})});})();
