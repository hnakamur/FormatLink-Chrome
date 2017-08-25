# Format Link for Chrome

## Why do I need it?
To format the link of the active tab instantly to use in Markdown, reST, HTML, Text, Textile or other formats.

## How to use

### toolbar button
Press the toolbar button of "Format Link".  When a popup opens, texts are automatically copied to the clipboard.

Also you can change the format with selecting the format in the dropdown list. And if you press the "Save as Default" button, you can make it as default.

### context menu
Open the context menu "Format Link", and select one of sub menus for the format you would like to use to copy the URL.

### keyboard shortcut
Press the shortcut key Alt+C to copy the URL in the default format.
If you selected some text, the selected text is used instead of the page title.

## Flexible settings
You can modify formats in [Tools] -> [Extensions] -> Clik "Options" link in "Format Link" Extension.
In format settings, you can use the mini template language.

* variable reference: {{variable}}
    * variable = title / url / text
    * The value of variable `title` is the HTML page title.
    * The value of variable `text` is determined as below:
         * If some text is selected, the selected text is used.
         * If you open the context menu over a link, this extension search the entire document
           for a link whose URL is the same as the link you selected, and uses the text of the link found.
           Note: If there is another link of the same URL, this is not what you want, but this is
           best I can do for now.
         * Otherwise, the page URL is used.
    * The value of the variable `url` is the link URL if selection contains only a link AND
      you initiate a copy with a context menu.
      Otherwise, the value of variable `url` is the HTML page URL.
         * Note it is always the HTML page URL if you use the toolbar button or the
           keyboard shortcut to copy.
           This behavior will be changed if I find a way to get a link URL in selection
           when a toolbar button or a shortcut key is pressed.
    * No spaces are allowed between variable name and braces.
* string substitution: {{variable.s("foo","bar")}}
    * Which means variable.replace(new RegExp("foo", 'g'), "bar")
    * You can use escape character \ in strings.
    * You must escape the first argument for string and regexp.
      For example, .s("\\[","\\[") means replacing [ with \\[
    * You can chain multiple .s("foo","bar")
* You can use the escape character \
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

## License
MIT License.
Source codes are hosted at [Github](https://github.com/hnakamur/FormatLink-Chrome)

## Credits

### Icon
I synthesized two icons (a pencil and a link) to produce ```icon.png```.

* A pencil icon from [Onebit free icon set](http://www.icojoy.com/articles/44/) © 2010 [Khodjaev Stanislav](http://www.icojoy.com/), used under a License: These icons are free to use in any kind of commercial or non-commercial project unlimited times.
* A link icon from [Bremen icon set](http://pc.de/icons/#Bremen) © 2010 [Patricia Clausnitzer](http://pc.de/icons/), used under a [Creative Commons Attribution 3.0 License](hhttp://creativecommons.org/licenses/by/3.0/)

### Extension
This extension "Format Link" are inspired by extensions below:

* [Chrome Web Store - Create Link](https://chrome.google.com/webstore/detail/gcmghdmnkfdbncmnmlkkglmnnhagajbm) by [ku (KUMAGAI Kentaro)](https://github.com/ku)
* [Make Link :: Add-ons for Firefox](https://addons.mozilla.org/en-US/firefox/addon/make-link/) by [Rory Parle](https://addons.mozilla.org/en-US/firefox/user/90/)
