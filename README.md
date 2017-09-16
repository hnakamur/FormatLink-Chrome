# Format Link for Chrome

## Why do I need it?
To format the link of the active tab instantly to use in Markdown, reST, HTML, Text, Textile or other formats.

## How to use

The UI changed dramatically in the version 2.0.0.

Now you can use only the context menu to copy the URL.

1. When you open the menu over a link, the link title and the link URL are copied.
    * However, due to the WebExtensions API limitation, the text is taken from the first link of the same URL in the page,
       so it may be different from what you want.
2. When you select the text and open the menu over a link, the selected text and the link URL are copied.
    * Note you can select the text and move the mouse cursor to a link which is outside of the selection.
3. When you open the menu somewhere not over a link, you can copy the page URL.
    * The text becomes the selected text if you selected some text, it becomes the page title otherwise.

The previous version has multiple context menu items for each format to copy.
The version 2.0.0 has only one context menu item.
This change was made to copy a link in shorter steps.

You can select the format with the radio button on the popup of the toolbar button.
When you select the radio button, it becomes the default format.
The "Set as default" button in the previous version was deleted.

Sorry for inconvenience with this major UI changes,
but I believe this version 2.0.0 is simpler and easier to use.
I hope you are accustomed to the new UI soon!

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
    * The value of the variable `url` is the link URL if selection contains only a link.
      Otherwise, the value of variable `url` is the HTML page URL.
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
