# asdefuser — AdShield Defuser

See `seia-soto/adshield-defuser` if you wonder what's in the box.

## Targets

We target all modern distribution of web browsers with any kind of userscript support.
Especially, we treat only *violentmonkey* as full featured userscript manager.

- Chrome, Firefox, and all browsers with their backend are supported.
- Safari via UserScripts app but not all browsers provides loose environment for userscripts are supported.

In loose environment, we cannot ensure the full control of the main world that website runs.
Therefore, the functionalities require to be done at `document-start`, before `document.readyState` changes, may not work.

However, we can mitigate AdShield scripts even if those limitations exist in loose environment.

## Restriction in Loose environments

Targeting the loose environment of platforms like Apple Safari, where userscript managers were not properly implemented, it cannot be guaranteed that full support will be provided.
Even if the userscript is able to restore the website, it may still fail to prevent tracking if it cannot run before any other script sources on the site.

Please find below a list of known issues caused by the lack of proper userscript implementation or feature support:

### Beacon report of UserScript use

If the userscript is unable to run before any other scripts and cannot control access to the JavaScript world, it may not be able to successfully block potential beacon reports of UserScript use.
Nevertheless, this issue can be resolved by blocking the reported domain name using a browser or DNS-level ad blocker.
If you can update the filter list as quickly as possible, the severity of this issue may not be critical.
However, it's important to note that the effectiveness of the filter list may depend on the frequency of updates and the ability to block newly-reported targets.

At present, **the Apple Safari with UserScript app** is vulnerable to this issue.
