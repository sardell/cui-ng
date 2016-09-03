# Tether directive
Version 1.0


## Description
This directive wraps the Tether API into a simple to use markup tool to "tether" elements together.

## How to use

* Make sure you include Tether in your dependencies
`<script src="node_modules/@covisint/tether/dist/js/tether.js"></script>`

* In your markup attach any element to another element, and pass in options that match the ones in the [Tether API](http://github.hubspot.com/tether/).

```html
  <span id="element-to-attach-to">The other element is going to attach to me</span>
  <span tether target="#element-to-attach-to" attachment="top right" target-attachment="bottom left"></span>
```

This will attach the second element to the first one, the top right of the 2nd element will be touching the bottom left of the first element at all times.

All told, Tether provides six built in attachment positions:

* left
* center
* right
* top
* middle
* bottom

The syntax of the attachment properties is: "vertical-attachment horizontal-attachment".
You must always supply an attachment. If you don't supply a target-attachment, it is assumed to be the mirror image of attachment.

Optional attributes:
* target-attachment: ex: `target-attachment="bottom left"`,
* offset: ex: `offset="10px 10px"`,
* target-offset: ex: `target-offset="10px 10px"`,
* targetModifier: ex: `target-modifier="visible"`,
* constraints: ex: `contraints="[{ to: 'scrollParent', pin: true }]"`
