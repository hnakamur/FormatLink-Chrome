# Format Link for Chrome

## Why do I need it?
To format the link of the active tab instantly to use in Markdown, reST, HTML, Text, Textile or other formats.

## How to use
You can use keyboard shortcuts, context menus, or the toolbar button of Format Link extension
to copy a link in the specified format. Before doing that, you can optionally select some text 
which may or may not contain a link.

### keyboard shortcut
The keyboard shortcut for "Copy a link in the default format" is shortcut for clicking the
toolbar button. The link is copied in the default format and the popup is shown under
the toolbar button.

Also there are shortcuts for copying in the link in the corresponding format regardless of
the default format.

You can change shortcuts at chrome://extensions/shortcuts

### context menu
Open the context menu and select the "Format Link as XXX" menu item.
"XXX" in the menu item label changes as you change the default format by clicking the "Set as default" button in the popup page for the toolbar button.

If you check the "Create submenus" in the options page and save the options,
submenus for each format are created under the "Format Link" context menu group.

### toolbar button
When you press the toolbar button of "Format Link", the link is copied in the default format,
the popup page becomes open, and the formatted text is shown in the text area.

If you want to copy the link in different format, you can press one of the radio buttons.

Also if you want to change the default format, you can press the "Set as default" button.

## Flexible settings
You can modify formats in [Tools] -> [Extensions] -> Clik "Options" link in "Format Link" Extension.
In format settings, you can use the mini template language.

* {{variable}}
    * variable = title / url / text
    * The value of variable `title` is the HTML page title.
    * The value of variable `text` is the selected text if some text is selected,
      the link text if you open the context menu over a link (see KNOWN LIMITATION below for link text),
      or the page URL if no text is selected and you open the context menu not over a link.
    * The value of the variable `url` is the link if you open the context menu over a link,
      the first link if selection contains a link, or the HTML page URL otherwise.
    * No spaces are allowed between variable name and braces.
* {{variable.s("foo","bar")}}
    * Which means `variable.replace(new RegExp("foo", 'g'), "bar")`
    * You can use escape character \ in strings.
    * You must escape the first argument for string and regexp.
      For example, `.s("\\[","\\[")` means replacing `\[` with `\\[`
    * You can chain multiple .s("foo","bar")
* You can use the escape character \ in strings. For example, you need to escape `\` with `\` like `\\`,
  and also you need to escape `{` with `\` like `\{`. See the LaTeX example below.
* Other characters are treated as literal strings.

Here are examples:

* Markdown

```
[{{text.s("\\[","\\[").s("\\]","\\]")}}]({{url.s("\\)","%29")}})
```

* reST

```
{{text}} <{{url}}>`_
```

* HTML

```
<a href="{{url.s("\"","&quot;")}}">{{text.s("<","&lt;")}}</a>
```

* Text

```
{{text}}\n{{url}}
```

* Redmine Texitile

```
"{{title.s("\"","&quot;").s("\\[","&#91;")}}":{{url}}
```

* LaTeX

```
\\href\{{{url}}\}\{{{text}}\}
```

## Permissions required by this extension

* To use this extension, the following two permissions are required:
  * "Read and change all your data on all websites"
    * This permission is needed for this extension to run the ["content script"](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts?hl=en) into the content of pages you visit in order to get the page title, the selected text, the page URL, or the link URL.
  * "Modify data you copy and paste"
    * This permission is needed to copy a URL and a text to the clipboard.

For technical details, see the following pages:

* [Declare permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions?hl=en)
  * ["content_scripts.matches"](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns?hl=en)
    * This extension uses `"<all_urls>"`.
* [Permissions](https://developer.chrome.com/docs/extensions/reference/permissions-list?hl=en)
  * This extension requires the following permissions:
    * "activeTab"
    * "clipboardWrite"
    * "contextMenus"
    * "storage"

## License
MIT License.
Source codes are hosted at [Github](https://github.com/hnakamur/FormatLink-Chrome)

## KNOWN LIMITATIONS

* Due to security reason, you cannot copy the URL on some pages like the Chrome Extension Gallary.
* Chrome allow each extension to have at most 4 keyboard shortcuts. One shortcut is used for copying a link with the default format, and the rest of three are used for copying a link with the corresponding format 1 to format 3. So format 4 to format 9 does not have keyboard shortcut.

## Credits

### Icon
I synthesized two icons (a pencil and a link) to produce ```icon.png```.

* A pencil icon from [Onebit free icon set](http://www.icojoy.com/articles/44/) © 2010 [Khodjaev Stanislav](http://www.icojoy.com/), used under a License: These icons are free to use in any kind of commercial or non-commercial project unlimited times.
* A link icon from [Bremen icon set](http://pc.de/icons/#Bremen) © 2010 [Patricia Clausnitzer](http://pc.de/icons/), used under a [Creative Commons Attribution 3.0 License](hhttp://creativecommons.org/licenses/by/3.0/)

### Extension
This extension "Format Link" are inspired by extensions below:

* [Chrome Web Store - Create Link](https://chrome.google.com/webstore/detail/gcmghdmnkfdbncmnmlkkglmnnhagajbm) by [ku (KUMAGAI Kentaro)](https://github.com/ku)
* [Make Link :: Add-ons for Firefox](https://addons.mozilla.org/en-US/firefox/addon/make-link/) by [Rory Parle](https://addons.mozilla.org/en-US/firefox/user/90/)
