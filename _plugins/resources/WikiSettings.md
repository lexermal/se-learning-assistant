# Configuration applied in Bookstack

## Settings menu
- Allow public access: true
- Name: Wiki
- Default Page Editor: WYSIWYG
- Application Homepage: Books
- Custom CSS: 

```html
<style>
  #header, #recent-activity, #book-tree, #new, #popular, #page-navigation, #sibling-navigation{display:none} 
  #content > div:nth-child(2){display: block;}
  #main-content > main > div.grid.half.v-center.no-row-gap > div{display:none}
#content > div.tri-layout-container > div.tri-layout-sides.print-hidden > div > div.tri-layout-right.print-hidden > aside > div:nth-child(1){display: none}
#content > div.tri-layout-container > div.tri-layout-sides.print-hidden > div{min-height:0}
  #content > div.tri-layout-container > div.tri-layout-sides.print-hidden > div > div.tri-layout-right.print-hidden > aside > div.actions.mb-xl > div{display:flex;flex-wrap:wrap}
  #content.block div.tri-layout-container div.tri-layout-sides.print-hidden div.tri-layout-sides-content div.tri-layout-right.print-hidden aside.tri-layout-right-contents div.actions.mb-xl div.icon-list.text-link {margin:0}
  #content.block div.tri-layout-container div.tri-layout-sides.print-hidden div.tri-layout-sides-content div.tri-layout-right.print-hidden aside.tri-layout-right-contents div.actions.mb-xl div.icon-list.text-link h{display:none}
  #content.block div.tri-layout-container div.tri-layout-sides.print-hidden div.tri-layout-sides-content div.tri-layout-right.print-hidden aside.tri-layout-right-contents div.actions.mb-xl div.icon-list.text-link :where(a, form, div){width:160px}

  html.dark-mode{background:#030712}
</style>

<script>
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const rmTheme = urlParams.get('rm_theme');
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    const returnUrl = encodeURIComponent(window.location.href);

    if(rmTheme===null){
      return
    }

    if ((rmTheme === 'dark' && !isDarkMode) || (rmTheme !== 'dark' && isDarkMode)) {
        const button = document.querySelector('#header > nav > div.dropdown-container > ul > li:nth-child(5) > form > button');
        
        if (button) {
            button.click() // Simulate a button click
        } else {
            console.error("Button not found");
        }
    }
})
</script>
```

## Public role
- Shelves: none checked