// ==UserScript==
// @encoding utf-8
// @name Universal YouTube
// @description Block YouTube Ads on Safari.
// @author HoJeong Go <seia@outlook.kr>
// @version 0.1.0
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
"use strict";(()=>{var l=()=>{try{return window.self!==window.top}catch(e){return!0}};if(l())throw new Error("UBYOUTUBE_SUBFRAME_FOUND");var r=window,a=(e,n)=>(typeof e[n]=="undefined"||(typeof e[n]=="boolean"&&(e[n]=!1),Array.isArray(e[n])&&(e[n]=[])),e),s=e=>(typeof e!="object"||(typeof(e==null?void 0:e.playerResponse)=="object"&&(e.playerResponse=s(e.playerResponse)),typeof(e==null?void 0:e.responseContext)=="object"&&(e.responseContext=s(e.responseContext)),a(e,"adPlacements"),a(e,"playerAds"),a(e,"adSlots"),console.debug("pruneAdProperties",e)),e),d=()=>{if(typeof r.ytInitialPlayerResponse=="undefined"){console.debug("ytInitialPlayerResponse is not defined");return}console.debug("proxy ytInitialPlayerResponse.{adPlacements,adSlots}"),r.ytInitialPlayerResponse.adPlacements=new Proxy(r.ytInitialPlayerResponse.adPlacements,{get(e,n,t){return console.debug("get ytInitialPlayerResponse.adPlacements"),[]}}),r.ytInitialPlayerResponse.adSlots=new Proxy(r.ytInitialPlayerResponse.adSlots,{get(e,n,t){return console.debug("get ytInitialPlayerResponse.adSlots"),[]}})},p=()=>{console.debug("proxy JSON.parse"),r.JSON.parse=new Proxy(r.JSON.parse,{apply(e,n,t){return s(Reflect.apply(e,n,t))}}),console.debug("proxy Response.prototype.json"),r.Response.prototype.json=new Proxy(r.Response.prototype.json,{async apply(e,n,t){return(async()=>s(await Reflect.apply(e,n,t)))()}})},u=e=>{e(document.querySelector("video")),new MutationObserver(t=>{for(let o of t)for(let i of o.addedNodes)i instanceof HTMLVideoElement&&(console.debug("subscribeVideoPlayer found new video node"),e(i))}).observe(document.body,{childList:!0,subtree:!0})},c=(e,n)=>{e.addEventListener("play",()=>{n(e)}),e.paused||n(e)},y=async e=>{let n=document.querySelector(".ytp-scrubber-container>div");if(!n)throw new Error("UBYOUTUBE_SCRUBBER_NOT_FOUND");if(!getComputedStyle(n).backgroundColor.includes("255, 204")){console.debug("skipAdContainer valid color signature not found");return}console.debug("skipAdContainer set={muted,currentTime} apply=play"),e.muted=!0,e.currentTime=e.duration-.1;let t=()=>{e.muted=!1,console.debug("skipAdContainer click skip button");let o=document.querySelector("button.ytp-ad-skip-button-modern.ytp-button");o==null||o.click()};e.addEventListener("ended",t),await e.play()};console.debug("ubyoutube installed");d();p();u(e=>{c(e,y)});})();
