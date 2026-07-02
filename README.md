# Tropisch Tours and Travel — Preview Site

Public GitHub Pages preview for client review.

**Live site:** https://collingwood-web-design.github.io/tropisch-tours-pages/

This repository contains only the static files required to run the website. Development and source assets live in the private [tropisch-tours](https://github.com/collingwood-web-design/tropisch-tours) repository.

## Updating the preview

From the development repo, run:

```powershell
.\scripts\build-pages.ps1
cd ..\_pages-build\tropisch-tours-pages
git add -A
git commit -m "Update preview site"
git push
```
